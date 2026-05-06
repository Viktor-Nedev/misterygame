export const roomConfigs = {
    livingRoom: {
        key: 'LivingRoomScene',
        title: 'Главен хол',
        mapName: 'living-room',
        accentColor: 0xd8b56d,
        intro: 'Заподозрените са събрани в хола. Някои гледат пода, други гледат вас. Отгоре кабинетът още мирише на кръв и уиски.',
        spawnPoint: { x: 240, y: 176 },
        doors: [
            { label: 'Кухня', targetScene: 'KitchenScene', spawnPoint: { x: 88, y: 104 }, x: 444, y: 96, width: 32, height: 96 },
            { label: 'Кабинетът на Arthur', targetScene: 'OfficeScene', spawnPoint: { x: 392, y: 112 }, x: 36, y: 96, width: 32, height: 96 },
            { label: 'Спалнята на Arthur', targetScene: 'BedroomScene', spawnPoint: { x: 240, y: 72 }, x: 240, y: 252, width: 112, height: 28 },
            { label: 'Трапезария', targetScene: 'DiningRoomScene', spawnPoint: { x: 240, y: 212 }, x: 132, y: 252, width: 72, height: 28 },
            { label: 'Стаята на Walter', targetScene: 'WalterRoomScene', spawnPoint: { x: 88, y: 112 }, x: 348, y: 252, width: 72, height: 28 }
        ],
        characters: [
            { id: 'martha', x: 100, y: 152 },
            { id: 'gordy', x: 152, y: 152 },
            { id: 'winston', x: 212, y: 150 },
            { id: 'sam', x: 272, y: 154 },
            { id: 'clara', x: 332, y: 152 }
        ],
        clues: [
            {
                id: 'letter-ruth',
                type: 'letter',
                title: 'Писмо 1 - Ruth Hayes',
                description: 'Зад портрет на младия Walter е скрито писмо от Ruth Hayes, биологичната майка на Arthur.',
                details: '"Взимам парите и заминавам. Детето е ваше. Никой няма да разбере. Но ако някой ден разбере, че не го обичате, ще се върна и ще ви унищожа."',
                icon: 'random/note.png',
                x: 72,
                y: 64,
                width: 36,
                height: 44,
                visual: { type: 'image', image: 'decor/picture1.png' }
            },
            {
                id: 'tunnel-map',
                type: 'map',
                title: 'Карта на тайните тунели',
                description: 'На гърба на картина на имението има ръкописна карта. Подписът е на Eddie.',
                details: 'Картата показва проход зад камината в кабинета, релси в стената и врата в сутерена зад бойлера.',
                icon: 'random/picture.png',
                x: 408,
                y: 66,
                width: 42,
                height: 36,
                visual: { type: 'image', image: 'random/picture.png' }
            },
            {
                id: 'silver-key',
                type: 'key',
                title: 'Малък сребърен ключ',
                description: 'В джоба на Winston има малък сребърен ключ. Той отключва старото бюро на Arthur.',
                details: 'Winston твърди, че Arthur му го е дал "за подреждане". Ключът е чист, но носи прах от спалнята на Arthur.',
                icon: 'office/chest.png',
                x: 214,
                y: 100,
                width: 26,
                height: 26,
                visual: { type: 'image', image: 'office/chest.png' }
            },
            {
                id: 'magnifier',
                type: 'tool',
                title: 'Лупа',
                description: 'Малка лупа в полицейската чанта до входа. Полезна за миниатюрни следи.',
                details: 'С нея можете да прочетете микрофилма, скрит в картината "Елен в гората".',
                icon: 'bathroom/mirror.png',
                x: 386,
                y: 208,
                width: 28,
                height: 34,
                visual: { type: 'image', image: 'bathroom/mirror.png' }
            },
            {
                id: 'officer-briefing',
                type: 'note',
                title: 'Доклад на полицай Malone',
                description: 'Кратък доклад от входа: вратата на кабинета е била заключена отвътре, а всички девет души са били в имението.',
                details: 'Malone отбелязва: Gordy и Martha са с кръв, но никой не е напускал къщата. Тялото е открито сутринта. Първата реакция на Walter е била мълчание.',
                icon: 'random/notebook.png',
                x: 384,
                y: 152,
                width: 34,
                height: 34,
                visual: { type: 'image', image: 'random/notebook.png' }
            }
        ]
    },
    kitchen: {
        key: 'KitchenScene',
        title: 'Кухня',
        mapName: 'kitchen',
        accentColor: 0xe6c15a,
        intro: 'Кухнята е пълна с метален шум, студено месо и страх. Ножовете са подредени твърде внимателно, освен един.',
        spawnPoint: { x: 88, y: 104 },
        doors: [
            { label: 'Главен хол', targetScene: 'LivingRoomScene', spawnPoint: { x: 392, y: 96 }, x: 36, y: 96, width: 32, height: 96 },
            { label: 'Трапезария', targetScene: 'DiningRoomScene', spawnPoint: { x: 240, y: 72 }, x: 240, y: 36, width: 112, height: 28 },
            { label: 'Работилница', targetScene: 'WorkshopScene', spawnPoint: { x: 88, y: 112 }, x: 444, y: 96, width: 32, height: 96 }
        ],
        clues: [
            {
                id: 'gordy-letter',
                type: 'letter',
                title: 'Писмо 3 - Gordy до брат си',
                description: 'Под чувал с брашно има писмо, което Gordy не е успял да изпрати.',
                details: '"Старият Walter ме помоли да му оставя нож в стаята. Каза, че иска да реже ябълки. Дадох му го. Сега ножът е в гърдите на Arthur. Walter ме заплаши, че ако кажа нещо, ще каже, че аз съм го направил. Какво да правя?"',
                icon: 'random/note.png',
                x: 116,
                y: 188,
                width: 34,
                height: 38,
                visual: { type: 'image', image: 'random/note.png' }
            },
            {
                id: 'blood-analysis',
                type: 'evidence',
                title: 'Анализ на кръвта по дрехите',
                description: 'Кръвта по престилката на Gordy е от телешко и от трупа, не от активен удар. Ръкавът на Martha е намокрен от локвата.',
                details: 'Gordy е опитал да извади ножа след откриването на тялото. Martha е паднала до трупа. Нито една следа не доказва, че някой от двамата е нанесъл удара.',
                icon: 'random/bloodspot2.png',
                x: 352,
                y: 172,
                width: 36,
                height: 30,
                visual: { type: 'image', image: 'random/bloodspot2.png' }
            },
            {
                id: 'fingerprints-report',
                type: 'evidence',
                title: 'Отпечатъци по ножа',
                description: 'Отпечатъците на Gordy са стари кухненски следи. Върху дръжката има размазване от ръкавица.',
                details: 'Докладът премахва Gordy като човек, който е държал ножа в момента на убийството. Някой е използвал кухненския му нож като чужда следа.',
                icon: 'random/knivewithblood.png',
                x: 302,
                y: 96,
                width: 34,
                height: 34,
                visual: { type: 'image', image: 'random/knivewithblood.png' }
            },
            {
                id: 'meat-alibi',
                type: 'alibi',
                title: 'Кухненско алиби',
                description: 'Остатъците от телешко и часовникът на фурната подкрепят твърдението на Gordy, че е готвил между 19:00 и 20:45.',
                details: 'Martha го е видяла до 20:00. Това не е перфектно алиби, но кръвта по престилката вече не е достатъчна за обвинение.',
                icon: 'kitchen/food.png',
                x: 82,
                y: 76,
                width: 30,
                height: 30,
                visual: { type: 'image', image: 'kitchen/food.png' }
            }
        ]
    },
    bedroom: {
        key: 'BedroomScene',
        title: 'Спалнята на Arthur',
        mapName: 'bedroom',
        accentColor: 0xaec6cf,
        intro: 'Стаята на Arthur е подредена като витрина. Истинските документи са там, където никой гост не би пипнал.',
        spawnPoint: { x: 240, y: 72 },
        doors: [
            { label: 'Главен хол', targetScene: 'LivingRoomScene', spawnPoint: { x: 240, y: 212 }, x: 240, y: 36, width: 112, height: 28 },
            { label: 'Кабинетът на Arthur', targetScene: 'OfficeScene', spawnPoint: { x: 88, y: 112 }, x: 444, y: 112, width: 32, height: 96 },
            { label: 'Стаята на Eleanor', targetScene: 'EleanorRoomScene', spawnPoint: { x: 392, y: 112 }, x: 36, y: 112, width: 32, height: 96 }
        ],
        clues: [
            {
                id: 'letter-eleanor-walter',
                type: 'letter',
                title: 'Писмо 2 - Eleanor до Walter',
                description: 'Старото бюро на Arthur е заключено. Вътре има писмо от Eleanor до Walter.',
                details: '"Arthur уби нашето дете. Не това, което дадохме за осиновяване. Истинският ни син - от кръвта ни. Arthur разбра кой е и го прегази с колата си. Получих доклад от частния детектив. Съжалявам, че ти казвам това, но повече не мога да мълча."',
                lockedText: 'Бюрото не помръдва. Малък сребърен ключ би паснал на ключалката.',
                requires: ['silver-key'],
                icon: 'random/note.png',
                x: 164,
                y: 184,
                width: 38,
                height: 34,
                visual: { type: 'image', image: 'bedroom/desk.png' }
            },
            {
                id: 'daniel-photo',
                type: 'photo',
                title: 'Снимка на Daniel Gray',
                description: 'Снимка на млад мъж с надпис: "Моят син, 1983". Лицето не прилича на Arthur.',
                details: 'Daniel Gray е бил истинският син на Walter и Eleanor. Някой е пазил снимката в стаята на Arthur като трофей или като вина.',
                icon: 'random/photo2.png',
                x: 214,
                y: 128,
                width: 36,
                height: 34,
                visual: { type: 'image', image: 'random/photo2.png' }
            },
            {
                id: 'forged-will',
                type: 'document',
                title: 'Фалшиво завещание',
                description: 'Проект от 1985 г. прави Arthur единствен наследник и изтрива Clara и Ben.',
                details: 'Clara е имала мотив да съди Arthur, но не да го убие преди делото. Завещанието обяснява гнева, не убийството.',
                icon: 'random/notebook.png',
                x: 330,
                y: 92,
                width: 34,
                height: 34,
                visual: { type: 'image', image: 'random/notebook.png' }
            },
            {
                id: 'ben-threat',
                type: 'document',
                title: 'Заплаха към Ben',
                description: 'Писмо от Arthur до Ben: ако се върне в основното крило, ще бъде обвинен в престъпление, което не е извършил.',
                details: 'Ben е удобен заподозрян за прибързан детектив, но документът показва по-скоро страх, отколкото мотив.',
                icon: 'random/photo1.png',
                x: 112,
                y: 92,
                width: 34,
                height: 26,
                visual: { type: 'image', image: 'random/photo1.png' }
            }
        ]
    },
    office: {
        key: 'OfficeScene',
        title: 'Кабинетът на Arthur',
        mapName: 'office',
        accentColor: 0xb84a4a,
        intro: 'Тялото е в кабинета. Заключена врата, нож в гърдите, документи за Daniel по бюрото и камина, която не стои съвсем правилно.',
        spawnPoint: { x: 392, y: 112 },
        doors: [
            { label: 'Главен хол', targetScene: 'LivingRoomScene', spawnPoint: { x: 88, y: 96 }, x: 444, y: 96, width: 32, height: 96 },
            { label: 'Кухня', targetScene: 'KitchenScene', spawnPoint: { x: 240, y: 212 }, x: 240, y: 36, width: 112, height: 28 },
            { label: 'Спалнята на Arthur', targetScene: 'BedroomScene', spawnPoint: { x: 392, y: 112 }, x: 36, y: 112, width: 32, height: 96 },
            { label: 'Сутерен зад камината', targetScene: 'CellarScene', spawnPoint: { x: 392, y: 112 }, x: 240, y: 252, width: 112, height: 28, requires: ['rusty-key', 'floor-panel'] }
        ],
        clues: [
            {
                id: 'body-report',
                type: 'evidence',
                title: 'Трупът на Arthur',
                description: 'Arthur е намушкан отзад, после е паднал напред. Часът на смъртта е между 20:15 и 20:55; най-силната следа сочи 20:41.',
                details: '20:41 плюс датата на Arthur дава кода 8241 за подовия панел. Ударът е тих, точен и идва от човек, който е влязъл зад него.',
                icon: 'characters/deadbody.png',
                x: 244,
                y: 132,
                width: 48,
                height: 30,
                visual: { type: 'image', image: 'characters/deadbody.png' }
            },
            {
                id: 'knife-evidence',
                type: 'weapon',
                title: 'Нож за филе',
                description: 'Ножът е кухненски, но е донесен тук предварително. Дръжката е бърсана.',
                details: 'Gordy е дал ножа на Walter, мислейки, че старецът ще реже ябълки. Самото оръжие е капан за готвача.',
                icon: 'random/knivewithblood.png',
                x: 292,
                y: 126,
                width: 34,
                height: 34,
                visual: { type: 'image', image: 'random/knivewithblood.png' }
            },
            {
                id: 'gold-key',
                type: 'key',
                title: 'Миниатюрен златен ключ',
                description: 'В джобния часовник на Arthur има тайно отделение с миниатюрен златен ключ.',
                details: 'Ключът отключва малко чекмедже под картината в кабинета.',
                icon: 'decor/clock.png',
                x: 210,
                y: 128,
                width: 28,
                height: 34,
                visual: { type: 'image', image: 'decor/clock.png' }
            },
            {
                id: 'arthur-confession',
                type: 'letter',
                title: 'Писмо 5 - признание на Arthur',
                description: 'Малко чекмедже под картината се отключва със златния ключ. Вътре е скрито писмо.',
                details: '"Аз убих човека, който твърдеше, че е истинският наследник. Беше грешка. Той ме изнудваше. Сега го няма. Ако някой прочете това - не търсете истината. Тя ще ви унищожи."',
                lockedText: 'Чекмеджето е миниатюрно и заключено. Нужно е нещо по-малко от обикновен ключ.',
                requires: ['gold-key'],
                icon: 'random/note.png',
                x: 86,
                y: 68,
                width: 38,
                height: 34,
                visual: { type: 'image', image: 'random/photo.png' }
            },
            {
                id: 'floor-panel',
                type: 'lock',
                title: 'Подов панел - код 8241',
                description: 'Панелът щраква. Под него има механична връзка към камината.',
                details: 'Кодът е изведен от час 20:41. Панелът отключва достъп до скрития проход, но вратата в сутерена все още иска ръждясалия механичен ключ.',
                code: '8241',
                icon: 'random/door2open.png',
                x: 238,
                y: 208,
                width: 38,
                height: 34,
                visual: { type: 'image', image: 'random/door2.png' }
            },
            {
                id: 'fireplace-trace',
                type: 'evidence',
                title: 'Следи зад камината',
                description: 'Саждите са изтрити по права линия. Някой е отварял камината като врата.',
                details: 'В заключената стая не е било нужно да се влиза през вратата. Това разбива привидно невъзможния locked-room трик.',
                icon: 'random/bloodfoodsteps.png',
                x: 374,
                y: 66,
                width: 34,
                height: 34,
                visual: { type: 'image', image: 'random/bloodfoodsteps.png' }
            }
        ]
    },
    diningRoom: {
        key: 'DiningRoomScene',
        title: 'Трапезария',
        mapName: 'dining-room',
        accentColor: 0xc9a05a,
        intro: 'Среброто е подредено с прекалена грижа. Картините гледат масата като свидетели, които са се научили да мълчат.',
        spawnPoint: { x: 240, y: 212 },
        doors: [
            { label: 'Главен хол', targetScene: 'LivingRoomScene', spawnPoint: { x: 132, y: 212 }, x: 132, y: 252, width: 72, height: 28 },
            { label: 'Кухня', targetScene: 'KitchenScene', spawnPoint: { x: 240, y: 72 }, x: 240, y: 36, width: 112, height: 28 },
            { label: 'Стаята на Eleanor', targetScene: 'EleanorRoomScene', spawnPoint: { x: 88, y: 112 }, x: 444, y: 112, width: 32, height: 96 }
        ],
        clues: [
            {
                id: 'wedding-photo-code',
                type: 'code',
                title: 'Сватбена снимка',
                description: 'На гърба на снимка на Eleanor и Walter пише: 1947-10-12.',
                details: 'Това е кодът за сейфа в стаята на Walter.',
                icon: 'random/photo.png',
                x: 86,
                y: 76,
                width: 36,
                height: 30,
                visual: { type: 'image', image: 'random/photo.png' }
            },
            {
                id: 'daniel-microfilm',
                type: 'film',
                title: 'Микрофилм от картината "Елен в гората"',
                description: 'В окото на елена има микрофилм. С лупата се вижда протокол от катастрофата с Daniel Gray.',
                details: 'Протоколът доказва, че Daniel Gray не е загинал случайно. Колата е била на Arthur, а спирачният път е прекалено къс за инцидент.',
                lockedText: 'В окото на картината има нещо тъмно, но е твърде дребно за невъоръжено око.',
                requires: ['magnifier'],
                icon: 'decor/picture3.png',
                x: 394,
                y: 74,
                width: 38,
                height: 40,
                visual: { type: 'image', image: 'decor/picture3.png' }
            },
            {
                id: 'silverware-alibi',
                type: 'alibi',
                title: 'Разбъркано сребро',
                description: 'Сребърните прибори подкрепят алибито на Winston само частично. Има работа, но няма свидетел.',
                details: 'Winston е можел да бъде в трапезарията, но това не доказва, че е бил там през цялото време.',
                icon: 'kitchen/bigtable.png',
                x: 240,
                y: 148,
                width: 48,
                height: 34,
                visual: { type: 'image', image: 'kitchen/bigtable.png' }
            },
            {
                id: 'library-alibi',
                type: 'alibi',
                title: 'Алиби на Clara',
                description: 'Бележка от библиотеката показва час 21:00 и подпис на Winston. Clara е била видяна да излиза.',
                details: 'Тя има мотив за съдебна битка, но не и чист прозорец за убийството.',
                icon: 'office/bookshelf.png',
                x: 146,
                y: 206,
                width: 34,
                height: 40,
                visual: { type: 'image', image: 'office/bookshelf.png' }
            }
        ]
    },
    walterRoom: {
        key: 'WalterRoomScene',
        title: 'Стаята на Walter',
        mapName: 'walter-room',
        accentColor: 0x9aa3a8,
        intro: 'Стаята на Walter е подредена около инвалидния стол. Точно затова всичко, което не пасва на стола, крещи.',
        spawnPoint: { x: 88, y: 112 },
        doors: [
            { label: 'Главен хол', targetScene: 'LivingRoomScene', spawnPoint: { x: 348, y: 212 }, x: 348, y: 252, width: 72, height: 28 },
            { label: 'Сутерен', targetScene: 'CellarScene', spawnPoint: { x: 88, y: 112 }, x: 36, y: 112, width: 32, height: 96, requires: ['rusty-key'] }
        ],
        characters: [
            { id: 'walter', x: 246, y: 148 }
        ],
        clues: [
            {
                id: 'rusty-key',
                type: 'key',
                title: 'Ръждясал механичен ключ',
                description: 'Под възглавницата на Walter има ръждясал ключ. На гърба е гравирано 3357.',
                details: 'Ключът отключва врата в сутерена зад бойлера. Кодът 3357 пасва на цифровата врата в работилницата на Eddie.',
                icon: 'office/chest.png',
                x: 232,
                y: 108,
                width: 30,
                height: 28,
                visual: { type: 'image', image: 'office/chest.png' }
            },
            {
                id: 'birth-certificate',
                type: 'document',
                title: 'Свидетелство за раждане на Daniel Gray',
                description: 'Сейфът на Walter се отваря. Вътре има свидетелство за раждане на Daniel Gray.',
                details: 'Daniel е истинският син на Walter и Eleanor. Даден е за осиновяване, а после е убит от Arthur, когато е потърсил наследството си.',
                code: '1947-10-12',
                icon: 'random/notebook.png',
                x: 374,
                y: 88,
                width: 36,
                height: 34,
                visual: { type: 'image', image: 'office/chest.png' }
            },
            {
                id: 'walter-shoes',
                type: 'evidence',
                title: 'Кал по обувките',
                description: 'Под леглото на Walter има обувки с прах от сутерена и тънка червеникава следа.',
                details: 'Инвалидният стол няма такъв прах. Някой е ходил пеша през долния проход.',
                icon: 'random/bloodfoodsteps.png',
                x: 140,
                y: 190,
                width: 34,
                height: 34,
                visual: { type: 'image', image: 'random/foodsteps.png' }
            },
            {
                id: 'hidden-walking-cane',
                type: 'evidence',
                title: 'Сгъваем бастун',
                description: 'Зад гардероба има сгъваем бастун, изтъркан от употреба.',
                details: 'Walter не е бил напълно прикован към стола. Той е репетирал ролята си шест години.',
                icon: 'bedroom/clock.png',
                x: 82,
                y: 76,
                width: 30,
                height: 42,
                visual: { type: 'image', image: 'bedroom/clock.png' }
            }
        ]
    },
    eleanorRoom: {
        key: 'EleanorRoomScene',
        title: 'Стаята на Eleanor',
        mapName: 'eleanor-room',
        accentColor: 0xcd9f92,
        intro: 'Тук старостта е декор, а паметта е оръжие. Eleanor забравя само това, което избира.',
        spawnPoint: { x: 392, y: 112 },
        doors: [
            { label: 'Спалнята на Arthur', targetScene: 'BedroomScene', spawnPoint: { x: 88, y: 112 }, x: 36, y: 112, width: 32, height: 96 },
            { label: 'Трапезария', targetScene: 'DiningRoomScene', spawnPoint: { x: 392, y: 112 }, x: 444, y: 112, width: 32, height: 96 }
        ],
        characters: [
            { id: 'eleanor', x: 238, y: 152 }
        ],
        clues: [
            {
                id: 'martha-letter',
                type: 'letter',
                title: 'Писмо 6 - Martha до дъщеря си',
                description: 'В кутията на Eleanor е прибрано писмо на Martha. В него има код 1123.',
                details: '"Снощи чистих кабинета, когато господин Arthur ме извика. Беше пиян. Каза: "Икономът ще умре тази нощ, но аз ще свърша работата с нож." Треперех. Той ме хвана за ръкава - затова има кръв по него. Не моята. Неговата? Не знам. Страх ме е."',
                icon: 'random/note.png',
                x: 126,
                y: 102,
                width: 34,
                height: 38,
                visual: { type: 'image', image: 'random/note.png' }
            },
            {
                id: 'luminol',
                type: 'tool',
                title: 'Луминал',
                description: 'Кутията на бабата се отваря с код 1123. Вътре има малък флакон луминал.',
                details: 'Кодът е в писмото на Martha. Луминалът може да провери старо петно зад портрета на Eleanor.',
                code: '1123',
                icon: 'random/bloodspot3.png',
                x: 332,
                y: 108,
                width: 34,
                height: 34,
                visual: { type: 'image', image: 'office/box.png' }
            },
            {
                id: 'grandmother-blood',
                type: 'evidence',
                title: 'Старо петно зад портрета',
                description: 'Луминалът разкрива изсъхнало петно от кръв на Arthur от детството му.',
                details: 'Петното не е за убийството, но показва, че Eleanor е пазила семейни тайни зад картини много преди тази нощ.',
                lockedText: 'Платното има петно, но без реагент не може да се докаже какво е.',
                requires: ['luminol'],
                icon: 'decor/picture6.png',
                x: 388,
                y: 74,
                width: 34,
                height: 42,
                visual: { type: 'image', image: 'decor/picture6.png' }
            }
        ]
    },
    workshop: {
        key: 'WorkshopScene',
        title: 'Работилница',
        mapName: 'workshop',
        accentColor: 0x7bc2b2,
        intro: 'Работилницата е пълна с части за врати, релси и тайни, които Eddie е мислел за чиста механика.',
        spawnPoint: { x: 88, y: 112 },
        doors: [
            { label: 'Кухня', targetScene: 'KitchenScene', spawnPoint: { x: 392, y: 96 }, x: 36, y: 96, width: 32, height: 96 },
            { label: 'Сутерен', targetScene: 'CellarScene', spawnPoint: { x: 240, y: 72 }, x: 240, y: 36, width: 112, height: 28, requires: ['rusty-key'] }
        ],
        characters: [
            { id: 'eddie', x: 164, y: 152 },
            { id: 'ben', x: 334, y: 154 }
        ],
        clues: [
            {
                id: 'key-fragment',
                type: 'key',
                title: 'Фрагмент от ключ',
                description: 'В кутията с инструменти на Eddie има фрагмент от ключ.',
                details: 'Фрагментът отключва тайното чекмедже в ателието на Eddie, ако знаете и кода 3357.',
                icon: 'office/box.png',
                x: 94,
                y: 188,
                width: 34,
                height: 34,
                visual: { type: 'image', image: 'office/box.png' }
            },
            {
                id: 'tunnel-sketches',
                type: 'map',
                title: 'Скици на релсова система',
                description: 'Скиците описват движещ се стол в стените и механизъм за заключване на резета отвътре.',
                details: 'Eddie е строил нещо, което може да превърне заключена стая в сцена. Той твърди, че не е знаел за убийство.',
                icon: 'random/notebook.png',
                x: 236,
                y: 104,
                width: 36,
                height: 34,
                visual: { type: 'image', image: 'random/notebook.png' }
            },
            {
                id: 'eddie-diary',
                type: 'letter',
                title: 'Писмо 4 - дневникът на Eddie',
                description: 'Тайното чекмедже се отваря с фрагмента и код 3357. Вътре е дневникът на Eddie.',
                details: '"Дядо Walter ми плати 10 хиляди долара за ремонт на стените. Направих ему релси и дистанционно. Не знаех за какво са. Снощи видях кръв по краката му. Той не беше в инвалидния стол. Той вървеше."',
                lockedText: 'Чекмеджето има цифрова брава и счупена ключалка. Трябват кодът 3357 и фрагментът от ключ.',
                code: '3357',
                requires: ['key-fragment'],
                icon: 'random/note.png',
                x: 308,
                y: 100,
                width: 36,
                height: 34,
                visual: { type: 'image', image: 'office/chest.png' }
            },
            {
                id: 'remote-components',
                type: 'device',
                title: 'Части за дистанционно',
                description: 'На масата има корпус, жици и механична схема за заключване на резета.',
                details: 'Системата е направена така, че вратата да изглежда заключена отвътре, дори когато убиецът вече е излязъл през стената.',
                icon: 'random/elevator.png',
                x: 382,
                y: 190,
                width: 34,
                height: 34,
                visual: { type: 'image', image: 'random/elevator.png' }
            }
        ]
    },
    cellar: {
        key: 'CellarScene',
        title: 'Сутерен и тунели',
        mapName: 'cellar',
        accentColor: 0x80a0a7,
        intro: 'Зад бойлера въздухът е студен. Релсите изчезват в стените, а колелата им са по-чисти от пода.',
        spawnPoint: { x: 240, y: 72 },
        doors: [
            { label: 'Кабинетът на Arthur', targetScene: 'OfficeScene', spawnPoint: { x: 240, y: 212 }, x: 240, y: 252, width: 112, height: 28 },
            { label: 'Стаята на Walter', targetScene: 'WalterRoomScene', spawnPoint: { x: 88, y: 112 }, x: 36, y: 112, width: 32, height: 96 },
            { label: 'Работилница', targetScene: 'WorkshopScene', spawnPoint: { x: 240, y: 72 }, x: 240, y: 36, width: 112, height: 28 }
        ],
        clues: [
            {
                id: 'walter-rails',
                type: 'evidence',
                title: 'Релси в стената',
                description: 'Релсите водят от стаята на Walter до камината в кабинета на Arthur.',
                details: 'Това е физическото доказателство, че Walter е могъл да стигне до заключения кабинет, без да използва вратата.',
                icon: 'random/elevator.png',
                x: 214,
                y: 128,
                width: 40,
                height: 30,
                visual: { type: 'image', image: 'random/elevator.png' }
            },
            {
                id: 'remote-control',
                type: 'device',
                title: 'Дистанционно за резетата',
                description: 'В ниша до релсите има дистанционно. То заключва резетата на кабинета отвътре.',
                details: 'С това Walter е напуснал през тунела и е оставил заключена стая след себе си.',
                icon: 'random/door1open.png',
                x: 292,
                y: 128,
                width: 32,
                height: 38,
                visual: { type: 'image', image: 'random/door1open.png' }
            },
            {
                id: 'dna-report',
                type: 'evidence',
                title: 'ДНК и алкохолна проба на Sam',
                description: 'Sam е имал над 2.5 промила алкохол и няма прясна кръв по дрехите.',
                details: 'Той е искал Arthur мъртъв, но в тази нощ не е бил способен на прецизен удар и няма следи по оръжието.',
                icon: 'random/bloodspot.png',
                x: 356,
                y: 190,
                width: 36,
                height: 32,
                visual: { type: 'image', image: 'random/bloodspot.png' }
            },
            {
                id: 'clock-repair',
                type: 'alibi',
                title: 'Разглобен часовник на Ben',
                description: 'В източното крило има разглобен часовник с пресни следи от масло.',
                details: 'Ben няма свидетел, но материалната следа подкрепя разказа му по-добре от празно алиби.',
                icon: 'decor/clock.png',
                x: 108,
                y: 190,
                width: 30,
                height: 38,
                visual: { type: 'image', image: 'decor/clock.png' }
            }
        ]
    }
}

export const TOTAL_CLUES = Object.values(roomConfigs)
    .reduce((sum, room) => sum + room.clues.length, 0)
