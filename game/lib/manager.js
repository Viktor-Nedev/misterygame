const _sceneMaps = new Map()
const _wallGroups = new Map()

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
            scene.load.json(mapName, `maps/${mapName}.json`)
            scene.load.once(`filecomplete-json-${mapName}`, () => {
                const mapData = scene.cache.json.get(mapName)
                const tilesetUrl = mapData.tileset.replace(/^assets\//, '')

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
                        scene.load.image(key, src.replace(/^assets\//, ''))
                    }
                })
            })
        }
    },

    create(scene) {
        for (const mapName of getMapsForScene(scene)) {
            const mapData = scene.cache.json.get(mapName)
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
            furniture.forEach(({ src, x, y, w, h }) => {
                const key = `${mapName}_furniture_${src}`

                if (!scene.textures.exists(key)) {
                    return
                }

                scene.add.image(x + w / 2, y + h / 2, key)
                    .setOrigin(0.5, 0.5)
                    .setDisplaySize(w, h)
                    .setDepth(1.2)
            })

            const wallGroup = scene.physics.add.staticGroup()
            ;(collisions ?? []).forEach(({ x, y, w, h }) => {
                const rect = scene.add.rectangle(x + w / 2, y + h / 2, w, h)
                    .setVisible(false)

                scene.physics.add.existing(rect, true)
                wallGroup.add(rect)
            })

            _wallGroups.set(`${scene.sys.settings.key}:${mapName}`, wallGroup)
        }
    },

    getWallGroup(scene, mapName) {
        return _wallGroups.get(`${scene.sys.settings.key}:${mapName}`)
    }
}
