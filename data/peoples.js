// Народы — отдельная система, не смешанная с классификацией рас.
// Раса ссылается на свою группу народов через поле peoples в data/races.js.
// Новый народ добавляется записью "id": { name: "...", description: "..." }
// в entries нужной категории.
const peoples = {
    human: {
        name: "Народы людей",
        description: "Описание пока не добавлено.",
        categories: {
            numerous: {
                name: "Многочисленные",
                description: "Описание пока не добавлено.",
                entries: {}
            },
            small: {
                name: "Малочисленные",
                description: "Описание пока не добавлено.",
                entries: {}
            }
        }
    }
};
