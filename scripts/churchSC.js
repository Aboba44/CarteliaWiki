// Отображение пути Церкви: ветвь → палата → тема → статья или список орденов.
function renderChurchContent() {
    const content = document.getElementById("church-content");

    if (!content) return;

    setBreadcrumbs([{ label: "Церковь" }]);
    const branchEntries = Object.entries(church.branches);

    content.innerHTML = `
        <article class="wiki-page">
            ${renderPageHeader(
                "Мир Картелии",
                "Церковь",
                "Выберите ветвь Церкви, чтобы открыть её палаты и темы."
            )}
            <button class="church-hierarchy-launcher" type="button" onclick="showChurchHierarchy()">
                <span class="church-hierarchy-launcher-title">Иерархия церкви</span>
                <span class="church-hierarchy-launcher-description">Посмотреть устройство власти и подчинения</span>
                <span class="church-hierarchy-launcher-arrow" aria-hidden="true">→</span>
            </button>
        <div class="church-branch-switcher">
            <button
                class="church-branch-arrow church-branch-arrow--previous"
                type="button"
                aria-label="Предыдущая ветвь"
                onclick="changeChurchBranch(-1)"
            >‹</button>
            <div class="wiki-cards church-branch-grid" role="group" aria-label="Ветви Церкви">
                ${branchEntries.map(([id, branch], index) => `
                    <div class="church-branch-item church-branch-item--${id}${index === 0 ? " is-current" : ""}">
                        <button
                            class="wiki-card church-branch-card church-branch-card--${id}"
                            type="button"
                            data-branch-id="${id}"
                            aria-expanded="false"
                            aria-current="${index === 0 ? "true" : "false"}"
                            aria-controls="church-branch-chambers"
                            onclick="toggleChurchBranch('${id}', this)"
                        >
                            <svg class="church-branch-image" viewBox="0 0 1024 1024" aria-hidden="true">
                                <defs>
                                    <mask id="church-emblem-mask-${id}" mask-type="alpha">
                                        <image href="images/Other/flower.png" width="1024" height="1024"></image>
                                    </mask>
                                </defs>
                                <rect width="1024" height="1024" fill="currentColor" mask="url(#church-emblem-mask-${id})"></rect>
                            </svg>
                            <h2>${escapeHtml(branch.name)}</h2>
                            <p>${escapeHtml(branch.description)}</p>
                            <span class="church-branch-chevron" aria-hidden="true">⌄</span>
                        </button>
                        <button
                            class="church-branch-details-link"
                            type="button"
                            onclick="showChurchBranchPage('${id}')"
                        >
                            Подробнее о ветви
                        </button>
                    </div>
                `).join("")}
            </div>
            <button
                class="church-branch-arrow church-branch-arrow--next"
                type="button"
                aria-label="Следующая ветвь"
                onclick="changeChurchBranch(1)"
            >›</button>
        </div>
        <div
            id="church-branch-chambers"
            class="church-chamber-panel"
            aria-label="Палаты выбранной ветви"
            hidden
        >
            <div class="church-chamber-panel-inner"></div>
        </div>
        </article>
    `;
}

function setCurrentChurchBranch(branchId) {
    const items = Array.from(document.querySelectorAll(".church-branch-item"));
    const currentIndex = items.findIndex(item =>
        item.querySelector(".church-branch-card")?.dataset.branchId === branchId
    );

    if (currentIndex < 0) return;

    items.forEach((item, index) => {
        item.classList.toggle("is-current", index === currentIndex);
        item.querySelector(".church-branch-card")?.setAttribute(
            "aria-current",
            index === currentIndex ? "true" : "false"
        );
    });
}

function changeChurchBranch(direction) {
    const items = Array.from(document.querySelectorAll(".church-branch-item"));
    const currentIndex = items.findIndex(item => item.classList.contains("is-current"));
    if (!items.length || currentIndex < 0) return;

    const nextIndex = (currentIndex + direction + items.length) % items.length;
    const nextItem = items[nextIndex];
    const nextCard = nextItem?.querySelector(".church-branch-card");

    if (!nextCard) return;

    setCurrentChurchBranch(nextCard.dataset.branchId);

    const panel = document.getElementById("church-branch-chambers");
    if (panel?.classList.contains("is-open")) {
        toggleChurchBranch(nextCard.dataset.branchId, nextCard);
    }
}

