// Отображение пути Церкви: ветвь → палата → тема → статья или список орденов.
function renderChurchContent() {
    const content = document.getElementById("church-content");

    if (!content) return;

    setBreadcrumbs([{ label: "Церковь" }]);
    const branchEntries = Object.entries(church.branches);

    content.innerHTML = `
        <h1>Церковь</h1>
        <p>Выберите ветвь Церкви.</p>
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
        <article class="church-branch-page church-branch-page--${branchId}">
            <header class="church-branch-hero">
                <div class="church-branch-hero-image" aria-hidden="true"></div>
                <div class="church-branch-hero-content">
                    <p class="church-branch-eyebrow">Церковь</p>
                    <h1>${escapeHtml(branch.name)}</h1>
                </div>
            </header>
            <section class="church-branch-description">
                <h2>О ветви</h2>
                <p>${escapeHtml(branch.description)}</p>
            </section>
            <section class="church-branch-chambers">
                <h2>Палаты ветви</h2>
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
            </section>
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
        <article class="church-branch-page church-chamber-page church-branch-page--${branchId}">
            <header class="church-branch-hero church-chamber-hero">
                <div class="church-branch-hero-image" aria-hidden="true"></div>
                <div class="church-branch-hero-content">
                    <p class="church-branch-eyebrow">${escapeHtml(branch.name)}</p>
                    <h1>${escapeHtml(chamber.name)}</h1>
                </div>
            </header>
            <section class="church-branch-description">
                <h2>О палате</h2>
                <p>${escapeHtml(chamber.description)}</p>
            </section>
            <section class="church-branch-chambers church-chamber-topics">
                <h2>Темы</h2>
                ${chamber.topics.length
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
                }
            </section>
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

function appendChurchMarkdownInline(container, text, articleUrl) {
    const tokenPattern = /(!?\[[^\]]*\]\([^)]+\)|\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g;
    let lastIndex = 0;
    let match;

    while ((match = tokenPattern.exec(text)) !== null) {
        container.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
        const token = match[0];
        const imageMatch = token.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
        const linkMatch = token.match(/^\[([^\]]*)\]\(([^)]+)\)$/);

        if (imageMatch || linkMatch) {
            const label = imageMatch ? imageMatch[1] : linkMatch[1];
            const target = imageMatch ? imageMatch[2] : linkMatch[2];

            try {
                const url = new URL(target, articleUrl);
                if (url.protocol === "http:" || url.protocol === "https:") {
                    if (imageMatch) {
                        const image = document.createElement("img");
                        image.src = url.href;
                        image.alt = label;
                        container.appendChild(image);
                    } else {
                        const link = document.createElement("a");
                        link.href = url.href;
                        link.textContent = label;
                        container.appendChild(link);
                    }
                } else {
                    container.appendChild(document.createTextNode(token));
                }
            } catch (error) {
                container.appendChild(document.createTextNode(token));
            }
        } else {
            const element = token.startsWith("**")
                ? document.createElement("strong")
                : token.startsWith("`")
                    ? document.createElement("code")
                    : document.createElement("em");
            const delimiterLength = token.startsWith("**") ? 2 : 1;
            element.textContent = token.slice(delimiterLength, -delimiterLength);
            container.appendChild(element);
        }

        lastIndex = tokenPattern.lastIndex;
    }

    container.appendChild(document.createTextNode(text.slice(lastIndex)));
}

function renderChurchMarkdown(markdown, articleUrl) {
    // Преобразует поддерживаемый Markdown в DOM-элементы, не вставляя текст как HTML.
    const body = document.createElement("div");
    body.className = "church-article-body";
    const lines = markdown.replace(/\r\n?/g, "\n").split("\n");
    let index = 0;

    while (index < lines.length) {
        const line = lines[index].trim();
        if (!line) {
            index += 1;
            continue;
        }

        const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
        if (headingMatch) {
            const heading = document.createElement(`h${headingMatch[1].length}`);
            appendChurchMarkdownInline(heading, headingMatch[2], articleUrl);
            body.appendChild(heading);
            index += 1;
            continue;
        }

        const listMatch = line.match(/^([-*+]|\d+\.)\s+(.+)$/);
        if (listMatch) {
            const isOrdered = /^\d/.test(listMatch[1]);
            const list = document.createElement(isOrdered ? "ol" : "ul");
            while (index < lines.length) {
                const itemMatch = lines[index].trim().match(/^([-*+]|\d+\.)\s+(.+)$/);
                if (!itemMatch || /^\d/.test(itemMatch[1]) !== isOrdered) break;
                const item = document.createElement("li");
                appendChurchMarkdownInline(item, itemMatch[2], articleUrl);
                list.appendChild(item);
                index += 1;
            }
            body.appendChild(list);
            continue;
        }

        if (line.startsWith(">")) {
            const quote = document.createElement("blockquote");
            while (index < lines.length && lines[index].trim().startsWith(">")) {
                const quoteLine = lines[index].trim().replace(/^>\s?/, "");
                const paragraph = document.createElement("p");
                appendChurchMarkdownInline(paragraph, quoteLine, articleUrl);
                quote.appendChild(paragraph);
                index += 1;
            }
            body.appendChild(quote);
            continue;
        }

        const paragraphLines = [line];
        index += 1;
        while (index < lines.length) {
            const nextLine = lines[index].trim();
            if (!nextLine || /^(#{1,6})\s+/.test(nextLine) ||
                /^([-*+]|\d+\.)\s+/.test(nextLine) || nextLine.startsWith(">")) {
                break;
            }
            paragraphLines.push(nextLine);
            index += 1;
        }

        const paragraph = document.createElement("p");
        appendChurchMarkdownInline(paragraph, paragraphLines.join(" "), articleUrl);
        body.appendChild(paragraph);
    }

    return body;
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
    article.className = "church-article";

    const title = document.createElement("h1");
    title.textContent = topic.name;
    article.appendChild(title);

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
