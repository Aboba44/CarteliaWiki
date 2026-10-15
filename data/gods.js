const heraldDefinition = "Описание пока не добавлено.";

const godPantheons = {
    indigenous: {
        name: "Исконные",
        categories: {
            senior: {
                name: "Старшие боги",
                label: "Старший бог",
                definition: "Старшие боги Картелии отвечают за фундаментальные и абсолютные концепции, на которых держится устройство Картелии и прилегающих к ней миров. Из этого следует что они способны менять реальность в своих владениях как им хочется. На самом деле даже один бог сможет самостоятельно создать целый мир, вместе с существами, законами и т.д. Объединяются они лишь потому, что так легче простивостоять Этофиру. Так и сделали Маркарт, Гарлас и Зиркиф. Все старшие боги и подобные им - целиком и полностью создания Этофира. Которых тот создал для собственного кормления. Старшие боги не единственные в своём роде. Их тысячи, и каждый из них создаёт себе владения из нескольких миров; или из одного. Некоторые не противостоят жатве, другие сопротивляются. Картелия - лишь одна их тысяч творений детей Этофира. Старшие боги сумели добиться того, что Картелия стоит куда больше установленого Этофиром срока. Но чем больше Картелия стоит, тем более лакомой она становится для Этофира."
            },
            junior: {
                name: "Младшие боги",
                label: "Младший бог",
                definition: "Младшие боги Картелии созданы старшими и отвечают за неизбежные коцепции в рамках одного мира. В мире Картелии это Жизнь, Смерть и Душа. Созданы для круговорота души и поддержания барьера защищающего Картелию от Этофира. Младшие могут перестраивать реальность, но только в пределах своих владений (Со-гат, До-гат, Ро-гат) "
            },
            demigod: {
                name: "Полубоги",
                label: "Полубог",
                definition: "Полубоги это сильнейшние существа в мире смертных. Младшие и Старшие боги имеют свои миры, в то время как полубоги существуют только в мире смертных и не способны его покинуть. Способны влиять на реальноть, но не могут полностью её манирулировать. Полубоги принадлежать либо Ибелю, либо Китилю. Все, кроме Кекета."
            },
            heraldKitil: {
                name: "Вестники Китиля",
                label: "Вестник Китиля",
                definition: heraldDefinition
            },
            heraldIbel: {
                name: "Вестники Ибеля",
                label: "Вестник Ибеля",
                definition: heraldDefinition
            },
            heraldAlimesa: {
                name: "Вестники Алимесы",
                label: "Вестник Алимесы",
                definition: heraldDefinition
            }
        }
    },
    foreign: {
        name: "Чужеродные",
        categories: {
            equalsSeniors: {
                name: "Созданные Этофиром",
                label: "Созданный Этофиром",
                definition: ""
            },
            createdByFaceless: {
                name: "Созданные Безликим",
                label: "Созданный Безликим",
                definition: ""
            },
            createdByAvelmar: {
                name: "Созданные Авельмаром",
                label: "Созданный Авельмаром",
                definition: ""
            }
        }
    }
};

const gods = {

    markart: {
        name: "Маркарт",
        title: "Бог материи",
        pantheon: "indigenous",
        category: "senior",
        image: "images/gods/markart.jpg",
        description: "Здесь будет подробное описание Маркарта."
    },

    zirkif: {
        name: "Зиркиф",
        title: "Бог времени",
        pantheon: "indigenous",
        category: "senior",
        image: "images/gods/zirkif.jpg",
        description: "Здесь будет подробное описание Зиркифа."
    },

    garlas: {
        name: "Гарлас",
        title: "Бог пространства",
        pantheon: "indigenous",
        category: "senior",
        image: "images/gods/garlas.jpg",
        description: "Здесь будет подробное описание Гарласа."
    },

    alimesa: {
        name: "Алимеса",
        title: "Богиня души",
        pantheon: "indigenous",
        category: "junior",
        image: "images/gods/alimesa.jpg",
        description: "Здесь будет подробное описание Алимесы."
    },

    kitil: {
        name: "Китиль",
        title: "Бог смерти",
        pantheon: "indigenous",
        category: "junior",
        image: "images/gods/kitil.jpg",
        description: "Здесь будет подробное описание Китиля."
    },

    ibel: {
        name: "Ибель",
        title: "Бог жизни",
        pantheon: "indigenous",
        category: "junior",
        description: "Здесь будет подробное описание Ибеля."
    },

    keket: {
        name: "Кекет",
        title: "Праотец демонов",
        pantheon: "indigenous",
        category: "demigod",
        image: "images/gods/keket.jpg",
        description: "Праотец демонов."
    },

    alimarkh: {
        name: "Алимарх",
        pantheon: "indigenous",
        category: "demigod",
        description: "Пророк Иаланизма."
    },

    khrait: {
        name: "Храит",
        title: "Древо смерти",
        pantheon: "indigenous",
        category: "demigod",
        description: "Древо смерти."
    },

    mothersOfFellenim: {
        name: "Нэлиаресана, Сэрианелара и Рэлариэсана",
        title: "Матери Фелленим",
        pantheon: "indigenous",
        category: "demigod",
        description: "Матери Фелленим."
    },

    maidenOfSacrifice: {
        name: "Дева жертвы",
        pantheon: "indigenous",
        category: "heraldKitil",
        description: "Милосердие Китиля."
    },

    sekhem: {
        name: "Секхем",
        pantheon: "indigenous",
        category: "heraldKitil",
        description: "Палач Китиля."
    },

    narberal: {
        name: "Нарберал",
        pantheon: "indigenous",
        category: "heraldKitil",
        description: "Судья Китиля."
    },

    heraldIbel1: {
        name: "Вестник 1",
        pantheon: "indigenous",
        category: "heraldIbel"
    },

    heraldIbel2: {
        name: "Вестник 2",
        pantheon: "indigenous",
        category: "heraldIbel"
    },

    heraldAlimesa1: {
        name: "Вестник 1",
        pantheon: "indigenous",
        category: "heraldAlimesa"
    },

    heraldAlimesa2: {
        name: "Вестник 2",
        pantheon: "indigenous",
        category: "heraldAlimesa"
    },

    faceless: {
        name: "Безликий",
        title: "Бог бездны",
        pantheon: "foreign",
        category: "equalsSeniors",
        description: "Описание пока не добавлено."
    },

    avelmar: {
        name: "Авельмар",
        title: "Бог звёзд",
        pantheon: "foreign",
        category: "equalsSeniors",
        description: "Описание пока не добавлено."
    },

    yahweh: {
        name: "Яхве",
        title: "Бог плоти",
        pantheon: "foreign",
        category: "createdByFaceless",
        description: "Описание пока не добавлено."
    },

    ferncat: {
        name: "Фернкат",
        title: "Бог апокалипсиса",
        pantheon: "foreign",
        category: "createdByFaceless",
        description: "Описание пока не добавлено."
    },

    frida: {
        name: "Фрида",
        title: "Богиня судьбы",
        pantheon: "foreign",
        category: "createdByAvelmar",
        description: "Описание пока не добавлено."
    },

    saretAndZaret: {
        name: "Сарет и Зарет",
        title: "Боги исполнения",
        pantheon: "foreign",
        category: "createdByAvelmar",
        description: "Описание пока не добавлено."
    },

    ethophir: {
        name: "Этофир",
        pantheon: "foreign",
        standalone: true,
        image: "",
        imagePlaceholder: "Изображение пока не добавлено.",
        description: ""
    }

};
