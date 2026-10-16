function renderWorlds() {
    const content = document.getElementById("worlds-content");

    if (!content) return;

    content.innerHTML = `
        <h1>Миры</h1>
        <p>Выберите мир или измерение, чтобы открыть подробности.</p>

        <h2>Измерения</h2>
        ${renderWikiCards(Object.entries(dimensions), ([id, dimension]) => `
            <button class="wiki-card"
                    onclick="showDimension('${id}')">
                <h2>${dimension.name}</h2>
                <p>${dimension.summary}</p>
            </button>
        `)}

        <h2>Миры</h2>
        ${renderWikiCards(Object.entries(worlds), ([id, world]) => `
            <button class="wiki-card"
                    onclick="showWorld('${id}')">
                <h2>${world.name}</h2>
                <p>${world.description}</p>
            </button>
        `)}
    `;
}

function showWorlds() {
    showSection("worlds", true);
    renderWorlds();
    const info = document.getElementById("worlds-info");

    if (info) {
        info.innerHTML = "";
    }
}

function showWorld(worldId, syncRoute = true) {
    const world = worlds[worldId];
    const info = document.getElementById("worlds-info");

    if (!world || !info) return;

    if (syncRoute) setWikiRoute(`#worlds/world/${encodeURIComponent(worldId)}`);
    setBreadcrumbs([
        { label: "Миры", route: "#worlds" },
        { label: world.name }
    ]);
    info.innerHTML = `
        <h2>${world.name}</h2>
        <p>${world.description}</p>
    `;
}

function showDimension(dimensionId, syncRoute = true) {
    const dimension = dimensions[dimensionId];
    const info = document.getElementById("worlds-info");

    if (!dimension || !info) return;

    if (syncRoute) setWikiRoute(`#worlds/dimension/${encodeURIComponent(dimensionId)}`);
    setBreadcrumbs([
        { label: "Миры", route: "#worlds" },
        { label: "Измерения", route: "#worlds" },
        { label: dimension.name }
    ]);
    info.innerHTML = `
        <h2>${dimension.name}</h2>
        <p>${dimension.description}</p>
        <p>${dimension.summary}</p>
        <ul>
            ${dimension.notes.map(note => `<li>${note}</li>`).join("") || "<li>Описание пока не добавлено.</li>"}
        </ul>
    `;
}
