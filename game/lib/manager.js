const _sceneMaps = new Map()
const _wallGroups = new Map()

function isSolidFurniture(src) {
    if (!src) return false

    // Non-solid decor: wall hangings, floor rugs, doors.
    const nonSolidPatterns = [
        /carpet/i,
        /rug/i,
        /mat/i,
        /picture/i,
        /painting/i,
        /mirror/i,
        /clock/i,
        /door/i,
        /window/i
    ]

    return !nonSolidPatterns.some(pattern => pattern.test(src))
}

function getMapsForScene(scene) {
    const key = scene.sys.settings.key

    if (!_sceneMaps.has(key)) {
        _sceneMaps.set(key, new Set())
    }

    return _sceneMaps.get(key)
}

export const manager = {
    map(scene, mapName) {
        getMapsForScene(scene).add(mapName)
    },

    preload(scene) {
        for (const mapName of getMapsForScene(scene)) {
            scene.load.json(mapName, `assets/maps/${mapName}.json`)
            scene.load.once(`filecomplete-json-${mapName}`, () => {
                const mapData = scene.cache.json.get(mapName)
                if (!mapData) return

                const tilesetUrl = `assets/${mapData.tileset.replace(/^assets\//, '')}`

                scene.load.spritesheet(`${mapName}_tileset`, tilesetUrl, {
                    frameWidth: mapData.tileSize,
                    frameHeight: mapData.tileSize
                })

                const furniture = mapData.layers?.furniture ?? []
                const seen = new Set()

                furniture.forEach(({ src }) => {
                    if (seen.has(src)) {
                        return
                    }

                    seen.add(src)
                    const key = `${mapName}_furniture_${src}`

                    if (!scene.textures.exists(key)) {
                        scene.load.image(key, `assets/${src.replace(/^assets\//, '')}`)
                    }
                })
            })
        }
    },

    create(scene) {
        for (const mapName of getMapsForScene(scene)) {
            const mapData = scene.cache.json.get(mapName)
            if (!mapData) continue

            const { tileSize, layers, collisions } = mapData
            const tilesetKey = `${mapName}_tileset`

            const floorGrid = layers.floor ?? layers.wall ?? []
            floorGrid.forEach((row, rowIndex) => {
                row.forEach((tileId, colIndex) => {
                    if (tileId === 0) {
                        return
                    }

                    scene.add.image(
                        colIndex * tileSize,
                        rowIndex * tileSize,
                        tilesetKey,
                        tileId - 1
                    ).setOrigin(0, 0).setDepth(0)
                })
            })

            const furniture = layers.furniture ?? []

            const wallGroup = scene.physics.add.staticGroup()
            ;(collisions ?? []).forEach(({ x, y, w, h }) => {
                const rect = scene.add.rectangle(x + w / 2, y + h / 2, w, h)
                    .setVisible(false)

                scene.physics.add.existing(rect, true)
                wallGroup.add(rect)
            })

            furniture.forEach(({ src, x, y, w, h }) => {
                if (/door|elevator/i.test(src)) {
                    // Doors are rendered by RoomScene so we don't duplicate images per room.
                    return
                }

                const key = `${mapName}_furniture_${src}`

                if (!scene.textures.exists(key)) {
                    return
                }

                scene.add.image(x + w / 2, y + h / 2, key)
                    .setOrigin(0.5, 0.5)
                    .setDisplaySize(w, h)
                    .setDepth(1.2)

                if (isSolidFurniture(src)) {
                    const footprintHeight = Math.max(10, Math.round(h * 0.35))
                    const footprintWidth = Math.max(10, Math.round(w * 0.9))
                    const footprintX = x + (w - footprintWidth) / 2
                    const footprintY = y + h - footprintHeight

                    const collider = scene.add.rectangle(
                        footprintX + footprintWidth / 2,
                        footprintY + footprintHeight / 2,
                        footprintWidth,
                        footprintHeight
                    ).setVisible(false)

                    scene.physics.add.existing(collider, true)
                    wallGroup.add(collider)
                }
            })

            _wallGroups.set(`${scene.sys.settings.key}:${mapName}`, wallGroup)
        }
    },

    getWallGroup(scene, mapName) {
        return _wallGroups.get(`${scene.sys.settings.key}:${mapName}`)
    }
}
