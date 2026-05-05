import RoomScene from './RoomScene.js'
import { roomConfigs } from './roomConfigs.js'

export default class LivingRoomScene extends RoomScene {
    constructor() {
        super('LivingRoomScene', roomConfigs.livingRoom)
    }
}
