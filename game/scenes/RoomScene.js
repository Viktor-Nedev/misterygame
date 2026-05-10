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
            this.load.image('room-door', 'assets/random/door.png')
        }

        if (!this.textures.exists('ash-officer')) {
            this.load.spritesheet('ash-officer', 'assets/sprites/ash.png', {
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
            this.load.image(key, `assets/${path}`)
        }

        this.roomConfig.clues.forEach(clue => {
            loadAsset(clue.icon)
            loadAsset(clue.visual?.image)
        })

            ; (this.roomConfig.characters ?? []).forEach(character => {
                loadAsset(SUSPECTS[character.id]?.portrait)
            })

        // Accusation screen needs all portraits available, regardless of current room.
        Object.values(SUSPECTS).forEach(suspect => {
            loadAsset(suspect.portrait)
        })

        loadAsset('characters/gradinar.png')
        loadAsset('random/elevator.png')
    }

    create() {
        super.create()
        manager.create(this)
        this.renderWallLayer()

        this.state = getGameState()
        if (typeof this.state.musicVolume !== 'number') {
            this.state.musicVolume = 0.5
        }
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
        const mapData = this.cache.json.get(this.roomConfig.mapName)
        const furnitureSrcs = new Set((mapData?.layers?.furniture ?? []).map(item => item.src))

        this.clueObjects = this.roomConfig.clues.map(clue => {
            let visual
            let baseScale = 1

            switch (clue.visual?.type) {
                case 'image':
                    if (furnitureSrcs.has(clue.visual.image)) {
                        // The clue is already rendered as map furniture; don't draw a second copy on top.
                        visual = this.add.rectangle(clue.x, clue.y, clue.width, clue.height, 0xffffff, 0)
                            .setVisible(false)
                    } else {
                        visual = this.add.image(clue.x, clue.y, assetKey(clue.visual.image))
                            .setDisplaySize(clue.width, clue.height)
                            .setDepth(1.25)
                    }
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

            this.physics.add.existing(visual, true)
            // Only block movement if the clue has its own visible world object.
            if (visual.visible) {
                this.physics.add.collider(this.lia.sprite, visual)
            }

            const zone = this.add.zone(clue.x, clue.y, clue.width + 16, clue.height + 16)
            this.physics.add.existing(zone, true)

            const clueState = {
                ...clue,
                visual,
                zone,
                baseScale,
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

            // Calculate base scale for characters (approx 32px height)
            const baseScale = 32 / sprite.height
            sprite.setScale(baseScale)

            this.physics.add.existing(sprite, true)
            this.physics.add.collider(this.lia.sprite, sprite)

            const zone = this.add.zone(character.x, character.y, 42, 64)
            this.physics.add.existing(zone, true)

            const characterState = {
                ...character,
                zone,
                sprite,
                baseScale,
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
        // UI must always render above the y-sorted world objects (which use y as depth).
        this.overlayContainer = this.add.container(0, 0).setScrollFactor(0).setDepth(10000)

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

        this.notesButton = this.add.rectangle(0, 21, 70, 26, 0x2b2018, 0.86)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.toggleNotes())
        this.notesText = this.add.text(0, 21, 'NOTES', {
            fontFamily: 'Manrope, sans-serif',
            fontSize: '11px',
            fontStyle: '800',
            color: '#ead8b8'
        }).setOrigin(0.5)

        this.overlayContainer.add([
            this.accusationButton,
            this.accusationText,
            this.settingsButton,
            this.settingsText,
            this.notesButton,
            this.notesText
        ])

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
        }).setOrigin(1, 0).setScrollFactor(0).setDepth(10020)

        // Clue preview panel - shows clue content automatically when approaching
        this.cluePreviewBackdrop = this.add.rectangle(240, 144, 500, 300, 0x000000, 0.7)
            .setScrollFactor(0).setDepth(10050).setVisible(false)

        this.cluePreviewPaper = this.add.rectangle(240, 144, 480, 280, 0xfdfbf7, 1)
            .setStrokeStyle(2, 0xc1b299, 0.8)
            .setScrollFactor(0).setDepth(10051).setVisible(false)

        this.cluePreviewTitle = this.add.text(240, 70, '', {
            fontFamily: '"Cormorant Garamond", Georgia, serif',
            fontSize: '22px',
            fontStyle: '700',
            color: '#20150f',
            align: 'center',
            wordWrap: { width: 420 }
        }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(10052).setVisible(false)

        this.cluePreviewDesc = this.add.text(240, 105, '', {
            fontFamily: '"Libre Baskerville", Georgia, serif',
            fontSize: '18px',
            color: '#35261c',
            align: 'center',
            lineSpacing: 6,
            wordWrap: { width: 440 }
        }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(10052).setVisible(false)

        this.cluePreviewDetails = this.add.text(240, 150, '', {
            fontFamily: '"Libre Baskerville", Georgia, serif',
            fontSize: '16px',
            color: '#5a4a3a',
            align: 'center',
            lineSpacing: 5,
            wordWrap: { width: 440 }
        }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(10052).setVisible(false)

        this.cluePreviewHint = this.add.text(240, 260, 'Press E to collect • Esc to close', {
            fontFamily: '"Manrope", Arial, sans-serif',
            fontSize: '14px',
            fontStyle: '700',
            color: '#8b7355',
            align: 'center'
        }).setOrigin(0.5, 1).setScrollFactor(0).setDepth(10052).setVisible(false)

        this.cluePreviewImage = this.add.image(240, 130, 'room-door')
            .setScrollFactor(0).setDepth(10053).setVisible(false).setOrigin(0.5)

        this.cluePreviewImageBg = this.add.rectangle(240, 130, 90, 90, 0xfcfbf8, 1)
            .setStrokeStyle(1, 0x9b7a48, 0.4)
            .setScrollFactor(0).setDepth(10052.5).setVisible(false).setOrigin(0.5)

        this.modalBackdrop = this.add.rectangle(240, 144, 480, 288, 0x000000, 0.62)
            .setScrollFactor(0).setDepth(10100).setVisible(false)
        // Ensure the dim layer doesn't steal clicks from the modal contents.
        this.modalBackdrop.disableInteractive()

        this.modalShadow = this.add.rectangle(244, 148, 474, 294, 0x000000, 0.3)
            .setScrollFactor(0).setDepth(10101).setVisible(false)

        this.modalPaperBack = this.add.rectangle(240, 144, 460, 280, 0xffffff, 0.1)
            .setScrollFactor(0).setDepth(10102).setVisible(false)

        this.modalFolder = this.add.rectangle(240, 144, 470, 290, 0xfdfbf7, 1)
            .setStrokeStyle(1, 0xc1b299, 0.6)
            .setScrollFactor(0)
            .setDepth(10103)
            .setVisible(false)

        this.modalStamp = this.add.text(240, 60, 'EVIDENCE FILE', {
            fontFamily: '"Special Elite", "Courier New", monospace',
            fontSize: '14px',
            fontStyle: '700',
            color: '#9f2d22'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(10104).setVisible(false)

        this.modalTitle = this.add.text(240, 85, '', {
            fontFamily: '"Cormorant Garamond", Georgia, serif',
            fontSize: '24px',
            fontStyle: '700',
            color: '#20150f',
            align: 'center',
            wordWrap: { width: 400 }
        }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(10105).setVisible(false)

        this.modalBody = this.add.text(240, 125, '', {
            fontFamily: '"Libre Baskerville", Georgia, serif',
            fontSize: '13px',
            color: '#35261c',
            align: 'center',
            lineSpacing: 6,
            wordWrap: { width: 420 }
        }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(10105).setVisible(false)

        this.modalFooter = this.add.text(240, 260, '', {
            fontFamily: '"Manrope", Arial, sans-serif',
            fontSize: '12px',
            fontStyle: '700',
            color: '#6d5235',
            align: 'center',
            wordWrap: { width: 500 }
        }).setOrigin(0.5, 1).setScrollFactor(0).setDepth(10105).setVisible(false)

        this.modalMurdererPhoto = this.add.image(240, 180, 'room-door').setVisible(false).setDepth(10106).setScale(2)

        this.modalClueImageBg = this.add.rectangle(240, 160, 100, 100, 0xfcfbf8, 1)
            .setStrokeStyle(1, 0x9b7a48, 0.4)
            .setScrollFactor(0).setDepth(10105.5).setVisible(false).setOrigin(0.5)

        this.modalClueImage = this.add.image(240, 160, 'room-door')
            .setScrollFactor(0).setDepth(10106).setVisible(false).setOrigin(0.5)

        // Settings slider (Phaser-native so it scales with zoom)
        this.settingsSliderTrack = this.add.rectangle(240, 150, 220, 10, 0x2b2018, 0.35)
            .setStrokeStyle(1, 0x8c6e45, 0.55)
            .setScrollFactor(0)
            .setDepth(10106.2)
            .setVisible(false)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', pointer => {
                if (this.modalMode !== 'settings') return
                this.updateMusicVolumeFromDrag(pointer.worldX)
            })

        this.settingsSliderFill = this.add.rectangle(240, 150, 0, 10, 0x9f2d22, 0.55)
            .setScrollFactor(0)
            .setDepth(10106.25)
            .setOrigin(0, 0.5)
            .setVisible(false)

        this.settingsSliderHandle = this.add.rectangle(240, 150, 14, 18, 0xf8f4eb, 0.95)
            .setStrokeStyle(1, 0x6d5235, 0.8)
            .setScrollFactor(0)
            .setDepth(10106.3)
            .setVisible(false)
            .setInteractive({ useHandCursor: true, draggable: true })

        this.input.setDraggable(this.settingsSliderHandle)
        this.settingsSliderHandle.on('drag', (_pointer, dragX) => {
            if (this.modalMode !== 'settings') return
            this.updateMusicVolumeFromDrag(dragX)
        })

        // Accusation grid (portraits)
        const accuseOrder = [
            'martha',
            'gordy',
            'eddie',
            'eleanor',
            'winston',
            'sam',
            'clara',
            'ben',
            'walter'
        ].filter(id => SUSPECTS[id])

        this.accuseCards = accuseOrder.map((id, index) => {
            const suspect = SUSPECTS[id]
            const bg = this.add.rectangle(0, 0, 84, 92, 0x241a13, 0.92)
                .setStrokeStyle(1, 0x8d7350, 0.86)
                .setScrollFactor(0)
                .setDepth(10106.5)
                .setVisible(false)
                .setInteractive({ useHandCursor: true })

            const portrait = this.add.image(0, 0, assetKey(suspect.portrait))
                .setScrollFactor(0)
                .setDepth(10106.6)
                .setVisible(false)

            const label = this.add.text(0, 0, `${index + 1}. ${suspect.name}`, {
                fontFamily: '"Manrope", Arial, sans-serif',
                fontSize: '10px',
                fontStyle: '700',
                color: '#20150f',
                align: 'center',
                wordWrap: { width: 86 }
            })
                .setOrigin(0.5, 0)
                .setScrollFactor(0)
                .setDepth(10106.7)
                .setVisible(false)

            const choose = () => this.chooseAccusedSuspect(id)
            bg.on('pointerdown', choose)
            portrait.setInteractive({ useHandCursor: true }).on('pointerdown', choose)
            label.setInteractive({ useHandCursor: true }).on('pointerdown', choose)

            return { id, bg, portrait, label }
        })

        this.createNotesPanel()
    }

    updateMusicVolumeFromDrag(dragX) {
        const { leftWorld, widthWorld } = this.settingsSliderBounds ?? { leftWorld: 0, widthWorld: 1 }
        const clamped = Phaser.Math.Clamp(dragX, leftWorld, leftWorld + widthWorld)
        const t = Phaser.Math.Clamp((clamped - leftWorld) / widthWorld, 0, 1)
        this.state.musicVolume = t
        this.updateSettingsSlider()
    }

    updateSettingsSlider() {
        if (!this.settingsSliderBounds) return
        const t = Phaser.Math.Clamp(this.state.musicVolume ?? 0.5, 0, 1)
        const { leftWorld, widthWorld, widthPx, yWorld } = this.settingsSliderBounds
        const x = leftWorld + widthWorld * t

        this.settingsSliderHandle.setPosition(x, yWorld)
        this.settingsSliderFill.setPosition(leftWorld, yWorld)
        this.settingsSliderFill.width = Math.max(2, widthPx * t)

        // Keep the modal body text updated with the current volume.
        if (this.modalMode === 'settings') {
            this.modalBody.setText(this.getSettingsText())
        }
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
        this.notesDom.setScrollFactor(0).setDepth(10150).setVisible(false)

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
            if (this.modalMode === 'notes' || this.modalMode === 'code') {
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

            if (this.modalMode) {
                this.hideModal()
                return
            }

            if (!canAccuse()) {
                const needed = Math.max(0, CASE_FILE.accusationThreshold - this.clues.length)
                this.setNotice(`You need ${needed} more clues before the final decision.`, 2800)
                return
            }

            this.showAccusationModal()
        }

        this.handleEscape = () => {
            if (this.modalMode === 'notes') {
                this.toggleNotes(false)
                return
            }

            if (this.modalMode) {
                this.hideModal()
                return
            }

            // Close clue preview with Esc
            if (this.cluePreviewVisible) {
                this.hideCluePreview()
            }
        }

        this.handleChoice1 = () => this.handleModalChoice(1)
        this.handleChoice2 = () => this.handleModalChoice(2)
        this.handleChoice3 = () => this.handleModalChoice(3)
        this.handleChoice4 = () => this.handleModalChoice(4)
        this.handleNote = () => this.appendPendingNote()
        this.handleKeydown = event => this.handleCodeInput(event)

        this.input.keyboard.on('keydown-E', this.handleInteract)
        this.input.keyboard.on('keydown-ENTER', this.handleInteract)
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
            this.input.keyboard.off('keydown-ENTER', this.handleInteract)
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
                'Press E / Enter or Esc to continue.',
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
            'Press E / Enter, F, or Esc. Click an inventory icon to reopen it.',
            'clue',
            { visual: clue.visual, icon: clue.icon }
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
            'Press N to save this to notes. E / Enter or Esc closes.',
            'interview',
            { portrait: suspect.portrait }
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
        if (this.modalMode === 'quiz') {
            this.chooseQuizAnswer(index - 1)
        }
    }

    showSettings() {
        this.showModal(
            'Settings & Controls',
            this.getSettingsText(),
            'Press E or Esc to close.',
            'settings'
        )
    }

    getSettingsText() {
        const volume = Math.round((this.state.musicVolume ?? 0.5) * 100)
        return [
            `MUSIC VOLUME: ${volume}%`,
            '',
            'CONTROLS:',
            'WASD / Arrows: Move character',
            'E: Interact / Close modal',
            'F: Accusation menu',
            'N: Save interview to NOTES',
            'ESC: Close modal / NOTES'
        ].join('\n')
    }

    showAccusationModal() {
        this.quizAnswers = []
        this.quizStep = 0
        this.showModal(
            'Choose the killer',
            [
                'Pick a suspect from the portraits.',
                '',
                'After choosing, you must answer 3 questions',
                'about the case and the clues to confirm',
                'you actually played the investigation.'
            ].join('\n'),
            'Click a portrait to accuse. E / Esc closes.',
            'accuse'
        )
    }

    chooseAccusedSuspect(id) {
        if (this.modalMode !== 'accuse') return
        this.pendingAccusedId = id
        this.quizAnswers = []
        this.quizStep = 0
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
            const quizCorrect = this.quizAnswers.every((ans, i) => ans === CASE_QUIZ[i].answer)

            if (!quizCorrect) {
                this.showModal(
                    'Interrogation Failed',
                    'You could not explain key details of the murder. The manor keeps its secret.',
                    'Press E, F, or Esc to return.',
                    'ending'
                )
                return
            }

            if (!canReachTruth()) {
                this.showModal(
                    'Not Ready Yet',
                    'You have suspicions, but you still lack crucial evidence. Collect the remaining required clues before the final accusation.',
                    'Press E, F, or Esc to return.',
                    'ending'
                )
                return
            }

            const accusedId = this.pendingAccusedId
            const murdererId = 'walter'
            const guessCorrect = accusedId === murdererId
            this.state.solved = guessCorrect
            this.state.endingId = guessCorrect ? 'accuse-walter' : 'accuse-wrong'

            const truthBody = ENDING_OPTIONS.find(opt => opt.id === 'arrest-walter')?.body
                ?? 'Walter confesses to everything. The rails, the remote lock, and the knife were all part of his judgment.'

            this.showMurdererResult({ body: truthBody, accusedId, guessCorrect })
            this.updateHeader()
        }
    }

    showMurdererResult({ body, accusedId, guessCorrect }) {
        this.showModal(
            'CASE SOLVED',
            '',
            'Press E to close.',
            'murder-reveal'
        )

        const suspect = SUSPECTS['walter']
        this.modalTitle.setText('THE MURDER IS')
        this.modalTitle.setStyle({ color: '#ff0000', fontSize: '32px' })

        const accusedName = SUSPECTS[accusedId]?.name ?? 'Unknown'
        const verdict = guessCorrect
            ? `You accused ${accusedName}. Correct.`
            : `You accused ${accusedName}. Wrong.`

        this.modalBody.setText(`${suspect.name}\n${verdict}\n\n${body}`)
        this.modalMurdererPhoto.setTexture(assetKey(suspect.portrait))
        this.modalMurdererPhoto.setVisible(true)
        this.layoutOverlay()
    }

    showInventoryItem(item) {
        selectInventoryItem(item.id)
        this.showModal(
            item.title,
            `${item.description}\n\n${item.details ?? ''}`,
            'Press E or Esc to close.',
            'inventory',
            item
        )
    }

    showModal(title, body, footer, mode, extraData = null) {
        this.modalMode = mode
        this.modalTitle.setText(title)
        this.modalBody.setText(body)
        this.modalFooter.setText(footer)

        if (mode !== 'murder-reveal') {
            this.modalTitle.setStyle({ color: '#20150f', fontSize: '24px' })
        }

        const bodyLength = body.length
        const fontSize = bodyLength > 1200 ? 14 : bodyLength > 900 ? 16 : bodyLength > 600 ? 18 : 20
        const lineSpacing = bodyLength > 900 ? 4 : 6
        this.modalBody.setStyle({
            fontSize: `${fontSize}px`,
            lineSpacing
        })

        if (this.cluePreviewVisible) {
            this.hideCluePreview()
        }

        this.modalMurdererPhoto.setVisible(false)
        this.modalClueImage.setVisible(false)
        this.modalClueImageBg.setVisible(false)
        this._modalExtraData = extraData

        // Show clue/suspect image inside the modal
        if (extraData && (mode === 'clue' || mode === 'inventory' || mode === 'interview')) {
            let imageKey = null
            if (mode === 'interview' && extraData.portrait) {
                imageKey = extraData.portrait
            } else {
                imageKey = extraData.visual?.image || extraData.icon
            }
            if (imageKey && this.textures.exists(assetKey(imageKey))) {
                this.modalClueImage.setTexture(assetKey(imageKey))
                this.modalClueImage.setVisible(true)
                this.modalClueImageBg.setVisible(true)
            }
        }

        this.modalBackdrop.setVisible(true)
        this.modalShadow.setVisible(true)
        this.modalPaperBack.setVisible(true)
        this.modalFolder.setVisible(true)
        this.modalStamp.setVisible(true)
        this.modalTitle.setVisible(true)
        this.modalBody.setVisible(true)
        this.modalFooter.setVisible(true)

        this.layoutOverlay()
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
        this.modalClueImage.setVisible(false)
        this.modalClueImageBg.setVisible(false)
        this.settingsSliderTrack.setVisible(false)
        this.settingsSliderFill.setVisible(false)
        this.settingsSliderHandle.setVisible(false)

        if (this.accuseCards) {
            this.accuseCards.forEach(card => {
                card.bg.setVisible(false)
                card.portrait.setVisible(false)
                card.label.setVisible(false)
            })
        }
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

    showCluePreview(clue) {
        if (!clue || this.cluePreviewVisible) return

        this.cluePreviewVisible = true

        // Check if clue is already collected
        const alreadyCollected = this.clues.some(c => c.id === clue.id)

        // Set up the preview content
        this.cluePreviewTitle.setText(clue.title)
        this.cluePreviewDesc.setText(clue.description)
        this.cluePreviewDetails.setText(clue.details ?? '')

        // Update hint based on collection status
        if (alreadyCollected) {
            this.cluePreviewHint.setText('Already collected • Press E to view again • Esc to close')
        } else {
            this.cluePreviewHint.setText('Press E to collect • Esc to close')
        }

        // Show image if available
        const imageKey = clue.visual?.image || clue.icon
        if (imageKey && this.textures.exists(assetKey(imageKey))) {
            this.cluePreviewImage.setTexture(assetKey(imageKey))
            this.cluePreviewImage.setVisible(true)
            this.cluePreviewImageBg.setVisible(true)
        } else {
            this.cluePreviewImage.setVisible(false)
            this.cluePreviewImageBg.setVisible(false)
        }

        // Show the preview panel
        this.cluePreviewBackdrop.setVisible(true)
        this.cluePreviewPaper.setVisible(true)
        this.cluePreviewTitle.setVisible(true)
        this.cluePreviewDesc.setVisible(true)
        this.cluePreviewDetails.setVisible(true)
        this.cluePreviewHint.setVisible(true)

        // Adjust text positions if image is shown
        if (imageKey && this.textures.exists(assetKey(imageKey))) {
            this.cluePreviewTitle.setY(165)
            this.cluePreviewDesc.setY(200)
            this.cluePreviewDetails.setY(240)
            this.cluePreviewHint.setY(340)
        } else {
            this.cluePreviewTitle.setY(70)
            this.cluePreviewDesc.setY(105)
            this.cluePreviewDetails.setY(150)
            this.cluePreviewHint.setY(260)
        }

        this.layoutOverlay()
    }

    hideCluePreview() {
        if (!this.cluePreviewVisible) return

        this.cluePreviewVisible = false
        this.cluePreviewBackdrop.setVisible(false)
        this.cluePreviewPaper.setVisible(false)
        this.cluePreviewTitle.setVisible(false)
        this.cluePreviewDesc.setVisible(false)
        this.cluePreviewDetails.setVisible(false)
        this.cluePreviewHint.setVisible(false)
        this.cluePreviewImage.setVisible(false)
        this.cluePreviewImageBg.setVisible(false)
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
            const isNear = now - clue.lastSeenAt <= INTERACTION_WINDOW
            clue.visual.setScale(clue.baseScale)

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
            character.sprite.setScale(character.baseScale)

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

        // Auto-show clue preview when near a clue (and not in modal mode)
        if (this.currentClue && !this.modalMode && !this.cluePreviewVisible) {
            this.showCluePreview(this.currentClue)
        } else if ((!this.currentClue || this.modalMode) && this.cluePreviewVisible) {
            this.hideCluePreview()
        }

        // Y-sorting
        this.lia.sprite.setDepth(this.lia.sprite.y)
        this.clueObjects.forEach(clue => clue.visual.setDepth(clue.visual.y))
        this.characterObjects.forEach(char => char.sprite.setDepth(char.sprite.y))
        this.doors.forEach(door => {
            if (door.sprite) {
                door.sprite.setDepth(door.y - 10) // Doors usually background
            }
        })
        if (this.officer) this.officer.setDepth(this.officer.y)
        if (this.ashMarker) this.ashMarker.setDepth(this.ashMarker.y)
    }

    updatePrompt() {
        let text = 'Move: WASD/Arrows. E/Enter - interact. F - accusation. NOTES - notebook.'

        if (this.modalMode === 'code') {
            text = 'Enter the code and press Enter.'
        } else if (this.modalMode === 'accuse') {
            text = 'Click a portrait to accuse. E or Esc closes.'
        } else if (this.modalMode === 'quiz') {
            text = 'Answer with 1, 2, 3, or 4.'
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
            text = 'Truth is established. Press F for accusation.'
        } else if (canAccuse()) {
            text = 'You can accuse someone, but part of the truth may still be missing. F - accuse.'
        }

        this.promptText.setText(text)
    }

    rebuildInventoryBar() {
        this.inventoryElements.forEach(element => element.destroy())
        this.inventoryElements = []

        const items = getInventoryItems()
        const camera = this.cameras.main
        camera.update(0, 0)
        const zoom = camera.zoom
        const invZoom = 1 / zoom
        const width = this.scale.width
        const height = this.scale.height
        const view = camera.worldView
        const topLeft = { x: view.x, y: view.y }
        const maxVisible = Math.max(6, Math.floor((width - 190 * invZoom) / ((INVENTORY_SLOT_SIZE + 6) * invZoom)))
        const visibleItems = items.slice(Math.max(0, items.length - maxVisible))
        const startX = topLeft.x + 142 * invZoom
        const y = topLeft.y + height * invZoom - 21 * invZoom

        visibleItems.forEach((item, index) => {
            const x = startX + index * (INVENTORY_SLOT_SIZE + 6) * invZoom
            const slot = this.add.rectangle(x, y, INVENTORY_SLOT_SIZE, INVENTORY_SLOT_SIZE, 0x241a13, 0.96)
                .setStrokeStyle(1, 0x8d7350, 0.86)
                .setScrollFactor(0)
                .setDepth(10010)
                .setScale(invZoom)
                .setInteractive({ useHandCursor: true })

            const iconKey = assetKey(item.icon)
            const icon = this.textures.exists(iconKey)
                ? this.add.image(x, y, iconKey).setDisplaySize(26, 26)
                : this.add.rectangle(x, y, 24, 24, 0xd8b56d, 0.9)
            icon.setScrollFactor(0).setDepth(10011).setScale(invZoom)

            slot.on('pointerdown', () => this.showInventoryItem(item))
            icon.setInteractive({ useHandCursor: true }).on('pointerdown', () => this.showInventoryItem(item))

            this.inventoryElements.push(slot, icon)
        })

        if (items.length > visibleItems.length) {
            const hidden = items.length - visibleItems.length
            const moreText = this.add.text(topLeft.x + (width - 54) * invZoom, y, `+${hidden}`, {
                fontFamily: '"Manrope", Arial, sans-serif',
                fontSize: '13px',
                fontStyle: '800',
                color: '#d8b56d'
            }).setOrigin(0.5).setScrollFactor(0).setDepth(10012).setScale(invZoom)
            this.inventoryElements.push(moreText)
        }
    }

    handleResize(gameSize) {
        this.configureCamera()
        this.layoutOverlay(gameSize)
        this.rebuildInventoryBar()
    }

    layoutOverlay(gameSize = { width: this.scale.width, height: this.scale.height }) {
        const width = gameSize.width
        const height = gameSize.height
        const camera = this.cameras.main

        // Force-update the camera view rect after zoom / center changes (important on resize).
        camera.update(0, 0)

        const zoom = camera.zoom
        const invZoom = 1 / zoom
        const view = camera.worldView
        const topLeft = { x: view.x, y: view.y }
        const center = { x: view.centerX, y: view.centerY }

        const uiElements = [
            this.header,
            this.headerTitle,
            this.accusationButton,
            this.accusationText,
            this.settingsButton,
            this.settingsText,
            this.notesButton,
            this.notesText,
            this.noticeText,
            this.promptText,
            this.inventoryBar,
            this.modalBackdrop,
            this.modalShadow,
            this.modalPaperBack,
            this.modalFolder,
            this.modalStamp,
            this.modalTitle,
            this.modalBody,
            this.modalFooter,
            this.modalMurdererPhoto,
            this.settingsSliderTrack,
            this.settingsSliderFill,
            this.settingsSliderHandle,
            this.modalClueImageBg,
            this.cluePreviewBackdrop,
            this.cluePreviewPaper,
            this.cluePreviewTitle,
            this.cluePreviewDesc,
            this.cluePreviewDetails,
            this.cluePreviewHint,
            this.cluePreviewImageBg
        ]

        if (this.accuseCards) {
            this.accuseCards.forEach(card => {
                uiElements.push(card.bg, card.portrait, card.label)
            })
        }
        uiElements.forEach(el => el.setScale(invZoom))

        // Header / Footer bars
        this.header.setPosition(topLeft.x, topLeft.y).setSize(width, 42)
        this.inventoryBar.setPosition(topLeft.x, topLeft.y + height * invZoom).setSize(width, 42)

        // Header title
        this.headerTitle.setPosition(topLeft.x + 14 * invZoom, topLeft.y + 10 * invZoom)

        // Top-right buttons
        const headerY = topLeft.y + 21 * invZoom
        this.notesButton.setPosition(topLeft.x + (width - 250) * invZoom, headerY)
        this.notesText.setPosition(topLeft.x + (width - 250) * invZoom, headerY)

        this.accusationButton.setPosition(topLeft.x + (width - 150) * invZoom, headerY)
        this.accusationText.setPosition(topLeft.x + (width - 150) * invZoom, headerY)

        this.settingsButton.setPosition(topLeft.x + (width - 60) * invZoom, headerY)
        this.settingsText.setPosition(topLeft.x + (width - 60) * invZoom, headerY)

        // Prompt and notice
        this.noticeText.setPosition(topLeft.x + (width - 14) * invZoom, topLeft.y + 54 * invZoom)
        this.promptText.setPosition(topLeft.x + 14 * invZoom, topLeft.y + (height - 14) * invZoom)

        // Modal layout (responsive)
        const modalWidth = Math.min(560, Math.max(320, width - 80))
        const modalHeight = Math.min(380, Math.max(240, height - 140))

        this.modalBackdrop.setPosition(center.x, center.y).setSize(width, height)

        this.modalShadow.setPosition(center.x + 4 * invZoom, center.y + 4 * invZoom).setSize(modalWidth, modalHeight)
        this.modalPaperBack.setPosition(center.x, center.y).setSize(modalWidth - 20, modalHeight - 20)
        this.modalFolder.setPosition(center.x, center.y).setSize(modalWidth - 30, modalHeight - 30)

        const modalTop = center.y - (modalHeight / 2) * invZoom
        const modalBottom = center.y + (modalHeight / 2) * invZoom

        this.modalStamp.setPosition(center.x, modalTop + 20 * invZoom)
        this.modalTitle.setPosition(center.x, modalTop + 44 * invZoom)
        this.modalFooter.setPosition(center.x, modalBottom - 18 * invZoom)

        // Body and special modes
        const bodyTop = modalTop + 84 * invZoom
        const bodyBottom = modalBottom - 44 * invZoom

        if (this.modalMode === 'murder-reveal') {
            const photoY = bodyTop + 34 * invZoom
            this.modalMurdererPhoto.setPosition(center.x, photoY)
            this.modalBody.setPosition(center.x, photoY + 58 * invZoom)
        } else if (this.modalMode === 'settings') {
            this.modalBody.setPosition(center.x, bodyTop + 64 * invZoom)
        } else if (this.modalClueImage.visible) {
            // Clue / Interview / Inventory image display
            const isInterview = this.modalMode === 'interview'

            // Larger image sizes for a cooler presentation
            const imgW = isInterview ? 76 : 86
            const imgH = isInterview ? 116 : 86

            this.modalClueImage.setDisplaySize(imgW * invZoom, imgH * invZoom)

            // Polaroid-like background frame
            this.modalClueImageBg.setSize(imgW + 14, imgH + 28)

            // Adjust photoY so it sits prominently below the title
            const photoY = bodyTop + (imgH / 2 + 10) * invZoom

            this.modalClueImageBg.setPosition(center.x, photoY)
            this.modalClueImage.setPosition(center.x, photoY - 6 * invZoom)

            this.modalBody.setPosition(center.x, photoY + (imgH / 2 + 24) * invZoom)
        } else {
            this.modalBody.setPosition(center.x, bodyTop)
        }

        if (this.accuseCards) {
            const show = this.modalMode === 'accuse'
            this.accuseCards.forEach(card => {
                card.bg.setVisible(show)
                card.portrait.setVisible(show)
                card.label.setVisible(show)
            })

            if (show) {
                const cols = 3
                const cellW = 96
                const cellH = 106
                const gridTop = bodyTop + 8 * invZoom
                const startX = center.x - ((cols - 1) * cellW * 0.5) * invZoom

                this.accuseCards.forEach((card, idx) => {
                    const col = idx % cols
                    const row = Math.floor(idx / cols)
                    const x = startX + col * cellW * invZoom
                    const y = gridTop + row * cellH * invZoom

                    card.bg.setPosition(x, y).setSize(84, 92)
                    card.portrait.setPosition(x, y - 8 * invZoom).setDisplaySize(46, 68)
                    card.label.setPosition(x, y + 40 * invZoom)
                })
            }
        }

        const wrapWidth = Math.max(260, modalWidth - 70)
        this.modalTitle.setWordWrapWidth(wrapWidth)
        this.modalBody.setWordWrapWidth(wrapWidth)
        this.modalFooter.setWordWrapWidth(modalWidth - 40)

        // Notes panel (DOM)
        if (this.notesDom) {
            const panelWidth = 320
            const x = camera.getWorldPoint(width - 20 - panelWidth / 2, height / 2).x
            const y = camera.getWorldPoint(width - 20 - panelWidth / 2, height / 2).y
            this.notesDom.setPosition(x, y)
            this.notesDom.setScale(invZoom)
        }

        // Settings slider position
        if (this.modalMode === 'settings') {
            const sliderY = bodyTop + 34 * invZoom
            const sliderWidth = Math.min(260, modalWidth - 120)
            const left = center.x - (sliderWidth / 2) * invZoom

            this.settingsSliderBounds = {
                leftWorld: left,
                widthWorld: sliderWidth * invZoom,
                widthPx: sliderWidth,
                yWorld: sliderY
            }

            this.settingsSliderTrack
                .setPosition(center.x, sliderY)
                .setSize(sliderWidth, 10)
                .setVisible(true)

            this.settingsSliderFill.setSize(sliderWidth, 10).setVisible(true)
            this.settingsSliderHandle.setVisible(true)
            this.updateSettingsSlider()
        } else {
            this.settingsSliderBounds = null
            this.settingsSliderTrack.setVisible(false)
            this.settingsSliderFill.setVisible(false)
            this.settingsSliderHandle.setVisible(false)
        }

        // Clue preview panel layout
        if (this.cluePreviewVisible) {
            const previewWidth = Math.min(520, Math.max(340, width - 60))
            const previewHeight = Math.min(340, Math.max(260, height - 160))

            this.cluePreviewBackdrop.setPosition(center.x, center.y).setSize(width, height)
            this.cluePreviewPaper.setPosition(center.x, center.y).setSize(previewWidth - 40, previewHeight - 40)

            const previewTop = center.y - (previewHeight / 2) * invZoom
            const previewCenter = previewTop + (previewHeight / 2) * invZoom

            const hasImage = this.cluePreviewImage.visible
            if (hasImage) {
                const imgW = 80
                const imgH = 80
                const photoY = previewTop + (imgH / 2 + 20) * invZoom

                this.cluePreviewImageBg.setPosition(center.x, photoY).setSize(imgW + 14, imgH + 28)
                this.cluePreviewImage.setPosition(center.x, photoY - 4 * invZoom).setDisplaySize(imgW * invZoom, imgH * invZoom)

                this.cluePreviewTitle.setPosition(center.x, photoY + (imgH / 2 + 30) * invZoom)
                this.cluePreviewDesc.setPosition(center.x, photoY + (imgH / 2 + 65) * invZoom)
                this.cluePreviewDetails.setPosition(center.x, photoY + (imgH / 2 + 115) * invZoom)
                this.cluePreviewHint.setPosition(center.x, previewTop + previewHeight * invZoom - 24 * invZoom)
            } else {
                this.cluePreviewTitle.setPosition(center.x, previewTop + 30 * invZoom)
                this.cluePreviewDesc.setPosition(center.x, previewTop + 75 * invZoom)
                this.cluePreviewDetails.setPosition(center.x, previewTop + 125 * invZoom)
                this.cluePreviewHint.setPosition(center.x, previewTop + previewHeight * invZoom - 24 * invZoom)
            }

            // Update word wrap widths
            const previewWrapWidth = Math.max(300, previewWidth - 60)
            this.cluePreviewTitle.setWordWrapWidth(previewWrapWidth)
            this.cluePreviewDesc.setWordWrapWidth(previewWrapWidth)
            this.cluePreviewDetails.setWordWrapWidth(previewWrapWidth)
        }
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
