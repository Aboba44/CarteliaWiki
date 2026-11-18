// Народы расы: группа народов → категория → отдельный народ.
// Данные лежат в data/peoples.js, ссылка на группу — в поле peoples записи расы.
// Маршрут: #belonging/<принадлежность>/<категория>/<раса>/peoples[/<категория>[/<народ>]].

function getRaceRoute(raceId, categoryId) {
    const race = races[raceId];
    if (!race) return "";

    return `#belonging/${encodeURIComponent(race.belonging)}/${encodeURIComponent(categoryId)}/${encodeURIComponent(raceId)}`;
}

function getPeoplesRoute(raceId, categoryId, peopleCategoryId, peopleId) {
    const base = `${getRaceRoute(raceId, categoryId)}/peoples`;
    if (!peopleCategoryId) return base;

    const categoryRoute = `${base}/${encodeURIComponent(peopleCategoryId)}`;
    return peopleId ? `${categoryRoute}/${encodeURIComponent(peopleId)}` : categoryRoute;
}

function getRaceContext(raceId, categoryId) {
    const race = races[raceId];
    const belonging = raceBelongings[race && race.belonging];
    const category = belonging && belonging.categories[categoryId];
    const group = race && race.peoples ? peoples[race.peoples] : null;

    if (!race || !belonging || !category || !group) return null;

    return { race, belonging, category, group };
}

function setPeopleBreadcrumbs(raceId, categoryId, extra = []) {
    const context = getRaceContext(raceId, categoryId);

    if (!context) return;

    setBreadcrumbs([
        { label: "Расы", route: "#races" },
        { label: "Принадлежность", route: "#belonging" },
        { label: context.belonging.name, route: `#belonging/${encodeURIComponent(context.race.belonging)}` },
        { label: context.category.name, route: `#belonging/${encodeURIComponent(context.race.belonging)}/${encodeURIComponent(categoryId)}` },
        { label: context.race.name, route: getRaceRoute(raceId, categoryId) },
        ...extra
    ]);
}

function renderPeopleCategoryTile(raceId, categoryId, peopleCategoryId, peopleCategory) {
    const peopleCount = Object.keys(peopleCategory.entries || {}).length;
    const meta = peopleCount
        ? `${peopleCount} ${pluralizeRu(peopleCount, "народ", "народа", "народов")}`
        : "Народы пока не добавлены";
    const metaClass = peopleCount
        ? "races-tile-meta"
        : "races-tile-meta races-tile-meta--muted";

    return `
        <button
            class="wiki-card races-tile"
            type="button"
            onclick="showPeopleCategory('${raceId}', '${categoryId}', '${peopleCategoryId}')"
        >
            <span class="races-tile-title">${escapeHtml(peopleCategory.name)}</span>
            <span class="${metaClass}">${meta}</span>
            ${peopleCategory.description && !isPlaceholderText(peopleCategory.description)
                ? `<span class="races-tile-text">${escapeHtml(peopleCategory.description)}</span>`
                : ""}
        </button>
    `;
}

function renderPeopleTile(raceId, categoryId, peopleCategoryId, peopleId, people) {
    return `
        <button
            class="wiki-card races-tile"
            type="button"
            onclick="showPeople('${raceId}', '${categoryId}', '${peopleCategoryId}', '${peopleId}')"
        >
            <span class="races-tile-title">${escapeHtml(people.name)}</span>
            ${people.description && !isPlaceholderText(people.description)
                ? `<span class="races-tile-text">${escapeHtml(people.description)}</span>`
                : ""}
        </button>
    `;
}

function showPeoples(raceId, categoryId, syncRoute = true) {
    const container = getRacesContainer();
    const context = getRaceContext(raceId, categoryId);

    if (!container || !context) return;

    if (syncRoute) setWikiRoute(getPeoplesRoute(raceId, categoryId));
    setPeopleBreadcrumbs(raceId, categoryId, [{ label: "Народы" }]);

    const categories = Object.entries(context.group.categories || {});

    container.innerHTML = `
        <article class="races-page">
            ${renderPageHeader(
                `${context.belonging.name} · ${context.category.name} · ${context.race.name}`,
                context.group.name,
                context.group.description
            )}
            ${categories.length
                ? `<div class="wiki-cards races-tiles">
                    ${categories.map(([peopleCategoryId, peopleCategory]) =>
                        renderPeopleCategoryTile(raceId, categoryId, peopleCategoryId, peopleCategory)
                    ).join("")}
                </div>`
                : `<p class="page-empty">Категории народов пока не добавлены.</p>`
            }
        </article>
    `;
}

function showPeopleCategory(raceId, categoryId, peopleCategoryId, syncRoute = true) {
    const container = getRacesContainer();
    const context = getRaceContext(raceId, categoryId);
    const peopleCategory = context && context.group.categories[peopleCategoryId];

    if (!container || !context || !peopleCategory) return;

    if (syncRoute) setWikiRoute(getPeoplesRoute(raceId, categoryId, peopleCategoryId));
    setPeopleBreadcrumbs(raceId, categoryId, [
        { label: "Народы", route: getPeoplesRoute(raceId, categoryId) },
        { label: peopleCategory.name }
    ]);

    const entries = Object.entries(peopleCategory.entries || {});

    container.innerHTML = `
        <article class="races-page">
            ${renderPageHeader(
                context.group.name,
                peopleCategory.name,
                peopleCategory.description
            )}
            ${entries.length
                ? `<div class="wiki-cards races-tiles">
                    ${entries.map(([peopleId, people]) =>
                        renderPeopleTile(raceId, categoryId, peopleCategoryId, peopleId, people)
                    ).join("")}
                </div>`
                : `<p class="page-empty">Народы пока не добавлены.</p>`
            }
        </article>
    `;
}

function showPeople(raceId, categoryId, peopleCategoryId, peopleId, syncRoute = true) {
    const container = getRacesContainer();
    const context = getRaceContext(raceId, categoryId);
    const peopleCategory = context && context.group.categories[peopleCategoryId];
    const people = peopleCategory && peopleCategory.entries && peopleCategory.entries[peopleId];

    if (!container || !context || !peopleCategory || !people) return;

    if (syncRoute) setWikiRoute(getPeoplesRoute(raceId, categoryId, peopleCategoryId, peopleId));
    setPeopleBreadcrumbs(raceId, categoryId, [
        { label: "Народы", route: getPeoplesRoute(raceId, categoryId) },
        { label: peopleCategory.name, route: getPeoplesRoute(raceId, categoryId, peopleCategoryId) },
        { label: people.name }
    ]);

    container.innerHTML = `
        <article class="races-page">
            ${renderPageHeader(
                `${context.group.name} · ${peopleCategory.name}`,
                people.name,
                people.description || "Описание пока не добавлено."
            )}
        </article>
    `;
}
