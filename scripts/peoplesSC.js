// Народы расы: категории народов и отдельный народ.
// Данные лежат в data/peoples.js, ссылка на группу — в поле peoples записи расы.
// Маршрут: #belonging/<принадлежность>/<категория>/<раса>/peoples[/<категория>[/<народ>]].
// Категории народов не являются отдельными страницами: они показываются
// заголовками на странице расы, чтобы до народа можно было дойти за один клик.

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

function renderRacePeoplesSection(raceId, categoryId) {
    // Секция народов на странице расы: категории — заголовки, народы — карточки.
    const context = getRaceContext(raceId, categoryId);
    if (!context) return "";

    const peopleCategories = Object.entries(context.group.categories || {});

    return `
        <section class="wiki-section races-people">
            ${peopleCategories.length
                ? peopleCategories.map(([peopleCategoryId, peopleCategory]) => {
                    const entries = Object.entries(peopleCategory.entries || {});
                    return `
                        <div class="races-group" id="races-people-${peopleCategoryId}">
                            <h2 class="races-group-title">${escapeHtml(peopleCategory.name)}</h2>
                            ${entries.length
                                ? `<div class="wiki-cards races-tiles">
                                    ${entries.map(([peopleId, people]) =>
                                        renderPeopleTile(raceId, categoryId, peopleCategoryId, peopleId, people)
                                    ).join("")}
                                </div>`
                                : `<p class="races-group-empty">Народы пока не добавлены.</p>`
                            }
                        </div>
                    `;
                }).join("")
                : `<p class="page-empty">Категории народов пока не добавлены.</p>`
            }
        </section>
    `;
}

function scrollToRacePeopleGroup(peopleCategoryId) {
    const target = document.getElementById(`races-people-${peopleCategoryId}`);
    if (target) target.scrollIntoView({ block: "start" });
}

function showPeople(raceId, categoryId, peopleCategoryId, peopleId, syncRoute = true) {
    const container = getRacesContainer();
    const context = getRaceContext(raceId, categoryId);
    const peopleCategory = context && context.group.categories[peopleCategoryId];
    const people = peopleCategory && peopleCategory.entries && peopleCategory.entries[peopleId];

    if (!container || !context || !peopleCategory || !people) return;

    if (syncRoute) setWikiRoute(getPeoplesRoute(raceId, categoryId, peopleCategoryId, peopleId));
    setBreadcrumbs([
        { label: "Расы", route: "#races" },
        { label: "Принадлежность", route: "#belonging" },
        { label: context.belonging.name, route: `#belonging/${encodeURIComponent(context.race.belonging)}` },
        { label: context.category.name, route: `#belonging/${encodeURIComponent(context.race.belonging)}/${encodeURIComponent(categoryId)}` },
        { label: context.race.name, route: getRaceRoute(raceId, categoryId) },
        { label: peopleCategory.name, route: getPeoplesRoute(raceId, categoryId, peopleCategoryId) },
        { label: people.name }
    ]);

    container.innerHTML = `
        <article class="wiki-page">
            ${renderPageHeader(
                `${context.belonging.name} · ${context.category.name} · ${peopleCategory.name}`,
                people.name,
                people.description || "Описание пока не добавлено."
            )}
        </article>
    `;
}
