const DEFAULT_SUSPECTS = ['Adrian Vale', 'Mara Quinn', 'Lionel Hart']
const REQUIRED_CLUES = ['knife', 'friend-photo', 'threat-note']

export const CASE_FILE = {
    title: 'The Thornfield House Murder',
    victim: 'Evelyn Ward',
    culprit: 'Mara Quinn',
    accusationThreshold: 5,
    totalClues: 8,
    menuIntro: [
        'Journalist Evelyn Ward invited her husband, her oldest friend, and her business partner to Thornfield House after discovering someone had been draining relief funds through forged ledgers.',
        '',
        'Before she could reveal the name, the lights went out and Evelyn was stabbed in the living room.',
        '',
        'As Lia, search the rooms, connect the lies, and expose the killer before the story dies with her.'
    ].join('\n')
}

function createState() {
    return {
        clues: [],
        clueCatalog: {},
        suspects: [...DEFAULT_SUSPECTS],
        culprit: CASE_FILE.culprit,
        solved: false
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

export function addClue(id, title, description) {
    if (state.clues.includes(id)) {
        return false
    }

    state.clues.push(id)
    state.clueCatalog[id] = { title, description }
    return true
}

export function getCollectedClues() {
    return state.clues.map(id => ({
        id,
        ...state.clueCatalog[id]
    }))
}

export function canAccuse() {
    return state.clues.length >= CASE_FILE.accusationThreshold
}

export function hasRequiredClues() {
    return REQUIRED_CLUES.every(id => state.clues.includes(id))
}

export function resolveAccusation(suspect) {
    const isCorrect = suspect === state.culprit && hasRequiredClues()

    if (isCorrect) {
        state.solved = true
    }

    return isCorrect
}

export { DEFAULT_SUSPECTS, REQUIRED_CLUES }
