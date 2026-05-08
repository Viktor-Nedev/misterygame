const STORAGE_NOTES_KEY = 'blackwood-manor-notes-v2'

export const CASE_FILE = {
    title: 'Angel of the Blackwood Manor',
    caseName: 'Angel of the\nBlackwood Manor',
    victim: 'Arthur Blackwood, 58',
    culprit: 'Walter Blackwood',
    accusationThreshold: 18,
    totalClues: 24,
    location: 'Blackwood Manor, Vermont',
    timeOfDeath: 'November 2, 1987, between 20:15 and 20:55',
    summary: 'You arrive at the manor at 8:30 AM. Light rain, old timber, and the smell of burnt oil linger in the halls. Arthur Blackwood is found dead in his locked second-floor office, a fillet knife in his chest.',
    details: [
        'The office door was bolted from the inside, but there are traces of a hidden mechanism behind the fireplace.',
        'Cook Gordon Floyd and maid Martha White have blood on their clothes, but both insist they are innocent.',
        'Nine suspects are inside the manor, and every alibi hides a different family lie.'
    ],
    objective: 'Collect letters, keys, codes, and painted clues, unlock the tunnels, and find the truth.',
    menuIntro: [
        '"Truth is not what you expect. Truth is what you fear to say."',
        '',
        'You are the detective. Nine people are trapped inside Blackwood Manor.',
        'The dead man is upstairs. The knife is still in his chest. The door is locked from the inside.',
        '',
        'Someone built a path through the walls. Someone waited ten years.'
    ].join('\n')
}

export const CASE_QUIZ = [
    {
        question: 'What was the motive behind the murder?',
        options: [
            'Money and inheritance',
            'Revenge for Daniel Gray',
            'A secret affair',
            'Self-defense'
        ],
        answer: 1
    },
    {
        question: 'How did the killer enter the locked office?',
        options: [
            'Through the window',
            'A spare key from the butler',
            'Mechanical rails inside the walls',
            'He was already hiding inside'
        ],
        answer: 2
    },
    {
        question: 'What weapon was used for the murder?',
        options: [
            'A heavy lead pipe',
            'A fillet knife from the kitchen',
            'A poisoned drink',
            'A service revolver'
        ],
        answer: 1
    }
]

export const ENDING_OPTIONS = [
    {
        id: 'arrest-walter',
        label: 'Arrest Walter Blackwood',
        requiresTruth: true,
        title: 'Case Closed: The Father\'s Judgment',
        body: 'Walter confesses to everything. He reveals that Arthur killed his biological son, Daniel Gray, ten years ago, and the justice was long overdue. Walter dies in the courtroom from a heart attack. Eleanor never forgives him for turning their grief into a murder.'
    },
    {
        id: 'hide-truth',
        label: 'Keep the Secret',
        requiresTruth: true,
        title: 'The Manor Keeps Breathing',
        body: 'You leave the manor without pressing charges. The family remains intact only on the surface. Winston continues to arrange the silver, Eleanor stays silent, and Walter returns to his chair. The truth remains buried in the walls.'
    },
    {
        id: 'frame-gordy',
        label: 'Arrest Gordon Floyd',
        requiresTruth: false,
        title: 'Bad Ending: The Wrong Man',
        body: 'Gordon Floyd is convicted for the knife he gave to Walter. Years later, the rails in the walls are found, but it\'s too late. The detective chose convenience over the truth.'
    },
    {
        id: 'tell-eleanor',
        label: 'Reveal Only to Eleanor',
        requiresTruth: true,
        title: 'A Private Truth',
        body: 'You tell everything to Eleanor. She doesn\'t cry. She only whispers that she had been waiting ten years for someone to understand. Walter is not arrested that night, but the lie has nowhere left to hide.'
    }
]

export const FINAL_REQUIRED_CLUES = [
    'letter-ruth',
    'letter-eleanor',
    'gordy-confession',
    'eddie-diary',
    'arthur-note',
    'martha-letter',
    'tunnel-map',
    'remote-control',
    'walter-rails'
]

