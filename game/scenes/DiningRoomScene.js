import RoomScene from './RoomScene.js'
import { roomConfigs } from './roomConfigs.js'

export default class DiningRoomScene extends RoomScene {
    constructor() {
        super('DiningRoomScene', roomConfigs.diningRoom)
    }
}
