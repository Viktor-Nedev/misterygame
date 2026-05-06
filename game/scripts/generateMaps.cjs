const fs = require('fs')
const path = require('path')

const assetRoot = path.join(__dirname, '..', 'assets')
const outputDir = path.join(assetRoot, 'maps')
const tileSize = 16
const mapWidth = 30
const mapHeight = 18

function toAssetPath(filePath) {
    return path.relative(assetRoot, filePath).replaceAll(path.sep, '/')
}

function walkImages(dir) {
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
        const entryPath = path.join(dir, entry.name)

        if (entry.isDirectory()) {
            return walkImages(entryPath)
        }

        if (!/\.(png|jpe?g)$/i.test(entry.name)) {
            return []
        }

        return [toAssetPath(entryPath)]
    })
}

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
            if ((x * 2 + y) % 11 === 0) return Math.max(1, baseTile - 1)
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

function displaySize(src) {
    const lower = src.toLowerCase()

    if (lower.includes('background')) return { w: 48, h: 30 }
    if (lower.includes('bigtable') || lower.includes('kitchencounters')) return { w: 54, h: 28 }
    if (lower.includes('table') || lower.includes('sofa') || lower.includes('bench')) return { w: 46, h: 30 }
    if (lower.includes('bed')) return { w: 42, h: 38 }
    if (lower.includes('bookshelf') || lower.includes('shelfs') || lower.includes('fridge')) return { w: 30, h: 42 }
    if (lower.includes('lamp') || lower.includes('clock') || lower.includes('window')) return { w: 26, h: 42 }
    if (lower.includes('picture') || lower.includes('photo') || lower.includes('note')) return { w: 34, h: 30 }
    if (lower.includes('tree') || lower.includes('bush') || lower.includes('fontan')) return { w: 36, h: 40 }
    if (lower.includes('flower') || lower.includes('plant')) return { w: 30, h: 34 }
    if (lower.includes('door')) return { w: 30, h: 42 }
    if (lower.includes('knive') || lower.includes('blood')) return { w: 32, h: 32 }
    return { w: 32, h: 32 }
}

function placeAssets(assets, offset = 0) {
    const xPositions = [48, 100, 152, 204, 256, 308, 360, 412]
    const yPositions = [54, 96, 138, 184, 226]

    return assets.map((src, index) => {
        const cell = index + offset
        const x = xPositions[cell % xPositions.length]
        const y = yPositions[Math.floor(cell / xPositions.length) % yPositions.length]
        const size = displaySize(src)

        return furniture(src, x, y, size.w, size.h)
    })
}

const allImages = walkImages(assetRoot).sort()
const excluded = new Set([
    'random/background.jpg',
    'rooms/room1.png',
    'rooms/room2.png',
    'rooms/room3.png',
    'sprites/ash.png',
    'sprites/lia.png',
    'characters/bogata jena.png',
    'characters/boy.png',
    'characters/brother.png',
    'characters/deadbody.png',
    'characters/dqdo.png',
    'characters/gotvach.png',
    'characters/gradinar.png',
    'characters/ikonom.png',
    'characters/ikonomka.png',
    'characters/mehanik.png',
    'characters/sister.png'
])

const unassigned = new Set(allImages.filter(src => !excluded.has(src)))
const buckets = {
    'living-room': [],
    kitchen: [],
    bedroom: [],
    office: [],
    'dining-room': [],
    'walter-room': [],
    'eleanor-room': [],
    workshop: [],
    cellar: []
}

function take(roomName, predicate) {
    for (const src of [...unassigned]) {
        if (predicate(src)) {
            buckets[roomName].push(src)
            unassigned.delete(src)
        }
    }
}

take('living-room', src =>
    src.startsWith('livingroom/') ||
    /^random\/(piano|guitar|harp|photo|photo1|photo2|picture|flower|plants|cat|cat2)\.png$/.test(src)
)
take('kitchen', src =>
    src.startsWith('kitchen/') ||
    /^random\/(kitchencounters|knive1|knivewithblood|bloodfoodsteps|foodsteps|note|notebook|table1|table2)\.png$/.test(src)
)
take('bedroom', src => src.startsWith('bedroom/') || src.startsWith('bathroom/'))
take('office', src => src.startsWith('office/'))
take('dining-room', src => src.startsWith('decor/'))
take('walter-room', src =>
    /^random\/(chair|door|door1open|door2|door2open|window2|lamp1|lamp2|bloodspot|bloodspot2|bloodspot3)\.png$/.test(src)
)
take('workshop', src => /^random\/(elevator)\.png$/.test(src))
take('cellar', src => src.startsWith('garden/'))

