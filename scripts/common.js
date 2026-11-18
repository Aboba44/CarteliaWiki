// Небольшие общие помощники: URL-маршруты, хлебные крошки и разметка карточек.
let lastResolvedHash = null;

function setWikiRoute(route, replace = false) {
    if (window.location.hash !== route) {
        const method = replace ? "replaceState" : "pushState";
        window.history[method]({ route }, "", route);
    }
    lastResolvedHash = route;
}

function setBreadcrumbs(items) {
    const nav = document.getElementById("breadcrumbs");
    if (!nav) return;

    nav.replaceChildren();

    items.forEach(function (item, index) {
        if (index > 0) {
            const separator = document.createElement("span");
            separator.className = "breadcrumb-separator";
            separator.setAttribute("aria-hidden", "true");
            separator.textContent = "→";
            nav.appendChild(separator);
        }

        if (item.route && index < items.length - 1) {
            const link = document.createElement("a");
            link.href = item.route;
            link.textContent = item.label;
            nav.appendChild(link);
        } else {
            const current = document.createElement("span");
            current.className = "breadcrumb-current";
            current.textContent = item.label;
            current.setAttribute("aria-current", "page");
            nav.appendChild(current);
        }
    });
}

function getSectionLabel(section) {
    const labels = {
        home: "Главная",
        church: "Церковь",
        belonging: "Расы",
        gods: "Боги",
        worlds: "Миры",
        magic: "Магия",
        orders: "Святые ордена",
        theocracy: "Теократия",
        hegemony: "Гегемония",
        confederation: "Конфедерация",
        map: "Карта",
        author: "От автора",
        reading: "Чтиво"
    };

    return labels[section] || section;
}


function escapeHtml(value) {
    // Экранирует текст перед вставкой в innerHTML-шаблоны.
    return String(value ?? "").replace(/[&<>"']/g, function (character) {
        return {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            "\"": "&quot;",
            "'": "&#39;"
        }[character];
    });
}

function pluralizeRu(count, one, few, many) {
    // Русские формы множественного числа: 1 раса, 2 расы, 5 рас.
    const value = Math.abs(Number(count) || 0);
    const lastTwo = value % 100;
    const lastOne = value % 10;

    if (lastTwo >= 11 && lastTwo <= 14) return many;
    if (lastOne === 1) return one;
    if (lastOne >= 2 && lastOne <= 4) return few;

    return many;
}

function isPlaceholderText(value) {
    // Отличает служебные заглушки от настоящего текста, чтобы не выводить их в карточках.
    const normalized = String(value || "")
        .trim()
        .toLocaleLowerCase("ru-RU")
        .replace(/ё/g, "е")
        .replace(/\s+/g, " ")
        .replace(/[.!]+$/, "");

    return /^(описание пока не добавлено|определение еще не добавлено|категория пока не проработана|здесь будет( подробное)? описание.*)$/.test(normalized);
}

function renderPageHeader(eyebrow, title, lead) {
    // Единый заголовок страницы раздела: надзаголовок, крупный h1 и лид.
    const hasLead = lead && !isPlaceholderText(lead);

    return `
        <header class="page-header">
            ${eyebrow ? `<p class="page-eyebrow">${escapeHtml(eyebrow)}</p>` : ""}
            <h1 class="page-title">${escapeHtml(title)}</h1>
            ${hasLead ? `<p class="page-lead">${escapeHtml(lead)}</p>` : ""}
        </header>
    `;
}

function renderWikiPage(eyebrow, title, lead, body) {
    // Общая оболочка страницы раздела: центрированный заголовок и содержимое.
    return `
        <article class="wiki-page">
            ${renderPageHeader(eyebrow, title, lead)}
            ${body || ""}
        </article>
    `;
}

function renderWikiSection(title, body) {
    // Внутренний блок главной страницы раздела: центрированный подзаголовок и карточки.
    return `
        <section class="wiki-section">
            <h2 class="wiki-section-title">${escapeHtml(title)}</h2>
            ${body || ""}
        </section>
    `;
}

function renderWikiCards(items, renderItem) {
    return `
        <div class="wiki-cards">
            ${items.map(renderItem).join("")}
        </div>
    `;
}
