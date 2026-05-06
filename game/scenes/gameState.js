const STORAGE_NOTES_KEY = 'blackwood-manor-notes-v1'

export const CASE_FILE = {
    title: 'Angel of the Blackwood Manor',
    caseName: 'Angel of the Blackwood Manor',
    victim: 'Arthur Blackwood, 58',
    culprit: 'Walter Blackwood',
    accusationThreshold: 18,
    totalClues: 38,
    location: 'Blackwood Manor, Vermont',
    timeOfDeath: '2 ноември 1987 г., между 20:15 и 20:55',
    summary: 'Пристигате в имението в 8:30 сутринта. Ситен дъжд, стара дървесина и миризма на изгоряло масло. Arthur Blackwood е намерен мъртъв в заключения си кабинет на втория етаж, с нож за филе в гърдите.',
    details: [
        'Вратата е заключена отвътре с резета, но зад камината има следи от скрит механизъм.',
        'Готвачът Gordon Floyd и чистачката Martha White имат кръв по дрехите, но и двамата настояват, че са невинни.',
        'Деветима заподозрени са в имението, а всяко алиби крие отделна семейна лъжа.'
    ],
    objective: 'Съберете писмата, ключовете, кодовете и уликите от картините, отключете тунелите и изберете какво да направи детективът.',
    menuIntro: [
        '"Истината не е която очакваш. Истината е която не смееш да кажеш."',
        '',
        'Вие сте детективът. Девет души са затворени в Blackwood Manor.',
        'Мъртвецът е горе. Ножът е в гърдите му. Вратата е заключена отвътре.',
        '',
        'Някой е построил път през стените. Някой е чакал десет години.'
    ].join('\n')
}

export const ENDING_OPTIONS = [
    {
        id: 'arrest-walter',
        label: 'Арестувай Walter',
        requiresTruth: true,
        title: 'Case Closed: Walter Blackwood',
        body: 'Walter признава всичко. Казва, че Arthur е убил истинския му син Daniel Gray и че съдът е закъснял с десет години. Умира в съдебната зала от инфаркт. Eleanor никога не му прощава, че е превърнал траура им в убийство.'
    },
    {
        id: 'hide-truth',
        label: 'Запази тайната',
        requiresTruth: true,
        title: 'The Manor Keeps Breathing',
        body: 'Напускате имението без обвинение. Семейството остава цяло само на вид. Winston продължава да подрежда среброто, Eleanor мълчи, а Walter се връща в стола си. Истината остава в стените.'
    },
    {
        id: 'frame-gordy',
        label: 'Предай Gordy',
        requiresTruth: false,
        title: 'Bad Ending: Wrong Man',
        body: 'Gordon Floyd е осъден за ножа, който е дал на Walter. Години по-късно намират релсите в стената, но вече е късно. Детективът е решил удобно, не вярно.'
    },
    {
        id: 'tell-eleanor',
        label: 'Разкрий само пред Eleanor',
        requiresTruth: true,
        title: 'A Private Truth',
        body: 'Казвате всичко на Eleanor. Тя не плаче. Само прошепва, че е чакала десет години някой да разбере. Walter не е арестуван тази нощ, но лъжата вече няма къде да стои.'
    }
]

export const FINAL_REQUIRED_CLUES = [
    'arthur-confession',
    'birth-certificate',
    'daniel-microfilm',
    'eddie-diary',
    'gordy-letter',
    'letter-eleanor-walter',
    'remote-control',
    'rusty-key',
    'tunnel-map',
    'walter-rails'
]

