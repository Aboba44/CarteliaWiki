const churchHierarchyOrderEntries = Object.entries(orders)
    .filter(([, order]) => order.branch === "silver");

const churchHierarchy = {
    rootId: "alimarh",
    nodes: {
        alimarh: {
            title: "Алимарх",
            description: "Возглавляет церковную иерархию.",
            kind: "head",
            children: ["archbishop-silver", "archbishop-gold", "archbishop-azure"]
        },
        "archbishop-silver": {
            title: "Архиепископ Серебряного заката",
            description: "Возглавляет Серебряную ветвь Церкви.",
            kind: "archbishop",
            branchId: "silver",
            children: ["bishop-rest", "bishop-valor", "bishop-truth"]
        },
        "archbishop-gold": {
            title: "Архиепископ Золотого рассвета",
            description: "Возглавляет Золотую ветвь Церкви.",
            kind: "archbishop",
            branchId: "gold",
            children: ["bishop-mercy", "bishop-good", "bishop-vocation", "bishop-abundance"]
        },
        "archbishop-azure": {
            title: "Архиепископ Лазурных небес",
            description: "Возглавляет Лазурную ветвь Церкви.",
            kind: "archbishop",
            branchId: "azure",
            children: ["bishop-enlightenment", "bishop-piety", "bishop-ideal"]
        },
        "bishop-rest": {
            description: "Руководит Палатой Упокоения.",
            kind: "bishop",
            branchId: "silver",
            chamberId: "rest",
            children: []
        },
        "bishop-valor": {
            description: "Руководит Палатой Доблести.",
            kind: "bishop",
            branchId: "silver",
            chamberId: "valor",
            children: [
                "supreme-commander",
                ...churchHierarchyOrderEntries.map(([orderId]) => `magister-${orderId}`)
            ]
        },
        "supreme-commander": {
            title: "Верховный воевода",
            description: "Подчиняется епископу Доблести.",
            kind: "commander",
            branchId: "silver",
            children: []
        },
        "bishop-truth": {
            description: "Руководит Палатой Истины.",
            kind: "bishop",
            branchId: "silver",
            chamberId: "truth",
            children: ["supreme-inquisitor", "supreme-judge"]
        },
        "supreme-inquisitor": {
            title: "Верховный Инквизитор",
            description: "Подчиняется епископу Истины.",
            kind: "inquisitor",
            branchId: "silver",
            organizationId: "inquisition",
            children: ["high-inquisitor"]
        },
        "high-inquisitor": {
            title: "Высший Инквизитор",
            description: "Подчиняется Верховному Инквизитору.",
            kind: "inquisitor",
            branchId: "silver",
            organizationId: "inquisition",
            children: ["senior-inquisitor"]
        },
        "senior-inquisitor": {
            title: "Старший Инквизитор",
            description: "Подчиняется Высшему Инквизитору.",
            kind: "inquisitor",
            branchId: "silver",
            organizationId: "inquisition",
            children: ["inquisitor"]
        },
        inquisitor: {
            title: "Инквизитор",
            description: "Подчиняется Старшему Инквизитору.",
            kind: "inquisitor",
            branchId: "silver",
            organizationId: "inquisition",
            children: ["junior-inquisitor"]
        },
        "junior-inquisitor": {
            title: "Младший Инквизитор",
            description: "Подчиняется Инквизитору.",
            kind: "inquisitor",
            branchId: "silver",
            organizationId: "inquisition",
            children: []
        },
        "supreme-judge": {
            title: "Верховный Судья",
            description: "Подчиняется епископу Истины.",
            kind: "judge",
            branchId: "silver",
            children: []
        },
        "bishop-mercy": {
            description: "Руководит Палатой Милосердия.",
            kind: "bishop",
            branchId: "gold",
            chamberId: "mercy",
            children: []
        },
        "bishop-good": {
            description: "Руководит Палатой Блага.",
            kind: "bishop",
            branchId: "gold",
            chamberId: "good",
            children: []
        },
        "bishop-vocation": {
            description: "Руководит Палатой Призвания.",
            kind: "bishop",
            branchId: "gold",
            chamberId: "vocation",
            children: []
        },
        "bishop-abundance": {
            description: "Руководит Палатой Изобилия.",
            kind: "bishop",
            branchId: "gold",
            chamberId: "abundance",
            children: []
        },
        "bishop-enlightenment": {
            description: "Руководит Палатой Просвещения.",
            kind: "bishop",
            branchId: "azure",
            chamberId: "enlightenment",
            children: []
        },
        "bishop-piety": {
            description: "Руководит Палатой Благочестия.",
            kind: "bishop",
            branchId: "azure",
            chamberId: "piety",
            children: []
        },
        "bishop-ideal": {
            description: "Руководит Палатой Идеала.",
            kind: "bishop",
            branchId: "azure",
            chamberId: "truth",
            children: []
        },
        ...Object.fromEntries(churchHierarchyOrderEntries.map(([orderId]) => [
            `magister-${orderId}`,
            {
                orderId,
                organizationId: "orders",
                description: "Описание пока не добавлено.",
                kind: "magister",
                branchId: "silver",
                children: []
            }
        ]))
    },
    organizations: {
        orders: {
            name: "Святые ордена",
            kind: "orders"
        },
        inquisition: {
            name: "Инквизиция",
            kind: "inquisition"
        }
    }
};
