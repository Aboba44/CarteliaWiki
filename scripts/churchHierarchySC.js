function escapeChurchHierarchyText(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;"
    })[character]);
}

function getChurchHierarchyNodeTitle(node) {
    if (node.title) return node.title;

    if (node.orderId) {
        const order = orders[node.orderId];
        if (!order) throw new Error(`Не найден орден для магистра: ${node.orderId}.`);
        return `Магистр ордена «${order.name}»`;
    }

    const chamber = church.branches[node.branchId]?.chambers[node.chamberId];
    if (!chamber) {
        throw new Error(`Не найдена палата для должности ${node.chamberId}.`);
    }

    const chamberTitle = chamber.name.startsWith("Палата ")
        ? chamber.name.slice("Палата ".length)
        : chamber.name;
    return `Епископ ${chamberTitle}`;
}

function buildChurchHierarchyLayout() {
    const nodeWidth = 236;
    const nodeHeight = 88;
    const horizontalGap = 24;
    const levelGap = 190;
    const padding = 48;
    const rootId = churchHierarchy.rootId;
    if (!churchHierarchy.nodes[rootId]) throw new Error(`Не найдена корневая должность иерархии: ${rootId}.`);

    const visited = new Set();
    const subtreeWidths = new Map();
    let maxDepth = 0;

    function measureSubtree(nodeId, depth = 0) {
        const node = churchHierarchy.nodes[nodeId];
        if (!node) throw new Error(`Не найдена должность в иерархии Церкви: ${nodeId}.`);
        if (visited.has(nodeId)) {
            throw new Error(`Должность ${nodeId} повторяется или образует цикл в иерархии Церкви.`);
        }
        if (!Array.isArray(node.children)) {
            throw new Error(`У должности ${nodeId} должен быть список подчинённых.`);
        }

        visited.add(nodeId);
        maxDepth = Math.max(maxDepth, depth);
        const childWidths = node.children.map(childId => measureSubtree(childId, depth + 1));
        const childrenWidth = childWidths.reduce((total, width) => total + width, 0)
            + Math.max(0, childWidths.length - 1) * horizontalGap;
        const width = Math.max(nodeWidth, childrenWidth);
        subtreeWidths.set(nodeId, width);
        return width;
    }

    const treeWidth = measureSubtree(rootId);
    if (visited.size !== Object.keys(churchHierarchy.nodes).length) {
        throw new Error("В иерархии Церкви есть должности, не связанные с корнем.");
    }

    const positions = [];
    const connectors = [];

    function placeSubtree(nodeId, left, depth = 0, parentBranchId = null) {
        const node = churchHierarchy.nodes[nodeId];
        const subtreeWidth = subtreeWidths.get(nodeId);
        const x = left + (subtreeWidth - nodeWidth) / 2;
        const y = padding + depth * levelGap;
        const branchId = node.branchId || parentBranchId;

        positions.push({ id: nodeId, x, y, width: nodeWidth, height: nodeHeight, branchId });

        if (node.children.length) {
            const childWidth = node.children.reduce(
                (total, childId) => total + subtreeWidths.get(childId),
                0
            ) + (node.children.length - 1) * horizontalGap;
            let childLeft = left + (subtreeWidth - childWidth) / 2;
            const childCenters = [];

            node.children.forEach(childId => {
                const childSubtreeWidth = subtreeWidths.get(childId);
                const childX = childLeft + (childSubtreeWidth - nodeWidth) / 2;
                childCenters.push(childX + nodeWidth / 2);
                placeSubtree(childId, childLeft, depth + 1, branchId);
                childLeft += childSubtreeWidth + horizontalGap;
            });

            const parentCenter = x + nodeWidth / 2;
            const parentBottom = y + nodeHeight;
            const childTop = y + levelGap;
            const connectorY = parentBottom + (childTop - parentBottom) / 2;
            const childLines = childCenters.map(center =>
                `M ${center} ${connectorY} V ${childTop}`
            ).join(" ");

            connectors.push({
                branchId,
                path: `M ${parentCenter} ${parentBottom} V ${connectorY} M ${childCenters[0]} ${connectorY} H ${childCenters[childCenters.length - 1]} ${childLines}`
            });
        }
    }

    placeSubtree(rootId, 0);

    const organizations = Object.entries(churchHierarchy.organizations).map(([id, organization]) => {
        const members = positions.filter(position =>
            churchHierarchy.nodes[position.id].organizationId === id
        );
        if (!members.length) throw new Error(`В организации ${organization.name} нет должностей.`);

        const left = Math.min(...members.map(position => position.x));
        const top = Math.min(...members.map(position => position.y));
        const right = Math.max(...members.map(position => position.x + position.width));
        const bottom = Math.max(...members.map(position => position.y + position.height));
        const horizontalPadding = 16;
        const labelSpace = 34;

        return {
            id,
            name: organization.name,
            kind: organization.kind,
            x: left - horizontalPadding,
            y: top - labelSpace,
            width: right - left + horizontalPadding * 2,
            height: bottom - top + labelSpace + horizontalPadding
        };
    });

    positions.forEach(position => {
        const organizationId = churchHierarchy.nodes[position.id].organizationId;
        if (organizationId && !churchHierarchy.organizations[organizationId]) {
            throw new Error(`Не найдена организация для должности ${position.id}: ${organizationId}.`);
        }
    });

    return {
        width: treeWidth + padding * 2,
        height: padding * 2 + maxDepth * levelGap + nodeHeight,
        positions,
        connectors,
        organizations
    };
}

