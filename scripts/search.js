let searchIndex = [];

function normalizeSearchText(value) {
    return String(value || "")
        .normalize("NFKC")
        .toLocaleLowerCase("ru-RU")
        .replace(/ё/g, "е")
        .replace(/[^\p{L}\p{N}]+/gu, " ")
        .trim();
}

function getSearchableText(values) {
    const candidates = Array.isArray(values) ? values.flat(Infinity) : [values];

    return candidates
        .filter(value => typeof value === "string")
        .map(value => value.trim())
        .filter(value => {
            if (!value) return false;

            const normalized = normalizeSearchText(value);
            return !/^(?:описание пока не добавлено|определение еще не добавлено|категория пока не проработана|здесь будет (?:подробное )?описание(?: .*)?|description not added)$/.test(normalized);
        })
        .join(" ");
}

function getSearchSectionLabel(sectionId) {
    const translationKey = `sections.${sectionId}`;
    const translated = t(translationKey);

    if (translated !== translationKey) return translated;
    if (sectionId === "home") return currentLanguage === "en" ? "Home" : "Главная";

    return getSectionLabel(sectionId);
}

function addSearchEntry(entries, title, section, contentValues, route, open, hierarchy = []) {
    const cleanTitle = String(title || "").trim();
    if (!cleanTitle) return;

    const cleanHierarchy = (Array.isArray(hierarchy) ? hierarchy : [hierarchy])
        .map(value => getSearchableText(value))
        .filter(Boolean)
        .join(" · ");
    const content = getSearchableText(contentValues);
    const titleKey = normalizeSearchText(cleanTitle);
    const context = [section, ...cleanHierarchy.split(" · ")]
        .filter(Boolean)
        .filter((value, index, values) => {
            const normalized = normalizeSearchText(value);
            return normalized !== titleKey
                && values.findIndex(candidate => normalizeSearchText(candidate) === normalized) === index;
        })
        .join(" · ");

    entries.push({
        title: cleanTitle,
        section,
        context,
        content,
        searchable: normalizeSearchText([cleanTitle, context, content].join(" ")),
        route,
        open
    });
}

