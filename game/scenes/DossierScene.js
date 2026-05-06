import Phaser from 'phaser'
import { CASE_FILE } from './gameState.js'

export default class DossierScene extends Phaser.Scene {
    constructor() {
        super('DossierScene')
    }

    create() {
        this.cameras.main.setBackgroundColor('#100b08')

        this.background = this.add.rectangle(0, 0, 0, 0, 0x100b08, 1)
            .setOrigin(0, 0)
        this.tableGlow = this.add.rectangle(0, 0, 0, 0, 0x1f1711, 0.55)
            .setStrokeStyle(1, 0x6d5235, 0.25)
        this.folderShadow = this.add.rectangle(0, 0, 0, 0, 0x000000, 0.3)
            .setAngle(-4)
        this.paperBottom = this.add.rectangle(0, 0, 0, 0, 0xf4ede3, 0.95)
            .setAngle(-5)
            .setStrokeStyle(1, 0xd6ccb9, 0.65)
        this.paperTop = this.add.rectangle(0, 0, 0, 0, 0xf8f4eb, 0.98)
            .setAngle(2)
            .setStrokeStyle(1, 0xd6ccb9, 0.75)
        this.folder = this.add.rectangle(0, 0, 0, 0, 0xbf9f72, 1)
            .setAngle(-3)
            .setStrokeStyle(1, 0x8c6e45, 0.9)

        this.folderStamp = this.add.text(0, 0, 'BLACKWOOD', {
            fontFamily: '"Special Elite", "Courier New", monospace',
            fontSize: '28px',
            color: '#9f2d22'
        }).setOrigin(0.5).setAngle(-3)

        this.caseNumber = this.add.text(0, 0, 'DOSSIER 1987', {
            fontFamily: '"Special Elite", "Courier New", monospace',
            fontSize: '22px',
            color: '#9f2d22'
        }).setOrigin(0.5).setAngle(-3)

        this.dossierCard = this.add.rectangle(0, 0, 0, 0, 0xf8f4eb, 0.98)
            .setStrokeStyle(1, 0xd6ccb9, 0.8)

        this.cardTitle = this.add.text(0, 0, CASE_FILE.caseName, {
            fontFamily: '"Cormorant Garamond", Georgia, serif',
            fontSize: '46px',
            fontStyle: '700',
            color: '#20150f'
        }).setOrigin(0.5)

        this.cardBody = this.add.text(0, 0, '', {
            fontFamily: '"Libre Baskerville", Georgia, serif',
            fontSize: '17px',
            color: '#35261c',
            lineSpacing: 10,
            wordWrap: { width: 760 }
        }).setOrigin(0.5, 0)

        this.startShadow = this.add.rectangle(0, 0, 300, 60, 0x2c2017, 0.35)
            .setInteractive({ useHandCursor: true })
        this.startButton = this.add.rectangle(0, 0, 300, 60, 0x2a1b12, 0.95)
            .setStrokeStyle(1, 0xe7d8bf, 0.8)
            .setInteractive({ useHandCursor: true })
        this.startLabel = this.add.text(0, 0, 'ВЛЕЗ В ИМЕНИЕТО', {
            fontFamily: '"Manrope", Arial, sans-serif',
            fontSize: '18px',
            fontStyle: '700',
            color: '#f8f4eb'
        }).setOrigin(0.5)

        const cardLines = [
            `Жертва: ${CASE_FILE.victim}`,
            `Място: ${CASE_FILE.location}`,
            `Час на смъртта: ${CASE_FILE.timeOfDeath}`,
            '',
            CASE_FILE.summary,
            '',
            'Известни факти:',
            `- ${CASE_FILE.details[0]}`,
            `- ${CASE_FILE.details[1]}`,
            `- ${CASE_FILE.details[2]}`,
            '',
            CASE_FILE.objective
        ]
        this.cardBody.setText(cardLines.join('\n'))

        const start = () => this.startGame()
        this.startButton.on('pointerover', () => {
            this.startButton.setFillStyle(0x4a261d, 0.98)
            this.startButton.setStrokeStyle(1, 0xf8f4eb, 1)
        })
        this.startButton.on('pointerout', () => {
            this.startButton.setFillStyle(0x2a1b12, 0.95)
            this.startButton.setStrokeStyle(1, 0xe7d8bf, 0.8)
        })
        this.startButton.on('pointerdown', start)
        this.startShadow.on('pointerdown', start)

        this.input.keyboard.once('keydown-ENTER', start)

        this.scale.on('resize', this.handleResize, this)
        this.events.once('shutdown', () => {
            this.scale.off('resize', this.handleResize, this)
        })

        this.handleResize({ width: this.scale.width, height: this.scale.height })
    }

    handleResize(gameSize) {
        const width = gameSize.width
        const height = gameSize.height

        this.background.setSize(width, height)
        this.tableGlow.setPosition(width * 0.5, height * 0.5)
        this.tableGlow.setSize(Math.min(1100, width - 50), Math.min(760, height - 50))

        const folderWidth = Math.min(980, width - 120)
        const folderHeight = Math.min(620, height - 140)
        const centerX = width / 2
        const centerY = height / 2

        this.folderShadow.setPosition(centerX + 12, centerY + 12)
        this.folderShadow.setSize(folderWidth, folderHeight)
        this.paperBottom.setPosition(centerX + 18, centerY + 10)
        this.paperBottom.setSize(folderWidth - 70, folderHeight - 40)
        this.paperTop.setPosition(centerX + 4, centerY + 4)
        this.paperTop.setSize(folderWidth - 36, folderHeight - 18)
        this.folder.setPosition(centerX - 24, centerY - 4)
        this.folder.setSize(folderWidth * 0.56, folderHeight * 0.92)

        this.folderStamp.setPosition(centerX - folderWidth * 0.18, centerY - folderHeight * 0.1)
        this.caseNumber.setPosition(centerX - folderWidth * 0.19, centerY + folderHeight * 0.27)

        this.dossierCard.setPosition(centerX + folderWidth * 0.11, centerY)
        this.dossierCard.setSize(folderWidth * 0.64, folderHeight * 0.82)
        this.cardTitle.setPosition(centerX + folderWidth * 0.11, centerY - folderHeight * 0.31)
        this.cardBody.setPosition(centerX + folderWidth * 0.11, centerY - folderHeight * 0.23)
        this.cardBody.setWordWrapWidth(folderWidth * 0.54)

        this.startShadow.setPosition(centerX + folderWidth * 0.11, centerY + folderHeight * 0.35)
        this.startButton.setPosition(centerX + folderWidth * 0.11, centerY + folderHeight * 0.34)
        this.startLabel.setPosition(centerX + folderWidth * 0.11, centerY + folderHeight * 0.34)
    }

    startGame() {
        this.cameras.main.fadeOut(300, 0, 0, 0)
        this.time.delayedCall(320, () => {
            this.scene.start('GameScene')
        })
    }
}