export const SUSPECTS = {
    martha: {
        name: 'Martha White',
        role: 'Maid',
        age: 54,
        portrait: 'characters/ikonomka.png',
        alibi: 'Cleaning the kitchen with Gordy until 20:00, then the living room until 20:30. Seen by Gordy and Eleanor.',
        level2: ['martha-letter'],
        level3: ['martha-letter', 'blood-stain-martha'],
        dialogues: [
            "I was just cleaning! I entered this morning and saw him... lying in blood. I fainted. My sleeve got wet. God forgive me for not calling for help immediately.",
            "Arthur told me the butler would die tonight. I didn't believe him. I thought he was drinking. Last night I heard a noise from the office, but I didn't go in. I was afraid.",
            "I have no motive. I worked here for eight years. Arthur was rude sometimes, but he paid well. I didn't kill him. I swear on my children's lives."
        ]
    },
    gordy: {
        name: 'Gordon "Gordy" Floyd',
        role: 'Cook',
        age: 48,
        portrait: 'characters/gotvach.png',
        alibi: 'In the kitchen from 19:00 to 20:45, cutting meat. Martha saw him, and the blood on his apron is a mix of beef and blood from the corpse.',
        level2: ['gordy-confession'],
        level3: ['gordy-confession', 'fingerprints-knife'],
        dialogues: [
            "The blood? Yes, there is blood on my apron. I was cutting beef. The knife has been missing for a week. I thought I lost it.",
            "Fine, fine. Walter asked me for a knife. Said he wanted to cut apples. The old man is in a wheelchair, what was I supposed to do? I gave it to him. Now I regret it. But I didn't kill him!",
            "My fingerprints are on the knife because I held it every day in the kitchen! That proves nothing. Walter used me and then blackmailed me."
        ]
    },
    eddie: {
        name: 'Eddie "Tinker" Reynolds',
        role: 'Mechanic',
        age: 41,
        portrait: 'characters/mehanik.png',
        alibi: 'In his workshop in the basement from 19:00 to 21:30. His tools support him, but there is no witness.',
        level2: ['tunnel-map'],
        level3: ['tunnel-map', 'remote-control', 'eddie-diary'],
        dialogues: [
            "I just fix things. Doors, locks, pumps. Tunnels? What tunnels? I don't know what you're talking about.",
            "Fine, I built rails for Walter. He said he wanted to move around the house without being seen. I didn't know he was going to kill anyone! He lied to me!",
            "The remote locks the latches from the inside, yes. Walter told me it was to keep people out of his room. I believed him. Now I know nothing."
        ]
    },
    eleanor: {
        name: 'Eleanor Gray',
        role: 'Grandmother',
        age: 83,
        portrait: 'characters/bogata jena.png',
        alibi: 'In her room from 19:00 to 21:00. The TV was on, but no one saw her.',
        level2: ['letter-eleanor'],
        level3: ['letter-eleanor', 'remote-control', 'walter-rails'],
        dialogues: [
            "Who are you? Oh, Arthur? Did Arthur die? I... don't remember well. Did I eat breakfast today? Do you want some tea?",
            "How did you find this letter? It was... hidden. Fine, I won't lie. Arthur killed my child. My true child. Walter didn't know. I told him only years ago. He... he couldn't forgive.",
            "Yes, Walter did it. I begged him not to. But he said: 'He killed our son. I will kill his.' I don't regret that Arthur is dead. I regret that my Walter will die in prison."
        ]
    },
    walter: {
        name: 'Walter Blackwood',
        role: 'Grandfather',
        age: 85,
        portrait: 'characters/dqdo.png',
        alibi: 'In his room, in a wheelchair - according to Eleanor. This alibi has only one witness.',
        level2: ['rusty-key'],
        level3: ['rusty-key', 'remote-control', 'walter-rails'],
        dialogues: [
            "...",
            "I am an invalid. I can't even go to the bathroom alone. How the hell do you think I killed someone?",
            "Fine. You caught me. Yes, I did it. But do you know why? Arthur killed my true son. Not the adopted one. My blood. My boy. I am not a murderer. I am a judge."
        ]
    },
    sam: {
        name: 'Samuel "Sam" Blackwood',
        role: 'Brother',
        age: 56,
        portrait: 'characters/brother.png',
        alibi: 'In his room, drinking alone from 18:00 to 23:00. Empty bottles, but no witness.',
        level2: ['loan-shark-letter'],
        level3: ['loan-shark-letter', 'dna-sample'],
        dialogues: [
            "Finally! Arthur is dead! Finally! What? Am I a suspect? I was in my room, drinking whiskey and counting my debts. I have dozens of witnesses - the bottles.",
            "Fine, I wrote that I wanted him dead. So what? Everyone in this family thought it. But I didn't kill him. I don't have the guts for that.",
            "I don't have fingerprints on the knife. Check! I was in my room. Lonely, drunk, and pathetic, but not a killer. That is the truth."
        ]
    },
    clara: {
        name: 'Clara Blackwood',
        role: 'Sister',
        age: 54,
        portrait: 'characters/sister.png',
        alibi: 'In the library from 19:00 to 21:00. Winston saw her leaving around 21:00.',
        level2: ['forged-will'],
        level3: ['forged-will', 'library-alibi'],
        dialogues: [
            "Arthur was a tyrant. I distanced myself from him years ago. I came for the funeral, and now I'm a suspect? Wonderful. I have a lawyer.",
            "Yes, I was looking for evidence that Arthur forged the will. He stole Ben's and my inheritance. But I didn't kill him. I needed him alive to sue him.",
            "My alibi? I was in the library, reading old documents. Winston saw me around 21:00. Arthur died around 20:30-21:00. So I'm clean."
        ]
    },
    ben: {
        name: 'Benjamin "Ben" Blackwood',
        role: 'Other Brother',
        age: 52,
        portrait: 'characters/boy.png',
        alibi: 'In the east wing, repairing an old clock. The clock is disassembled, but no one saw him.',
        level2: ['ben-threat'],
        level3: ['ben-threat', 'clock-repair-trace'],
        dialogues: [
            "I've lived in a separate wing for twenty years. I don't talk to Arthur. I came back because Winston called me. That's all.",
            "I left because Arthur threatened me. Said if I didn't disappear, he'd accuse me of things I didn't do. I was young and scared.",
            "I had no motive to kill him. He was no longer part of my life. I was in my workshop, repairing an old clock. That doesn't make me a killer."
        ]
    },
    winston: {
        name: 'Winston "Win" Hill',
        role: 'Butler',
        age: 63,
        portrait: 'characters/ikonom.png',
        alibi: 'In the dining room from 19:30 to 21:00, arranging silver. No one saw him the whole time.',
        level2: ['letter-ruth'],
        level3: ['letter-ruth', 'birth-certificate'],
        dialogues: [
            "I maintained order in this house for thirty years. Arthur was not an easy man, but did he deserve death? No. I have an alibi - I was in the dining room, arranging the silver.",
            "Yes, Arthur was not Walter's son. He was my son. With the maid Ruth. She died when he was a baby. I was silent for 42 years. I didn't kill him. He was my son, damn it!",
            "Did I know Arthur killed Walter's true son? I found out a year ago. I didn't say anything because I was afraid I'd be blamed. I am an accomplice by silence."
        ]
    }
}