function buildSearchIndex() {
    const entries = [];
    const dynamicContent = [
        "#church-content",
        "#belonging-info",
        "#god-list",
        "#god-info",
        "#worlds-content",
        "#worlds-info",
        "#orders-content",
        "#magic-foundations",
        "#magic-foundation-info",
        "#magic-types",
        "#magic-type-info"
    ].join(",");

    document.querySelectorAll(".content > section").forEach(section => {
        const staticSection = section.cloneNode(true);
        staticSection.querySelectorAll(dynamicContent).forEach(element => element.remove());

        const heading = staticSection.querySelector("h1, h2, h3");
        const title = heading?.textContent.trim() || getSearchSectionLabel(section.id);
        heading?.remove();
        const content = getSearchableText(staticSection.textContent);
        if (!title && !content) return;

        addSearchEntry(
            entries,
            title,
            getSearchSectionLabel(section.id),
            [content],
            `#${section.id}`
        );
    });

    Object.entries(godPantheons).forEach(([pantheonId, pantheon]) => {
        const godsLabel = getSearchSectionLabel("gods");
        addSearchEntry(entries, pantheon.name, godsLabel, [], `#gods/${pantheonId}`);

        Object.entries(pantheon.categories).forEach(([categoryId, category]) => {
            addSearchEntry(
                entries,
                category.name,
                godsLabel,
                [category.definition],
                `#gods/${pantheonId}/category/${categoryId}`,
                null,
                [pantheon.name]
            );
        });
    });

    Object.entries(gods).forEach(([godId, god]) => {
        const pantheonId = god.pantheon || "indigenous";
        const pantheon = godPantheons[pantheonId];
        const category = pantheon?.categories[god.category];
        addSearchEntry(
            entries,
            god.name,
            getSearchSectionLabel("gods"),
            [god.title, god.description],
            `#gods/${pantheonId}/god/${encodeURIComponent(godId)}`,
            null,
            [pantheon?.name, category?.name]
        );
    });

    const raceLocations = new Map();
    Object.entries(raceBelongings).forEach(([belongingId, belonging]) => {
        addSearchEntry(
            entries,
            belonging.name,
            getSearchSectionLabel("races"),
            [belonging.description],
            `#belonging/${belongingId}`,
            null,
            [getSearchSectionLabel("belonging")]
        );

        Object.entries(belonging.categories).forEach(([categoryId, category]) => {
            addSearchEntry(
                entries,
                category.name,
                getSearchSectionLabel("races"),
                [category.description],
                `#belonging/${belongingId}/${categoryId}`,
                null,
                [belonging.name]
            );

            (category.races || []).forEach(raceId => {
                if (!raceLocations.has(raceId)) {
                    raceLocations.set(raceId, { belongingId, categoryId, belonging, category });
                }
            });
        });
    });

    Object.entries(races).forEach(([raceId, race]) => {
        const location = raceLocations.get(raceId);
        const belonging = location?.belonging || raceBelongings[race.belonging];
        const categoryId = location?.categoryId || "sentient";
        addSearchEntry(
            entries,
            race.name,
            getSearchSectionLabel("races"),
            [race.description, race.notes],
            `#belonging/${race.belonging}/${categoryId}/${raceId}`,
            null,
            [belonging?.name, location?.category?.name]
        );
    });

    Object.entries(church.branches).forEach(([branchId, branch]) => {
        addSearchEntry(
            entries,
            branch.name,
            getSearchSectionLabel("church"),
            [branch.description],
            `#church/${encodeURIComponent(branchId)}`
        );

        Object.entries(branch.chambers).forEach(([chamberId, chamber]) => {
            addSearchEntry(
                entries,
                chamber.name,
                getSearchSectionLabel("church"),
                [chamber.description],
                `#church/${encodeURIComponent(branchId)}/${encodeURIComponent(chamberId)}`,
                null,
                [branch.name]
            );

            (chamber.topics || []).forEach((topic, topicIndex) => {
                addSearchEntry(
                    entries,
                    topic.name,
                    getSearchSectionLabel("church"),
                    [topic.description],
                    `#church/${encodeURIComponent(branchId)}/${encodeURIComponent(chamberId)}/topic/${topicIndex}`,
                    null,
                    [branch.name, chamber.name]
                );
            });
        });
    });

    let churchOrderRoute = null;
    Object.entries(church.branches).some(([branchId, branch]) =>
        Object.entries(branch.chambers).some(([chamberId, chamber]) => {
            const topicIndex = (chamber.topics || []).findIndex(topic => topic.type === "orders");
            if (topicIndex < 0) return false;

            churchOrderRoute = `#church/${encodeURIComponent(branchId)}/${encodeURIComponent(chamberId)}/topic/${topicIndex}`;
            return true;
        })
    );

    Object.entries(orders).forEach(([orderId, order]) => {
        const route = churchOrderRoute
            ? `${churchOrderRoute}/order/${encodeURIComponent(orderId)}`
            : `#orders/${encodeURIComponent(orderId)}`;
        addSearchEntry(
            entries,
            order.name,
            getSearchSectionLabel("church"),
            [order.description],
            route,
            null,
            [church.branches[order.branch]?.name || order.branch, getSearchSectionLabel("orders")]
        );
    });

    magic.foundations.forEach(topic => {
        addSearchEntry(
            entries,
            topic.title,
            getSearchSectionLabel("magic"),
            [topic.description],
            `#magic/foundation/${encodeURIComponent(topic.id)}`,
            null,
            ["Основные темы"]
        );
    });

    Object.entries(magic.types).forEach(([typeId, type]) => {
        addSearchEntry(
            entries,
            type.name,
            getSearchSectionLabel("magic"),
            [type.summary, type.description, type.focus, type.traits, type.principles, type.applications, type.limitations],
            `#magic/type/${encodeURIComponent(typeId)}`,
            null,
            ["Виды магии"]
        );
    });

    Object.entries(worlds).forEach(([worldId, world]) => {
        addSearchEntry(
            entries,
            world.name,
            getSearchSectionLabel("worlds"),
            [world.description],
            `#worlds/world/${encodeURIComponent(worldId)}`
        );
    });

    Object.entries(dimensions).forEach(([dimensionId, dimension]) => {
        addSearchEntry(
            entries,
            dimension.name,
            getSearchSectionLabel("worlds"),
            [dimension.description, dimension.summary, dimension.notes],
            `#worlds/dimension/${encodeURIComponent(dimensionId)}`,
            null,
            ["Измерения"]
        );
    });

    return entries;
}

