export const roomConfigs = {
    livingRoom: {
        key: 'LivingRoomScene',
        title: 'Main Hall',
        mapName: 'living-room',
        accentColor: 0xd8b56d,
        intro: 'The heart of the manor. Rain taps against the high windows. The air is thick with history and unspoken secrets.',
        spawnPoint: { x: 240, y: 176 },
        doors: [
            { label: 'Kitchen', targetScene: 'KitchenScene', spawnPoint: { x: 88, y: 104 }, x: 444, y: 112, width: 42, height: 120 },
            { label: 'Dining Room', targetScene: 'DiningRoomScene', spawnPoint: { x: 240, y: 88 }, x: 240, y: 252, width: 140, height: 32, isElevator: true }
        ],
        characters: [
            { id: 'martha', x: 122, y: 186 }
        ],
        clues: [
            {
                id: 'letter-ruth',
                type: 'letter',
                title: 'Letter from Ruth Hayes',
                description: 'A letter hidden behind a portrait of young Walter.',
                details: '"I am taking the money and leaving. The child is yours. No one will ever know. But if one day he finds out you do not love him, I will return and destroy you."',
                icon: 'random/note.png',
                x: 72,
                y: 64,
                width: 50,
                height: 40,
                visual: { type: 'image', image: 'decor/picture1.png' }
            },
            {
                id: 'wedding-photo-code',
                type: 'code',
                title: 'Wedding Photo',
                description: 'On the back of Eleanor and Walter\'s wedding photo, a date is handwritten: 1947-10-12.',
                details: 'This looks like a combination for a safe.',
                icon: 'random/photo.png',
                x: 386,
                y: 72,
                width: 50,
                height: 40,
                visual: { type: 'image', image: 'random/photo.png' }
            }
        ]
    },
    kitchen: {
        key: 'KitchenScene',
        title: 'Kitchen',
        mapName: 'kitchen',
        accentColor: 0xe6c15a,
        intro: 'Cold meat and sharp steel. The cook stands here, his hands still trembling.',
        spawnPoint: { x: 88, y: 112 },
        doors: [
            { label: 'Main Hall', targetScene: 'LivingRoomScene', spawnPoint: { x: 392, y: 112 }, x: 36, y: 112, width: 42, height: 120 },
            { label: 'Workshop', targetScene: 'WorkshopScene', spawnPoint: { x: 88, y: 112 }, x: 444, y: 112, width: 42, height: 120 }
        ],
        characters: [
            { id: 'gordy', x: 348, y: 166 }
        ],
        clues: [
            {
                id: 'gordy-confession',
                type: 'letter',
                title: 'Gordy\'s Unsent Letter',
                description: 'A letter found under a sack of flour.',
                details: '"Old Walter asked me for a knife. Said he wanted to cut apples. I gave it to him. Now that knife is in Arthur\'s chest. Walter threatened me... what should I do?"',
                icon: 'random/note.png',
                x: 116,
                y: 198,
                width: 50,
                height: 40,
                visual: { type: 'image', image: 'random/note.png' }
            },
            {
                id: 'fingerprints-knife',
                type: 'evidence',
                title: 'Fingerprints Report',
                description: 'A police report on the knife.',
                details: 'Only Gordy\'s fingerprints are on the handle. However, they are old and greasy, not fresh.',
                icon: 'random/knivewithblood.png',
                x: 302,
                y: 96,
                width: 50,
                height: 40,
                visual: { type: 'image', image: 'random/knivewithblood.png' }
            }
        ]
    },
    workshop: {
        key: 'WorkshopScene',
        title: 'Workshop',
        mapName: 'workshop',
        accentColor: 0x7bc2b2,
        intro: 'Oil, grease, and mechanical wonders. This is where the manor\'s secrets are built.',
        spawnPoint: { x: 88, y: 112 },
        doors: [
            { label: 'Kitchen', targetScene: 'KitchenScene', spawnPoint: { x: 392, y: 112 }, x: 36, y: 112, width: 42, height: 120 },
            { label: 'Cellar', targetScene: 'CellarScene', spawnPoint: { x: 88, y: 112 }, x: 444, y: 112, width: 42, height: 120, code: '3357' }
        ],
        characters: [
            { id: 'eddie', x: 164, y: 162 },
            { id: 'ben', x: 334, y: 164 }
        ],
        clues: [
            {
                id: 'key-fragment',
                type: 'key',
                title: 'Key Fragment',
                description: 'A piece of a key found in Eddie\'s toolbox.',
                details: 'It opens the hidden drawer in his workshop.',
                icon: 'office/box.png',
                x: 94,
                y: 198,
                width: 40,
                height: 30,
                visual: { type: 'image', image: 'office/box.png' }
            },
            {
                id: 'eddie-diary',
                type: 'letter',
                title: 'Eddie\'s Diary',
                description: 'A hidden drawer that requires a code and a key fragment.',
                details: '"Walter paid me 10k for \'wall repairs\'. I built rails and a remote. Last night I saw him walking. He wasn\'t in the chair."',
                requires: ['key-fragment'],
                icon: 'random/note.png',
                x: 308,
                y: 100,
                width: 60,
                height: 40,
                visual: { type: 'image', image: 'random/note.png' }
            }
        ]
    },
    cellar: {
        key: 'CellarScene',
        title: 'Cellar',
        mapName: 'cellar',
        accentColor: 0x80a0a7,
        intro: 'The hidden veins of the manor. The cold truth lies behind these walls.',
        spawnPoint: { x: 88, y: 112 },
        doors: [
            { label: 'Workshop', targetScene: 'WorkshopScene', spawnPoint: { x: 392, y: 112 }, x: 36, y: 112, width: 42, height: 120 },
            { label: 'Arthur\'s Office', targetScene: 'OfficeScene', spawnPoint: { x: 240, y: 220 }, x: 240, y: 36, width: 140, height: 32, isElevator: true }
        ],
        characters: [
            { id: 'sam', x: 382, y: 168 }
        ],
        clues: [
            {
                id: 'walter-rails',
                type: 'evidence',
                title: 'Mechanical Rails',
                description: 'Rails hidden in the walls leading from Walter\'s room to the office.',
                details: 'This is how Walter reached the office without using the doors.',
                icon: 'random/elevator.png',
                x: 214,
                y: 128,
                width: 80,
                height: 30,
                visual: { type: 'image', image: 'random/elevator.png' }
            },
            {
                id: 'remote-control',
                type: 'device',
                title: 'Remote Control',
                description: 'A device that locks and unlocks the office latches from the inside.',
                details: 'This explains the "locked room" mystery.',
                icon: 'random/door1open.png',
                x: 292,
                y: 128,
                width: 40,
                height: 38,
                visual: { type: 'image', image: 'random/door1open.png' }
            },
            {
                id: 'loan-shark-letter',
                type: 'letter',
                title: 'Loan Shark Letter',
                description: 'A threatening letter addressed to Sam.',
                details: 'Sam owes a lot of money. Arthur\'s death would solve his financial problems.',
                icon: 'random/note.png',
                x: 356,
                y: 190,
                width: 50,
                height: 40,
                visual: { type: 'image', image: 'random/photo2.png' }
            },
            {
                id: 'dna-sample',
                type: 'evidence',
                title: 'DNA Report',
                description: 'A report on skin samples found under Arthur\'s fingernails.',
                details: 'The DNA doesn\'t match any of the suspects. It seems the killer wore gloves.',
                icon: 'random/bloodspot.png',
                x: 108,
                y: 190,
                width: 50,
                height: 40,
                visual: { type: 'image', image: 'random/bloodspot.png' }
            }
        ]
    },
    office: {
        key: 'OfficeScene',
        title: 'Arthur\'s Office',
        mapName: 'office',
        accentColor: 0xb84a4a,
        intro: 'The scene of the crime. The door was locked from the inside, yet the killer found a way.',
        spawnPoint: { x: 392, y: 112 },
        doors: [
            { label: 'Secret Tunnel', targetScene: 'CellarScene', spawnPoint: { x: 240, y: 88 }, x: 240, y: 252, width: 140, height: 32, isElevator: true },
            { label: 'Bedroom', targetScene: 'BedroomScene', spawnPoint: { x: 392, y: 112 }, x: 36, y: 112, width: 42, height: 120 }
        ],
        clues: [
            {
                id: 'arthur-body',
                type: 'evidence',
                title: 'Arthur\'s Corpse',
                description: 'Arthur lies on the floor. A fillet knife is in his chest.',
                details: 'He was stabbed from behind. The time of death was between 20:15 and 20:55.',
                icon: 'characters/deadbody.png',
                x: 240,
                y: 200,
                width: 60,
                height: 30,
                visual: { type: 'image', image: 'characters/deadbody.png' }
            },
            {
                id: 'gold-key',
                type: 'key',
                title: 'Gold Key',
                description: 'A tiny gold key found inside Arthur\'s pocket watch.',
                details: 'It might open a small compartment.',
                icon: 'decor/clock.png',
                x: 160,
                y: 210,
                width: 40,
                height: 30,
                visual: { type: 'image', image: 'decor/clock.png' }
            },
            {
                id: 'floor-panel-office',
                type: 'lock',
                title: 'Floor Panel',
                description: 'A hidden panel near the desk. It requires a code.',
                details: 'The code is 8241 (Death time 20:41 + Date of death).',
                code: '8241',
                icon: 'random/door2.png',
                x: 374,
                y: 220,
                width: 60,
                height: 40,
                visual: { type: 'image', image: 'random/door2.png' }
            },
            {
                id: 'arthur-note',
                type: 'letter',
                title: 'Arthur\'s Secret Note',
                description: 'A note hidden in a drawer under a painting.',
                details: '"I killed the man who claimed to be the true heir. It was a mistake. He was blackmailing me. If anyone reads this - do not seek the truth."',
                requires: ['gold-key'],
                icon: 'random/note.png',
                x: 86,
                y: 68,
                width: 50,
                height: 40,
                visual: { type: 'image', image: 'random/photo1.png' }
            },
            {
                id: 'knife-trace',
                type: 'evidence',
                title: 'Knife Sheath',
                description: 'An empty sheath found in the desk drawer.',
                details: 'It belongs to a fillet knife. Gordy claims one was stolen from the kitchen last week.',
                icon: 'random/knivewithblood.png',
                x: 330,
                y: 92,
                width: 50,
                height: 40,
                visual: { type: 'image', image: 'random/knive.png' }
            }
        ]
    },
    bedroom: {
        key: 'BedroomScene',
        title: 'Arthur\'s Bedroom',
        mapName: 'bedroom',
        accentColor: 0xaec6cf,
        intro: 'A room full of trophies and luxury, built on a foundation of lies.',
        spawnPoint: { x: 392, y: 112 },
        doors: [
            { label: 'Arthur\'s Office', targetScene: 'OfficeScene', spawnPoint: { x: 88, y: 112 }, x: 444, y: 112, width: 42, height: 120 },
            { label: 'Walter\'s Room', targetScene: 'WalterRoomScene', spawnPoint: { x: 392, y: 112 }, x: 36, y: 112, width: 42, height: 120 }
        ],
        clues: [
            {
                id: 'silver-key',
                type: 'key',
                title: 'Silver Key',
                description: 'A silver key found in the butler\'s pocket.',
                details: 'Winston says Arthur gave it to him for safekeeping. It opens Arthur\'s desk.',
                icon: 'office/chest.png',
                x: 60,
                y: 188,
                width: 40,
                height: 30,
                visual: { type: 'image', image: 'office/chest.png' }
            },
            {
                id: 'letter-eleanor',
                type: 'letter',
                title: 'Letter from Eleanor',
                description: 'Locked inside Arthur\'s desk.',
                details: '"Arthur killed our child. Our true son. He ran him over with his car. I told Walter. He couldn\'t forgive."',
                requires: ['silver-key'],
                icon: 'random/note.png',
                x: 164,
                y: 184,
                width: 60,
                height: 40,
                visual: { type: 'image', image: 'bedroom/desk.png' }
            },
            {
                id: 'bed-arthur',
                type: 'decor',
                title: 'Arthur\'s Bed',
                description: 'A luxurious bed.',
                details: 'Nothing unusual here.',
                x: 240,
                y: 120,
                width: 42,
                height: 32,
                visual: { type: 'image', image: 'bedroom/bed.png' }
            },
            {
                id: 'forged-will',
                type: 'document',
                title: 'Forged Will',
                description: 'A draft of a will making Arthur the sole heir.',
                details: 'Clara was planning to sue Arthur over this. It gives her a motive, but she needed him alive for the trial.',
                icon: 'random/notebook.png',
                x: 330,
                y: 92,
                width: 60,
                height: 40,
                visual: { type: 'image', image: 'random/notebook.png' }
            },
            {
                id: 'ben-threat',
                type: 'document',
                title: 'Threat to Ben',
                description: 'A letter from Arthur to Ben, threatening to frame him for a crime.',
                details: 'Ben stayed in the east wing because he was afraid of Arthur.',
                icon: 'random/note.png',
                x: 112,
                y: 92,
                width: 50,
                height: 40,
                visual: { type: 'image', image: 'random/note.png' }
            }
        ]
    },
    walterRoom: {
        key: 'WalterRoomScene',
        title: 'Walter\'s Room',
        mapName: 'walter-room',
        accentColor: 0x9aa3a8,
        intro: 'The air is stale. The grandfather of the house sits here, a shadow of his former self.',
        spawnPoint: { x: 392, y: 112 },
        doors: [
            { label: 'Arthur\'s Bedroom', targetScene: 'BedroomScene', spawnPoint: { x: 88, y: 112 }, x: 444, y: 112, width: 42, height: 120 },
            { label: 'Eleanor\'s Room', targetScene: 'EleanorRoomScene', spawnPoint: { x: 392, y: 112 }, x: 36, y: 112, width: 42, height: 120 }
        ],
        characters: [
            { id: 'walter', x: 246, y: 158 }
        ],
        clues: [
            {
                id: 'rusty-key',
                type: 'key',
                title: 'Rusty Key',
                description: 'A rusty key hidden under Walter\'s pillow.',
                details: 'It opens the door in the cellar behind the boiler.',
                icon: 'office/chest.png',
                x: 232,
                y: 108,
                width: 40,
                height: 30,
                visual: { type: 'image', image: 'office/box.png' }
            },
            {
                id: 'birth-certificate',
                type: 'document',
                title: 'Birth Certificate',
                description: 'A hidden birth certificate for Daniel Gray.',
                details: 'Found in Walter\'s safe. Code: 1947-10-12.',
                code: '1947-10-12',
                icon: 'random/notebook.png',
                x: 374,
                y: 88,
                width: 60,
                height: 40,
                visual: { type: 'image', image: 'office/chest.png' }
            },
            {
                id: 'walter-shoes',
                type: 'evidence',
                title: 'Muddy Shoes',
                description: 'A pair of shoes found under Walter\'s bed.',
                details: 'They are covered in dust from the cellar tunnels. Why would an invalid have muddy shoes?',
                icon: 'random/bloodfoodsteps.png',
                x: 140,
                y: 190,
                width: 50,
                height: 40,
                visual: { type: 'image', image: 'random/foodsteps.png' }
            }
        ]
    },
    eleanorRoom: {
        key: 'EleanorRoomScene',
        title: 'Eleanor\'s Room',
        mapName: 'eleanor-room',
        accentColor: 0xcd9f92,
        intro: 'Elegance and decay. Eleanor remembers more than she lets on.',
        spawnPoint: { x: 392, y: 112 },
        doors: [
            { label: 'Walter\'s Room', targetScene: 'WalterRoomScene', spawnPoint: { x: 88, y: 112 }, x: 444, y: 112, width: 42, height: 120 },
            { label: 'Dining Room', targetScene: 'DiningRoomScene', spawnPoint: { x: 392, y: 112 }, x: 36, y: 112, width: 42, height: 120 }
        ],
        characters: [
            { id: 'eleanor', x: 238, y: 162 }
        ],
        clues: [
            {
                id: 'martha-letter',
                type: 'letter',
                title: 'Martha\'s Letter',
                description: 'A letter from Martha to her daughter, hidden in Eleanor\'s jewelry box.',
                details: '"I saw Arthur last night. He was drunk. He said he would kill the butler. I was so scared. There was blood on my sleeve... I think it was his." The box has a code: 1123.',
                code: '1123',
                icon: 'random/note.png',
                x: 126,
                y: 102,
                width: 60,
                height: 40,
                visual: { type: 'image', image: 'decor/picture2.png' }
            },
            {
                id: 'blood-stain-martha',
                type: 'evidence',
                title: 'Blood on Sleeve',
                description: 'A fresh blood stain on Martha\'s uniform.',
                details: 'She says she fainted and fell near the body. The pattern supports her story.',
                icon: 'random/bloodspot2.png',
                x: 332,
                y: 180,
                width: 50,
                height: 40,
                visual: { type: 'image', image: 'random/bloodspot2.png' }
            }
        ]
    },
    diningRoom: {
        key: 'DiningRoomScene',
        title: 'Dining Room',
        mapName: 'dining-room',
        accentColor: 0xc9a05a,
        intro: 'The silver is polished to a shine. A perfect facade for a broken family.',
        spawnPoint: { x: 392, y: 112 },
        doors: [
            { label: 'Eleanor\'s Room', targetScene: 'EleanorRoomScene', spawnPoint: { x: 88, y: 112 }, x: 444, y: 112, width: 42, height: 120 },
            { label: 'Main Hall', targetScene: 'LivingRoomScene', spawnPoint: { x: 240, y: 220 }, x: 240, y: 36, width: 140, height: 32, isElevator: true }
        ],
        characters: [
            { id: 'winston', x: 146, y: 178 },
            { id: 'clara', x: 338, y: 178 }
        ],
        clues: [
            {
                id: 'magnifier',
                type: 'tool',
                title: 'Magnifying Glass',
                description: 'A small glass useful for inspecting tiny details.',
                details: 'Use it on the "Deer in the Forest" painting.',
                icon: 'bathroom/mirror.png',
                x: 240,
                y: 148,
                width: 40,
                height: 30,
                visual: { type: 'image', image: 'bathroom/mirror.png' }
            },
            {
                id: 'microfilm-deer',
                type: 'film',
                title: 'Microfilm',
                description: 'Hidden in the deer\'s eye in the painting.',
                details: 'The microfilm shows a police report from Daniel Gray\'s crash. The car belonged to Arthur.',
                requires: ['magnifier'],
                icon: 'decor/picture3.png',
                x: 394,
                y: 74,
                width: 60,
                height: 40,
                visual: { type: 'image', image: 'decor/picture3.png' }
            },
            {
                id: 'library-alibi',
                type: 'alibi',
                title: 'Library Receipt',
                description: 'A receipt showing Clara was in the library at 21:00.',
                details: 'It confirms Winston\'s statement about seeing her leave.',
                icon: 'office/bookshelf.png',
                x: 146,
                y: 206,
                width: 50,
                height: 40,
                visual: { type: 'image', image: 'office/bookshelf.png' }
            }
        ]
    }
}

export const TOTAL_CLUES = Object.values(roomConfigs)
    .reduce((sum, room) => sum + room.clues.length, 0)
