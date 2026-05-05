export const roomConfigs = {
    livingRoom: {
        key: 'LivingRoomScene',
        title: 'Living Room',
        mapName: 'living-room',
        accentColor: 0x93c5fd,
        intro: 'This is where Evelyn bled out. Something about the room feels staged, as if the killer wanted the scene to speak before anyone else could.',
        spawnPoint: { x: 240, y: 176 },
        doors: [
            {
                label: 'Kitchen',
                targetScene: 'KitchenScene',
                spawnPoint: { x: 88, y: 104 },
                x: 444,
                y: 96,
                width: 32,
                height: 96
            },
            {
                label: 'Bedroom',
                targetScene: 'BedroomScene',
                spawnPoint: { x: 240, y: 72 },
                x: 240,
                y: 252,
                width: 112,
                height: 28
            },
            {
                label: 'Office',
                targetScene: 'OfficeScene',
                spawnPoint: { x: 392, y: 112 },
                x: 36,
                y: 96,
                width: 32,
                height: 96
            }
        ],
        clues: [
            {
                id: 'blood',
                title: 'Blood Pattern',
                description: 'The blood spray fans toward the piano. Evelyn was attacked here, then collapsed beside the rug. There was no struggle long enough for a random burglary.',
                x: 240,
                y: 176,
                width: 64,
                height: 34,
                color: 0xb91c1c,
                visual: {
                    type: 'ellipse',
                    color: 0x991b1b,
                    alpha: 0.92
                }
            },
            {
                id: 'friend-photo',
                title: 'Framed Photo',
                description: 'A cracked photo shows Evelyn and Mara years ago, smiling under a promise carved into the frame: "No secrets between us." The crack cuts straight through Mara\'s face.',
                x: 172,
                y: 108,
                width: 40,
                height: 30,
                color: 0xe2e8f0,
                visual: {
                    type: 'paper',
                    paperColor: 0xf8fafc,
                    edgeColor: 0x38bdf8,
                    textColor: '#334155',
                    lines: 'PHOTO',
                    fontSize: 9
                }
            }
        ]
    },
    kitchen: {
        key: 'KitchenScene',
        title: 'Kitchen',
        mapName: 'kitchen',
        accentColor: 0xfbbf24,
        intro: 'The kitchen smells of citrus, wine, and panic. Whoever was here before the murder left in a hurry.',
        spawnPoint: { x: 88, y: 104 },
        doors: [
            {
                label: 'Living Room',
                targetScene: 'LivingRoomScene',
                spawnPoint: { x: 392, y: 96 },
                x: 36,
                y: 96,
                width: 32,
                height: 96
            },
            {
                label: 'Office',
                targetScene: 'OfficeScene',
                spawnPoint: { x: 240, y: 72 },
                x: 240,
                y: 252,
                width: 112,
                height: 28
            }
        ],
        clues: [
            {
                id: 'threat-note',
                title: 'Threatening Note',
                description: 'The note reads: "Burn the ledger before midnight, or I will do it for you." The stationery belongs to Mara\'s gallery, though the signature line is torn away.',
                x: 152,
                y: 192,
                width: 62,
                height: 40,
                color: 0xfacc15,
                visual: {
                    type: 'paper',
                    paperColor: 0xfef3c7,
                    edgeColor: 0xf59e0b,
                    textColor: '#78350f',
                    lines: 'BURN\nTHE LEDGER',
                    fontSize: 10
                }
            },
            {
                id: 'broken-glass',
                title: 'Broken Glass',
                description: 'Shards of a wine glass glitter on the tile. Cobalt lipstick marks cling to one fragment, matching the shade Mara wore at dinner.',
                x: 344,
                y: 160,
                width: 44,
                height: 28,
                color: 0x93c5fd,
                visual: {
                    type: 'glass'
                }
            }
        ]
    },
    bedroom: {
        key: 'BedroomScene',
        title: 'Bedroom',
        mapName: 'bedroom',
        accentColor: 0xc084fc,
        intro: 'Evelyn trusted almost no one, yet the bedroom still holds the pieces she never had time to hide.',
        spawnPoint: { x: 240, y: 72 },
        doors: [
            {
                label: 'Living Room',
                targetScene: 'LivingRoomScene',
                spawnPoint: { x: 240, y: 212 },
                x: 240,
                y: 36,
                width: 112,
                height: 28
            },
            {
                label: 'Office',
                targetScene: 'OfficeScene',
                spawnPoint: { x: 88, y: 112 },
                x: 444,
                y: 112,
                width: 32,
                height: 96
            }
        ],
        clues: [
            {
                id: 'secret-photo',
                title: 'Hidden Snapshot',
                description: 'A tucked-away snapshot shows Mara handing Lionel an envelope behind Evelyn\'s back. They were working together long before tonight.',
                x: 208,
                y: 136,
                width: 42,
                height: 30,
                color: 0xf472b6,
                visual: {
                    type: 'paper',
                    paperColor: 0xfdf2f8,
                    edgeColor: 0xf472b6,
                    textColor: '#831843',
                    lines: 'SNAP',
                    fontSize: 10
                }
            },
            {
                id: 'phone',
                title: 'Unlocked Phone',
                description: 'Evelyn\'s unsent draft says: "If Mara moves the money again, I go public. Adrian knows nothing. Lionel only helped because he was afraid."',
                x: 352,
                y: 150,
                width: 26,
                height: 44,
                color: 0x818cf8,
                visual: {
                    type: 'device',
                    bodyColor: 0x0f172a,
                    edgeColor: 0x818cf8
                }
            }
        ]
    },
    office: {
        key: 'OfficeScene',
        title: 'Office',
        mapName: 'office',
        accentColor: 0x4ade80,
        intro: 'The office is where Evelyn kept the real numbers. The murder weapon and the reason for it are both close by.',
        spawnPoint: { x: 392, y: 112 },
        doors: [
            {
                label: 'Living Room',
                targetScene: 'LivingRoomScene',
                spawnPoint: { x: 88, y: 96 },
                x: 444,
                y: 96,
                width: 32,
                height: 96
            },
            {
                label: 'Kitchen',
                targetScene: 'KitchenScene',
                spawnPoint: { x: 240, y: 212 },
                x: 240,
                y: 36,
                width: 112,
                height: 28
            },
            {
                label: 'Bedroom',
                targetScene: 'BedroomScene',
                spawnPoint: { x: 392, y: 112 },
                x: 36,
                y: 112,
                width: 32,
                height: 96
            }
        ],
        clues: [
            {
                id: 'knife',
                title: 'Office Knife',
                description: 'A ceremonial knife lies half-hidden beside the desk. It was wiped with turpentine, a solvent Mara always kept in her studio to strip paint from tools.',
                x: 310,
                y: 124,
                width: 54,
                height: 14,
                color: 0xe5e7eb,
                visual: {
                    type: 'blade',
                    handleColor: 0x7c2d12
                }
            },
            {
                id: 'motive-doc',
                title: 'Forged Ledger',
                description: 'The ledger proves someone moved charity money through fake restoration invoices signed in Evelyn\'s name. Mara stood to lose everything when Evelyn exposed it at sunrise.',
                x: 112,
                y: 156,
                width: 60,
                height: 42,
                color: 0xfb923c,
                visual: {
                    type: 'paper',
                    paperColor: 0xffedd5,
                    edgeColor: 0xfb923c,
                    textColor: '#7c2d12',
                    lines: 'LEDGER',
                    fontSize: 11
                }
            }
        ]
    }
}

export const TOTAL_CLUES = Object.values(roomConfigs)
    .reduce((sum, room) => sum + room.clues.length, 0)
