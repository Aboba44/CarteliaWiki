// Раздел «Магия»: хаб с цепочкой основ и школами, страницы статей из Markdown.

let magicArticleRenderId = 0;

const MAGIC_SIGILS = {
    circle: `
        <circle cx="32" cy="32" r="21"/>
        <circle cx="32" cy="32" r="4"/>
        <path d="M32 11v7M32 46v7M11 32h7M46 32h7"/>
    `,
    triangle: `
        <path d="M32 9 54 49H10Z"/>
        <circle cx="32" cy="33" r="4"/>
        <path d="M32 17v8"/>
    `,
    diamond: `
        <path d="M32 6 58 32 32 58 6 32Z"/>
        <path d="M32 18v28M18 32h28"/>
    `,
    hexagon: `
        <path d="M32 7 53 19v26L32 57 11 45V19Z"/>
        <circle cx="32" cy="32" r="6"/>
    `,
    spiral: `
        <path d="M32 32c0-6 5-11 11-11s11 5 11 11-7 15-19 15S13 37 13 25 22 7 34 7"/>
    `
};

function getMagicContainer() {
    return document.getElementById("magic-content");
}

function magicHasText(value) {
    return Boolean(value && !isPlaceholderText(value));
}

function renderMagicSigil(key) {
    return `
        <svg class="magic-sigil" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
            ${MAGIC_SIGILS[key] || MAGIC_SIGILS.circle}
        </svg>
    `;
}

function magicRoman(value) {
    const numerals = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
    return numerals[value - 1] || String(value);
}

function getMagicFoundationChain() {
    // Строит цепочку по parent; если появятся ветки, обход останется корректным.
    const byId = new Map(magic.foundations.map(item => [item.id, item]));
    const result = [];
    const visited = new Set();

    function visit(foundation) {
        if (!foundation || visited.has(foundation.id)) return;
        visited.add(foundation.id);
        result.push(foundation);
        magic.foundations
            .filter(item => item.parent === foundation.id)
            .forEach(visit);
    }

    magic.foundations
        .filter(item => !item.parent || !byId.has(item.parent))
        .forEach(visit);
    magic.foundations.forEach(item => visit(item));

    return result;
}

function renderMagicFoundationSpine() {
    return getMagicFoundationChain().map((topic, index) => `
        <li class="magic-spine-item">
            <a class="magic-spine-link" href="#magic/foundation/${encodeURIComponent(topic.id)}">
                <span class="magic-spine-marker" aria-hidden="true">${magicRoman(index + 1)}</span>
                <span class="magic-spine-text">
                    <span class="magic-spine-title">${escapeHtml(topic.title)}</span>
                    ${magicHasText(topic.summary)
                        ? `<span class="magic-spine-summary">${escapeHtml(topic.summary)}</span>`
                        : ""}
                </span>
                <span class="magic-spine-arrow" aria-hidden="true">→</span>
            </a>
        </li>
    `).join("");
}

function renderMagicSchoolCards() {
    return Object.entries(magic.types).map(([typeId, type]) => `
        <a class="magic-school-card" href="#magic/type/${encodeURIComponent(typeId)}">
            <span class="magic-school-sigil" aria-hidden="true">${renderMagicSigil(type.sigil)}</span>
            <span class="magic-school-name">${escapeHtml(type.name)}</span>
            ${magicHasText(type.summary)
                ? `<span class="magic-school-summary">${escapeHtml(type.summary)}</span>`
                : ""}
            <span class="magic-school-open" aria-hidden="true">→</span>
        </a>
    `).join("");
}

function renderMagic() {
    const content = getMagicContainer();
    if (!content) return;

    setBreadcrumbs([{ label: "Магия" }]);

    const introParagraphs = (magic.intro.paragraphs || [])
        .filter(paragraph => paragraph && !isPlaceholderText(paragraph))
        .map(paragraph => `<p>${escapeHtml(paragraph)}</p>`)
        .join("");

    content.innerHTML = `
        <article class="wiki-page magic-page">
            <header class="page-header magic-hero">
                <p class="page-eyebrow">Мир Картелии</p>
                <h1 class="page-title">Магия</h1>
                <p class="page-lead">${escapeHtml(magic.intro.lead)}</p>
                <span class="magic-hero-mark" aria-hidden="true">${renderMagicSigil("spiral")}</span>
            </header>

            ${introParagraphs ? `<div class="magic-intro">${introParagraphs}</div>` : ""}

            <div class="magic-hub">
                <section class="magic-hub-column magic-hub-column--foundations">
                    <h2 class="magic-column-title">Основы</h2>
                    <ol class="magic-spine">
                        ${renderMagicFoundationSpine()}
                    </ol>
                </section>

                <section class="magic-hub-column magic-hub-column--schools">
                    <h2 class="magic-column-title">Виды магии</h2>
                    <div class="magic-schools">
                        ${renderMagicSchoolCards()}
                    </div>
                </section>
            </div>
        </article>
    `;
}

function showMagic() {
    showSection("magic", true);
    renderMagic();
}