function renderChurchHierarchyOrganization(organization) {
    return `
        <div
            class="church-hierarchy-organization church-hierarchy-organization--${organization.kind}"
            style="left: ${organization.x}px; top: ${organization.y}px; width: ${organization.width}px; height: ${organization.height}px;"
            role="group"
            aria-label="Организация: ${escapeChurchHierarchyText(organization.name)}"
        >
            <span class="church-hierarchy-organization-title">${escapeChurchHierarchyText(organization.name)}</span>
        </div>
    `;
}

function renderChurchHierarchyPosition(entry) {
    const node = churchHierarchy.nodes[entry.id];
    const branchId = node.branchId || entry.branchId;
    const branch = branchId ? church.branches[branchId] : null;
    if (branchId && !branch) throw new Error(`Не найдена ветвь Церкви: ${branchId}.`);

    const title = getChurchHierarchyNodeTitle(node);
    const description = node.description || "Описание пока не добавлено.";
    const tooltipId = `church-hierarchy-description-${entry.id}`;
    const classNames = [
        "church-hierarchy-position",
        `church-hierarchy-position--${node.kind}`
    ];
    if (branchId) classNames.push(`church-hierarchy-position--${branchId}`);
    if (node.organizationId) {
        const organization = churchHierarchy.organizations[node.organizationId];
        classNames.push(`church-hierarchy-position--organization-${organization.kind}`);
    }

    return `
        <div
            class="${classNames.join(" ")}"
            style="left: ${entry.x}px; top: ${entry.y}px; width: ${entry.width}px; height: ${entry.height}px;"
            role="group"
            tabindex="0"
            aria-label="${escapeChurchHierarchyText(title)}"
            aria-describedby="${tooltipId}"
        >
            <span class="church-hierarchy-position-title">${escapeChurchHierarchyText(title)}</span>
            ${node.kind === "archbishop" ? `<small>${escapeChurchHierarchyText(branch.name)}</small>` : ""}
            <span class="church-hierarchy-tooltip" id="${tooltipId}" role="tooltip">${escapeChurchHierarchyText(description)}</span>
        </div>
    `;
}

function renderChurchHierarchyScreen() {
    const screen = document.getElementById("church-hierarchy-screen");
    if (!screen) throw new Error("Не найден контейнер схемы иерархии Церкви.");

    const layout = buildChurchHierarchyLayout();
    screen.innerHTML = `
        <div class="church-hierarchy-page">
            <button class="church-hierarchy-back" type="button" onclick="returnFromChurchHierarchy()">
                <span aria-hidden="true">←</span> Вернуться
            </button>
            <h1>Иерархия церкви</h1>
            <div
                id="church-hierarchy-pan-viewport"
                class="church-hierarchy-pan-viewport"
                role="region"
                aria-label="Схема власти Церкви. Перетаскивайте для перемещения, прокручивайте для изменения масштаба."
            >
                <div
                    class="church-hierarchy-canvas"
                    style="width: ${layout.width}px; height: ${layout.height}px;"
                >
                    ${layout.organizations.map(renderChurchHierarchyOrganization).join("")}
                    <svg
                        class="church-hierarchy-connectors"
                        width="${layout.width}"
                        height="${layout.height}"
                        viewBox="0 0 ${layout.width} ${layout.height}"
                        aria-hidden="true"
                    >
                        ${layout.connectors.map(connector => `
                            <path
                                class="church-hierarchy-connector${connector.branchId ? ` church-hierarchy-connector--${connector.branchId}` : ""}"
                                d="${connector.path}"
                            ></path>
                        `).join("")}
                    </svg>
                    ${layout.positions.map(renderChurchHierarchyPosition).join("")}
                </div>
            </div>
            <p class="church-hierarchy-pan-hint">Перетаскивайте схему · Колёсико мыши — масштаб</p>
            <div class="church-hierarchy-zoom-controls" role="group" aria-label="Масштаб схемы">
                <button type="button" data-zoom="out" aria-label="Отдалить" title="Отдалить">−</button>
                <output class="church-hierarchy-zoom-level" aria-live="polite">100%</output>
                <button type="button" data-zoom="in" aria-label="Приблизить" title="Приблизить">+</button>
                <button type="button" data-zoom="reset" aria-label="Сбросить вид" title="Сбросить вид">↺</button>
            </div>
        </div>
    `;

    initializeChurchHierarchyPanning();
}

