import RoomScene from './RoomScene.js'
import { roomConfigs } from './roomConfigs.js'

export default class EleanorRoomScene extends RoomScene {
    constructor() {
        super('EleanorRoomScene', roomConfigs.eleanorRoom)
    }
}
