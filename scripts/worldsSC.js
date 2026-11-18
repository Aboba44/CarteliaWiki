// Рендер списка миров и измерений, а также страницы выбранной записи.
// Всё содержимое раздела рисуется в #worlds-content и использует общий каркас wiki-page.

function renderWorlds() {
    const content = document.getElementById("worlds-content");

    if (!content) return;

    setBreadcrumbs([{ label: "Миры" }]);

    const dimensionCards = renderWikiCards(Object.entries(dimensions), ([id, dimension]) => `
        <button class="wiki-card" type="button" onclick="showDimension('${id}')">
            <span class="wiki-card-meta">Измерение</span>
            <h2>${escapeHtml(dimension.name)}</h2>
            ${dimension.summary && !isPlaceholderText(dimension.summary)
                ? `<p>${escapeHtml(dimension.summary)}</p>`
                : ""}
        </button>
    `);

    const worldCards = renderWikiCards(Object.entries(worlds), ([id, world]) => `
        <button class="wiki-card" type="button" onclick="showWorld('${id}')">
            <span class="wiki-card-meta">Мир</span>
            <h2>${escapeHtml(world.name)}</h2>
            ${world.description && !isPlaceholderText(world.description)
                ? `<p>${escapeHtml(world.description)}</p>`
                : ""}
        </button>
    `);

    content.innerHTML = renderWikiPage(
        "Мир Картелии",
        "Миры",
        "Выберите мир или измерение, чтобы открыть подробности.",
        `${renderWikiSection("Измерения", dimensionCards)}
        ${renderWikiSection("Миры", worldCards)}`
    );
}

function showWorlds() {
    showSection("worlds", true);
    renderWorlds();
}

function showWorld(worldId, syncRoute = true) {
    const content = document.getElementById("worlds-content");
    const world = worlds[worldId];

    if (!content || !world) return;

    if (syncRoute) setWikiRoute(`#worlds/world/${encodeURIComponent(worldId)}`);
    setBreadcrumbs([
        { label: "Миры", route: "#worlds" },
        { label: world.name }
    ]);

    const hasDescription = world.description && !isPlaceholderText(world.description);

    content.innerHTML = renderWikiPage(
        "Миры",
        world.name,
        hasDescription ? world.description : "",
        hasDescription ? "" : `<p class="page-empty">Описание пока не добавлено.</p>`
    );
}

function showDimension(dimensionId, syncRoute = true) {
    const content = document.getElementById("worlds-content");
    const dimension = dimensions[dimensionId];

    if (!content || !dimension) return;

    if (syncRoute) setWikiRoute(`#worlds/dimension/${encodeURIComponent(dimensionId)}`);
    setBreadcrumbs([
        { label: "Миры", route: "#worlds" },
        { label: "Измерения", route: "#worlds" },
        { label: dimension.name }
    ]);

    const notes = (dimension.notes || []).filter(note => !isPlaceholderText(note));
    const hasDescription = dimension.description && !isPlaceholderText(dimension.description);
    const bodyParts = [];

    if (hasDescription) {
        bodyParts.push(`<p>${escapeHtml(dimension.description)}</p>`);
    }

    if (notes.length) {
        bodyParts.push(`<ul>${notes.map(note => `<li>${escapeHtml(note)}</li>`).join("")}</ul>`);
    }

    content.innerHTML = renderWikiPage(
        "Миры · Измерения",
        dimension.name,
        dimension.summary,
        bodyParts.length
            ? `<div class="wiki-article">${bodyParts.join("")}</div>`
            : (isPlaceholderText(dimension.summary) ? `<p class="page-empty">Описание пока не добавлено.</p>` : "")
    );
}
