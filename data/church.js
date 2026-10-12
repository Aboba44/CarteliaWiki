const church = {
    branches: {
        silver: {
            name: "Серебряная ветвь",
            description: "Ветвь доблести, истины и упокоения.",

            chambers: {
                rest: {
                    name: "Палаты Упокоения",
                    description: "Здесь будет описание Палат Упокоения.",
                    topics: []
                },

                valor: {
                    name: "Палата Доблести",
                    description: "Здесь будет описание Палаты Доблести.",
                    topics: [
                        {
                            name: "Святые ордена",
                            type: "orders"
                        },
                        {
                            name: "Регулярная армия",
                            type: "text",
                            readingMode: true
                        }
                    ]
                },

                truth: {
                    name: "Палата Истины",
                    description: "Здесь будет описание Палаты Истины.",
                    topics: [
                        {
                            name: "Судебная система",
                            type: "text",
                            readingMode: true
                        },
                        {
                            name: "Законодательство",
                            type: "text",
                            readingMode: true
                        },
                        {
                            name: "Инквизиция",
                            type: "text",
                            readingMode: true
                        }
                    ]
                }
            }
        },

        gold: {
            name: "Золотая ветвь",
            description: "Здесь будет описание Золотой ветви.",
            chambers: {}
        },

        azure: {
            name: "Лазурная ветвь",
            description: "Здесь будет описание Лазурной ветви.",
            chambers: {}
        }
    }
};