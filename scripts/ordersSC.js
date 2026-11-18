// Список орденов и их описание; функции поддерживают показ как отдельно, так и внутри Церкви.
// Внутри Церкви разметка остаётся прежней, отдельная страница использует общий каркас wiki-page.

function renderOrders(targetId = "orders-content") {
    const content = document.getElementById(targetId);

    if (!content) return;

    if (targetId === "church-content") {
        content.innerHTML = renderWikiPage(
            "Церковь · Святые ордена",
            "Святые ордена",
            "Выберите орден, чтобы открыть его описание.",
            renderWikiCards(Object.entries(orders), ([id, order]) => `
                <button class="wiki-card"
                        onclick="showOrder('${id}', '${targetId === 'church-content'}')">
                    <h2>${escapeHtml(order.name)}</h2>
                    <p>${escapeHtml(order.description)}</p>
                </button>
            `)
        );
        return;
    }

    setBreadcrumbs([{ label: "Святые ордена" }]);

    const cards = renderWikiCards(Object.entries(orders), ([id, order]) => `
        <button class="wiki-card" type="button" onclick="showOrder('${id}', false)">
            <span class="wiki-card-meta">${escapeHtml(church.branches[order.branch]?.name || "Орден")}</span>
            <h2>${escapeHtml(order.name)}</h2>
            ${order.description && !isPlaceholderText(order.description)
                ? `<p>${escapeHtml(order.description)}</p>`
                : ""}
        </button>
    `);

    content.innerHTML = renderWikiPage(
        "Церковь",
        "Святые ордена",
        "Выберите орден, чтобы открыть его описание.",
        cards
    );
}

function showOrders(fromChurchContext = false) {
    if (fromChurchContext) {
        showSection("church");
        renderOrders("church-content");
        return;
    }

    showSection("orders", true);
    renderOrders();
}

function showOrder(orderId, fromChurchContext = false, syncRoute = true) {
    const order = orders[orderId];
    const isChurchContext = fromChurchContext === true || fromChurchContext === "true";
    const targetId = isChurchContext ? "church-content" : "orders-content";
    const content = document.getElementById(targetId);

    if (!order || !content) return;

    if (isChurchContext) {
        const match = window.location.hash.match(/^#church\/([^/]+)\/([^/]+)\/topic\/(\d+)/);
        if (match) {
            const [, branchId, chamberId, topicIndex] = match;
            const topic = church.branches[branchId]?.chambers[chamberId]?.topics[Number(topicIndex)];
            if (topic) {
                if (syncRoute) setWikiRoute(`${match[0]}/order/${encodeURIComponent(orderId)}`);
                setChurchBreadcrumbs(branchId, chamberId, topic.name, order.name, Number(topicIndex));
            }
        }

        const hasDescription = order.description && !isPlaceholderText(order.description);

        content.innerHTML = renderWikiPage(
            "Церковь · Святые ордена",
            order.name,
            hasDescription ? order.description : "",
            hasDescription ? "" : `<p class="page-empty">Описание пока не добавлено.</p>`
        );
        return;
    }

    if (syncRoute) setWikiRoute(`#orders/${encodeURIComponent(orderId)}`);
    setBreadcrumbs([
        { label: "Святые ордена", route: "#orders" },
        { label: order.name }
    ]);

    const hasDescription = order.description && !isPlaceholderText(order.description);

    content.innerHTML = renderWikiPage(
        "Церковь · Святые ордена",
        order.name,
        hasDescription ? order.description : "",
        hasDescription ? "" : `<p class="page-empty">Описание пока не добавлено.</p>`
    );
}
