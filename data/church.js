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
                            type: "text"
                        }
                    ]
                },

                truth: {
                    name: "Палата Истины",
                    description: "Здесь будет описание Палаты Истины.",
                    topics: [
                        {
                            name: "Судебная система",
                            type: "text"
                        },
                        {
                            name: "Законодательство",
                            type: "text"
                        },
                        {
                            name: "Инквизиция",
                            type: "text"
                        }
                    ]
                }
            }
        },

        gold: {
            name: "Золотая ветвь",
            description: "Описание пока не добавлено.",
            chambers: {
                mercy: {
                    name: "Палата Милосердия",
                    description: "Описание пока не добавлено.",
                    topics: []
                },
                good: {
                    name: "Палата Блага",
                    description: "Описание пока не добавлено.",
                    topics: []
                },
                vocation: {
                    name: "Палата Призвания",
                    description: "Описание пока не добавлено.",
                    topics: []
                },
                abundance: {
                    name: "Палата Изобилия",
                    description: "Описание пока не добавлено.",
                    topics: []
                }
            }
        },

        azure: {
            name: "Лазурная ветвь",
            description: "Описание пока не добавлено.",
            chambers: {
                enlightenment: {
                    name: "Палата Просвещения",
                    description: "Описание пока не добавлено.",
                    topics: []
                },
                piety: {
                    name: "Палата Благочестия",
                    description: "Описание пока не добавлено.",
                    topics: []
                },
                truth: {
                    name: "Палата Истины",
                    description: "Описание пока не добавлено.",
                    topics: []
                }
            }
        }
    }
};