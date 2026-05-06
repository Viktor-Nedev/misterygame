import Phaser from 'phaser'
import { Scene, manager } from '@tialops/maki'
import {
    CASE_FILE,
    ENDING_OPTIONS,
    SUSPECTS,
    addClue,
    assetKey,
    canAccuse,
    canReachTruth,
    getGameState,
    getInventoryItems,
    getSavedNotes,
    getSuspectDialogue,
    hasAllItems,
    hasItem,
    resolveEnding,
    saveNotes,
    selectInventoryItem
} from './gameState.js'

const INTERACTION_WINDOW = 140
const TILE_SIZE = 16
const MAP_WIDTH = 30 * TILE_SIZE
const MAP_HEIGHT = 18 * TILE_SIZE
const PLAYER_SPEED = 165
const INVENTORY_SLOT_SIZE = 38

function normalizeCode(value) {
    return value.replaceAll('-', '').replaceAll(' ', '').trim().toLowerCase()
}

export default class RoomScene extends Scene {
    constructor(key, roomConfig) {
        super(key)
        this.roomConfig = roomConfig
    }

    init(data = {}) {
        this.spawnPoint = data.spawnPoint ?? this.roomConfig.spawnPoint
    }

    preload() {
        super.preload()
        this.lia = this.maki.player('lia')
        manager.map(this, this.roomConfig.mapName)
        manager.preload(this)
        this.preloadConfiguredAssets()

        if (!this.textures.exists('room-door')) {
            this.load.image('room-door', 'random/door.png')
        }

        if (!this.textures.exists('ash-officer')) {
            this.load.spritesheet('ash-officer', 'sprites/ash.png', {
                frameWidth: 32,
                frameHeight: 64
            })
        }
    }

    preloadConfiguredAssets() {
        const queued = new Set()
        const loadAsset = path => {
            if (!path) {
                return
            }

            const key = assetKey(path)

            if (this.textures.exists(key) || queued.has(key)) {
                return
            }

            queued.add(key)
            this.load.image(key, path)
        }

        this.roomConfig.clues.forEach(clue => {
            loadAsset(clue.icon)
            loadAsset(clue.visual?.image)
        })

        ;(this.roomConfig.characters ?? []).forEach(character => {
            loadAsset(SUSPECTS[character.id]?.portrait)
        })

        loadAsset('characters/gradinar.png')
    }

    create() {
        super.create()
        manager.create(this)
        this.renderWallLayer()

        this.state = getGameState()
        this.clues = this.state.clues
        this.currentDoor = null
        this.currentClue = null
        this.currentCharacter = null
        this.isTransitioning = false
        this.modalMode = null
        this.noticeTimer = null
        this.playerFacing = 'down'
        this.codeInput = ''
        this.codeClue = null
        this.pendingNoteText = ''
        this.inventoryElements = []

        this.cameras.main.setBackgroundColor('#06080f')
        this.configureCamera()

        this.lia.sprite.setPosition(this.spawnPoint.x, this.spawnPoint.y)
        this.lia.sprite.setDepth(7)
        this.lia.sprite.setCollideWorldBounds(true)
        this.lia.sprite.body.setSize(14, 18)
        this.lia.sprite.body.setOffset(9, 44)

        this.physics.world.setBounds(0, 0, MAP_WIDTH, MAP_HEIGHT)
        this.physics.add.collider(
            this.lia.sprite,
            manager.getWallGroup(this, this.roomConfig.mapName)
        )

        this.createDoors()
        this.createClueObjects()
        this.createCharacterObjects()
        this.createOfficer()
        this.createOverlay()
        this.bindInput()
        this.bindMovement()
        this.updateHeader()
        this.rebuildInventoryBar()
        this.setNotice(this.roomConfig.intro, 5200)

        this.scale.on('resize', this.handleResize, this)
        this.events.once('shutdown', () => {
            this.scale.off('resize', this.handleResize, this)
            this.destroyNotesPanel()
        })

        this.handleResize({ width: this.scale.width, height: this.scale.height })
        this.cameras.main.fadeIn(260, 0, 0, 0)
    }

    configureCamera() {
        const zoom = Math.min(this.scale.width / MAP_WIDTH, this.scale.height / MAP_HEIGHT)
        this.cameras.main.setZoom(zoom)
        this.cameras.main.centerOn(MAP_WIDTH / 2, MAP_HEIGHT / 2)
        this.cameras.main.roundPixels = true
    }

