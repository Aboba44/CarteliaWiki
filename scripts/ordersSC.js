function renderOrders(targetId = "orders-content") {
    const content = document.getElementById(targetId);

    if (!content) return;

    if (targetId === "orders-content") {
        setBreadcrumbs([{ label: "Святые ордена" }]);
    }

    content.innerHTML = `
        <h1>Святые ордена</h1>
        <p>Выберите орден, чтобы открыть его описание.</p>
        ${renderWikiCards(Object.entries(orders), ([id, order]) => `
            <button class="wiki-card"
                    onclick="showOrder('${id}', '${targetId === 'church-content'}')">
                <h2>${order.name}</h2>
                <p>${order.description}</p>
            </button>
        `)}
    `;
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
    const targetId = fromChurchContext === true || fromChurchContext === "true" ? "church-content" : "orders-content";
    const content = document.getElementById(targetId);

    if (!order || !content) return;

    if (fromChurchContext === true || fromChurchContext === "true") {
        const match = window.location.hash.match(/^#church\/([^/]+)\/([^/]+)\/topic\/(\d+)/);
        if (match) {
            const [, branchId, chamberId, topicIndex] = match;
            const topic = church.branches[branchId]?.chambers[chamberId]?.topics[Number(topicIndex)];
            if (topic) {
                if (syncRoute) setWikiRoute(`${match[0]}/order/${encodeURIComponent(orderId)}`);
                setChurchBreadcrumbs(branchId, chamberId, topic.name, order.name, Number(topicIndex));
            }
        }
    } else if (syncRoute) {
        setWikiRoute(`#orders/${encodeURIComponent(orderId)}`);
        setBreadcrumbs([
            { label: "Святые ордена", route: "#orders" },
            { label: order.name }
        ]);
    }

    content.innerHTML = `
        <h1>${order.name}</h1>
        <p>${order.description}</p>
    `;
}