let roundRobin = 0
const roomNames = Object.keys(buckets)
for (const src of unassigned) {
    buckets[roomNames[roundRobin % roomNames.length]].push(src)
    roundRobin += 1
}

const mapSpecs = [
    {
        fileName: 'living-room.json',
        name: 'living-room',
        tileset: 'assets/rooms/room3.png',
        floor: makeFloor(74, 15, 121, { x: 10, y: 8, w: 8, h: 4 }),
        wall: makeWallLayer(15)
    },
    {
        fileName: 'kitchen.json',
        name: 'kitchen',
        tileset: 'assets/rooms/room1.png',
        floor: makeFloor(89, 12, 109, { x: 4, y: 11, w: 10, h: 3 }),
        wall: makeWallLayer(12)
    },
    {
        fileName: 'bedroom.json',
        name: 'bedroom',
        tileset: 'assets/rooms/room3.png',
        floor: makeFloor(90, 28, 157, { x: 6, y: 8, w: 8, h: 4 }),
        wall: makeWallLayer(28)
    },
    {
        fileName: 'office.json',
        name: 'office',
        tileset: 'assets/rooms/room2.png',
        floor: makeFloor(73, 6, 118, { x: 11, y: 6, w: 6, h: 5 }),
        wall: makeWallLayer(6)
    },
    {
        fileName: 'dining-room.json',
        name: 'dining-room',
        tileset: 'assets/rooms/room1.png',
        floor: makeFloor(96, 12, 111, { x: 9, y: 7, w: 12, h: 5 }),
        wall: makeWallLayer(12)
    },
    {
        fileName: 'walter-room.json',
        name: 'walter-room',
        tileset: 'assets/rooms/room2.png',
        floor: makeFloor(82, 6, 120, { x: 6, y: 7, w: 8, h: 5 }),
        wall: makeWallLayer(6)
    },
    {
        fileName: 'eleanor-room.json',
        name: 'eleanor-room',
        tileset: 'assets/rooms/room3.png',
        floor: makeFloor(92, 28, 154, { x: 14, y: 6, w: 8, h: 6 }),
        wall: makeWallLayer(28)
    },
    {
        fileName: 'workshop.json',
        name: 'workshop',
        tileset: 'assets/rooms/room2.png',
        floor: makeFloor(76, 6, 119, { x: 5, y: 5, w: 20, h: 2 }),
        wall: makeWallLayer(6)
    },
    {
        fileName: 'cellar.json',
        name: 'cellar',
        tileset: 'assets/rooms/room1.png',
        floor: makeFloor(86, 12, 108, { x: 3, y: 8, w: 24, h: 2 }),
        wall: makeWallLayer(12)
    }
]

const maps = mapSpecs.map(spec => ({
    ...spec,
    furniture: placeAssets(buckets[spec.name]),
    collisions: withIds(roomShell())
}))

const defaultFurniture = placeAssets(allImages
    .filter(src => !src.startsWith('maps/'))
    .filter(src => !src.startsWith('sprites/'))
    .filter(src => src !== 'random/background.jpg')
    .slice(0, 36))

maps.push({
    fileName: 'default.json',
    name: 'default',
    tileset: 'assets/rooms/room3.png',
    floor: makeFloor(74, 15, 121, { x: 4, y: 4, w: 10, h: 4 }),
    wall: makeWallLayer(15),
    furniture: defaultFurniture,
    collisions: withIds(roomShell())
})

maps.push({
    fileName: 'default_map.json',
    name: 'default_map',
    tileset: 'assets/rooms/room2.png',
    floor: makeFloor(73, 6, 118, { x: 12, y: 6, w: 6, h: 5 }),
    wall: makeWallLayer(6),
    furniture: defaultFurniture,
    collisions: withIds(roomShell())
})

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

const usedDecor = Object.values(buckets).reduce((sum, list) => sum + list.length, 0)
console.log(`Generated ${maps.length} maps with ${usedDecor} scaled decorative assets.`)