export const SUSPECTS = {
    eleanor: {
        name: 'Eleanor Gray',
        role: 'Баба',
        age: 83,
        portrait: 'characters/bogata jena.png',
        alibi: 'В стаята си от 19:00 до 21:00. Телевизорът е бил включен, но никой не я е видял.',
        level2: ['letter-eleanor-walter'],
        level3: ['letter-eleanor-walter', 'remote-control', 'walter-rails'],
        dialogues: [
            'Кой си ти? О, Arthur? Arthur умря ли? Аз... не помня добре. Днес ядох ли закуска? Искаш ли чай?',
            'Как намери това писмо? То беше скрито. Добре, няма да лъжа. Arthur уби моето дете. Моето истинско дете. Walter не знаеше. Казах му едва преди години. Той не можеше да прости.',
            'Да, Walter го направи. Аз го молех да не го прави. Но той каза: "Той уби сина ни. Аз ще убия неговия." Не съжалявам, че Arthur е мъртъв. Съжалявам, че моят Walter ще умре в затвора.'
        ]
    },
    walter: {
        name: 'Walter Blackwood',
        role: 'Дядо',
        age: 85,
        portrait: 'characters/dqdo.png',
        alibi: 'В стаята си, в инвалиден стол - според Eleanor. Това алиби има само един свидетел.',
        level2: ['rusty-key'],
        level3: ['rusty-key', 'remote-control', 'walter-rails'],
        dialogues: [
            '... Инвалид съм. Не мога дори до тоалетната сам. Как, по дяволите, според теб съм убил някого?',
            'Ключ? Не знам за какъв ключ говориш. Вероятно Eddie го е изпуснал. Ръката му потрепва, преди пак да замълчи.',
            'Добре. Хвана ме. Да, аз го направих. Но знаеш ли защо? Arthur уби истинския ми син. Не осиновения. Моята кръв. Моето момче. Аз не съм убиец. Аз съм съдия.'
        ]
    },
    gordy: {
        name: 'Gordon "Gordy" Floyd',
        role: 'Готвач',
        age: 48,
        portrait: 'characters/gotvach.png',
        alibi: 'В кухнята от 19:00 до 20:45, режел месо. Martha го вижда, а кръвта по престилката е смес от телешко и кръв от трупа.',
        level2: ['gordy-letter'],
        level3: ['gordy-letter', 'fingerprints-report'],
        dialogues: [
            'Кръвта? Да, по престилката ми има кръв. Режех телешко. Ножът липсва от седмица. Мислех, че съм го загубил.',
            'Добре, добре. Walter ме помоли за нож. Каза, че иска да реже ябълки. Старецът е в инвалиден стол, какво да направя? Дадох му го. Сега съжалявам. Но не съм го убил!',
            'Отпечатъците ми са на ножа, защото аз го държах всеки ден в кухнята. Това нищо не доказва. Walter ме използва и после ме изнудва.'
        ]
    },
    martha: {
        name: 'Martha White',
        role: 'Чистачка',
        age: 54,
        portrait: 'characters/ikonomka.png',
        alibi: 'Чистела кухнята с Gordy до 20:00, после хола до 20:30. Видяна от Gordy и Eleanor.',
        level2: ['martha-letter'],
        level3: ['martha-letter', 'blood-analysis'],
        dialogues: [
            'Аз само чистех! Влязох сутринта и го видях... лежеше в кръв. Припаднах. Ръкавът ми се намокри. Господи, прости ми.',
            'Arthur ми каза, че икономът ще умре. Не му повярвах. Мислех, че пие. Снощи чух шум от кабинета, но не влязох. Страхувах се.',
            'Нямам мотив. Работех тук осем години. Arthur беше груб понякога, но плащаше добре. Не съм го убила. Кълна се в децата си.'
        ]
    },
    eddie: {
        name: 'Eddie "Tinker" Reynolds',
        role: 'Механик',
        age: 41,
        portrait: 'characters/mehanik.png',
        alibi: 'В работилницата си в мазето от 19:00 до 21:30. Инструментите го подкрепят, но няма свидетел.',
        level2: ['tunnel-sketches'],
        level3: ['tunnel-sketches', 'remote-control', 'eddie-diary'],
        dialogues: [
            'Аз само оправям неща. Врати, ключалки, помпи. Тунели? Какви тунели? Не знам за какво говориш.',
            'Добре, направих релси за Walter. Каза, че иска да се движи из къщата без да го виждат. Не знаех, че ще убива някого! Той ме излъга!',
            'Дистанционното заключва резетата отвътре, да. Walter ми каза, че е за да не влизат хора в стаята му. Повярвах му. Сега не знам нищо.'
        ]
    },
    winston: {
        name: 'Winston "Win" Hill',
        role: 'Иконом',
        age: 63,
        portrait: 'characters/ikonom.png',
        alibi: 'В трапезарията от 19:30 до 21:00, подреждал сребро. Никой не го е видял през цялото време.',
        level2: ['letter-ruth'],
        level3: ['letter-ruth', 'birth-certificate', 'daniel-microfilm'],
        dialogues: [
            'Поддържах реда в тази къща тридесет години. Arthur не беше лесен човек, но заслужаваше ли смърт? Не.',
            'Да, Arthur не беше син на Walter. Той беше мой син. С прислужницата Ruth. Тя почина, когато той беше бебе. Мълчах 42 години. Не го убих. Той беше мой син.',
            'Знаех ли, че Arthur е убил истинския син на Walter? Разбрах преди година. Не казах нищо, защото се страхувах. Аз съм съучастник по мълчание.'
        ]
    },
    sam: {
        name: 'Samuel "Sam" Blackwood',
        role: 'Брат',
        age: 56,
        portrait: 'characters/brother.png',
        alibi: 'В стаята си, пил сам от 18:00 до 23:00. Празни бутилки, но никакъв свидетел.',
        level2: ['loan-shark-letter'],
        level3: ['loan-shark-letter', 'dna-report'],
        dialogues: [
            'Накрая! Arthur умря! Какво? Заподозрян ли съм? Бях в стаята си, пиех уиски и броях дълговете си. Имам десетки свидетели - бутилките.',
            'Добре, писах, че искам да умре. И какво от това? Всеки в това семейство го е мислил. Но не съм го убил. Нямам смелост за такова нещо.',
            'Нямам отпечатъци върху ножа. Проверете. Бях самотен, пиян и жалък, но не убиец. Това е истината.'
        ]
    },
    clara: {
        name: 'Clara Blackwood',
        role: 'Сестра',
        age: 54,
        portrait: 'characters/sister.png',
        alibi: 'В библиотеката от 19:00 до 21:00. Winston я вижда около 21:00 да излиза.',
        level2: ['forged-will'],
        level3: ['forged-will', 'library-alibi'],
        dialogues: [
            'Arthur беше тиранин. Отчуждих се от него преди години. Дойдох за погребението, а сега съм заподозряна? Прекрасно.',
            'Да, търсих доказателства, че Arthur е фалшифицирал завещанието. Той открадна наследството на Ben и моето. Но не го убих. Имах нужда от него жив.',
            'Алибито ми? Бях в библиотеката, четях стари документи. Winston ме видя около 21:00. Arthur е умрял преди или около това време. Значи съм чиста.'
        ]
    },
    ben: {
        name: 'Benjamin "Ben" Blackwood',
        role: 'Друг брат',
        age: 52,
        portrait: 'characters/boy.png',
        alibi: 'В източното крило, ремонтирал стар часовник. Часовникът е разглобен, но никой не го е видял.',
        level2: ['ben-threat'],
        level3: ['ben-threat', 'clock-repair'],
        dialogues: [
            'Живея в отделно крило от двайсет години. Не говоря с Arthur. Върнах се, защото Winston ми се обади. Това е всичко.',
            'Напуснах, защото Arthur ме заплаши. Каза, че ако не изчезна, ще ме обвини в неща, които не съм направил. Бях млад и уплашен.',
            'Нямах мотив да го убия. Той вече не беше част от живота ми. Бях в работилницата си, ремонтирах стар часовник. Това не ме прави убиец.'
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

export function resolveEnding(optionId) {
    const option = ENDING_OPTIONS.find(item => item.id === optionId)

    if (!option) {
        return null
    }

    const success = !option.requiresTruth || canReachTruth()

    state.solved = success && option.requiresTruth
    state.endingId = option.id

    if (option.requiresTruth && !success) {
        return {
            title: 'Още не сте готови',
            body: 'Имате подозрения, но още липсват връзките между Daniel Gray, тунелите, дистанционното и признанията. Blackwood Manor ще ви излъже, ако бързате.'
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
        // Notes are a convenience layer; the game can continue without storage.
    }
}