function getSearchMatches(query) {
    const normalizedQuery = normalizeSearchText(query);
    const terms = normalizedQuery.split(/\s+/).filter(Boolean);
    if (terms.length === 0) return [];

    return searchIndex
        .map(entry => {
            if (!terms.every(term => entry.searchable.includes(term))) return null;

            const normalizedTitle = normalizeSearchText(entry.title);
            const normalizedContext = normalizeSearchText(entry.context);
            let score = 0;

            if (normalizedTitle === normalizedQuery) score += 100;
            else if (normalizedTitle.startsWith(normalizedQuery)) score += 60;
            else if (normalizedTitle.includes(normalizedQuery)) score += 35;
            if (normalizedContext.includes(normalizedQuery)) score += 15;

            return { entry, score };
        })
        .filter(Boolean)
        .sort((left, right) => right.score - left.score || left.entry.title.localeCompare(right.entry.title, currentLanguage));
}

function renderSearchResults(query) {
    const results = document.getElementById("search-results");
    const status = document.getElementById("search-status");
    if (!results || !status) return;

    results.replaceChildren();
    if (!normalizeSearchText(query)) {
        status.textContent = t("search.hint");
        status.hidden = false;
        return;
    }

    const matches = getSearchMatches(query).slice(0, 10);
    status.hidden = false;
    status.textContent = matches.length
        ? t("search.resultCount").replace("{count}", String(matches.length))
        : t("search.noResults");

    matches.forEach(({ entry }) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "search-result";
        button.setAttribute("role", "option");
        button.addEventListener("click", () => openSearchResult(entry));

        const title = document.createElement("span");
        title.className = "search-result-title";
        title.textContent = entry.title;
        button.appendChild(title);

        if (entry.context) {
            const context = document.createElement("span");
            context.className = "search-result-context";
            context.textContent = entry.context;
            button.appendChild(context);
        }

        if (entry.content) {
            const snippet = document.createElement("span");
            snippet.className = "search-result-snippet";
            snippet.textContent = entry.content.length > 170
                ? `${entry.content.slice(0, 167).trimEnd()}...`
                : entry.content;
            button.appendChild(snippet);
        }

        results.appendChild(button);
    });
}

function closeSearch(restoreFocus = false) {
    const panel = document.getElementById("search-panel");
    const toggle = document.getElementById("search-toggle");
    if (!panel || !toggle) return;

    panel.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
    if (restoreFocus) toggle.focus();
}

function toggleSearch() {
    const panel = document.getElementById("search-panel");
    const input = document.getElementById("site-search-input");
    const toggle = document.getElementById("search-toggle");
    if (!panel || !input || !toggle) return;

    panel.hidden = !panel.hidden;
    toggle.setAttribute("aria-expanded", String(!panel.hidden));
    if (!panel.hidden) {
        renderSearchResults(input.value);
        input.focus();
    }
}

function openSearchResult(entry) {
    closeSearch();

    if (entry.open) {
        entry.open();
        return;
    }

    if (entry.route) {
        setWikiRoute(entry.route);
        handleWikiRoute(true);
    }
}

function initializeSearch() {
    const input = document.getElementById("site-search-input");
    const panel = document.getElementById("search-panel");
    const toggle = document.getElementById("search-toggle");
    if (!input || !panel || !toggle) return;

    searchIndex = buildSearchIndex();
    input.addEventListener("input", () => renderSearchResults(input.value));
    input.addEventListener("keydown", event => {
        if (event.key === "Enter") {
            const firstResult = document.querySelector("#search-results .search-result");
            if (firstResult) {
                event.preventDefault();
                firstResult.click();
            }
        } else if (event.key === "ArrowDown") {
            const firstResult = document.querySelector("#search-results .search-result");
            if (firstResult) {
                event.preventDefault();
                firstResult.focus();
            }
        }
    });

    document.addEventListener("pointerdown", event => {
        if (!panel.contains(event.target) && !toggle.contains(event.target)) closeSearch();
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape" && !panel.hidden) {
            closeSearch(true);
        } else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
            event.preventDefault();
            if (panel.hidden) toggleSearch();
            else input.focus();
        }
    });
}