function showChurch() {
    showSection("church", true);
    renderChurchContent();
}

function toggleChurchBranch(branchId, button, syncRoute = true) {
    const branch = church.branches[branchId];
    const panel = document.getElementById("church-branch-chambers");
    const panelContent = panel?.querySelector(".church-chamber-panel-inner");
    if (!branch || !panel || !panelContent) return;

    const wasOpen = button.getAttribute("aria-expanded") === "true";
    document.querySelectorAll(".church-branch-card").forEach(card => {
        card.setAttribute("aria-expanded", "false");
        card.classList.remove("is-selected");
    });
    setCurrentChurchBranch(branchId);

    if (wasOpen) {
        panel.classList.remove("is-open");
        window.setTimeout(() => {
            if (!panel.classList.contains("is-open")) panel.hidden = true;
        }, 300);
        if (syncRoute) setWikiRoute("#church");
        return;
    }

    const chambers = Object.entries(branch.chambers);
    panelContent.innerHTML = `
        <h2>${escapeHtml(branch.name)}: палаты</h2>
        ${chambers.length
            ? renderWikiCards(chambers, ([chamberId, chamber]) => `
                <button
                    class="wiki-card church-chamber-card church-chamber-card--${branchId}"
                    type="button"
                    onclick="showChurchChamber('${branchId}', '${chamberId}')"
                >
                    <h3>${escapeHtml(chamber.name)}</h3>
                    <p>${escapeHtml(chamber.description)}</p>
                </button>
            `)
            : `<p class="church-chambers-empty">Палаты пока не добавлены.</p>`
        }
    `;

    button.setAttribute("aria-expanded", "true");
    button.classList.add("is-selected");
    panel.hidden = false;
    void panel.offsetHeight;
    panel.classList.add("is-open");
    if (syncRoute) setWikiRoute(`#church/${encodeURIComponent(branchId)}`);
    window.setTimeout(() => {
        if (panel.classList.contains("is-open")) {
            panel.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }, 300);
}


function showChurchBranch(branchId, syncRoute = true) {
    const branch = church.branches[branchId];

    if (!branch) return;

    if (syncRoute) setWikiRoute(`#church/${encodeURIComponent(branchId)}`);

    showSection("church");
    renderChurchContent();
    const button = Array.from(document.querySelectorAll(".church-branch-card"))
        .find(card => card.dataset.branchId === branchId);
    if (button) toggleChurchBranch(branchId, button, false);
}

function showChurchBranchPage(branchId, syncRoute = true) {
    const branch = church.branches[branchId];
    const content = document.getElementById("church-content");
    if (!branch || !content) return;

    if (syncRoute) setWikiRoute(`#church/${encodeURIComponent(branchId)}/about`);
    showSection("church");
    setBreadcrumbs([
        { label: "Церковь", route: "#church" },
        { label: branch.name }
    ]);

    const chambers = Object.entries(branch.chambers);
    content.innerHTML = `
        <article class="wiki-page church-branch-page church-branch-page--${branchId}">
            <header class="church-branch-hero">
                <div class="church-branch-hero-image" aria-hidden="true"></div>
                <div class="church-branch-hero-content">
                    ${renderPageHeader("Церковь", branch.name, branch.description)}
                </div>
            </header>
            ${renderWikiSection("Палаты ветви", chambers.length
                ? renderWikiCards(chambers, ([chamberId, chamber]) => `
                    <button
                        class="wiki-card church-chamber-card church-chamber-card--${branchId}"
                        type="button"
                        onclick="showChurchChamber('${branchId}', '${chamberId}')"
                    >
                        <h3>${escapeHtml(chamber.name)}</h3>
                        <p>${escapeHtml(chamber.description)}</p>
                    </button>
                `)
                : `<p class="church-chambers-empty">Палаты пока не добавлены.</p>`
            )}
        </article>
    `;
}


function showChurchChamber(branchId, chamberId, syncRoute = true) {
    const branch = church.branches[branchId];
    if (!branch) return;

    const chamber = branch.chambers[chamberId];

    if (!chamber) return;

    if (syncRoute) setWikiRoute(`#church/${encodeURIComponent(branchId)}/${encodeURIComponent(chamberId)}`);
    setBreadcrumbs([
        { label: "Церковь" },
        { label: branch.name, route: `#church/${encodeURIComponent(branchId)}/about` },
        { label: chamber.name }
    ]);

    showSection("church");

    const content = document.getElementById("church-content");

    content.innerHTML = `
        <article class="wiki-page church-branch-page church-chamber-page church-branch-page--${branchId}">
            <header class="church-branch-hero church-chamber-hero">
                <div class="church-branch-hero-image" aria-hidden="true"></div>
                <div class="church-branch-hero-content">
                    ${renderPageHeader(branch.name, chamber.name, chamber.description)}
                </div>
            </header>
            ${renderWikiSection("Темы", chamber.topics.length
                ? renderWikiCards(chamber.topics, (topic, topicIndex) => `
                    <button
                        class="wiki-card church-chamber-card church-chamber-card--${branchId}"
                        type="button"
                        onclick="openChurchTopic('${branchId}', '${chamberId}', '${topicIndex}')"
                    >
                        <h3>${escapeHtml(topic.name)}</h3>
                        ${topic.description ? `<p>${escapeHtml(topic.description)}</p>` : ""}
                    </button>
                `)
                : `<p class="church-chambers-empty">Темы пока не добавлены.</p>`
            )}
        </article>
    `;

}


function setChurchBreadcrumbs(branchId, chamberId, topicName, currentName, topicIndex) {
    const branch = church.branches[branchId];
    const chamber = branch?.chambers[chamberId];
    if (!branch || !chamber) return;

    setBreadcrumbs([
        { label: "Церковь" },
        { label: branch.name, route: `#church/${encodeURIComponent(branchId)}/about` },
        { label: chamber.name, route: `#church/${encodeURIComponent(branchId)}/${encodeURIComponent(chamberId)}` },
        { label: topicName, ...(currentName ? { route: `#church/${encodeURIComponent(branchId)}/${encodeURIComponent(chamberId)}/topic/${topicIndex}` } : {}) },
        ...(currentName ? [{ label: currentName }] : [])
    ]);
}

let churchArticleRenderId = 0;

function renderChurchMarkdown(markdown, articleUrl) {
    return renderMarkdownArticle(markdown, articleUrl, { bodyClass: "church-article-body" });
}

async function loadChurchArticle(topic, body, renderId) {
    // Загружает внешний файл статьи; номер рендера не даёт позднему ответу заменить новую страницу.
    try {
        const articleUrl = new URL(topic.contentFile, document.baseURI);
        const response = await fetch(articleUrl);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const markdown = await response.text();
        if (renderId !== churchArticleRenderId) return;
        body.replaceWith(renderChurchMarkdown(markdown, articleUrl));
    } catch (error) {
        if (renderId !== churchArticleRenderId) return;
        body.textContent = "Не удалось загрузить статью. Проверьте подключение локального сервера и путь к файлу.";
        body.classList.add("church-article-error");
        console.error(`Не удалось загрузить статью «${topic.name}».`, error);
    }
}

function openChurchTopic(branchId, chamberId, topicIndex, syncRoute = true) {
    const branch = church.branches[branchId];
    const chamber = branch?.chambers[chamberId];
    const topic = chamber?.topics[Number(topicIndex)];

    if (!branch || !chamber || !topic) return;

    const renderId = ++churchArticleRenderId;
    if (syncRoute) setWikiRoute(`#church/${encodeURIComponent(branchId)}/${encodeURIComponent(chamberId)}/topic/${topicIndex}`);
    setChurchBreadcrumbs(branchId, chamberId, topic.name, null, Number(topicIndex));

    if (topic.type === "orders") {
        showOrders(true);
        return;
    }

    showSection("church");

    const content = document.getElementById("church-content");
    const article = document.createElement("article");
    article.className = "wiki-page church-article";
    article.innerHTML = renderPageHeader(
        `${branch.name} · ${chamber.name}`,
        topic.name,
        topic.description || ""
    );

    const body = document.createElement("div");
    body.className = "church-article-body";
    article.appendChild(body);
    content.replaceChildren(article);

    if (topic.contentFile) {
        body.textContent = "Загружаем статью…";
        body.setAttribute("aria-live", "polite");
        loadChurchArticle(topic, body, renderId);
        return;
    }

    const paragraphs = Array.isArray(topic.content)
        ? topic.content
        : (topic.content ? [topic.content] : ["Статья будет добавлена позже."]);
    paragraphs.forEach(function (text) {
        const paragraph = document.createElement("p");
        paragraph.textContent = text;
        body.appendChild(paragraph);
    });
}