    bindMovement() {
        this.arrowKeys = this.input.keyboard.createCursorKeys()
        this.wasdKeys = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D
        })
    }

    renderWallLayer() {
        const mapData = this.cache.json.get(this.roomConfig.mapName)
        const wallGrid = mapData?.layers?.wall ?? []
        const tilesetKey = `${this.roomConfig.mapName}_tileset`

        wallGrid.forEach((row, rowIndex) => {
            row.forEach((tileId, colIndex) => {
                if (tileId === 0) {
                    return
                }

                this.add.image(
                    colIndex * mapData.tileSize,
                    rowIndex * mapData.tileSize,
                    tilesetKey,
                    tileId - 1
                ).setOrigin(0, 0).setDepth(4)
            })
        })
    }

    createDoors() {
        this.doors = this.roomConfig.doors.map(door => {
            const zone = this.add.zone(door.x, door.y, door.width, door.height)
            this.physics.add.existing(zone, true)

            const isVertical = door.height >= door.width
            const sprite = this.add.image(door.x, door.y, 'room-door')
                .setDepth(5.5)
                .setAlpha(0.96)

            if (isVertical) {
                sprite.setScale(0.26, 0.3)
            } else {
                sprite.setAngle(90).setScale(0.27, 0.34)
            }

            const glow = this.add.rectangle(
                door.x,
                door.y,
                door.width + 10,
                door.height + 10,
                0x7dd3fc,
                0
            ).setStrokeStyle(2, 0x7dd3fc, 0).setDepth(5.4)

            const doorState = {
                ...door,
                zone,
                sprite,
                glow,
                lastSeenAt: -Infinity
            }

            this.physics.add.overlap(this.lia.sprite, zone, () => {
                doorState.lastSeenAt = this.time.now
            })

            return doorState
        })
    }

    createClueObjects() {
        this.clueObjects = this.roomConfig.clues.map(clue => {
            const shadow = this.add.ellipse(
                clue.x,
                clue.y + Math.max(8, clue.height * 0.38),
                clue.width * 0.9,
                12,
                0x020617,
                0.22
            ).setDepth(7.6)

            const visual = this.createClueVisual(clue)
            const zone = this.add.zone(
                clue.x,
                clue.y,
                clue.interactionWidth ?? clue.width + 28,
                clue.interactionHeight ?? clue.height + 28
            )
            this.physics.add.existing(zone, true)

            const highlight = this.add.rectangle(
                clue.x,
                clue.y,
                clue.width + 22,
                clue.height + 22,
                0xf8fafc,
                0
            ).setStrokeStyle(2, 0xf8fafc, 0).setDepth(8.9)

            const clueState = {
                ...clue,
                zone,
                visual,
                shadow,
                highlight,
                lastSeenAt: -Infinity
            }

            this.physics.add.overlap(this.lia.sprite, zone, () => {
                clueState.lastSeenAt = this.time.now
            })

            return clueState
        })
    }

    createClueVisual(clue) {
        let visual

        switch (clue.visual?.type) {
        case 'image':
            visual = this.add.image(clue.x, clue.y, assetKey(clue.visual.image))
                .setDisplaySize(clue.width, clue.height)
            break
        case 'ellipse':
            visual = this.add.ellipse(
                clue.x,
                clue.y,
                clue.width,
                clue.height,
                clue.visual.color ?? clue.color,
                clue.visual.alpha ?? 1
            )
            break
        case 'paper':
            visual = this.add.container(clue.x, clue.y, [
                this.add.rectangle(
                    0,
                    0,
                    clue.width,
                    clue.height,
                    clue.visual.paperColor ?? clue.color,
                    0.98
                ).setStrokeStyle(2, clue.visual.edgeColor ?? 0xe5e7eb, 0.95),
                this.add.text(
                    0,
                    0,
                    clue.visual.lines ?? '',
                    {
                        fontFamily: '"Special Elite", "Courier New", monospace',
                        fontSize: `${clue.visual.fontSize ?? 10}px`,
                        color: clue.visual.textColor ?? '#0f172a',
                        align: 'center'
                    }
                ).setOrigin(0.5)
            ])
            break
        case 'device':
            visual = this.add.container(clue.x, clue.y, [
                this.add.rectangle(
                    0,
                    0,
                    clue.width,
                    clue.height,
                    clue.visual.bodyColor ?? 0x111827,
                    1
                ).setStrokeStyle(2, clue.visual.edgeColor ?? 0x818cf8, 1),
                this.add.rectangle(0, -2, clue.width - 8, clue.height - 14, 0x0f172a, 1)
                    .setStrokeStyle(1, 0x93c5fd, 0.45),
                this.add.circle(0, clue.height / 2 - 5, 2, 0xcbd5e1, 0.9)
            ])
            break
        default:
            visual = this.add.rectangle(
                clue.x,
                clue.y,
                clue.width,
                clue.height,
                clue.color ?? 0xd8b56d,
                0.96
            )
        }

        return visual.setDepth(8.2)
    }

    createCharacterObjects() {
        this.characterObjects = (this.roomConfig.characters ?? []).map(character => {
            const suspect = SUSPECTS[character.id]
            const shadow = this.add.ellipse(character.x, character.y + 24, 34, 12, 0x020617, 0.26)
                .setDepth(7.5)
            const sprite = this.add.image(character.x, character.y, assetKey(suspect.portrait))
                .setDisplaySize(character.width ?? 30, character.height ?? 54)
                .setDepth(8.3)

            const zone = this.add.zone(character.x, character.y, 46, 66)
            this.physics.add.existing(zone, true)

            const highlight = this.add.rectangle(character.x, character.y, 50, 70, 0xf8deb1, 0)
                .setStrokeStyle(2, 0xf8deb1, 0)
                .setDepth(8.9)

            const label = this.add.text(character.x, character.y + 42, suspect.name.split(' ')[0], {
                fontFamily: '"Manrope", Arial, sans-serif',
                fontSize: '9px',
                fontStyle: '700',
                color: '#f8f4eb',
                backgroundColor: 'rgba(20, 16, 13, 0.62)',
                padding: { x: 3, y: 1 }
            }).setOrigin(0.5).setDepth(9)

            const characterState = {
                ...character,
                zone,
                sprite,
                shadow,
                highlight,
                label,
                lastSeenAt: -Infinity
            }

            this.physics.add.overlap(this.lia.sprite, zone, () => {
                characterState.lastSeenAt = this.time.now
            })

            return characterState
        })
    }

    createOfficer() {
        if (this.scene.key !== 'LivingRoomScene') {
            return
        }

        this.officerShadow = this.add.ellipse(382, 178, 34, 12, 0x020617, 0.24).setDepth(7.4)
        this.officer = this.add.image(382, 150, assetKey('characters/gradinar.png'))
            .setDisplaySize(32, 54)
            .setDepth(8.2)
        this.ashMarker = this.add.sprite(416, 150, 'ash-officer', 0)
            .setDisplaySize(22, 44)
            .setDepth(8.1)
            .setTint(0xcbd5e1)
    }

    createOverlay() {
        this.vignetteTop = this.add.rectangle(0, 0, 0, 0, 0x070606, 0.55)
            .setOrigin(0, 0)
            .setScrollFactor(0)
            .setDepth(20)

        this.vignetteBottom = this.add.rectangle(0, 0, 0, 0, 0x070606, 0.68)
            .setOrigin(0, 1)
            .setScrollFactor(0)
            .setDepth(20)

        this.headerPlate = this.add.rectangle(0, 0, 390, 64, 0x15110d, 0.92)
            .setStrokeStyle(1, this.roomConfig.accentColor, 0.9)
            .setScrollFactor(0)
            .setDepth(21)

        this.roomTitle = this.add.text(0, 0, '', {
            fontFamily: '"Cormorant Garamond", Georgia, serif',
            fontSize: '32px',
            fontStyle: '700',
            color: '#f8f4eb'
        }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(22)

        this.cluePill = this.add.rectangle(0, 0, 140, 34, 0x241a13, 0.95)
            .setStrokeStyle(1, 0x8d7350, 0.85)
            .setScrollFactor(0)
            .setDepth(22)

        this.clueCounterText = this.add.text(0, 0, '', {
            fontFamily: '"Manrope", Arial, sans-serif',
            fontSize: '13px',
            fontStyle: '700',
            color: '#f2e6cc'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(23)

        this.notesButton = this.add.rectangle(0, 0, 92, 36, 0x2b2018, 0.95)
            .setStrokeStyle(1, 0xd8b56d, 0.88)
            .setScrollFactor(0)
            .setDepth(23)
            .setInteractive({ useHandCursor: true })
        this.notesButtonText = this.add.text(0, 0, 'NOTES', {
            fontFamily: '"Manrope", Arial, sans-serif',
            fontSize: '13px',
            fontStyle: '800',
            color: '#f8f4eb'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(24)
        this.notesButton.on('pointerdown', () => this.toggleNotes())

        this.noticeText = this.add.text(0, 0, '', {
            fontFamily: '"Manrope", Arial, sans-serif',
            fontSize: '15px',
            color: '#f0dcc1',
            align: 'right',
            wordWrap: { width: 420 }
        }).setOrigin(1, 0).setScrollFactor(0).setDepth(22)

        this.promptPlate = this.add.rectangle(0, 0, 0, 46, 0x15110d, 0.96)
            .setStrokeStyle(1, 0x5d4933, 0.9)
            .setScrollFactor(0)
            .setDepth(21)

        this.promptText = this.add.text(0, 0, '', {
            fontFamily: '"Manrope", Arial, sans-serif',
            fontSize: '15px',
            color: '#f8f4eb',
            align: 'center'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(22)

        this.inventoryPlate = this.add.rectangle(0, 0, 0, 54, 0x0d0a08, 0.92)
            .setStrokeStyle(1, 0x5d4933, 0.95)
            .setScrollFactor(0)
            .setDepth(24)

        this.inventoryLabel = this.add.text(0, 0, 'ИНВЕНТАР', {
            fontFamily: '"Manrope", Arial, sans-serif',
            fontSize: '11px',
            fontStyle: '800',
            color: '#d8b56d'
        }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(25)

        this.modalBackdrop = this.add.rectangle(0, 0, 0, 0, 0x050403, 0.76)
            .setOrigin(0, 0)
            .setScrollFactor(0)
            .setDepth(39)
            .setVisible(false)

        this.modalShadow = this.add.rectangle(0, 0, 780, 470, 0x000000, 0.3)
            .setScrollFactor(0)
            .setDepth(40)
            .setVisible(false)

        this.modalPaperBack = this.add.rectangle(0, 0, 736, 426, 0xf1e5d2, 0.98)
            .setStrokeStyle(1, 0xd3b98d, 0.8)
            .setScrollFactor(0)
            .setDepth(41)
            .setVisible(false)

        this.modalFolder = this.add.rectangle(0, 0, 710, 400, 0xc4a46f, 1)
            .setStrokeStyle(1, 0x765638, 0.95)
            .setScrollFactor(0)
            .setDepth(42)
            .setVisible(false)

        this.modalStamp = this.add.text(0, 0, 'BLACKWOOD FILE', {
            fontFamily: '"Special Elite", "Courier New", monospace',
            fontSize: '22px',
            color: '#8d251d'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(43).setVisible(false)

        this.modalTitle = this.add.text(0, 0, '', {
            fontFamily: '"Cormorant Garamond", Georgia, serif',
            fontSize: '34px',
            fontStyle: '700',
            color: '#1d140d',
            align: 'center',
            wordWrap: { width: 600 }
        }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(43).setVisible(false)

        this.modalBody = this.add.text(0, 0, '', {
            fontFamily: '"Libre Baskerville", Georgia, serif',
            fontSize: '16px',
            color: '#2f2419',
            align: 'center',
            lineSpacing: 7,
            wordWrap: { width: 600 }
        }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(43).setVisible(false)

        this.modalFooter = this.add.text(0, 0, '', {
            fontFamily: '"Manrope", Arial, sans-serif',
            fontSize: '13px',
            fontStyle: '700',
            color: '#5b4633',
            align: 'center',
            wordWrap: { width: 560 }
        }).setOrigin(0.5, 1).setScrollFactor(0).setDepth(43).setVisible(false)

        this.createNotesPanel()
    }

    createNotesPanel() {
        const savedNotes = getSavedNotes()
        this.notesDom = this.add.dom(0, 0).createFromHTML(`
            <div class="blackwood-notes">
                <div class="blackwood-notes__header">
                    <span>NOTES</span>
                    <button type="button" data-close="true">Close</button>
                </div>
                <textarea spellcheck="false" placeholder="Алибита, кодове, връзки...">${savedNotes}</textarea>
            </div>
        `)
        this.notesDom.setScrollFactor(0).setDepth(70).setVisible(false)

        const element = this.notesDom.node
        this.notesTextarea = element.querySelector('textarea')
        this.notesCloseButton = element.querySelector('button')

        element.addEventListener('keydown', event => event.stopPropagation())
        element.addEventListener('keyup', event => event.stopPropagation())
        this.notesTextarea.addEventListener('input', () => saveNotes(this.notesTextarea.value))
        this.notesCloseButton.addEventListener('click', () => this.toggleNotes(false))
    }

    destroyNotesPanel() {
        if (this.notesDom) {
            this.notesDom.destroy()
            this.notesDom = null
        }
    }

    bindInput() {
        this.handleInteract = () => {
            if (this.modalMode === 'notes' || this.modalMode === 'code' || this.modalMode === 'final-choice') {
                return
            }

            if (this.modalMode) {
                this.hideModal()
                return
            }

            if (this.isTransitioning) {
                return
            }

            if (this.currentCharacter) {
                this.inspectCharacter(this.currentCharacter)
                return
            }

            if (this.currentClue) {
                this.inspectClue(this.currentClue)
                return
            }

            if (this.currentDoor) {
                this.enterDoor(this.currentDoor)
            }
        }

        this.handleFinal = () => {
            if (this.isTransitioning || this.modalMode === 'notes' || this.modalMode === 'code') {
                return
            }

            if (this.modalMode === 'final-choice') {
                this.hideModal()
                return
            }

            if (this.modalMode) {
                this.hideModal()
                return
            }

            if (!canAccuse()) {
                const needed = Math.max(0, CASE_FILE.accusationThreshold - this.clues.length)
                this.setNotice(`Нужни са още ${needed} улики, преди да стигнете до финален избор.`, 2800)
                return
            }

            this.showFinalChoiceModal()
        }

        this.handleEscape = () => {
            if (this.modalMode === 'notes') {
                this.toggleNotes(false)
                return
            }

            if (this.modalMode) {
                this.hideModal()
            }
        }

        this.handleChoice1 = () => this.chooseEnding(0)
        this.handleChoice2 = () => this.chooseEnding(1)
        this.handleChoice3 = () => this.chooseEnding(2)
        this.handleChoice4 = () => this.chooseEnding(3)
        this.handleNote = () => this.appendPendingNote()
        this.handleKeydown = event => this.handleCodeInput(event)

        this.input.keyboard.on('keydown-E', this.handleInteract)
        this.input.keyboard.on('keydown-F', this.handleFinal)
        this.input.keyboard.on('keydown-ESC', this.handleEscape)
        this.input.keyboard.on('keydown-ONE', this.handleChoice1)
        this.input.keyboard.on('keydown-TWO', this.handleChoice2)
        this.input.keyboard.on('keydown-THREE', this.handleChoice3)
        this.input.keyboard.on('keydown-FOUR', this.handleChoice4)
        this.input.keyboard.on('keydown-N', this.handleNote)
        this.input.keyboard.on('keydown', this.handleKeydown)

        this.events.once('shutdown', () => {
            this.input.keyboard.off('keydown-E', this.handleInteract)
            this.input.keyboard.off('keydown-F', this.handleFinal)
            this.input.keyboard.off('keydown-ESC', this.handleEscape)
            this.input.keyboard.off('keydown-ONE', this.handleChoice1)
            this.input.keyboard.off('keydown-TWO', this.handleChoice2)
            this.input.keyboard.off('keydown-THREE', this.handleChoice3)
            this.input.keyboard.off('keydown-FOUR', this.handleChoice4)
            this.input.keyboard.off('keydown-N', this.handleNote)
            this.input.keyboard.off('keydown', this.handleKeydown)
        })
    }

    inspectClue(clue) {
        if (clue.requires && !hasAllItems(clue.requires)) {
            this.showModal(
                clue.title,
                clue.lockedText ?? 'Тази улика още не може да бъде проверена. Липсва правилният предмет.',
                'Натиснете E или Esc, за да продължите.',
                'clue'
            )
            return
        }

        if (clue.code && !hasItem(clue.id)) {
            this.showCodeModal(clue)
            return
        }

        this.collectClue(clue)
    }

    collectClue(clue) {
        const isNewClue = addClue({
            id: clue.id,
            type: clue.type,
            title: clue.title,
            description: clue.description,
            details: clue.details,
            icon: clue.icon
        })

        const statusText = isNewClue
            ? 'Уликата е добавена в инвентара.'
            : 'Тази улика вече е записана.'

        this.showModal(
            clue.title,
            `${clue.description}\n\n${clue.details ?? ''}\n\n${statusText}`,
            'Натиснете E, F или Esc. Клик върху икона в инвентара я отваря отново.',
            'clue'
        )

        this.updateHeader()
        this.rebuildInventoryBar()
    }

    inspectCharacter(character) {
        const suspect = getSuspectDialogue(character.id)

        if (!suspect) {
            return
        }

        this.pendingNoteText = [
            `Разпит: ${suspect.name} (ниво ${suspect.level})`,
            suspect.text,
            `Алиби: ${suspect.alibi}`
        ].join('\n')

        this.showModal(
            `${suspect.name} - ${suspect.role}, ${suspect.age}`,
            `${suspect.text}\n\nАлиби: ${suspect.alibi}`,
            'Натиснете N, за да запишете в бележника. E или Esc затваря.',
            'interview'
        )
    }

    appendPendingNote() {
        if (!this.pendingNoteText || (this.modalMode !== 'interview' && this.modalMode !== 'clue')) {
            return
        }

        const current = getSavedNotes()
        const separator = current.trim().length ? '\n\n' : ''
        const next = `${current}${separator}${this.pendingNoteText}`
        saveNotes(next)

        if (this.notesTextarea) {
            this.notesTextarea.value = next
        }

        this.setNotice('Записано в NOTES.', 1800)
    }

    showCodeModal(clue) {
        this.codeClue = clue
        this.codeInput = ''
        this.updateCodeModal()
        this.modalMode = 'code'
    }

    updateCodeModal() {
        const codePreview = this.codeInput || '...'

        this.showModal(
            this.codeClue.title,
            [
                this.codeClue.lockedText ?? 'Заключено е с код.',
                '',
                `Въведен код: ${codePreview}`
            ].join('\n'),
            'Пишете цифри и тире. Enter проверява кода. Backspace трие. Esc затваря.',
            'code'
        )
    }

    handleCodeInput(event) {
        if (this.modalMode !== 'code' || !this.codeClue) {
            return
        }

        if (event.key === 'Enter') {
            const target = normalizeCode(this.codeClue.code)
            const input = normalizeCode(this.codeInput)

            if (input === target) {
                const clue = this.codeClue
                this.codeClue = null
                this.codeInput = ''
                this.collectClue(clue)
                this.setNotice('Кодът е правилен.', 1800)
            } else {
                this.setNotice('Кодът не пасва.', 1600)
            }
            return
        }

        if (event.key === 'Backspace') {
            this.codeInput = this.codeInput.slice(0, -1)
            this.updateCodeModal()
            return
        }

        if (/^[0-9-]$/.test(event.key) && this.codeInput.length < 12) {
            this.codeInput += event.key
            this.updateCodeModal()
        }
    }

    showFinalChoiceModal() {
        const truthLine = canReachTruth()
            ? 'Имате достатъчно улики да назовете истината.'
            : 'Можете да вземете решение, но истината още не е напълно доказана.'

        this.showModal(
            'Финален избор на детектива',
            [
                truthLine,
                '',
                `1. ${ENDING_OPTIONS[0].label}`,
                `2. ${ENDING_OPTIONS[1].label}`,
                `3. ${ENDING_OPTIONS[2].label}`,
                `4. ${ENDING_OPTIONS[3].label}`
            ].join('\n'),
            'Натиснете 1, 2, 3 или 4. F или Esc затваря.',
            'final-choice'
        )
    }

    chooseEnding(index) {
        if (this.modalMode !== 'final-choice') {
            return
        }

        const option = ENDING_OPTIONS[index]

        if (!option) {
            return
        }

        const result = resolveEnding(option.id)

        this.showModal(
            result.title,
            result.body,
            'Натиснете E, F или Esc, за да се върнете в имението.',
            'ending'
        )

        this.updateHeader()
    }

    showInventoryItem(item) {
        selectInventoryItem(item.id)
        this.showModal(
            item.title,
            `${item.description}\n\n${item.details ?? ''}`,
            'Натиснете E или Esc, за да затворите.',
            'inventory'
        )
    }

    showModal(title, body, footer, mode) {
        this.modalMode = mode
        this.modalTitle.setText(title)
        this.modalBody.setText(body)
        this.modalFooter.setText(footer)

        const bodyLength = body.length
        const fontSize = bodyLength > 980 ? 13 : bodyLength > 680 ? 14 : 16
        const lineSpacing = bodyLength > 820 ? 5 : 7
        this.modalBody.setStyle({
            fontSize: `${fontSize}px`,
            lineSpacing
        })

        this.modalBackdrop.setVisible(true)
        this.modalShadow.setVisible(true)
        this.modalPaperBack.setVisible(true)
        this.modalFolder.setVisible(true)
        this.modalStamp.setVisible(true)
        this.modalTitle.setVisible(true)
        this.modalBody.setVisible(true)
        this.modalFooter.setVisible(true)
    }

    hideModal() {
        this.modalMode = null
        this.codeClue = null
        this.codeInput = ''
        this.modalBackdrop.setVisible(false)
        this.modalShadow.setVisible(false)
        this.modalPaperBack.setVisible(false)
        this.modalFolder.setVisible(false)
        this.modalStamp.setVisible(false)
        this.modalTitle.setVisible(false)
        this.modalBody.setVisible(false)
        this.modalFooter.setVisible(false)
    }

    toggleNotes(force) {
        const nextVisible = typeof force === 'boolean' ? force : !this.notesDom.visible
        this.notesDom.setVisible(nextVisible)
        this.notesButton.setFillStyle(nextVisible ? 0x5a2d22 : 0x2b2018, 0.96)
        this.modalMode = nextVisible ? 'notes' : null

        if (nextVisible) {
            this.notesTextarea.focus()
        }
    }

    enterDoor(door) {
        if (this.isTransitioning) {
            return
        }

        if (door.requires && !hasAllItems(door.requires)) {
            const missing = door.requires.filter(id => !hasItem(id)).length
            this.setNotice(`Заключено. Липсват ${missing} нужни предмета или улики.`, 2600)
            return
        }

        this.isTransitioning = true
        this.setNotice(`Влизате в: ${door.label}...`, 1200)
        this.cameras.main.fadeOut(220, 0, 0, 0)

        this.time.delayedCall(230, () => {
            this.scene.start(door.targetScene, {
                spawnPoint: door.spawnPoint
            })
        })
    }

    setNotice(text, duration = 0) {
        if (this.noticeTimer) {
            this.noticeTimer.remove(false)
            this.noticeTimer = null
        }

        this.noticeText.setText(text)

        if (duration > 0) {
            this.noticeTimer = this.time.delayedCall(duration, () => {
                this.noticeText.setText('')
                this.noticeTimer = null
            })
        }
    }

    updateHeader() {
        const clueCount = this.clues.length
        const solvedText = this.state.solved ? 'Solved' : 'Active'
        this.roomTitle.setText(this.roomConfig.title)
        this.clueCounterText.setText(`${solvedText} | ${clueCount}/${CASE_FILE.totalClues}`)
    }

    updateInteractionState() {
        this.currentDoor = null
        this.currentClue = null
        this.currentCharacter = null

        let nearestDoorDistance = Infinity
        let nearestClueDistance = Infinity
        let nearestCharacterDistance = Infinity
        const now = this.time.now

        this.doors.forEach(door => {
            const isNear = now - door.lastSeenAt <= INTERACTION_WINDOW
            const locked = door.requires && !hasAllItems(door.requires)
            const strokeColor = locked ? 0xef4444 : 0x7dd3fc

            door.glow.setStrokeStyle(2, strokeColor, isNear ? 0.92 : 0)
            door.sprite.setTint(isNear ? (locked ? 0xfca5a5 : 0xe0f2fe) : 0xffffff)

            if (!isNear) {
                return
            }

            const distance = Phaser.Math.Distance.Between(
                this.lia.sprite.x,
                this.lia.sprite.y,
                door.x,
                door.y
            )

            if (distance < nearestDoorDistance) {
                nearestDoorDistance = distance
                this.currentDoor = door
            }
        })

        this.clueObjects.forEach(clue => {
            const collected = this.clues.includes(clue.id)
            const isNear = now - clue.lastSeenAt <= INTERACTION_WINDOW
            const locked = clue.requires && !hasAllItems(clue.requires)

            clue.visual.setScale(isNear && !collected ? 1.04 : 1)
            clue.highlight.setStrokeStyle(
                2,
                collected ? 0x86efac : (locked ? 0xef4444 : 0xf8deb1),
                isNear || collected ? 0.95 : 0
            )

            if (!isNear) {
                return
            }

            const distance = Phaser.Math.Distance.Between(
                this.lia.sprite.x,
                this.lia.sprite.y,
                clue.x,
                clue.y
            )

            if (distance < nearestClueDistance) {
                nearestClueDistance = distance
                this.currentClue = clue
            }
        })

        this.characterObjects.forEach(character => {
            const isNear = now - character.lastSeenAt <= INTERACTION_WINDOW
            character.sprite.setScale(isNear ? 1.04 : 1)
            character.highlight.setStrokeStyle(2, 0xf8deb1, isNear ? 0.92 : 0)

            if (!isNear) {
                return
            }

            const distance = Phaser.Math.Distance.Between(
                this.lia.sprite.x,
                this.lia.sprite.y,
                character.x,
                character.y
            )

            if (distance < nearestCharacterDistance) {
                nearestCharacterDistance = distance
                this.currentCharacter = character
            }
        })
    }

    updatePrompt() {
        let text = 'Движение: WASD/стрелки. E - действие. F - финален избор. NOTES - бележник.'

        if (this.modalMode === 'code') {
            text = 'Въведете кода и натиснете Enter.'
        } else if (this.modalMode === 'final-choice') {
            text = 'Изберете финал с 1, 2, 3 или 4.'
        } else if (this.modalMode === 'notes') {
            text = 'Бележките се запазват автоматично.'
        } else if (this.modalMode) {
            text = this.modalMode === 'interview'
                ? 'N записва разпита в NOTES. E или Esc затваря.'
                : 'E или Esc затваря файла.'
        } else if (this.currentCharacter) {
            const suspect = SUSPECTS[this.currentCharacter.id]
            text = `E - разпит на ${suspect.name}.`
        } else if (this.currentClue) {
            text = `E - оглед: ${this.currentClue.title}.`
        } else if (this.currentDoor) {
            const locked = this.currentDoor.requires && !hasAllItems(this.currentDoor.requires)
            text = locked
                ? `${this.currentDoor.label} е заключено.`
                : `E - влезте в: ${this.currentDoor.label}.`
        } else if (canReachTruth()) {
            text = 'Истината е доказана. Натиснете F за финалния избор.'
        } else if (canAccuse()) {
            text = 'Имате достатъчно материал за избор, но част от истината може да липсва. F - финал.'
        }

        this.promptText.setText(text)
    }

    rebuildInventoryBar() {
        this.inventoryElements.forEach(element => element.destroy())
        this.inventoryElements = []

        const items = getInventoryItems()
        const width = this.scale.width
        const maxVisible = Math.max(6, Math.floor((width - 190) / (INVENTORY_SLOT_SIZE + 6)))
        const visibleItems = items.slice(Math.max(0, items.length - maxVisible))
        const startX = 142
        const y = this.scale.height - 28

        visibleItems.forEach((item, index) => {
            const x = startX + index * (INVENTORY_SLOT_SIZE + 6)
            const slot = this.add.rectangle(x, y, INVENTORY_SLOT_SIZE, INVENTORY_SLOT_SIZE, 0x241a13, 0.96)
                .setStrokeStyle(1, 0x8d7350, 0.86)
                .setScrollFactor(0)
                .setDepth(26)
                .setInteractive({ useHandCursor: true })

            const iconKey = assetKey(item.icon)
            const icon = this.textures.exists(iconKey)
                ? this.add.image(x, y, iconKey).setDisplaySize(26, 26)
                : this.add.rectangle(x, y, 24, 24, 0xd8b56d, 0.9)
            icon.setScrollFactor(0).setDepth(27)

            slot.on('pointerdown', () => this.showInventoryItem(item))
            icon.setInteractive({ useHandCursor: true }).on('pointerdown', () => this.showInventoryItem(item))

            this.inventoryElements.push(slot, icon)
        })

        if (items.length > visibleItems.length) {
            const hidden = items.length - visibleItems.length
            const moreText = this.add.text(width - 54, y, `+${hidden}`, {
                fontFamily: '"Manrope", Arial, sans-serif',
                fontSize: '13px',
                fontStyle: '800',
                color: '#d8b56d'
            }).setOrigin(0.5).setScrollFactor(0).setDepth(27)
            this.inventoryElements.push(moreText)
        }
    }

    handleResize(gameSize) {
        const width = gameSize.width
        const height = gameSize.height

        this.configureCamera()

        this.vignetteTop.setSize(width, 104)
        this.vignetteBottom.setSize(width, 126)
        this.vignetteBottom.setPosition(0, height)

        this.headerPlate.setPosition(268, 50)
        this.roomTitle.setPosition(44, 50)
        this.cluePill.setPosition(426, 50)
        this.clueCounterText.setPosition(426, 50)

        this.notesButton.setPosition(width - 68, 50)
        this.notesButtonText.setPosition(width - 68, 50)

        this.noticeText.setPosition(width - 40, 86)
        this.noticeText.setWordWrapWidth(Math.min(520, width * 0.36))

        const promptWidth = Math.min(840, width - 100)
        this.promptPlate.setSize(promptWidth, 46)
        this.promptPlate.setPosition(width / 2, height - 88)
        this.promptText.setPosition(width / 2, height - 88)

        this.inventoryPlate.setSize(Math.min(980, width - 54), 54)
        this.inventoryPlate.setPosition(width / 2, height - 28)
        this.inventoryLabel.setPosition(50, height - 28)

        this.modalBackdrop.setSize(width, height)
        this.modalShadow.setPosition(width / 2 + 10, height / 2 + 12)
        this.modalPaperBack.setPosition(width / 2 + 4, height / 2 + 4)
        this.modalFolder.setPosition(width / 2, height / 2)
        this.modalStamp.setPosition(width / 2, height / 2 - 152)
        this.modalTitle.setPosition(width / 2, height / 2 - 124)
        this.modalBody.setPosition(width / 2, height / 2 - 54)
        this.modalBody.setWordWrapWidth(Math.min(600, width - 180))
        this.modalFooter.setPosition(width / 2, height / 2 + 168)

        if (this.notesDom) {
            const panelWidth = Math.min(330, Math.max(260, width * 0.28))
            const panelHeight = Math.min(430, Math.max(250, height - 160))
            const panel = this.notesDom.node.querySelector('.blackwood-notes')
            panel.style.width = `${panelWidth}px`
            panel.style.height = `${panelHeight}px`
            this.notesDom.setPosition(width - panelWidth / 2 - 24, height / 2 + 10)
        }

        this.rebuildInventoryBar()
    }

    movePlayer() {
        const left = this.arrowKeys.left.isDown || this.wasdKeys.left.isDown
        const right = this.arrowKeys.right.isDown || this.wasdKeys.right.isDown
        const up = this.arrowKeys.up.isDown || this.wasdKeys.up.isDown
        const down = this.arrowKeys.down.isDown || this.wasdKeys.down.isDown

        const directionX = (right ? 1 : 0) - (left ? 1 : 0)
        const directionY = (down ? 1 : 0) - (up ? 1 : 0)

        this.lia.sprite.setVelocity(0)

        if (directionX === 0 && directionY === 0) {
            this.lia.sprite.anims.stop()
            return
        }

        const vector = new Phaser.Math.Vector2(directionX, directionY)
            .normalize()
            .scale(PLAYER_SPEED)

        this.lia.sprite.setVelocity(vector.x, vector.y)

        if (Math.abs(directionX) > Math.abs(directionY)) {
            this.playerFacing = directionX > 0 ? 'right' : 'left'
        } else {
            this.playerFacing = directionY > 0 ? 'down' : 'up'
        }

        this.lia.sprite.anims.play(`lia-${this.playerFacing}`, true)
    }

    update() {
        this.updateInteractionState()
        this.updatePrompt()

        if (this.isTransitioning || this.modalMode) {
            this.lia.sprite.setVelocity(0)
            return
        }

        this.movePlayer()
    }
}
