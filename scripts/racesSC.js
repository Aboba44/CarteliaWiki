// Раздел «Расы»: принадлежности → категории → расы → народы.
// Все страницы рисуются в #races-content и используют общий каркас page-header.
// Ссылка на народы расы ведёт в отдельную систему peoples (scripts/peoplesSC.js).
/* =========================
   ПРИНАДЛЕЖНОСТЬ
   ========================= */

function getRacesContainer() {
    return document.getElementById("races-content");
}

function countBelongingRaces(belonging) {
    const raceIds = new Set();

    Object.values(belonging.categories || {}).forEach(function (category) {
        (category.races || []).forEach(function (raceId) {
            raceIds.add(raceId);
        });
    });

    return raceIds.size;
}

function renderBelongingCard(belongingId, belonging) {
    const categoriesCount = Object.keys(belonging.categories || {}).length;
    const racesCount = countBelongingRaces(belonging);
    const monogram = Array.from(belonging.name.trim())[0]?.toUpperCase() || "?";
    const meta = categoriesCount
        ? [
            `${categoriesCount} ${pluralizeRu(categoriesCount, "категория", "категории", "категорий")}`,
            `${racesCount} ${pluralizeRu(racesCount, "раса", "расы", "рас")}`
        ].join(" · ")
        : "Категории пока не добавлены";

    return `
        <button
            class="wiki-card races-belonging-card races-belonging-card--${belongingId}"
            type="button"
            onclick="showBelonging('${belongingId}')"
        >
            <span class="races-belonging-emblem" aria-hidden="true">
                <span class="races-belonging-monogram">${escapeHtml(monogram)}</span>
            </span>
            <span class="races-belonging-name">${escapeHtml(belonging.name)}</span>
            <span class="races-belonging-meta">${meta}</span>
        </button>
    `;
}

function renderBelongingRoot() {
    const container = getRacesContainer();

    if (!container) return;

    setBreadcrumbs([
        { label: "Расы", route: "#races" },
        { label: "Принадлежность" }
    ]);

    container.innerHTML = `
        <article class="races-page">
            ${renderPageHeader(
                "Расы",
                "Принадлежность",
                "Классификация рас по принадлежности к богам. Выберите бога, чтобы увидеть, какие существа ему принадлежат."
            )}
            <div class="wiki-cards races-belongs">
                ${Object.entries(raceBelongings)
                    .map(([id, belonging]) => renderBelongingCard(id, belonging))
                    .join("")}
            </div>
        </article>
    `;
}

function showRaces() {
    // Возвращает раздел «Расы» к списку принадлежностей, даже если открыта раса.
    showSection("belonging", true);
    renderBelongingRoot();
}

function showBelonging(belongingId, syncRoute = true) {
    const container = getRacesContainer();
    const belonging = raceBelongings[belongingId];

    if (!container || !belonging) return;

    if (syncRoute) setWikiRoute(`#belonging/${belongingId}`);
    setBreadcrumbs([
        { label: "Расы", route: "#races" },
        { label: "Принадлежность", route: "#belonging" },
        { label: belonging.name }
    ]);

    const categories = Object.entries(belonging.categories || {});

    container.innerHTML = `
        <article class="races-page">
            ${renderPageHeader("Принадлежность", belonging.name, belonging.description)}
            ${categories.length
                ? `<div class="wiki-cards races-tiles">
                    ${categories.map(([categoryId, category]) =>
                        renderCategoryTile(belongingId, categoryId, category)
                    ).join("")}
                </div>`
                : `<p class="page-empty">Категории существ пока не определены.</p>`
            }
        </article>
    `;
}


/* =========================
   КАТЕГОРИИ СУЩЕСТВ
   ========================= */

