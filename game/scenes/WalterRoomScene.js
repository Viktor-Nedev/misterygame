import RoomScene from './RoomScene.js'
import { roomConfigs } from './roomConfigs.js'

export default class WalterRoomScene extends RoomScene {
    constructor() {
        super('WalterRoomScene', roomConfigs.walterRoom)
    }
}
