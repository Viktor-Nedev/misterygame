import Phaser from 'phaser'
import { Scene } from '@tialops/maki'
import { manager } from '../lib/manager.js'
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

function escapeHtml(value) {
    return value
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;')
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

        ;(this.roomConfig.doors ?? []).forEach(door => {
            if (door.isElevator) loadAsset('random/elevator.png')
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
        this.lia.sprite.setScale(0.5)
        this.lia.sprite.setCollideWorldBounds(true)
        this.lia.sprite.body.setSize(18, 22)
        this.lia.sprite.body.setOffset(7, 30)

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
        // Cap zoom to avoid "huge" characters on high-res screens
        const cappedZoom = Math.min(zoom, 2.5)
        this.cameras.main.setZoom(cappedZoom)
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
            const isElevator = !!door.isElevator
            const asset = isElevator ? assetKey('random/elevator.png') : 'room-door'
            
            const sprite = this.add.image(door.x, door.y, asset)
                .setDepth(6)
                .setDisplaySize(door.width, door.height)

            if (!isElevator && door.x < 100) {
                // Left door - maybe flip?
            } else if (!isElevator && door.x > 380) {
                // Right door
            }

            const zone = this.add.zone(door.x, door.y, door.width + 16, door.height + 16)
            this.physics.add.existing(zone, true)

            const glow = this.add.rectangle(door.x, door.y, door.width + 4, door.height + 4, 0x7dd3fc, 0)
                .setStrokeStyle(3, 0x7dd3fc, 0)
                .setDepth(6.1)

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
            const collected = this.clues.includes(clue.id)
            let visual

            switch (clue.visual?.type) {
            case 'image':
                visual = this.add.image(clue.x, clue.y, assetKey(clue.visual.image))
                    .setDisplaySize(clue.width, clue.height)
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

            visual.setDepth(5.8)
            this.physics.add.existing(visual, true)
            this.physics.add.collider(this.lia.sprite, visual)

            const zone = this.add.zone(clue.x, clue.y, clue.width + 16, clue.height + 16)
            this.physics.add.existing(zone, true)

            const clueState = {
                ...clue,
                visual,
                zone,
                baseScale: 1,
                lastSeenAt: -Infinity
            }

            this.physics.add.overlap(this.lia.sprite, zone, () => {
                clueState.lastSeenAt = this.time.now
            })

            return clueState
        })
    }

    createCharacterObjects() {
        this.characterObjects = (this.roomConfig.characters ?? []).map(character => {
            const suspect = SUSPECTS[character.id]
            const sprite = this.add.image(character.x, character.y, assetKey(suspect.portrait))
                .setDepth(8.8)
                .setDisplaySize(14, 24)

            this.physics.add.existing(sprite, true)
            this.physics.add.collider(this.lia.sprite, sprite)

            const zone = this.add.zone(character.x, character.y, 42, 64)
            this.physics.add.existing(zone, true)

            const characterState = {
                ...character,
                zone,
                sprite,
                baseScale: 1,
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
        this.overlayContainer = this.add.container(0, 0).setScrollFactor(0).setDepth(40)

        this.header = this.add.rectangle(0, 0, 480, 42, 0x140e0a, 0.96).setOrigin(0, 0)
        this.overlayContainer.add(this.header)

        this.headerTitle = this.add.text(14, 10, 'Blackwood Case', {
            fontFamily: '"Cormorant Garamond", serif',
            fontSize: '18px',
            fontStyle: '700',
            color: '#d8b56d'
        })
        this.overlayContainer.add(this.headerTitle)

        this.accusationButton = this.add.rectangle(350, 21, 100, 26, 0x9f2d22, 0.8)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.handleFinal())
        
        this.accusationText = this.add.text(350, 21, 'ACCUSE', {
            fontFamily: 'Manrope, sans-serif',
            fontSize: '11px',
            fontStyle: '800',
            color: '#ffffff'
        }).setOrigin(0.5)
        
        this.settingsButton = this.add.rectangle(440, 21, 60, 26, 0x35261c, 0.8)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.showSettings())
        
        this.settingsText = this.add.text(440, 21, 'SET', {
            fontFamily: 'Manrope, sans-serif',
            fontSize: '11px',
            fontStyle: '800',
            color: '#ead8b8'
        }).setOrigin(0.5)

        this.overlayContainer.add([this.accusationButton, this.accusationText, this.settingsButton, this.settingsText])

        this.inventoryBar = this.add.rectangle(0, 288, 480, 42, 0x140e0a, 0.92).setOrigin(0, 1)
        this.overlayContainer.add(this.inventoryBar)

        this.promptText = this.add.text(14, 274, '', {
            fontFamily: '"Manrope", sans-serif',
            fontSize: '11px',
            color: '#94a3b8'
        }).setOrigin(0, 1)
        this.overlayContainer.add(this.promptText)

        this.noticeText = this.add.text(466, 54, '', {
            fontFamily: '"Manrope", sans-serif',
            fontSize: '12px',
            color: '#f0dcc1',
            align: 'right',
            wordWrap: { width: 300 }
        }).setOrigin(1, 0).setScrollFactor(0).setDepth(45)

        this.modalBackdrop = this.add.rectangle(240, 144, 480, 288, 0x000000, 0.62)
            .setScrollFactor(0).setDepth(41).setVisible(false)

        this.modalShadow = this.add.rectangle(244, 148, 474, 294, 0x000000, 0.3)
            .setScrollFactor(0).setDepth(41.5).setVisible(false)

        this.modalPaperBack = this.add.rectangle(240, 144, 460, 280, 0xffffff, 0.1)
            .setScrollFactor(0).setDepth(41.8).setVisible(false)

        this.modalFolder = this.add.rectangle(240, 144, 470, 290, 0xfdfbf7, 1)
            .setStrokeStyle(1, 0xc1b299, 0.6)
            .setScrollFactor(0)
            .setDepth(42)
            .setVisible(false)

        this.modalStamp = this.add.text(240, 60, 'EVIDENCE FILE', {
            fontFamily: '"Special Elite", "Courier New", monospace',
            fontSize: '14px',
            fontStyle: '700',
            color: '#9f2d22'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(43).setVisible(false)

        this.modalTitle = this.add.text(240, 85, '', {
            fontFamily: '"Cormorant Garamond", Georgia, serif',
            fontSize: '24px',
            fontStyle: '700',
            color: '#20150f',
            align: 'center',
            wordWrap: { width: 400 }
        }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(43).setVisible(false)

        this.modalBody = this.add.text(240, 125, '', {
            fontFamily: '"Libre Baskerville", Georgia, serif',
            fontSize: '13px',
            color: '#35261c',
            align: 'center',
            lineSpacing: 6,
            wordWrap: { width: 420 }
        }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(43).setVisible(false)

        this.modalFooter = this.add.text(240, 260, '', {
            fontFamily: '"Manrope", Arial, sans-serif',
            fontSize: '12px',
            fontStyle: '700',
            color: '#6d5235',
            align: 'center',
            wordWrap: { width: 500 }
        }).setOrigin(0.5, 1).setScrollFactor(0).setDepth(43).setVisible(false)
        
        this.modalMurdererPhoto = this.add.image(240, 180, 'room-door').setVisible(false).setDepth(44).setScale(2)

        this.createNotesPanel()
    }

    createNotesPanel() {
        if (!this.sys.game.domContainer) {
            this.notesDom = null
            return
        }

        const savedNotes = getSavedNotes()
        this.notesDom = this.add.dom(0, 0).createFromHTML(`
            <div class="blackwood-notes">
                <div class="blackwood-notes__header">
                    <span>NOTES</span>
                    <button type="button" data-close="true">Close</button>
                </div>
                <textarea spellcheck="false" placeholder="Alibis, codes, links...">${escapeHtml(savedNotes)}</textarea>
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
                this.setNotice(`You need ${needed} more clues before the final decision.`, 2800)
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

        this.handleChoice1 = () => this.handleModalChoice(1)
        this.handleChoice2 = () => this.handleModalChoice(2)
        this.handleChoice3 = () => this.handleModalChoice(3)
        this.handleChoice4 = () => this.handleModalChoice(4)
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
                clue.lockedText ?? 'This clue cannot be examined yet. A required item is missing.',
                'Press E or Esc to continue.',
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
            ? 'Clue added to inventory.'
            : 'This clue is already logged.'

        this.showModal(
            clue.title,
            `${clue.description}\n\n${clue.details ?? ''}\n\n${statusText}`,
            'Press E, F, or Esc. Click an inventory icon to reopen it.',
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
            `Interview: ${suspect.name} (level ${suspect.level})`,
            suspect.text,
            `Alibi: ${suspect.alibi}`
        ].join('\n')

        this.showModal(
            `${suspect.name} - ${suspect.role}, ${suspect.age}`,
            `${suspect.text}\n\nAlibi: ${suspect.alibi}`,
            'Press N to save this to notes. E or Esc closes.',
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

        this.setNotice('Saved to NOTES.', 1800)
    }

    showCodeModal(clue) {
        this.codeClue = clue
        this.codeInput = ''
        this.modalMode = 'code'
        this.updateCodeModal()
    }

    showDoorCodeModal(door) {
        this.codeDoor = door
        this.codeInput = ''
        this.modalMode = 'door-code'
        this.updateCodeModal()
    }

    showCodeModal(clue) {
        this.codeClue = clue
        this.codeInput = ''
        this.modalMode = 'code'
        this.updateCodeModal()
    }

    showDoorCodeModal(door) {
        this.codeDoor = door
        this.codeInput = ''
        this.modalMode = 'door-code'
        this.updateCodeModal()
    }

    updateCodeModal() {
        const codePreview = this.codeInput || '...'
        const isDoor = this.modalMode === 'door-code'
        const title = isDoor ? 'Access Code Required' : this.codeClue.title
        const body = isDoor 
            ? `Enter the 4-digit code to unlock this door.\n\nEntered code: ${codePreview}`
            : [this.codeClue.lockedText ?? 'Locked with a code.', '', `Entered code: ${codePreview}`].join('\n')

        this.showModal(
            title,
            body,
            'Type digits and press Enter. Backspace deletes, Esc closes.',
            this.modalMode
        )
    }

    handleCodeInput(event) {
        if (this.modalMode !== 'code' && this.modalMode !== 'door-code') {
            return
        }

        if (event.key === 'Enter') {
            if (this.modalMode === 'code') {
                const target = normalizeCode(this.codeClue.code)
                const input = normalizeCode(this.codeInput)

                if (input === target) {
                    const clue = this.codeClue
                    this.codeClue = null
                    this.codeInput = ''
                    this.hideModal()
                    this.collectClue(clue)
                    this.setNotice('Code accepted.', 1800)
                } else {
                    this.setNotice('Code does not match.', 1600)
                }
            } else if (this.modalMode === 'door-code') {
                const target = normalizeCode(this.codeDoor.code)
                const input = normalizeCode(this.codeInput)

                if (input === target) {
                    if (!this.state.unlockedDoors) this.state.unlockedDoors = []
                    this.state.unlockedDoors.push(this.codeDoor.targetScene)
                    const targetDoor = this.codeDoor
                    this.hideModal()
                    this.enterDoor(targetDoor)
                    this.setNotice('Access Granted.', 1800)
                } else {
                    this.setNotice('Invalid Code.', 1600)
                    this.codeInput = ''
                    this.updateCodeModal()
                }
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

    handleModalChoice(index) {
        if (this.modalMode === 'final-choice') {
            this.chooseEnding(index - 1)
        } else if (this.modalMode === 'quiz') {
            this.chooseQuizAnswer(index - 1)
        }
    }

    showSettings() {
        this.showModal(
            'Settings & Controls',
            [
                'MUSIC VOLUME',
                '[Slider Placeholder ----------------]',
                '',
                'CONTROLS:',
                'WASD / Arrows: Move character',
                'E / Enter: Interact / Next',
                'F: Open Accusation Menu',
                'N: Save interview to Notes',
                'Esc: Close Modal / Notes'
            ].join('\n'),
            'Settings saved. Press E or Esc to close.',
            'settings'
        )
    }

    showFinalChoiceModal() {
        this.quizAnswers = []
        this.quizStep = 0
        this.showModal(
            'Detective final decision',
            [
                'You are about to name the killer.',
                'But first, you must prove your logic.',
                '',
                `1. ${ENDING_OPTIONS[0].label}`,
                `2. ${ENDING_OPTIONS[1].label}`,
                `3. ${ENDING_OPTIONS[2].label}`,
                `4. ${ENDING_OPTIONS[3].label}`
            ].join('\n'),
            'Press 1, 2, 3, or 4. F or Esc closes.',
            'final-choice'
        )
    }

    chooseEnding(index) {
        if (this.modalMode !== 'final-choice') return
        this.pendingEndingIndex = index
        this.startAccusationQuiz()
    }

    startAccusationQuiz() {
        const question = CASE_QUIZ[this.quizStep]
        this.showModal(
            `Question ${this.quizStep + 1} of 3`,
            [
                question.question,
                '',
                ...question.options.map((opt, i) => `${i + 1}. ${opt}`)
            ].join('\n'),
            'Press 1, 2, 3, or 4 to answer.',
            'quiz'
        )
    }

    chooseQuizAnswer(answerIndex) {
        if (this.modalMode !== 'quiz') return
        this.quizAnswers.push(answerIndex)
        this.quizStep++

        if (this.quizStep < CASE_QUIZ.length) {
            this.startAccusationQuiz()
        } else {
            const option = ENDING_OPTIONS[this.pendingEndingIndex]
            const result = resolveEnding(option.id, this.quizAnswers)
            
            if (result.id === 'arrest-walter' && canReachTruth()) {
                this.showMurdererResult(result)
            } else {
                this.showModal(
                    result.title,
                    result.body,
                    'Press E, F, or Esc to return.',
                    'ending'
                )
            }
            this.updateHeader()
        }
    }

    showMurdererResult(result) {
        this.showModal(
            'CASE SOLVED',
            '',
            'Press E to close.',
            'murder-reveal'
        )
        
        this.modalTitle.setText('THE MURDERER IS')
        this.modalTitle.setStyle({ color: '#ff0000', fontSize: '32px' })
        
        const suspect = SUSPECTS['walter']
        this.modalBody.setText(`${suspect.name}\n\n${result.body}`)
        this.modalBody.setY(220)
        
        this.modalMurdererPhoto.setTexture(assetKey(suspect.portrait))
        this.modalMurdererPhoto.setVisible(true)
        this.modalMurdererPhoto.setY(150)
    }

    showInventoryItem(item) {
        selectInventoryItem(item.id)
        this.showModal(
            item.title,
            `${item.description}\n\n${item.details ?? ''}`,
            'Press E or Esc to close.',
            'inventory'
        )
    }

    showModal(title, body, footer, mode) {
        this.modalMode = mode
        this.modalTitle.setText(title)
        this.modalBody.setText(body)
        this.modalFooter.setText(footer)

        const bodyLength = body.length
        const fontSize = bodyLength > 1200 ? 10 : bodyLength > 900 ? 11 : bodyLength > 600 ? 12 : 13
        const lineSpacing = bodyLength > 900 ? 3 : 5
        this.modalBody.setStyle({
            fontSize: `${fontSize}px`,
            lineSpacing
        })
        
        this.modalMurdererPhoto.setVisible(false)
        
        if (mode === 'quiz') {
            this.modalBody.setY(130)
        } else if (mode === 'murder-reveal') {
            this.modalBody.setY(210)
        } else {
            this.modalBody.setY(this.modalTitle.y + 40)
        }

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
        this.modalMurdererPhoto.setVisible(false)
    }

    toggleNotes(force) {
        if (!this.notesDom) {
            this.setNotice('Notes are not available in this mode.', 1800)
            return
        }

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

        if (door.code && !this.state.unlockedDoors?.includes(door.targetScene)) {
            this.showDoorCodeModal(door)
            return
        }

        if (door.requires && !hasAllItems(door.requires)) {
            const missing = door.requires.filter(id => !hasItem(id)).length
            this.setNotice(`Locked. Missing ${missing} required clues.`, 2600)
            return
        }

        this.isTransitioning = true
        this.setNotice(`Entering: ${door.label}...`, 1200)
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
        const solvedText = this.state.solved ? ' - SOLVED' : ''
        this.headerTitle.setText(`${this.roomConfig.title.toUpperCase()}${solvedText} | EVIDENCE: ${clueCount}/${CASE_FILE.totalClues}`)
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

            const scaleFactor = isNear && !collected ? 1.1 : 1
            clue.visual.setScale(clue.baseScale * scaleFactor)

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
            const scaleFactor = isNear ? 1.1 : 1
            character.sprite.setScale(character.baseScale * scaleFactor)

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
        let text = 'Move: WASD/Arrows. E - interact. F - final decision. NOTES - notebook.'

        if (this.modalMode === 'code') {
            text = 'Enter the code and press Enter.'
        } else if (this.modalMode === 'final-choice') {
            text = 'Choose an ending with 1, 2, 3, or 4.'
        } else if (this.modalMode === 'notes') {
            text = 'Notes are saved automatically.'
        } else if (this.modalMode) {
            text = this.modalMode === 'interview'
                ? 'N saves the interview to NOTES. E or Esc closes.'
                : 'E or Esc closes the file.'
        } else if (this.currentCharacter) {
            const suspect = SUSPECTS[this.currentCharacter.id]
            text = `E - interview ${suspect.name}.`
        } else if (this.currentClue) {
            text = `E - inspect: ${this.currentClue.title}.`
        } else if (this.currentDoor) {
            const locked = this.currentDoor.requires && !hasAllItems(this.currentDoor.requires)
            text = locked
                ? `${this.currentDoor.label} is locked.`
                : `E - enter: ${this.currentDoor.label}.`
        } else if (canReachTruth()) {
            text = 'Truth is established. Press F for final decision.'
        } else if (canAccuse()) {
            text = 'You can make a decision, but part of the truth may still be missing. F - final.'
        }

        this.promptText.setText(text)
    }

    rebuildInventoryBar() {
        this.inventoryElements.forEach(element => element.destroy())
        this.inventoryElements = []

        const items = getInventoryItems()
        const zoom = this.cameras.main.zoom
        const invZoom = 1 / zoom
        const width = this.scale.width
        const maxVisible = Math.max(6, Math.floor((width - 190 * invZoom) / ((INVENTORY_SLOT_SIZE + 6) * invZoom)))
        const visibleItems = items.slice(Math.max(0, items.length - maxVisible))
        const startX = 142 * invZoom
        const y = this.scale.height - 21 * invZoom

        visibleItems.forEach((item, index) => {
            const x = startX + index * (INVENTORY_SLOT_SIZE + 6) * invZoom
            const slot = this.add.rectangle(x, y, INVENTORY_SLOT_SIZE, INVENTORY_SLOT_SIZE, 0x241a13, 0.96)
                .setStrokeStyle(1, 0x8d7350, 0.86)
                .setScrollFactor(0)
                .setDepth(26)
                .setScale(invZoom)
                .setInteractive({ useHandCursor: true })

            const iconKey = assetKey(item.icon)
            const icon = this.textures.exists(iconKey)
                ? this.add.image(x, y, iconKey).setDisplaySize(26 * invZoom, 26 * invZoom)
                : this.add.rectangle(x, y, 24 * invZoom, 24 * invZoom, 0xd8b56d, 0.9)
            icon.setScrollFactor(0).setDepth(27)
            icon.setScale(invZoom)

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

        this.header.setSize(width, 42)
        this.inventoryBar.setSize(width, 42)
        this.inventoryBar.setPosition(0, height)
        
        this.accusationButton.setPosition(width - 130, 21)
        this.accusationText.setPosition(width - 130, 21)
        this.settingsButton.setPosition(width - 40, 21)
        this.settingsText.setPosition(width - 40, 21)
        
        this.noticeText.setPosition(width - 14, 54)
        this.promptText.setPosition(14, height - 14)

        this.modalBackdrop.setSize(width, height)
        this.modalBackdrop.setPosition(width / 2, height / 2)
        
        const zoom = this.cameras.main.zoom
        const invZoom = 1 / zoom
        
        const uiElements = [
            this.header, this.headerTitle, this.accusationButton, this.accusationText,
            this.settingsButton, this.settingsText, this.noticeText, this.promptText,
            this.inventoryBar,
            this.modalShadow, this.modalPaperBack, this.modalFolder,
            this.modalStamp, this.modalTitle, this.modalBody, this.modalFooter,
            this.modalMurdererPhoto
        ]
        uiElements.forEach(el => el.setScale(invZoom))

        const modalX = width / 2
        const modalY = height / 2

        this.modalShadow.setPosition(modalX + 4 * invZoom, modalY + 4 * invZoom)
        this.modalShadow.setSize(340, 220)
        this.modalPaperBack.setPosition(modalX, modalY)
        this.modalPaperBack.setSize(320, 200)
        this.modalFolder.setPosition(modalX, modalY)
        this.modalFolder.setSize(310, 190)
        
        this.modalStamp.setPosition(modalX, modalY - 70 * invZoom)
        this.modalTitle.setPosition(modalX, modalY - 50 * invZoom)
        this.modalBody.setPosition(modalX, modalY - 10 * invZoom)
        this.modalFooter.setPosition(modalX, modalY + 80 * invZoom)
        this.modalMurdererPhoto.setPosition(modalX, modalY + 20 * invZoom)
        
        this.header.setSize(width * zoom, 42)
        this.header.setPosition(0, 0)
        this.inventoryBar.setSize(width * zoom, 42)
        this.inventoryBar.setPosition(0, height)

        this.accusationButton.setPosition(width - 130 * invZoom, 21 * invZoom)
        this.accusationText.setPosition(width - 130 * invZoom, 21 * invZoom)
        this.settingsButton.setPosition(width - 40 * invZoom, 21 * invZoom)
        this.settingsText.setPosition(width - 40 * invZoom, 21 * invZoom)
        
        this.noticeText.setPosition(width - 14 * invZoom, 54 * invZoom)
        this.promptText.setPosition(14 * invZoom, height - 14 * invZoom)

        if (this.notesDom) {
            const panelWidth = 300
            const panelHeight = 400
            this.notesDom.setPosition(width - panelWidth / 2 - 20, height / 2)
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