function initializeChurchHierarchyPanning() {
    const viewport = document.getElementById("church-hierarchy-pan-viewport");
    const canvas = viewport?.querySelector(".church-hierarchy-canvas");
    if (!viewport || !canvas) throw new Error("Не удалось инициализировать перемещение схемы Церкви.");
    const zoomLevel = document.querySelector(".church-hierarchy-zoom-level");
    const minZoom = 0.12;
    const maxZoom = 3;

    let activePointerId = null;
    let startX = 0;
    let startY = 0;
    let startPanX = 0;
    let startPanY = 0;
    let currentPanX = 0;
    let currentPanY = 0;
    let isDragging = false;

    function updateView(zoom, panX, panY) {
        canvas.dataset.zoom = String(zoom);
        canvas.dataset.panX = String(panX);
        canvas.dataset.panY = String(panY);
        canvas.style.setProperty("--zoom", String(zoom));
        canvas.style.setProperty("--pan-x", `${panX}px`);
        canvas.style.setProperty("--pan-y", `${panY}px`);
        if (zoomLevel) zoomLevel.textContent = `${Math.round(zoom * 100)}%`;
    }

    function zoomAt(factor, clientX, clientY) {
        const bounds = viewport.getBoundingClientRect();
        const currentZoom = Number(canvas.dataset.zoom || 1);
        const nextZoom = Math.min(maxZoom, Math.max(minZoom, currentZoom * factor));
        if (nextZoom === currentZoom) return;

        const panX = Number(canvas.dataset.panX || 0);
        const panY = Number(canvas.dataset.panY || 0);
        const baseLeft = bounds.width / 2 - canvas.offsetWidth / 2;
        const baseTop = canvas.offsetTop;
        const localX = (clientX - bounds.left - baseLeft - panX) / currentZoom;
        const localY = (clientY - bounds.top - baseTop - panY) / currentZoom;
        const nextPanX = clientX - bounds.left - baseLeft - localX * nextZoom;
        const nextPanY = clientY - bounds.top - baseTop - localY * nextZoom;

        updateView(nextZoom, nextPanX, nextPanY);
    }

    viewport.addEventListener("pointerdown", event => {
        if (event.button !== 0) return;

        activePointerId = event.pointerId;
        startX = event.clientX;
        startY = event.clientY;
        startPanX = Number(canvas.dataset.panX || 0);
        startPanY = Number(canvas.dataset.panY || 0);
        currentPanX = startPanX;
        currentPanY = startPanY;
        isDragging = false;
        viewport.setPointerCapture(event.pointerId);
    });

    viewport.addEventListener("pointermove", event => {
        if (event.pointerId !== activePointerId) return;

        const deltaX = event.clientX - startX;
        const deltaY = event.clientY - startY;
        if (!isDragging && Math.hypot(deltaX, deltaY) < 4) return;

        isDragging = true;
        viewport.classList.add("is-dragging");
        event.preventDefault();
        currentPanX = startPanX + deltaX;
        currentPanY = startPanY + deltaY;
        canvas.style.setProperty("--pan-x", `${currentPanX}px`);
        canvas.style.setProperty("--pan-y", `${currentPanY}px`);
    });

    function finishDragging(event) {
        if (event.pointerId !== activePointerId) return;

        if (isDragging) {
            updateView(Number(canvas.dataset.zoom || 1), currentPanX, currentPanY);
        }

        activePointerId = null;
        isDragging = false;
        viewport.classList.remove("is-dragging");
        if (viewport.hasPointerCapture(event.pointerId)) {
            viewport.releasePointerCapture(event.pointerId);
        }
    }

    viewport.addEventListener("pointerup", finishDragging);
    viewport.addEventListener("pointercancel", finishDragging);

    viewport.addEventListener("wheel", event => {
        event.preventDefault();
        zoomAt(Math.exp(-event.deltaY * 0.0015), event.clientX, event.clientY);
    }, { passive: false });

    document.querySelector(".church-hierarchy-zoom-controls")?.addEventListener("click", event => {
        const button = event.target.closest("[data-zoom]");
        if (!button) return;

        const bounds = viewport.getBoundingClientRect();
        const centerX = bounds.left + bounds.width / 2;
        const centerY = bounds.top + bounds.height / 2;

        if (button.dataset.zoom === "reset") {
            updateView(1, 0, 0);
        } else {
            zoomAt(button.dataset.zoom === "in" ? 1.2 : 1 / 1.2, centerX, centerY);
        }
    });
}

function showChurchHierarchy(syncRoute = true) {
    const app = document.querySelector(".app");
    const screen = document.getElementById("church-hierarchy-screen");
    if (!app || !screen) throw new Error("Не найдена страница для отображения иерархии Церкви.");

    renderChurchHierarchyScreen();
    app.hidden = true;
    screen.hidden = false;
    if (syncRoute) setWikiRoute("#church/hierarchy");
}

function hideChurchHierarchyScreen() {
    const screen = document.getElementById("church-hierarchy-screen");
    const app = document.querySelector(".app");
    if (screen) screen.hidden = true;
    if (app) app.hidden = false;
}

function returnFromChurchHierarchy() {
    hideChurchHierarchyScreen();
    showChurch();
}
