import Phaser from 'phaser'
import { resetGameState } from './gameState.js'

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene')
    }

    create() {
        resetGameState()
        this.scene.start('LivingRoomScene', {
            spawnPoint: { x: 240, y: 176 }
        })
    }
}
