import RoomScene from './RoomScene.js'
import { roomConfigs } from './roomConfigs.js'

export default class WorkshopScene extends RoomScene {
    constructor() {
        super('WorkshopScene', roomConfigs.workshop)
    }
}