export function assetKey(path) {
    return `asset:${path}`
}

function createState() {
    return {
        clues: [],
        clueCatalog: {},
        inventory: [],
        selectedInventoryId: null,
        solved: false,
        endingId: null
    }
}

let state = createState()

export function resetGameState() {
    state = createState()
    return state
}

export function getGameState() {
    return state
}

export function addClue(itemOrId, title, description) {
    const item = typeof itemOrId === 'object'
        ? itemOrId
        : { id: itemOrId, title, description, type: 'evidence' }

    if (state.clues.includes(item.id)) {
        return false
    }

    const normalized = {
        type: 'evidence',
        icon: 'random/note.png',
        details: item.description,
        ...item
    }

    state.clues.push(normalized.id)
    state.clueCatalog[normalized.id] = normalized
    state.inventory.push(normalized)
    return true
}

export function getCollectedClues() {
    return state.clues.map(id => state.clueCatalog[id])
}

export function getInventoryItems() {
    return [...state.inventory]
}

export function hasItem(id) {
    return state.clues.includes(id)
}

export function hasAllItems(ids = []) {
    return ids.every(hasItem)
}

export function hasAnyItem(ids = []) {
    return ids.some(hasItem)
}

export function selectInventoryItem(id) {
    state.selectedInventoryId = id
}

export function getSelectedInventoryItem() {
    return state.inventory.find(item => item.id === state.selectedInventoryId) ?? null
}

export function canAccuse() {
    return state.clues.length >= CASE_FILE.accusationThreshold
}

export function hasRequiredClues() {
    return FINAL_REQUIRED_CLUES.every(hasItem)
}

export function canReachTruth() {
    return canAccuse() && hasRequiredClues()
}

export function resolveEnding(optionId, quizAnswers = []) {
    const option = ENDING_OPTIONS.find(item => item.id === optionId)

    if (!option) {
        return null
    }

    const quizCorrect = quizAnswers.every((ans, i) => ans === CASE_QUIZ[i].answer)
    const success = quizCorrect && (!option.requiresTruth || canReachTruth())

    state.solved = success && option.requiresTruth
    state.endingId = option.id

    if (!quizCorrect) {
        return {
            title: 'Interrogation Failed',
            body: 'You couldn\'t explain the details of the crime. The police don\'t believe your theory. The killer remains free because of your lack of evidence and logic.'
        }
    }

    if (option.requiresTruth && !success) {
        return {
            title: 'Not Ready Yet',
            body: 'You have suspicions, but you still lack the connections between Daniel Gray, the tunnels, the remote control, and the confessions. Blackwood Manor will deceive you if you hurry.'
        }
    }

    return option
}

export function getSuspectDialogue(suspectId) {
    const suspect = SUSPECTS[suspectId]

    if (!suspect) {
        return null
    }

    let level = 1

    if (hasAllItems(suspect.level3)) {
        level = 3
    } else if (hasAnyItem(suspect.level2)) {
        level = 2
    }

    return {
        ...suspect,
        level,
        text: suspect.dialogues[level - 1]
    }
}

export function getSavedNotes() {
    try {
        return window.localStorage.getItem(STORAGE_NOTES_KEY) ?? ''
    } catch {
        return ''
    }
}

export function saveNotes(value) {
    try {
        window.localStorage.setItem(STORAGE_NOTES_KEY, value)
    } catch {
    }
}
