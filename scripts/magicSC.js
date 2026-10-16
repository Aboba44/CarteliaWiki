function renderMagicFoundations() {
    const content = document.getElementById("magic-foundations");

    if (!content) return;

    content.innerHTML = `
        <h2>Основные темы</h2>
        ${renderWikiCards(magic.foundations, topic => `
            <button class="wiki-card"
                    onclick="showMagicFoundation('${topic.id}')">
                <h2>${topic.title}</h2>
                <p>${topic.description}</p>
            </button>
        `)}
    `;
}

function renderMagicTypes() {
    const content = document.getElementById("magic-types");

    if (!content) return;

    content.innerHTML = `
        <h2>Виды магии</h2>
        ${renderWikiCards(Object.entries(magic.types), ([id, type]) => `
            <button class="wiki-card"
                    onclick="showMagicType('${id}')">
                <h2>${type.name}</h2>
                <p>${type.summary}</p>
            </button>
        `)}
    `;
}


function showMagic() {
    showSection("magic", true);
    renderMagicFoundations();
    renderMagicTypes();
    document.getElementById("magic-foundation-info")?.replaceChildren();
    document.getElementById("magic-type-info")?.replaceChildren();
}

function showMagicFoundation(topicId, syncRoute = true) {
    const topic = magic.foundations.find(item => item.id === topicId);
    const info = document.getElementById("magic-foundation-info");

    if (!topic || !info) return;

    if (syncRoute) setWikiRoute(`#magic/foundation/${encodeURIComponent(topicId)}`);
    setBreadcrumbs([
        { label: "Магия", route: "#magic" },
        { label: "Основные темы", route: "#magic" },
        { label: topic.title }
    ]);
    document.getElementById("magic-type-info")?.replaceChildren();
    info.innerHTML = `
        <h2>${topic.title}</h2>
        <p>${topic.description}</p>
    `;
}

function showMagicType(typeId, syncRoute = true) {
    const type = magic.types[typeId];
    const info = document.getElementById("magic-type-info");

    if (!type || !info) return;

    if (syncRoute) setWikiRoute(`#magic/type/${encodeURIComponent(typeId)}`);
    setBreadcrumbs([
        { label: "Магия", route: "#magic" },
        { label: "Виды магии", route: "#magic" },
        { label: type.name }
    ]);
    document.getElementById("magic-foundation-info")?.replaceChildren();
    info.innerHTML = `
        <h2>${type.name}</h2>
        <p>${type.description}</p>
    `;
}
