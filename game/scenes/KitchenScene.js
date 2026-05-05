import RoomScene from './RoomScene.js'
import { roomConfigs } from './roomConfigs.js'

export default class KitchenScene extends RoomScene {
    constructor() {
        super('KitchenScene', roomConfigs.kitchen)
    }
}
