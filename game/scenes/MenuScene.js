import Phaser from 'phaser'
import { CASE_FILE } from './gameState.js'

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene')
    }

    create() {
        this.cameras.main.setBackgroundColor('#040712')

        this.backdrop = this.add.rectangle(0, 0, 0, 0, 0x040712, 1)
            .setOrigin(0, 0)
        this.glowA = this.add.ellipse(0, 0, 460, 460, 0x1d4ed8, 0.18)
        this.glowB = this.add.ellipse(0, 0, 360, 360, 0xb91c1c, 0.16)

        this.card = this.add.rectangle(0, 0, 760, 460, 0x0f172a, 0.96)
            .setStrokeStyle(2, 0x64748b, 0.95)

        this.kicker = this.add.text(0, 0, 'Playable Mystery Demo', {
            fontSize: '18px',
            color: '#93c5fd',
            letterSpacing: 1
        }).setOrigin(0.5)

        this.title = this.add.text(0, 0, 'THORNFIELD HOUSE', {
            fontSize: '54px',
            fontStyle: 'bold',
            color: '#f8fafc'
        }).setOrigin(0.5)

        this.subtitle = this.add.text(0, 0, `${CASE_FILE.victim} was murdered before midnight.`, {
            fontSize: '24px',
            color: '#e2e8f0'
        }).setOrigin(0.5)

        this.body = this.add.text(0, 0, CASE_FILE.menuIntro, {
            fontSize: '19px',
            color: '#cbd5e1',
            align: 'center',
            wordWrap: { width: 620 },
            lineSpacing: 8
        }).setOrigin(0.5)

        this.controls = this.add.text(0, 0, 'Arrow Keys: Move    E: Inspect / Enter    F: Accuse', {
            fontSize: '18px',
            color: '#f8fafc'
        }).setOrigin(0.5)

        this.startButton = this.add.rectangle(0, 0, 280, 58, 0x1d4ed8, 1)
            .setStrokeStyle(2, 0xbfdbfe, 0.9)
            .setInteractive({ useHandCursor: true })

        this.startLabel = this.add.text(0, 0, 'Start Investigation', {
            fontSize: '22px',
            fontStyle: 'bold',
            color: '#eff6ff'
        }).setOrigin(0.5)

        this.startHint = this.add.text(0, 0, 'Press Enter or click the button', {
            fontSize: '16px',
            color: '#93c5fd'
        }).setOrigin(0.5)

        this.startButton.on('pointerover', () => {
            this.startButton.setFillStyle(0x2563eb, 1)
        })
        this.startButton.on('pointerout', () => {
            this.startButton.setFillStyle(0x1d4ed8, 1)
        })
        this.startButton.on('pointerdown', () => this.startGame())

        this.input.keyboard.once('keydown-ENTER', () => this.startGame())

        this.scale.on('resize', this.handleResize, this)
        this.events.once('shutdown', () => {
            this.scale.off('resize', this.handleResize, this)
        })

        this.handleResize({ width: this.scale.width, height: this.scale.height })
    }

    handleResize(gameSize) {
        const width = gameSize.width
        const height = gameSize.height

        this.backdrop.setSize(width, height)
        this.glowA.setPosition(width * 0.18, height * 0.24)
        this.glowB.setPosition(width * 0.83, height * 0.74)

        this.card.setPosition(width / 2, height / 2)
        this.kicker.setPosition(width / 2, height / 2 - 176)
        this.title.setPosition(width / 2, height / 2 - 124)
        this.subtitle.setPosition(width / 2, height / 2 - 70)
        this.body.setPosition(width / 2, height / 2 + 10)
        this.controls.setPosition(width / 2, height / 2 + 112)
        this.startButton.setPosition(width / 2, height / 2 + 180)
        this.startLabel.setPosition(width / 2, height / 2 + 180)
        this.startHint.setPosition(width / 2, height / 2 + 226)
    }

    startGame() {
        this.cameras.main.fadeOut(220, 0, 0, 0)
        this.time.delayedCall(230, () => {
            this.scene.start('GameScene')
        })
    }
}
