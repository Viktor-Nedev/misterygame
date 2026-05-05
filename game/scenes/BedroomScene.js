import RoomScene from './RoomScene.js'
import { roomConfigs } from './roomConfigs.js'

export default class BedroomScene extends RoomScene {
    constructor() {
        super('BedroomScene', roomConfigs.bedroom)
    }
}
