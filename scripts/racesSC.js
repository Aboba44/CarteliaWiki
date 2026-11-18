// Навигация по принадлежностям и категориям существ до страницы выбранной расы.
// Ссылка на народы расы ведёт в отдельную систему peoples (scripts/peoplesSC.js).
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

function showRaces() {
    // Возвращает раздел «Расы» к списку принадлежностей, даже если открыта раса.
    showSection("belonging", true);
    renderBelongingRoot();
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
            type="button"
            onclick="showCreatureCategory('${belongingId}', '${id}')"
        >
            ${escapeHtml(category.name)}
        </button>
    `).join("");

    info.innerHTML = `
        <h2>${escapeHtml(belonging.name)}</h2>
        <p>${escapeHtml(belonging.description)}</p>

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
                type="button"
                onclick="showRace('${raceId}', '${categoryId}')"
            >
                ${escapeHtml(race.name)}
            </button>
        `;
    }).join("");

    info.innerHTML = `
        <h2>${escapeHtml(belonging.name)} — ${escapeHtml(category.name)}</h2>
        <p>${escapeHtml(category.description)}</p>

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

    const peopleGroup = race.peoples ? peoples[race.peoples] : null;

    info.innerHTML = `
        <h2>${escapeHtml(race.name)}</h2>
        <p>${escapeHtml(race.description)}</p>
        ${race.notes ? `<p>${escapeHtml(race.notes)}</p>` : ""}
        ${peopleGroup ? `
            <section class="race-peoples">
                <h3>Народы</h3>
                <div class="wiki-cards">
                    <button
                        class="wiki-card"
                        type="button"
                        onclick="showPeoples('${raceId}', '${categoryId}')"
                    >
                        <h3>${escapeHtml(peopleGroup.name)}</h3>
                        ${peopleGroup.description ? `<p>${escapeHtml(peopleGroup.description)}</p>` : ""}
                    </button>
                </div>
            </section>
        ` : ""}
    `;

}


/* =========================
   ПЕРЕКЛЮЧЕНИЕ РАЗДЕЛОВ
   ========================= */
