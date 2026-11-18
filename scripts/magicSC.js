// Списки основ и видов магии и страницы выбранной записи.
// Всё содержимое раздела рисуется в #magic-content и использует общий каркас wiki-page.

function renderMagic() {
    const content = document.getElementById("magic-content");

    if (!content) return;

    setBreadcrumbs([{ label: "Магия" }]);

    const foundationCards = renderWikiCards(magic.foundations, topic => `
        <button class="wiki-card" type="button" onclick="showMagicFoundation('${topic.id}')">
            <span class="wiki-card-meta">Основа</span>
            <h2>${escapeHtml(topic.title)}</h2>
            ${topic.description && !isPlaceholderText(topic.description)
                ? `<p>${escapeHtml(topic.description)}</p>`
                : ""}
        </button>
    `);

    const typeCards = renderWikiCards(Object.entries(magic.types), ([id, type]) => `
        <button class="wiki-card" type="button" onclick="showMagicType('${id}')">
            <span class="wiki-card-meta">Вид магии</span>
            <h2>${escapeHtml(type.name)}</h2>
            ${type.summary && !isPlaceholderText(type.summary)
                ? `<p>${escapeHtml(type.summary)}</p>`
                : ""}
        </button>
    `);

    content.innerHTML = renderWikiPage(
        "Мир Картелии",
        "Магия",
        magic.intro.lead,
        `<div class="wiki-intro">
            ${magic.intro.paragraphs.map(paragraph => `<p>${escapeHtml(paragraph)}</p>`).join("")}
        </div>
        ${renderWikiSection("Основные темы", foundationCards)}
        ${renderWikiSection("Виды магии", typeCards)}`
    );
}

function showMagic() {
    showSection("magic", true);
    renderMagic();
}

function showMagicFoundation(topicId, syncRoute = true) {
    const content = document.getElementById("magic-content");
    const topic = magic.foundations.find(item => item.id === topicId);

    if (!content || !topic) return;

    if (syncRoute) setWikiRoute(`#magic/foundation/${encodeURIComponent(topicId)}`);
    setBreadcrumbs([
        { label: "Магия", route: "#magic" },
        { label: "Основные темы", route: "#magic" },
        { label: topic.title }
    ]);

    const hasDescription = topic.description && !isPlaceholderText(topic.description);

    content.innerHTML = renderWikiPage(
        "Магия · Основные темы",
        topic.title,
        hasDescription ? topic.description : "",
        hasDescription ? "" : `<p class="page-empty">Описание пока не добавлено.</p>`
    );
}

function renderMagicTypeBody(type) {
    const parts = [];
    const listSections = [
        ["traits", "Особенности"],
        ["principles", "Принципы"],
        ["applications", "Применение"],
        ["limitations", "Ограничения"]
    ];

    if (type.description && !isPlaceholderText(type.description)) {
        parts.push(`<p>${escapeHtml(type.description)}</p>`);
    }

    if (type.focus && !isPlaceholderText(type.focus)) {
        parts.push(`<p><strong>Направление:</strong> ${escapeHtml(type.focus)}</p>`);
    }

    listSections.forEach(function ([key, title]) {
        const values = (type[key] || []).filter(value => !isPlaceholderText(value));

        if (!values.length) return;

        parts.push(`<h2>${title}</h2>
            <ul>${values.map(value => `<li>${escapeHtml(value)}</li>`).join("")}</ul>`);
    });

    return parts.join("");
}

function showMagicType(typeId, syncRoute = true) {
    const content = document.getElementById("magic-content");
    const type = magic.types[typeId];

    if (!content || !type) return;

    if (syncRoute) setWikiRoute(`#magic/type/${encodeURIComponent(typeId)}`);
    setBreadcrumbs([
        { label: "Магия", route: "#magic" },
        { label: "Виды магии", route: "#magic" },
        { label: type.name }
    ]);

    const body = renderMagicTypeBody(type);

    content.innerHTML = renderWikiPage(
        "Магия · Виды магии",
        type.name,
        type.summary,
        body
            ? `<div class="wiki-article">${body}</div>`
            : `<p class="page-empty">Описание пока не добавлено.</p>`
    );
}
