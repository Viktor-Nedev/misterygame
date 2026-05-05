import Phaser from 'phaser'
import GameScene from './scenes/GameScene.js'
import MenuScene from './scenes/MenuScene.js'
import LivingRoomScene from './scenes/LivingRoomScene.js'
import KitchenScene from './scenes/KitchenScene.js'
import BedroomScene from './scenes/BedroomScene.js'
import OfficeScene from './scenes/OfficeScene.js'

new Phaser.Game({
    type: Phaser.AUTO,
    backgroundColor: '#040712',
    scale: {
        mode: Phaser.Scale.RESIZE,
        width: window.innerWidth,
        height: window.innerHeight
    },
    physics: {
        default: 'arcade',
        arcade: { debug: false }
    },
    scene: [
        MenuScene,
        GameScene,
        LivingRoomScene,
        KitchenScene,
        BedroomScene,
        OfficeScene
    ]
})
