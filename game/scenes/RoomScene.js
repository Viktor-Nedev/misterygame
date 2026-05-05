import Phaser from 'phaser'
import { Scene, manager } from '@tialops/maki'
import {
    CASE_FILE,
    addClue,
    canAccuse,
    getGameState,
    hasRequiredClues,
    resolveAccusation
} from './gameState.js'

const INTERACTION_WINDOW = 140
const TILE_SIZE = 16
const MAP_WIDTH = 30 * TILE_SIZE
const MAP_HEIGHT = 18 * TILE_SIZE

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
    }

    create() {
        super.create()
        manager.create(this)
        this.renderWallLayer()

        this.state = getGameState()
        this.clues = this.state.clues
        this.suspects = this.state.suspects
        this.currentDoor = null
        this.currentClue = null
        this.isTransitioning = false
        this.modalMode = null
        this.noticeTimer = null

        this.cameras.main.setBackgroundColor('#050816')
        this.configureCamera()

        this.lia.sprite.setPosition(this.spawnPoint.x, this.spawnPoint.y)
        this.lia.sprite.setDepth(6)
        this.lia.sprite.setCollideWorldBounds(true)

        this.physics.world.setBounds(0, 0, MAP_WIDTH, MAP_HEIGHT)
        this.physics.add.collider(
            this.lia.sprite,
            manager.getWallGroup(this, this.roomConfig.mapName)
        )

        this.createDoors()
        this.createClueObjects()
        this.createOverlay()
        this.bindInput()
        this.updateHeader()
        this.setNotice(this.roomConfig.intro, 4200)

        this.scale.on('resize', this.handleResize, this)
        this.events.once('shutdown', () => {
            this.scale.off('resize', this.handleResize, this)
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

            const outline = this.add.rectangle(
                door.x,
                door.y,
                door.width,
                door.height,
                0x7dd3fc,
                0
            ).setStrokeStyle(2, 0x7dd3fc, 0).setDepth(7)

            const doorState = {
                ...door,
                zone,
                outline,
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
                clue.width + 18,
                clue.height + 18,
                0xffffff,
                0
            ).setStrokeStyle(2, 0xffffff, 0).setDepth(9)

            const clueState = {
                ...clue,
                zone,
                visual,
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
                    0.96
                ).setStrokeStyle(2, clue.visual.edgeColor ?? 0xe5e7eb, 0.95)
            ])

            if (clue.visual.lines) {
                visual.add(this.add.text(
                    0,
                    0,
                    clue.visual.lines,
                    {
                        fontSize: `${clue.visual.fontSize ?? 10}px`,
                        color: clue.visual.textColor ?? '#0f172a',
                        align: 'center'
                    }
                ).setOrigin(0.5))
            }
            break
        case 'device':
            visual = this.add.rectangle(
                clue.x,
                clue.y,
                clue.width,
                clue.height,
                clue.visual.bodyColor ?? 0x111827,
                1
            ).setStrokeStyle(2, clue.visual.edgeColor ?? 0x818cf8, 1)
            break
        case 'blade':
            visual = this.add.container(clue.x, clue.y, [
                this.add.rectangle(0, 0, clue.width, clue.height, 0xe5e7eb, 1),
                this.add.rectangle(
                    -(clue.width / 2) + 12,
                    0,
                    14,
                    clue.height + 6,
                    clue.visual.handleColor ?? 0x7c2d12,
                    1
                )
            ])
            break
        case 'glass':
            visual = this.add.container(clue.x, clue.y, [
                this.add.triangle(-10, 2, 0, 0, 10, 6, 4, 18, 0x93c5fd, 0.85),
                this.add.triangle(10, -4, 0, 4, 12, -8, 18, 10, 0xbfdbfe, 0.75),
                this.add.triangle(0, 10, -12, 6, -2, 18, 12, 14, 0xe0f2fe, 0.75)
            ])
            break
        default:
            visual = this.add.rectangle(
                clue.x,
                clue.y,
                clue.width,
                clue.height,
                clue.color,
                0.95
            )
        }

        return visual.setDepth(8)
    }

    createOverlay() {
        this.topShade = this.add.rectangle(0, 0, 0, 0, 0x030712, 0.58)
            .setOrigin(0, 0)
            .setScrollFactor(0)
            .setDepth(20)

        this.bottomShade = this.add.rectangle(0, 0, 0, 0, 0x030712, 0.54)
            .setOrigin(0, 1)
            .setScrollFactor(0)
            .setDepth(20)

        this.titleChip = this.add.rectangle(0, 0, 0, 0, 0x0f172a, 0.9)
            .setStrokeStyle(2, this.roomConfig.accentColor, 0.95)
            .setScrollFactor(0)
            .setDepth(21)

        this.titleText = this.add.text(0, 0, '', {
            fontSize: '28px',
            fontStyle: 'bold',
            color: '#f8fafc'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(22)

        this.noticeText = this.add.text(0, 0, '', {
            fontSize: '16px',
            color: '#cbd5e1',
            align: 'center',
            wordWrap: { width: 780 }
        }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(22)

        this.promptChip = this.add.rectangle(0, 0, 0, 0, 0x0f172a, 0.94)
            .setStrokeStyle(1, 0x334155, 0.9)
            .setScrollFactor(0)
            .setDepth(21)

        this.promptText = this.add.text(0, 0, '', {
            fontSize: '18px',
            color: '#f8fafc',
            align: 'center'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(22)

        this.modalBackdrop = this.add.rectangle(0, 0, 0, 0, 0x020617, 0.72)
            .setOrigin(0, 0)
            .setScrollFactor(0)
            .setDepth(39)
            .setVisible(false)

        this.modalCard = this.add.rectangle(0, 0, 620, 340, 0x0f172a, 0.98)
            .setStrokeStyle(2, 0x94a3b8, 0.9)
            .setScrollFactor(0)
            .setDepth(40)
            .setVisible(false)

        this.modalTitle = this.add.text(0, 0, '', {
            fontSize: '30px',
            fontStyle: 'bold',
            color: '#f8fafc',
            align: 'center',
            wordWrap: { width: 520 }
        }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(41).setVisible(false)

        this.modalBody = this.add.text(0, 0, '', {
            fontSize: '19px',
            color: '#dbe4ee',
            align: 'center',
            lineSpacing: 8,
            wordWrap: { width: 520 }
        }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(41).setVisible(false)

        this.modalFooter = this.add.text(0, 0, '', {
            fontSize: '15px',
            color: '#93c5fd',
            align: 'center',
            wordWrap: { width: 500 }
        }).setOrigin(0.5, 1).setScrollFactor(0).setDepth(41).setVisible(false)
    }

    bindInput() {
        this.handleInteract = () => {
            if (this.modalMode === 'clue' || this.modalMode === 'ending') {
                this.hideModal()
                return
            }

            if (this.modalMode === 'accusation') {
                return
            }

            if (this.isTransitioning) {
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

        this.handleAccuse = () => {
            if (this.isTransitioning) {
                return
            }

            if (this.modalMode === 'clue' || this.modalMode === 'ending') {
                this.hideModal()
                return
            }

            if (this.modalMode === 'accusation') {
                this.hideModal()
                return
            }

            if (!canAccuse()) {
                const needed = Math.max(0, CASE_FILE.accusationThreshold - this.clues.length)
                this.setNotice(`You need ${needed} more clue${needed === 1 ? '' : 's'} before making an accusation.`, 2800)
                return
            }

            this.showAccusationModal()
        }

        this.handleEscape = () => {
            if (this.modalMode) {
                this.hideModal()
            }
        }

        this.handleChoice1 = () => this.chooseSuspect(0)
        this.handleChoice2 = () => this.chooseSuspect(1)
        this.handleChoice3 = () => this.chooseSuspect(2)

        this.input.keyboard.on('keydown-E', this.handleInteract)
        this.input.keyboard.on('keydown-F', this.handleAccuse)
        this.input.keyboard.on('keydown-ESC', this.handleEscape)
        this.input.keyboard.on('keydown-ONE', this.handleChoice1)
        this.input.keyboard.on('keydown-TWO', this.handleChoice2)
        this.input.keyboard.on('keydown-THREE', this.handleChoice3)

        this.events.once('shutdown', () => {
            this.input.keyboard.off('keydown-E', this.handleInteract)
            this.input.keyboard.off('keydown-F', this.handleAccuse)
            this.input.keyboard.off('keydown-ESC', this.handleEscape)
            this.input.keyboard.off('keydown-ONE', this.handleChoice1)
            this.input.keyboard.off('keydown-TWO', this.handleChoice2)
            this.input.keyboard.off('keydown-THREE', this.handleChoice3)
        })
    }

    inspectClue(clue) {
        const isNewClue = addClue(clue.id, clue.title, clue.description)

        this.showModal(
            clue.title,
            `${clue.description}\n\n${isNewClue ? 'Clue recorded in Lia\'s notebook.' : 'Lia has already logged this clue.'}`,
            'Press E, F, or Esc to continue.',
            'clue'
        )

        this.updateHeader()
    }

    showAccusationModal() {
        this.showModal(
            'Make Your Accusation',
            [
                'The evidence board is full enough to name a killer.',
                '',
                `1. ${this.suspects[0]}`,
                `2. ${this.suspects[1]}`,
                `3. ${this.suspects[2]}`
            ].join('\n'),
            'Press 1, 2, or 3 to choose. Press F or Esc to back out.',
            'accusation'
        )
    }

    chooseSuspect(index) {
        if (this.modalMode !== 'accusation') {
            return
        }

        const suspect = this.suspects[index]
        if (!suspect) {
            return
        }

        const isCorrect = resolveAccusation(suspect)

        if (isCorrect) {
            this.showModal(
                'Case Closed',
                `${suspect} killed ${CASE_FILE.victim}.\n\nThe office knife, the threatening note, and the old photo prove Mara feared Evelyn would expose the stolen foundation money and the forged ledgers by dawn.`,
                'Press E, F, or Esc to continue exploring the house.',
                'ending'
            )
            this.setNotice('You solved the murder at Thornfield House.', 4000)
        } else {
            const hint = hasRequiredClues()
                ? 'The story still does not support that accusation.'
                : 'You are still missing the thread that links the knife, the threat, and Mara.'

            this.showModal(
                'Wrong Accusation',
                `${suspect} has motive, but the evidence does not hold.\n\n${hint}`,
                'Press E, F, or Esc to keep investigating.',
                'clue'
            )
        }

        this.updateHeader()
    }

    showModal(title, body, footer, mode) {
        this.modalMode = mode
        this.modalTitle.setText(title)
        this.modalBody.setText(body)
        this.modalFooter.setText(footer)

        this.modalBackdrop.setVisible(true)
        this.modalCard.setVisible(true)
        this.modalTitle.setVisible(true)
        this.modalBody.setVisible(true)
        this.modalFooter.setVisible(true)
    }

    hideModal() {
        this.modalMode = null
        this.modalBackdrop.setVisible(false)
        this.modalCard.setVisible(false)
        this.modalTitle.setVisible(false)
        this.modalBody.setVisible(false)
        this.modalFooter.setVisible(false)
    }

    enterDoor(door) {
        if (this.isTransitioning) {
            return
        }

        this.isTransitioning = true
        this.setNotice(`Entering the ${door.label}...`, 1200)
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
        const solvedText = this.state.solved ? '  |  Case solved' : ''
        this.titleText.setText(
            `${this.roomConfig.title}  |  Clues ${clueCount}/${CASE_FILE.totalClues}${solvedText}`
        )
    }

    updateInteractionState() {
        this.currentDoor = null
        this.currentClue = null

        let nearestDoorDistance = Infinity
        let nearestClueDistance = Infinity
        const now = this.time.now

        this.doors.forEach(door => {
            const isNear = now - door.lastSeenAt <= INTERACTION_WINDOW
            door.outline.setStrokeStyle(2, 0x7dd3fc, isNear ? 0.95 : 0)

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

            if (clue.visual.setScale) {
                clue.visual.setScale(isNear && !collected ? 1.04 : 1)
            }

            clue.highlight.setStrokeStyle(
                2,
                collected ? 0x86efac : 0xfde68a,
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
    }

    updatePrompt() {
        let text = 'Use the arrow keys to move. Investigate with E.'

        if (this.modalMode === 'accusation') {
            text = 'Choose a suspect with 1, 2, or 3.'
        } else if (this.modalMode) {
            text = 'Press E, F, or Esc to close the window.'
        } else if (this.currentClue) {
            text = `Press E to inspect ${this.currentClue.title}.`
        } else if (this.currentDoor) {
            text = `Press E to enter the ${this.currentDoor.label}.`
        } else if (canAccuse()) {
            text = 'You have enough evidence. Press F to make an accusation.'
        }

        this.promptText.setText(text)
    }

    handleResize(gameSize) {
        const width = gameSize.width
        const height = gameSize.height

        this.configureCamera()

        this.topShade.setSize(width, 118)
        this.bottomShade.setSize(width, 92)
        this.bottomShade.setPosition(0, height)

        const titleWidth = Math.min(740, width - 80)
        this.titleChip.setSize(titleWidth, 56)
        this.titleChip.setPosition(width / 2, 52)
        this.titleText.setPosition(width / 2, 52)
        this.noticeText.setPosition(width / 2, 86)
        this.noticeText.setWordWrapWidth(Math.max(360, width - 200))

        const promptWidth = Math.min(900, width - 96)
        this.promptChip.setSize(promptWidth, 50)
        this.promptChip.setPosition(width / 2, height - 38)
        this.promptText.setPosition(width / 2, height - 38)

        this.modalBackdrop.setSize(width, height)
        this.modalCard.setPosition(width / 2, height / 2)
        this.modalTitle.setPosition(width / 2, height / 2 - 136)
        this.modalBody.setPosition(width / 2, height / 2 - 70)
        this.modalBody.setWordWrapWidth(Math.min(560, width - 180))
        this.modalFooter.setPosition(width / 2, height / 2 + 138)
    }

    update() {
        this.updateInteractionState()
        this.updatePrompt()

        if (this.isTransitioning || this.modalMode) {
            this.lia.sprite.setVelocity(0)
            return
        }

        this.maki.move(this.lia)
    }
}
