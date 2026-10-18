function renderChurchContent() {
    const content = document.getElementById("church-content");

    if (!content) return;

    setBreadcrumbs([{ label: "Церковь" }]);

    content.innerHTML = `
        <h1>Церковь</h1>
        <p>Выберите ветвь Церкви.</p>
        <div class="wiki-cards church-branch-grid">
            ${Object.entries(church.branches).map(([id, branch]) => `
                <div class="church-branch-item church-branch-item--${id}">
                    <button
                        class="wiki-card church-branch-card church-branch-card--${id}"
                        type="button"
                        data-branch-id="${id}"
                        aria-expanded="false"
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
                        <h2>${branch.name}</h2>
                        <p>${branch.description}</p>
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
            <div
                id="church-branch-chambers"
                class="church-chamber-panel"
                aria-label="Палаты выбранной ветви"
                hidden
            >
                <div class="church-chamber-panel-inner"></div>
            </div>
        </div>
    `;
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
        <h2>${branch.name}: палаты</h2>
        ${chambers.length
            ? renderWikiCards(chambers, ([chamberId, chamber]) => `
                <button
                    class="wiki-card church-chamber-card church-chamber-card--${branchId}"
                    type="button"
                    onclick="showChurchChamber('${branchId}', '${chamberId}')"
                >
                    <h3>${chamber.name}</h3>
                    <p>${chamber.description}</p>
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
                    <h1>${branch.name}</h1>
                </div>
            </header>
            <section class="church-branch-description">
                <h2>О ветви</h2>
                <p>${branch.description}</p>
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
                            <h3>${chamber.name}</h3>
                            <p>${chamber.description}</p>
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
                    <p class="church-branch-eyebrow">${branch.name}</p>
                    <h1>${chamber.name}</h1>
                </div>
            </header>
            <section class="church-branch-description">
                <h2>О палате</h2>
                <p>${chamber.description}</p>
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
                            <h3>${topic.name}</h3>
                            ${topic.description ? `<p>${topic.description}</p>` : ""}
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

function openChurchTopic(branchId, chamberId, topicIndex, syncRoute = true) {
    const branch = church.branches[branchId];
    const chamber = branch?.chambers[chamberId];
    const topic = chamber?.topics[Number(topicIndex)];

    if (!branch || !chamber || !topic) return;

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
    const paragraphs = Array.isArray(topic.content)
        ? topic.content
        : (topic.content ? [topic.content] : ["Статья будет добавлена позже."]);
    paragraphs.forEach(function (text) {
        const paragraph = document.createElement("p");
        paragraph.textContent = text;
        body.appendChild(paragraph);
    });

    article.appendChild(body);
    content.replaceChildren(article);

}