function renderCategoryTile(belongingId, categoryId, category) {
    const racesCount = (category.races || []).filter(function (raceId) {
        return Boolean(races[raceId]);
    }).length;
    const meta = racesCount
        ? `${racesCount} ${pluralizeRu(racesCount, "раса", "расы", "рас")}`
        : "Расы пока не добавлены";
    const metaClass = racesCount
        ? "races-tile-meta"
        : "races-tile-meta races-tile-meta--muted";

    return `
        <button
            class="wiki-card races-tile"
            type="button"
            onclick="showCreatureCategory('${belongingId}', '${categoryId}')"
        >
            <span class="races-tile-title">${escapeHtml(category.name)}</span>
            <span class="${metaClass}">${meta}</span>
            ${category.description && !isPlaceholderText(category.description)
                ? `<span class="races-tile-text">${escapeHtml(category.description)}</span>`
                : ""}
        </button>
    `;
}

function showCreatureCategory(belongingId, categoryId, syncRoute = true) {
    const container = getRacesContainer();
    const belonging = raceBelongings[belongingId];
    const category = belonging && belonging.categories[categoryId];

    if (!container || !belonging || !category) return;

    if (syncRoute) setWikiRoute(`#belonging/${belongingId}/${categoryId}`);
    setBreadcrumbs([
        { label: "Расы", route: "#races" },
        { label: "Принадлежность", route: "#belonging" },
        { label: belonging.name, route: `#belonging/${belongingId}` },
        { label: category.name }
    ]);

    const raceEntries = (category.races || [])
        .map(function (raceId) { return [raceId, races[raceId]]; })
        .filter(function ([, race]) { return Boolean(race); });

    container.innerHTML = `
        <article class="races-page">
            ${renderPageHeader(belonging.name, category.name, category.description)}
            ${raceEntries.length
                ? `<div class="wiki-cards races-tiles">
                    ${raceEntries.map(([raceId, race]) =>
                        renderRaceTile(raceId, categoryId, race)
                    ).join("")}
                </div>`
                : `<p class="page-empty">Категория пока не проработана.</p>`
            }
        </article>
    `;
}


/* =========================
   РАСЫ
   ========================= */

function renderRaceTile(raceId, categoryId, race) {
    const hasPeoples = Boolean(race.peoples && peoples[race.peoples]);

    return `
        <button
            class="wiki-card races-tile"
            type="button"
            onclick="showRace('${raceId}', '${categoryId}')"
        >
            <span class="races-tile-title">${escapeHtml(race.name)}</span>
            ${hasPeoples ? `<span class="races-tile-meta">Народы</span>` : ""}
            ${race.description && !isPlaceholderText(race.description)
                ? `<span class="races-tile-text">${escapeHtml(race.description)}</span>`
                : ""}
        </button>
    `;
}

function showRace(raceId, categoryId = "sentient", syncRoute = true) {
    const container = getRacesContainer();
    const race = races[raceId];
    const belonging = raceBelongings[race && race.belonging];
    const category = belonging && belonging.categories[categoryId];

    if (!container || !race || !belonging || !category) return;

    if (syncRoute) setWikiRoute(`#belonging/${race.belonging}/${categoryId}/${raceId}`);
    setBreadcrumbs([
        { label: "Расы", route: "#races" },
        { label: "Принадлежность", route: "#belonging" },
        { label: belonging.name, route: `#belonging/${race.belonging}` },
        { label: category.name, route: `#belonging/${race.belonging}/${categoryId}` },
        { label: race.name }
    ]);

    const peopleGroup = race.peoples ? peoples[race.peoples] : null;

    container.innerHTML = `
        <article class="races-page">
            ${renderPageHeader(
                `${belonging.name} · ${category.name}`,
                race.name,
                race.description
            )}
            ${race.notes ? `<p class="page-note">${escapeHtml(race.notes)}</p>` : ""}
            ${peopleGroup ? renderRacePeoplesSection(raceId, categoryId) : ""}
        </article>
    `;
}


/* =========================
   ПЕРЕКЛЮЧЕНИЕ РАЗДЕЛОВ
   ========================= */
