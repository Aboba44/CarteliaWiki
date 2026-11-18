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

function setPeopleBreadcrumbs(raceId, categoryId, extra = []) {
    const race = races[raceId];
    const belonging = raceBelongings[race?.belonging];
    const category = belonging?.categories[categoryId];

    if (!race || !belonging || !category) return;

    setBreadcrumbs([
        { label: "Расы", route: "#races" },
        { label: "Принадлежность", route: "#belonging" },
        { label: belonging.name, route: `#belonging/${encodeURIComponent(race.belonging)}` },
        { label: category.name, route: `#belonging/${encodeURIComponent(race.belonging)}/${encodeURIComponent(categoryId)}` },
        { label: race.name, route: getRaceRoute(raceId, categoryId) },
        ...extra
    ]);
}

function getRacePeopleGroup(raceId) {
    const race = races[raceId];
    const group = race?.peoples ? peoples[race.peoples] : null;

    return race && group ? { race, group } : null;
}

function showPeoples(raceId, categoryId, syncRoute = true) {
    const info = document.getElementById("belonging-info");
    const context = getRacePeopleGroup(raceId);

    if (!info || !context) return;

    const { group } = context;
    if (syncRoute) setWikiRoute(getPeoplesRoute(raceId, categoryId));
    setPeopleBreadcrumbs(raceId, categoryId, [{ label: "Народы" }]);

    const categories = Object.entries(group.categories || {});

    info.innerHTML = `
        <h2>${escapeHtml(group.name)}</h2>
        ${group.description ? `<p>${escapeHtml(group.description)}</p>` : ""}

        ${categories.length
            ? renderWikiCards(categories, ([peopleCategoryId, peopleCategory]) => `
                <button
                    class="wiki-card"
                    type="button"
                    onclick="showPeopleCategory('${raceId}', '${categoryId}', '${peopleCategoryId}')"
                >
                    <h3>${escapeHtml(peopleCategory.name)}</h3>
                    ${peopleCategory.description ? `<p>${escapeHtml(peopleCategory.description)}</p>` : ""}
                </button>
            `)
            : `<p class="wiki-empty">Категории народов пока не добавлены.</p>`
        }
    `;
}

function showPeopleCategory(raceId, categoryId, peopleCategoryId, syncRoute = true) {
    const info = document.getElementById("belonging-info");
    const context = getRacePeopleGroup(raceId);
    const peopleCategory = context?.group.categories[peopleCategoryId];

    if (!info || !context || !peopleCategory) return;

    if (syncRoute) setWikiRoute(getPeoplesRoute(raceId, categoryId, peopleCategoryId));
    setPeopleBreadcrumbs(raceId, categoryId, [
        { label: "Народы", route: getPeoplesRoute(raceId, categoryId) },
        { label: peopleCategory.name }
    ]);

    const entries = Object.entries(peopleCategory.entries || {});

    info.innerHTML = `
        <h2>${escapeHtml(context.group.name)}: ${escapeHtml(peopleCategory.name)}</h2>
        ${peopleCategory.description ? `<p>${escapeHtml(peopleCategory.description)}</p>` : ""}

        ${entries.length
            ? renderWikiCards(entries, ([peopleId, people]) => `
                <button
                    class="wiki-card"
                    type="button"
                    onclick="showPeople('${raceId}', '${categoryId}', '${peopleCategoryId}', '${peopleId}')"
                >
                    <h3>${escapeHtml(people.name)}</h3>
                    ${people.description ? `<p>${escapeHtml(people.description)}</p>` : ""}
                </button>
            `)
            : `<p class="wiki-empty">Народы пока не добавлены.</p>`
        }
    `;
}

function showPeople(raceId, categoryId, peopleCategoryId, peopleId, syncRoute = true) {
    const info = document.getElementById("belonging-info");
    const context = getRacePeopleGroup(raceId);
    const peopleCategory = context?.group.categories[peopleCategoryId];
    const people = peopleCategory?.entries?.[peopleId];

    if (!info || !context || !peopleCategory || !people) return;

    if (syncRoute) setWikiRoute(getPeoplesRoute(raceId, categoryId, peopleCategoryId, peopleId));
    setPeopleBreadcrumbs(raceId, categoryId, [
        { label: "Народы", route: getPeoplesRoute(raceId, categoryId) },
        { label: peopleCategory.name, route: getPeoplesRoute(raceId, categoryId, peopleCategoryId) },
        { label: people.name }
    ]);

    info.innerHTML = `
        <h2>${escapeHtml(people.name)}</h2>
        <p>${escapeHtml(people.description || "Описание пока не добавлено.")}</p>
    `;
}
