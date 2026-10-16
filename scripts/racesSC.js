/* =========================
   ПРИНАДЛЕЖНОСТЬ
   ========================= */

function renderBelongingRoot() {
    const info = document.getElementById("belonging-info");

    if (!info) return;

    info.replaceChildren();
    setBreadcrumbs([
        { label: "Расы", route: "#races" },
        { label: "Принадлежность" }
    ]);
}

function showBelonging(belongingId, syncRoute = true) {
    const info = document.getElementById("belonging-info");
    const belonging = raceBelongings[belongingId];

    if (!info || !belonging) return;

    if (syncRoute) setWikiRoute(`#belonging/${belongingId}`);
    setBreadcrumbs([
        { label: "Расы", route: "#races" },
        { label: "Принадлежность", route: "#belonging" },
        { label: belonging.name }
    ]);

    const categoryButtons = Object.entries(belonging.categories).map(([id, category]) => `
        <button
            class="creature-category-button"
            onclick="showCreatureCategory('${belongingId}', '${id}')"
        >
            ${category.name}
        </button>
    `).join("");

    info.innerHTML = `
        <h2>${belonging.name}</h2>
        <p>${belonging.description}</p>

        <div class="creature-category-list">
            ${categoryButtons || "<p>Категории существ пока не определены.</p>"}
        </div>
    `;

}


/* =========================
   КАТЕГОРИИ СУЩЕСТВ
   ========================= */

function showCreatureCategory(belongingId, categoryId, syncRoute = true) {
    const info = document.getElementById("belonging-info");
    const belonging = raceBelongings[belongingId];
    const category = belonging && belonging.categories[categoryId];

    if (!info || !belonging || !category) return;

    if (syncRoute) setWikiRoute(`#belonging/${belongingId}/${categoryId}`);
    setBreadcrumbs([
        { label: "Расы", route: "#races" },
        { label: "Принадлежность", route: "#belonging" },
        { label: belonging.name, route: `#belonging/${belongingId}` },
        { label: category.name }
    ]);

    const raceButtons = (category.races || []).map((raceId) => {
        const race = races[raceId];

        if (!race) return "";

        return `
            <button
                class="creature-category-button"
                onclick="showRace('${raceId}', '${categoryId}')"
            >
                ${race.name}
            </button>
        `;
    }).join("");

    info.innerHTML = `
        <h2>${belonging.name} — ${category.name}</h2>
        <p>${category.description}</p>

        <div class="creature-category-list">
            ${raceButtons || "<p>Категория пока не проработана.</p>"}
        </div>
    `;

}


/* =========================
   РАСЫ
   ========================= */

function showRace(raceId, categoryId = "sentient", syncRoute = true) {
    const info = document.getElementById("belonging-info");
    const race = races[raceId];

    if (!info || !race) return;

    const belonging = raceBelongings[race.belonging];
    const category = belonging?.categories[categoryId];
    if (!belonging || !category) return;

    if (syncRoute) setWikiRoute(`#belonging/${race.belonging}/${categoryId}/${raceId}`);
    setBreadcrumbs([
        { label: "Расы", route: "#races" },
        { label: "Принадлежность", route: "#belonging" },
        { label: belonging.name, route: `#belonging/${race.belonging}` },
        { label: category.name, route: `#belonging/${race.belonging}/${categoryId}` },
        { label: race.name }
    ]);

    info.innerHTML = `
        <h2>${race.name}</h2>
        <p>${race.description}</p>
        ${race.notes ? `<p>${race.notes}</p>` : ""}
    `;

}


/* =========================
   ПЕРЕКЛЮЧЕНИЕ РАЗДЕЛОВ
   ========================= */
