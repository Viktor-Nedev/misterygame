import RoomScene from './RoomScene.js'
import { roomConfigs } from './roomConfigs.js'

export default class CellarScene extends RoomScene {
    constructor() {
        super('CellarScene', roomConfigs.cellar)
    }
}
