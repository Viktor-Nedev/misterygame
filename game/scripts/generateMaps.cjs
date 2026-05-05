const fs = require('fs')
const path = require('path')

const outputDir = path.join(__dirname, '..', 'assets', 'maps')
const tileSize = 16
const mapWidth = 30
const mapHeight = 18

function makeFloor(baseTile, borderTile, accentTile, accentRect) {
    return Array.from({ length: mapHeight }, (_, y) =>
        Array.from({ length: mapWidth }, (_, x) => {
            const isBorder =
                x === 0 ||
                y === 0 ||
                x === mapWidth - 1 ||
                y === mapHeight - 1

            const inAccent =
                accentRect &&
                x >= accentRect.x &&
                x < accentRect.x + accentRect.w &&
                y >= accentRect.y &&
                y < accentRect.y + accentRect.h

            if (isBorder) return borderTile
            if (inAccent) return accentTile
            if ((x + y) % 9 === 0) return Math.max(1, baseTile - 1)
            return baseTile
        })
    )
}

function makeWallLayer(borderTile) {
    return Array.from({ length: mapHeight }, (_, y) =>
        Array.from({ length: mapWidth }, (_, x) => {
            const isBorder =
                x === 0 ||
                y === 0 ||
                x === mapWidth - 1 ||
                y === mapHeight - 1

            return isBorder ? borderTile : 0
        })
    )
}

function collision(x, y, w, h) {
    return { x, y, w, h }
}

function withIds(rects) {
    return rects.map((rect, index) => ({
        id: index,
        ...rect
    }))
}

function roomShell() {
    return [
        collision(0, 0, mapWidth * tileSize, tileSize),
        collision(0, (mapHeight - 1) * tileSize, mapWidth * tileSize, tileSize),
        collision(0, tileSize, tileSize, (mapHeight - 2) * tileSize),
        collision((mapWidth - 1) * tileSize, tileSize, tileSize, (mapHeight - 2) * tileSize)
    ]
}

function furniture(src, x, y, w, h) {
    return { src, x, y, w, h }
}

function wallCollision(x, y, w, h) {
    return collision(x, y, w, h)
}

