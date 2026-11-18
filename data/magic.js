// Справочник магии: цепочка основ, школы и пути к Markdown-статьям.
// Тексты статей лежат в data/articles/magic/ и подключаются через contentFile.
const magic = {
    intro: {
        lead: "Магия в мире Картелии — это не просто сила, а способ взаимодействия с самой структурой мира.",
        paragraphs: [
            "Здесь будут описаны источники магии, её ограничения, виды заклинаний, ритуалы и влияние на общество.",
            "В дальнейшем этот раздел станет полноценной системой, где каждая школа магии будет иметь свои правила, цену и последствия."
        ]
    },

    foundations: [
        {
            id: "primordial-mana",
            title: "Первородная энергия",
            parent: null,
            summary: "",
            description: "Определение ещё не добавлено.",
            contentFile: "data/articles/magic/foundations/primordial-energy.md"
        },
        {
            id: "simplified-mana",
            title: "Духовная энергия",
            parent: "primordial-mana",
            summary: "",
            description: "Определение ещё не добавлено."
        },
        {
            id: "soul",
            title: "Душа",
            parent: "simplified-mana",
            summary: "",
            description: "Определение ещё не добавлено."
        },
        {
            id: "soul-structure",
            title: "Структура души",
            parent: "soul",
            summary: "",
            description: "Определение ещё не добавлено."
        },
        {
            id: "soul-properties",
            title: "Свойства души",
            parent: "soul-structure",
            summary: "",
            description: "Определение ещё не добавлено."
        },
        {
            id: "techniques",
            title: "Духовные техники",
            parent: "soul-properties",
            summary: "",
            description: "Описание пока не добавлено."
        }
    ],

    types: {
        elemental: {
            name: "Элементальная",
            summary: "Описание пока не добавлено.",
            description: "Описание пока не добавлено.",
            focus: "Описание пока не добавлено.",
            sigil: "circle",
            contentFile: "",
            traits: ["Описание пока не добавлено."],
            principles: ["Описание пока не добавлено."],
            applications: ["Описание пока не добавлено."],
            limitations: ["Описание пока не добавлено."]
        },
        runic: {
            name: "Руническая",
            summary: "Описание пока не добавлено.",
            description: "Описание пока не добавлено.",
            focus: "Описание пока не добавлено.",
            sigil: "triangle",
            contentFile: "",
            traits: ["Описание пока не добавлено."],
            principles: ["Описание пока не добавлено."],
            applications: ["Описание пока не добавлено."],
            limitations: ["Описание пока не добавлено."]
        },
        fundamental: {
            name: "Фундаментальная",
            summary: "Описание пока не добавлено.",
            description: "Описание пока не добавлено.",
            focus: "Описание пока не добавлено.",
            sigil: "diamond",
            contentFile: "",
            traits: ["Описание пока не добавлено."],
            principles: ["Описание пока не добавлено."],
            applications: ["Описание пока не добавлено."],
            limitations: ["Описание пока не добавлено."]
        },
        demonic: {
            name: "Демоническая",
            summary: "Описание пока не добавлено.",
            description: "Описание пока не добавлено.",
            focus: "Описание пока не добавлено.",
            sigil: "hexagon",
            contentFile: "",
            traits: ["Описание пока не добавлено."],
            principles: ["Описание пока не добавлено."],
            applications: ["Описание пока не добавлено."],
            limitations: ["Описание пока не добавлено."]
        },
        beast: {
            name: "Звериная",
            summary: "Описание пока не добавлено.",
            description: "Описание пока не добавлено.",
            focus: "Описание пока не добавлено.",
            sigil: "spiral",
            contentFile: "",
            traits: ["Описание пока не добавлено."],
            principles: ["Описание пока не добавлено."],
            applications: ["Описание пока не добавлено."],
            limitations: ["Описание пока не добавлено."]
        }
    }
};
