import RoomScene from './RoomScene.js'
import { roomConfigs } from './roomConfigs.js'

export default class OfficeScene extends RoomScene {
    constructor() {
        super('OfficeScene', roomConfigs.office)
    }
}
