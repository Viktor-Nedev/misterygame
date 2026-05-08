import Phaser from 'phaser'
import { CASE_FILE } from './gameState.js'

export default class DossierScene extends Phaser.Scene {
    constructor() {
        super('DossierScene')
        this.currentPage = 0
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
            .setAngle(-2)
            .setStrokeStyle(1, 0xd6ccb9, 0.65)
        this.paperTop = this.add.rectangle(0, 0, 0, 0, 0xf8f4eb, 0.98)
            .setAngle(1)
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
            fontSize: '40px',
            fontStyle: '700',
            color: '#20150f'
        }).setOrigin(0.5)

        this.cardBody = this.add.text(0, 0, '', {
            fontFamily: '"Libre Baskerville", Georgia, serif',
            fontSize: '16px',
            color: '#35261c',
            lineSpacing: 8,
            wordWrap: { width: 600 }
        }).setOrigin(0.5, 0)

        this.pageIndicator = this.add.text(0, 0, 'Page 1 of 3', {
            fontFamily: '"Manrope", Arial, sans-serif',
            fontSize: '14px',
            color: '#8c6e45'
        }).setOrigin(0.5)

        // Navigation Buttons
        this.prevButton = this.add.text(0, 0, '← PREVIOUS', {
            fontFamily: '"Manrope", Arial, sans-serif',
            fontSize: '16px',
            fontStyle: '700',
            color: '#8c6e45'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true })

        this.nextButton = this.add.text(0, 0, 'NEXT PAGE →', {
            fontFamily: '"Manrope", Arial, sans-serif',
            fontSize: '16px',
            fontStyle: '700',
            color: '#8c6e45'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true })

        this.startShadow = this.add.rectangle(0, 0, 320, 60, 0x2c2017, 0.35)
            .setInteractive({ useHandCursor: true })
        this.startButton = this.add.rectangle(0, 0, 320, 60, 0x2a1b12, 0.95)
            .setStrokeStyle(1, 0xe7d8bf, 0.8)
            .setInteractive({ useHandCursor: true })
        this.startLabel = this.add.text(0, 0, 'ENTER THE MANOR', {
            fontFamily: '"Manrope", Arial, sans-serif',
            fontSize: '18px',
            fontStyle: '700',
            color: '#f8f4eb'
        }).setOrigin(0.5)

        this.setupPages()
        this.updatePage()

        this.prevButton.on('pointerdown', () => this.changePage(-1))
        this.nextButton.on('pointerdown', () => this.changePage(1))
        
        this.prevButton.on('pointerover', () => this.prevButton.setColor('#20150f'))
        this.prevButton.on('pointerout', () => this.prevButton.setColor('#8c6e45'))
        this.nextButton.on('pointerover', () => this.nextButton.setColor('#20150f'))
        this.nextButton.on('pointerout', () => this.nextButton.setColor('#8c6e45'))

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
        this.input.keyboard.on('keydown-LEFT', () => this.changePage(-1))
        this.input.keyboard.on('keydown-RIGHT', () => this.changePage(1))

        this.scale.on('resize', this.handleResize, this)
        this.events.once('shutdown', () => {
            this.scale.off('resize', this.handleResize, this)
        })

        this.handleResize({ width: this.scale.width, height: this.scale.height })
    }

    setupPages() {
        this.pages = [
            [
                `Victim: ${CASE_FILE.victim}`,
                `Location: ${CASE_FILE.location}`,
                `Time of death: ${CASE_FILE.timeOfDeath}`,
                '',
                'Incident Summary:',
                CASE_FILE.summary
            ].join('\n'),
            [
                'Known facts from the initial report:',
                '',
                `- ${CASE_FILE.details[0]}`,
                '',
                `- ${CASE_FILE.details[1]}`,
                '',
                `- ${CASE_FILE.details[2]}`
            ].join('\n'),
            [
                'Mission Objectives:',
                '',
                CASE_FILE.objective,
                '',
                'The manor holds many secrets. Collect evidence, question the residents, and uncover the truth behind Arthur Blackwood\'s death.'
            ].join('\n')
        ]
    }

    changePage(delta) {
        const next = this.currentPage + delta
        if (next >= 0 && next < this.pages.length) {
            this.currentPage = next
            this.updatePage()
        }
    }

    updatePage() {
        this.cardBody.setText(this.pages[this.currentPage])
        this.pageIndicator.setText(`Page ${this.currentPage + 1} of ${this.pages.length}`)
        
        this.prevButton.setVisible(this.currentPage > 0)
        this.nextButton.setVisible(this.currentPage < this.pages.length - 1)
        
        // Show start button only on the last page
        const isLastPage = this.currentPage === this.pages.length - 1
        this.startButton.setVisible(isLastPage)
        this.startShadow.setVisible(isLastPage)
        this.startLabel.setVisible(isLastPage)
    }

    handleResize(gameSize) {
        const width = gameSize.width
        const height = gameSize.height

        this.background.setSize(width, height)
        this.tableGlow.setPosition(width * 0.5, height * 0.5)
        this.tableGlow.setSize(Math.min(1000, width - 40), Math.min(650, height - 40))

        const folderWidth = Math.min(820, width - 80)
        const folderHeight = Math.min(560, height - 80)
        const centerX = width / 2
        const centerY = height / 2

        this.folderShadow.setPosition(centerX + 10, centerY + 10)
        this.folderShadow.setSize(folderWidth, folderHeight)
        this.paperBottom.setPosition(centerX + 12, centerY + 6)
        this.paperBottom.setSize(folderWidth - 50, folderHeight - 24)
        this.paperTop.setPosition(centerX + 4, centerY + 4)
        this.paperTop.setSize(folderWidth - 24, folderHeight - 12)
        this.folder.setPosition(centerX - folderWidth * 0.22, centerY - 4)
        this.folder.setSize(folderWidth * 0.48, folderHeight * 0.95)

        this.folderStamp.setPosition(centerX - folderWidth * 0.22, centerY - folderHeight * 0.1)
        this.caseNumber.setPosition(centerX - folderWidth * 0.22, centerY + folderHeight * 0.27)

        const cardX = centerX + folderWidth * 0.18
        const cardY = centerY
        const cardWidth = folderWidth * 0.55
        const cardHeight = folderHeight * 0.85

        this.dossierCard.setPosition(cardX, cardY)
        this.dossierCard.setSize(cardWidth, cardHeight)
        
        this.cardTitle.setPosition(cardX, cardY - cardHeight * 0.4)
        this.cardTitle.setAlign('center')
        this.cardBody.setPosition(cardX, cardY - cardHeight * 0.22)
        this.cardBody.setWordWrapWidth(cardWidth * 0.85)

        this.pageIndicator.setPosition(cardX, cardY + cardHeight * 0.43)
        this.prevButton.setPosition(cardX - cardWidth * 0.3, cardY + cardHeight * 0.43)
        this.nextButton.setPosition(cardX + cardWidth * 0.3, cardY + cardHeight * 0.43)

        this.startShadow.setPosition(cardX, cardY + cardHeight * 0.32)
        this.startButton.setPosition(cardX, cardY + cardHeight * 0.31)
        this.startLabel.setPosition(cardX, cardY + cardHeight * 0.31)
    }

    startGame() {
        this.cameras.main.fadeOut(300, 0, 0, 0)
        this.time.delayedCall(320, () => {
            this.scene.start('GameScene')
        })
    }
}

