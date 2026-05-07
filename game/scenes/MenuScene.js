import Phaser from 'phaser'

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene')
    }

    preload() {
        if (!this.textures.exists('menu-background')) {
            this.load.image('menu-background', 'random/background.jpg')
        }
    }

    create() {
        this.cameras.main.setBackgroundColor('#090706')

        this.backgroundImage = this.add.image(0, 0, 'menu-background')
            .setOrigin(0.5)
        this.backgroundShade = this.add.rectangle(0, 0, 0, 0, 0x050403, 0.58)
            .setOrigin(0, 0)
        this.backgroundBand = this.add.rectangle(0, 0, 0, 0, 0x110c08, 0.62)
            .setOrigin(0.5)
            .setStrokeStyle(1, 0x9b7a48, 0.3)
        this.grain = this.add.rectangle(0, 0, 0, 0, 0xf8f4eb, 0.035)
            .setOrigin(0, 0)

        this.kicker = this.add.text(0, 0, '', {
            fontFamily: '"Special Elite", "Courier New", monospace',
            fontSize: '18px',
            color: '#d8b56d'
        }).setOrigin(0.5)

        this.title = this.add.text(0, 0, 'ANGEL OF THE\nBLACKWOOD MANOR', {
            fontFamily: '"Cormorant Garamond", Georgia, serif',
            fontSize: '72px',
            fontStyle: '700',
            color: '#f8f4eb',
            align: 'center',
            lineSpacing: -8
        }).setOrigin(0.5)

        this.quote = this.add.text(0, 0, '"Truth is not what you expect. Truth is what you fear to say."', {
            fontFamily: '"Libre Baskerville", Georgia, serif',
            fontSize: '18px',
            color: '#ead8b8',
            align: 'center',
            wordWrap: { width: 720 }
        }).setOrigin(0.5)

        this.buttonShadow = this.add.rectangle(0, 0, 316, 62, 0x000000, 0.46)
            .setInteractive({ useHandCursor: true })
        this.startButton = this.add.rectangle(0, 0, 316, 62, 0x2a1b12, 0.96)
            .setStrokeStyle(1, 0xd8b56d, 0.92)
            .setInteractive({ useHandCursor: true })
        this.startLabel = this.add.text(0, 0, 'OPEN CASE FILE', {
            fontFamily: '"Manrope", Arial, sans-serif',
            fontSize: '16px',
            fontStyle: '800',
            color: '#f8f4eb'
        }).setOrigin(0.5)

        const start = () => this.startDossier()
        this.startButton.on('pointerover', () => {
            this.startButton.setFillStyle(0x4a261d, 0.98)
            this.startButton.setStrokeStyle(1, 0xf1d28a, 1)
        })
        this.startButton.on('pointerout', () => {
            this.startButton.setFillStyle(0x2a1b12, 0.96)
            this.startButton.setStrokeStyle(1, 0xd8b56d, 0.92)
        })
        this.startButton.on('pointerdown', start)
        this.buttonShadow.on('pointerdown', start)

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

        const backgroundScale = Math.max(
            width / this.backgroundImage.width,
            height / this.backgroundImage.height
        )
        this.backgroundImage.setPosition(width / 2, height / 2)
        this.backgroundImage.setScale(backgroundScale)
        this.backgroundShade.setSize(width, height)
        this.backgroundBand.setPosition(width / 2, height / 2 + 8)
        this.backgroundBand.setSize(Math.min(920, width - 60), Math.min(410, height - 120))
        this.grain.setSize(width, height)

        this.kicker.setPosition(width / 2, height / 2 - 150)
        this.title.setPosition(width / 2, height / 2 - 74)
        this.quote.setPosition(width / 2, height / 2 + 42)
        this.quote.setWordWrapWidth(Math.min(720, width - 80))
        this.buttonShadow.setPosition(width / 2 + 4, height / 2 + 126)
        this.startButton.setPosition(width / 2, height / 2 + 120)
        this.startLabel.setPosition(width / 2, height / 2 + 120)
    }

    startDossier() {
        this.cameras.main.fadeOut(300, 0, 0, 0)
        this.time.delayedCall(320, () => {
            this.scene.start('DossierScene')
        })
    }
}

