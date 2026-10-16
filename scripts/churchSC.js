function renderChurchContent() {
    const content = document.getElementById("church-content");

    if (!content) return;

    setBreadcrumbs([{ label: "Церковь" }]);

    content.innerHTML = `
        <h1>Церковь</h1>
        <p>Выберите ветвь Церкви.</p>
        ${renderWikiCards(Object.entries(church.branches), ([id, branch]) => `
            <button class="wiki-card"
                    onclick="showChurchBranch('${id}')">
                <h2>${branch.name}</h2>
                <p>${branch.description}</p>
            </button>
        `)}
    `;
}

function showChurch() {
    showSection("church", true);
    renderChurchContent();
}


function showChurchBranch(branchId, syncRoute = true) {
    const branch = church.branches[branchId];

    if (!branch) return;

    if (syncRoute) setWikiRoute(`#church/${encodeURIComponent(branchId)}`);

    showSection("church");
    setBreadcrumbs([
        { label: "Церковь", route: "#church" },
        { label: branch.name }
    ]);

    const content = document.getElementById("church-content");

    content.innerHTML = `
        <h1>${branch.name}</h1>
        <p>${branch.description}</p>

        <h2>Палаты</h2>
        ${renderWikiCards(Object.entries(branch.chambers), ([id, chamber]) => `
            <button class="wiki-card"
                    onclick="showChurchChamber('${branchId}', '${id}')">
                <h2>${chamber.name}</h2>
                <p>${chamber.description}</p>
            </button>
        `)}
    `;

}


function showChurchChamber(branchId, chamberId, syncRoute = true) {
    const branch = church.branches[branchId];
    if (!branch) return;

    const chamber = branch.chambers[chamberId];

    if (!chamber) return;

    if (syncRoute) setWikiRoute(`#church/${encodeURIComponent(branchId)}/${encodeURIComponent(chamberId)}`);
    setBreadcrumbs([
        { label: "Церковь", route: "#church" },
        { label: branch.name, route: `#church/${encodeURIComponent(branchId)}` },
        { label: chamber.name }
    ]);

    showSection("church");
    setBreadcrumbs([
        { label: "Церковь", route: "#church" },
        { label: branch.name, route: `#church/${encodeURIComponent(branchId)}` },
        { label: chamber.name }
    ]);

    const content = document.getElementById("church-content");

    content.innerHTML = `
        <h1>${chamber.name}</h1>
        <p>${chamber.description}</p>

        <h2>Темы</h2>
        ${renderWikiCards(chamber.topics, topic => `
            <button class="wiki-card"
                    onclick="openChurchTopic('${branchId}', '${chamberId}', '${chamber.topics.indexOf(topic)}')">
                <h2>${topic.name}</h2>
            </button>
        `)}
    `;

}


function setChurchBreadcrumbs(branchId, chamberId, topicName, currentName, topicIndex) {
    const branch = church.branches[branchId];
    const chamber = branch?.chambers[chamberId];
    if (!branch || !chamber) return;

    setBreadcrumbs([
        { label: "Церковь", route: "#church" },
        { label: branch.name, route: `#church/${encodeURIComponent(branchId)}` },
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