function renderMagicTypeBody(type) {
    const parts = [];
    const listSections = [
        ["traits", "Особенности"],
        ["principles", "Принципы"],
        ["applications", "Применение"],
        ["limitations", "Ограничения"]
    ];

    if (magicHasText(type.description)) {
        parts.push(`<p>${escapeHtml(type.description)}</p>`);
    }

    if (magicHasText(type.focus)) {
        parts.push(`<p><strong>Направление:</strong> ${escapeHtml(type.focus)}</p>`);
    }

    listSections.forEach(function ([key, title]) {
        const values = (type[key] || []).filter(value => !isPlaceholderText(value));

        if (!values.length) return;

        parts.push(`<h2>${title}</h2>
            <ul>${values.map(value => `<li>${escapeHtml(value)}</li>`).join("")}</ul>`);
    });

    return parts.join("");
}

function setupMagicArticleToc(slot, toc, layout) {
    const headings = Array.from(slot.querySelectorAll("h2, h3"));
    headings.forEach((heading, index) => {
        if (!heading.id) heading.id = `section-${index + 1}`;
    });

    const items = buildMarkdownToc(slot);

    if (!toc || items.length < 2) {
        if (toc) toc.innerHTML = "";
        if (layout) layout.classList.remove("has-toc");
        return;
    }

    toc.innerHTML = renderMarkdownToc(items);
    if (layout) layout.classList.add("has-toc");

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    toc.querySelectorAll(".magic-toc-link").forEach(function (button) {
        button.addEventListener("click", function () {
            const target = document.getElementById(button.dataset.target);
            if (!target) return;
            target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
        });
    });
}

async function loadMagicArticle(config, slot, toc, layout, renderId) {
    try {
        const articleUrl = new URL(config.contentFile, document.baseURI);
        const response = await fetch(articleUrl);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const markdown = await response.text();
        if (renderId !== magicArticleRenderId) return;

        slot.replaceChildren(renderMarkdownArticle(markdown, articleUrl, { bodyClass: "magic-article-body" }));
        setupMagicArticleToc(slot, toc, layout);
    } catch (error) {
        if (renderId !== magicArticleRenderId) return;
        slot.innerHTML = `<p class="page-empty">Не удалось загрузить статью. Проверьте локальный сервер и путь к файлу.</p>`;
        console.error(`Не удалось загрузить статью «${config.title}».`, error);
    }
}

function renderMagicArticlePage(config) {
    const content = getMagicContainer();
    if (!content) return;

    const renderId = ++magicArticleRenderId;
    const summary = magicHasText(config.summary)
        ? `<p class="page-lead">${escapeHtml(config.summary)}</p>`
        : "";
    const focus = magicHasText(config.focus)
        ? `<span class="magic-badge magic-badge--muted">${escapeHtml(config.focus)}</span>`
        : "";

    content.innerHTML = `
        <article class="wiki-page magic-article-page">
            <header class="page-header magic-article-header">
                <p class="page-eyebrow">${escapeHtml(config.eyebrow)}</p>
                <h1 class="page-title">${escapeHtml(config.title)}</h1>
                ${summary}
                <div class="magic-article-badges">
                    <span class="magic-badge">${escapeHtml(config.badge)}</span>
                    ${focus}
                </div>
                <span class="magic-article-sigil" aria-hidden="true">${renderMagicSigil(config.sigil)}</span>
            </header>

            <div class="magic-article-layout">
                <aside class="magic-article-toc" aria-label="Содержание статьи"></aside>
                <div class="magic-article-content"></div>
            </div>
        </article>
    `;

    const slot = content.querySelector(".magic-article-content");
    const toc = content.querySelector(".magic-article-toc");
    const layout = content.querySelector(".magic-article-layout");

    if (config.contentFile) {
        loadMagicArticle(config, slot, toc, layout, renderId);
        return;
    }

    slot.innerHTML = `<div class="magic-article-body">${config.fallbackHtml}</div>`;
    setupMagicArticleToc(slot, toc, layout);
}

function showMagicFoundation(topicId, syncRoute = true) {
    const topic = magic.foundations.find(item => item.id === topicId);

    if (!topic || !getMagicContainer()) return;

    if (syncRoute) setWikiRoute(`#magic/foundation/${encodeURIComponent(topicId)}`);
    setBreadcrumbs([
        { label: "Магия", route: "#magic" },
        { label: "Основы", route: "#magic" },
        { label: topic.title }
    ]);

    renderMagicArticlePage({
        eyebrow: "Магия · Основы",
        title: topic.title,
        summary: topic.summary,
        badge: "Основа",
        sigil: "diamond",
        contentFile: topic.contentFile || "",
        fallbackHtml: magicHasText(topic.description)
            ? `<p>${escapeHtml(topic.description)}</p>`
            : `<p class="page-empty">Статья пока не написана.</p>`
    });
}

function showMagicType(typeId, syncRoute = true) {
    const type = magic.types[typeId];

    if (!type || !getMagicContainer()) return;

    if (syncRoute) setWikiRoute(`#magic/type/${encodeURIComponent(typeId)}`);
    setBreadcrumbs([
        { label: "Магия", route: "#magic" },
        { label: "Виды магии", route: "#magic" },
        { label: type.name }
    ]);

    const fallback = renderMagicTypeBody(type);

    renderMagicArticlePage({
        eyebrow: "Магия · Виды магии",
        title: type.name,
        summary: type.summary,
        focus: type.focus,
        badge: "Школа магии",
        sigil: type.sigil || "circle",
        contentFile: type.contentFile || "",
        fallbackHtml: fallback || `<p class="page-empty">Статья пока не написана.</p>`
    });
}