const maps = [
    {
        fileName: 'living-room.json',
        name: 'living-room',
        tileset: 'assets/rooms/room3.png',
        floor: makeFloor(74, 15, 121, { x: 10, y: 8, w: 8, h: 4 }),
        wall: makeWallLayer(15),
        furniture: [
            furniture('random/plants.png', 48, 40, 32, 48),
            furniture('random/plants.png', 416, 188, 32, 48),
            furniture('random/photo.png', 150, 42, 52, 39),
            furniture('random/piano.png', 384, 52, 32, 48),
            furniture('random/guitar.png', 64, 184, 16, 48),
            furniture('random/harp.png', 336, 184, 32, 32),
            furniture('random/picture.png', 176, 156, 109, 81),
            furniture('random/flower.png', 280, 204, 32, 32)
        ],
        collisions: withIds([
            ...roomShell(),
            wallCollision(48, 40, 32, 48),
            wallCollision(384, 52, 32, 48),
            wallCollision(336, 184, 32, 32),
            wallCollision(64, 184, 16, 48),
            wallCollision(416, 188, 32, 48)
        ])
    },
    {
        fileName: 'kitchen.json',
        name: 'kitchen',
        tileset: 'assets/rooms/room1.png',
        floor: makeFloor(89, 12, 109, { x: 4, y: 11, w: 10, h: 3 }),
        wall: makeWallLayer(12),
        furniture: [
            furniture('bedroom/desk.png', 48, 48, 32, 32),
            furniture('bedroom/desk.png', 80, 48, 32, 32),
            furniture('bedroom/desk.png', 112, 48, 32, 32),
            furniture('bedroom/desk.png', 144, 48, 32, 32),
            furniture('bedroom/desk.png', 176, 48, 32, 32),
            furniture('bedroom/desk.png', 208, 48, 32, 32),
            furniture('bedroom/desk.png', 240, 48, 32, 32),
            furniture('bedroom/desk.png', 272, 48, 32, 32),
            furniture('bedroom/desk.png', 304, 48, 32, 32),
            furniture('bedroom/desk.png', 336, 48, 32, 32),
            furniture('kitchen/food.png', 64, 60, 16, 32),
            furniture('kitchen/strawberry.png', 96, 64, 16, 16),
            furniture('kitchen/grape.png', 120, 64, 16, 16),
            furniture('kitchen/lemon.png', 144, 64, 16, 16),
            furniture('random/plants.png', 400, 176, 32, 48),
            furniture('random/note.png', 120, 178, 80, 95),
            furniture('bedroom/chair.png', 320, 144, 32, 32),
            furniture('bedroom/chair.png', 352, 144, 32, 32)
        ],
        collisions: withIds([
            ...roomShell(),
            wallCollision(48, 48, 320, 32),
            wallCollision(384, 80, 32, 128),
            wallCollision(64, 176, 64, 32),
            wallCollision(320, 144, 64, 32),
            wallCollision(400, 176, 32, 48)
        ])
    },
    {
        fileName: 'bedroom.json',
        name: 'bedroom',
        tileset: 'assets/rooms/room3.png',
        floor: makeFloor(90, 28, 157, { x: 6, y: 8, w: 8, h: 4 }),
        wall: makeWallLayer(28),
        furniture: [
            furniture('bedroom/queenbed.png', 64, 64, 32, 48),
            furniture('bedroom/twobed.png', 256, 48, 48, 48),
            furniture('bedroom/lamp.png', 400, 64, 16, 48),
            furniture('bedroom/mirror.png', 400, 144, 16, 16),
            furniture('random/photo1.png', 194, 58, 29, 22),
            furniture('bedroom/doll.png', 336, 176, 32, 32),
            furniture('bedroom/chair.png', 176, 176, 32, 32),
            furniture('bedroom/desk.png', 160, 176, 32, 32)
        ],
        collisions: withIds([
            ...roomShell(),
            wallCollision(64, 64, 32, 48),
            wallCollision(256, 48, 48, 48),
            wallCollision(336, 176, 32, 32),
            wallCollision(160, 176, 48, 32),
            wallCollision(400, 64, 16, 48)
        ])
    },
    {
        fileName: 'office.json',
        name: 'office',
        tileset: 'assets/rooms/room2.png',
        floor: makeFloor(73, 6, 118, { x: 11, y: 6, w: 6, h: 5 }),
        wall: makeWallLayer(6),
        furniture: [
            furniture('bedroom/desk.png', 208, 64, 32, 32),
            furniture('bedroom/chair.png', 208, 112, 32, 32),
            furniture('bedroom/chairleft.png', 176, 112, 16, 32),
            furniture('bedroom/chairright.png', 256, 112, 16, 32),
            furniture('bedroom/lamp.png', 384, 56, 16, 48),
            furniture('random/picture.png', 48, 40, 109, 81),
            furniture('bedroom/mirror.png', 80, 184, 16, 16),
            furniture('random/plants.png', 416, 184, 32, 48),
            furniture('bedroom/desk.png', 64, 176, 32, 32)
        ],
        collisions: withIds([
            ...roomShell(),
            wallCollision(176, 64, 96, 80),
            wallCollision(384, 56, 16, 48),
            wallCollision(416, 184, 32, 48),
            wallCollision(64, 176, 32, 32)
        ])
    }
]

for (const map of maps) {
    const payload = {
        name: map.name,
        tileset: map.tileset,
        tileSize,
        mapWidth,
        mapHeight,
        layers: {
            floor: map.floor,
            wall: map.wall,
            furniture: map.furniture
        },
        collisions: map.collisions
    }

    fs.writeFileSync(
        path.join(outputDir, map.fileName),
        `${JSON.stringify(payload, null, 2)}\n`
    )
}

console.log(`Generated ${maps.length} maps.`)
