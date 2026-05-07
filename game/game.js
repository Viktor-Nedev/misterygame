import Phaser from 'phaser'
import GameScene from './scenes/GameScene.js'
import MenuScene from './scenes/MenuScene.js'
import DossierScene from './scenes/DossierScene.js'
import LivingRoomScene from './scenes/LivingRoomScene.js'
import KitchenScene from './scenes/KitchenScene.js'
import BedroomScene from './scenes/BedroomScene.js'
import OfficeScene from './scenes/OfficeScene.js'
import DiningRoomScene from './scenes/DiningRoomScene.js'
import WalterRoomScene from './scenes/WalterRoomScene.js'
import EleanorRoomScene from './scenes/EleanorRoomScene.js'
import WorkshopScene from './scenes/WorkshopScene.js'
import CellarScene from './scenes/CellarScene.js'

const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'game-root',
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
    dom: {
        createContainer: true
    },
    scene: [
        MenuScene,
        DossierScene,
        GameScene,
        LivingRoomScene,
        KitchenScene,
        BedroomScene,
        OfficeScene,
        DiningRoomScene,
        WalterRoomScene,
        EleanorRoomScene,
        WorkshopScene,
        CellarScene
    ]
})

if (import.meta.env.DEV) {
    window.__BLACKWOOD_GAME__ = game
}
