// Раздел «Миры»: интерактивная карта Пузыря Бигель и страницы пространств.
// Всё содержимое рисуется в #worlds-content; данные — data/worlds.js и data/dimensions.js.

const WORLD_KIND_LABELS = {
    elder: "Измерение старших богов",
    garden: "Сад",
    mortal: "Мир смертных",
    tumor: "За пределами пузыря"
};

// Компоновка карты — это вёрстка, а не лор, поэтому хранится здесь, а не в данных.
const WORLD_BUBBLE_LAYOUT = {
    viewBox: { w: 1120, h: 680 },
    nodes: {
        nikrason: { x: 560, y: 158 },
        doGat: { x: 376, y: 302 },
        soGat: { x: 744, y: 302 },
        roGat: { x: 560, y: 500 },
        cartelia: { x: 560, y: 342 },
        abyss: { x: 190, y: 440 },
        zlatograd: { x: 930, y: 440 }
    }
};

function getWorldsContainer() {
    return document.getElementById("worlds-content");
}

function worldKindLabel(world) {
    return WORLD_KIND_LABELS[world.kind] || "Мир";
}

function worldMonogram(name) {
    return Array.from(String(name || "").trim())[0]?.toUpperCase() || "?";
}

function renderWorldsBubbleArt() {
    return `
        <svg class="worlds-bubble-art" viewBox="0 0 1120 680" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">
            <defs>
                <radialGradient id="wb-void" cx="50%" cy="42%" r="72%">
                    <stop offset="0%" stop-color="#1b2836"/>
                    <stop offset="55%" stop-color="#0b1119"/>
                    <stop offset="100%" stop-color="#05070b"/>
                </radialGradient>
                <radialGradient id="wb-bubble" cx="42%" cy="34%" r="78%">
                    <stop offset="0%" stop-color="rgba(78,104,138,0.34)"/>
                    <stop offset="52%" stop-color="rgba(26,36,52,0.55)"/>
                    <stop offset="100%" stop-color="rgba(5,8,14,0.86)"/>
                </radialGradient>
                <radialGradient id="wb-core" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stop-color="rgba(200,167,107,0.16)"/>
                    <stop offset="62%" stop-color="rgba(200,167,107,0.04)"/>
                    <stop offset="100%" stop-color="rgba(200,167,107,0)"/>
                </radialGradient>
                <radialGradient id="wb-rim" cx="50%" cy="50%" r="50%">
                    <stop offset="72%" stop-color="rgba(200,167,107,0)"/>
                    <stop offset="90%" stop-color="rgba(200,167,107,0.30)"/>
                    <stop offset="97%" stop-color="rgba(230,201,136,0.85)"/>
                    <stop offset="100%" stop-color="rgba(230,201,136,0)"/>
                </radialGradient>
            </defs>

            <rect width="1120" height="680" fill="url(#wb-void)"/>

            <circle class="worlds-dust" cx="118" cy="120" r="1.4"/>
            <circle class="worlds-dust" cx="298" cy="66" r="1.1"/>
            <circle class="worlds-dust" cx="842" cy="104" r="1.3"/>
            <circle class="worlds-dust" cx="1006" cy="232" r="1.1"/>
            <circle class="worlds-dust" cx="96" cy="330" r="1.2"/>
            <circle class="worlds-dust" cx="1038" cy="480" r="1.4"/>
            <circle class="worlds-dust" cx="470" cy="88" r="1"/>
            <circle class="worlds-dust" cx="656" cy="600" r="1.2"/>
            <circle class="worlds-dust" cx="150" cy="572" r="1.1"/>
            <circle class="worlds-dust" cx="950" cy="596" r="1.3"/>

            <ellipse class="worlds-strain" cx="208" cy="440" rx="96" ry="74" fill="rgba(0,0,0,0.35)"/>
            <ellipse class="worlds-strain" cx="912" cy="440" rx="96" ry="74" fill="rgba(0,0,0,0.35)"/>

            <ellipse class="worlds-bubble-body" cx="560" cy="340" rx="380" ry="250" fill="url(#wb-bubble)"/>
            <ellipse class="worlds-bubble-core" cx="560" cy="340" rx="330" ry="215" fill="url(#wb-core)"/>
            <ellipse class="worlds-bubble-inner" cx="560" cy="340" rx="352" ry="224" fill="none" stroke="rgba(200,167,107,0.16)" stroke-width="1"/>
            <ellipse class="worlds-bubble-rim" cx="560" cy="340" rx="380" ry="250" fill="none" stroke="url(#wb-rim)" stroke-width="3"/>
        </svg>
    `;
}

function renderWorldNode(worldId, world) {
    const layout = WORLD_BUBBLE_LAYOUT.nodes[worldId];
    if (!layout) return "";

    const left = (layout.x / WORLD_BUBBLE_LAYOUT.viewBox.w * 100).toFixed(3);
    const top = (layout.y / WORLD_BUBBLE_LAYOUT.viewBox.h * 100).toFixed(3);
    const kindLabel = worldKindLabel(world);
    const monogram = escapeHtml(worldMonogram(world.name));

    return `
        <button
            type="button"
            class="worlds-node worlds-node--${world.zone} worlds-node--${world.kind} worlds-node--${worldId}"
            style="left:${left}%;top:${top}%"
            data-world-id="${worldId}"
            onclick="showWorld('${worldId}')"
            aria-label="${escapeHtml(world.name)} — ${escapeHtml(kindLabel)}"
        >
            <span class="worlds-node-orb" aria-hidden="true">
                <span class="worlds-node-monogram">${monogram}</span>
            </span>
            <span class="worlds-node-name">${escapeHtml(world.name)}</span>
        </button>
    `;
}

function renderWorldsBubble() {
    const nodes = Object.entries(worlds)
        .map(([id, world]) => renderWorldNode(id, world))
        .join("");

    return `
        <div class="worlds-bubble">
            <div class="worlds-bubble-scroll">
                <div class="worlds-bubble-stage">
                    ${renderWorldsBubbleArt()}
                    <div class="worlds-bubble-nodes">${nodes}</div>
                </div>
            </div>
            <p class="worlds-scroll-hint">Карту можно прокручивать по горизонтали.</p>
            <div class="worlds-bubble-status" aria-live="polite">
                <span class="worlds-bubble-status-name">${escapeHtml(worldBubble.name)}</span>
                <span class="worlds-bubble-status-meta">${escapeHtml(worldBubble.summary)}</span>
            </div>
            <div class="worlds-legend" aria-hidden="true">
                <span class="worlds-legend-item"><i class="worlds-legend-dot worlds-legend-dot--inside"></i>Внутри пузыря</span>
                <span class="worlds-legend-item"><i class="worlds-legend-dot worlds-legend-dot--outside"></i>За пределами</span>
            </div>
        </div>
    `;
}

function initWorldsBubble(container) {
    const stage = container.querySelector(".worlds-bubble-stage");
    const statusName = container.querySelector(".worlds-bubble-status-name");
    const statusMeta = container.querySelector(".worlds-bubble-status-meta");
    if (!stage || !statusName || !statusMeta) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    if (finePointer && !reduceMotion) {
        stage.addEventListener("pointermove", function (event) {
            const rect = stage.getBoundingClientRect();
            const px = (event.clientX - rect.left) / rect.width - 0.5;
            const py = (event.clientY - rect.top) / rect.height - 0.5;
            stage.style.setProperty("--tilt-x", (py * -4).toFixed(2) + "deg");
            stage.style.setProperty("--tilt-y", (px * 4).toFixed(2) + "deg");
        });

        stage.addEventListener("pointerleave", function () {
            stage.style.setProperty("--tilt-x", "0deg");
            stage.style.setProperty("--tilt-y", "0deg");
        });
    }

    function setStatus(worldId) {
        const world = worlds[worldId];
        if (!world) return;
        statusName.textContent = world.name;
        statusMeta.textContent = [worldKindLabel(world), world.summary].filter(Boolean).join(" · ");
    }

    function resetStatus() {
        statusName.textContent = worldBubble.name;
        statusMeta.textContent = worldBubble.summary;
    }

    container.querySelectorAll(".worlds-node").forEach(function (button) {
        const worldId = button.dataset.worldId;
        button.addEventListener("pointerenter", function () { setStatus(worldId); });
        button.addEventListener("focusin", function () { setStatus(worldId); });
        button.addEventListener("pointerleave", resetStatus);
        button.addEventListener("focusout", resetStatus);
    });

    // На узких экранах карта шире экрана: показываем её середину, а не левый край.
    const scroll = container.querySelector(".worlds-bubble-scroll");
    if (scroll) {
        window.requestAnimationFrame(function () {
            if (scroll.scrollWidth > scroll.clientWidth) {
                scroll.scrollLeft = Math.max(0, (scroll.scrollWidth - scroll.clientWidth) / 2);
            }
        });
    }
}

function renderWorlds() {
    const content = getWorldsContainer();
    if (!content) return;

    setBreadcrumbs([{ label: "Миры" }]);

    content.innerHTML = renderWikiPage(
        "Пузырь Бигель",
        "Миры",
        worldBubble.summary,
        renderWorldsBubble()
    );

    initWorldsBubble(content);
}

function showWorlds() {
    showSection("worlds", true);
    renderWorlds();
}

function showWorld(worldId, syncRoute = true) {
    const content = getWorldsContainer();
    const world = worlds[worldId];

    if (!content || !world) return;

    if (syncRoute) setWikiRoute(`#worlds/world/${encodeURIComponent(worldId)}`);
    setBreadcrumbs([
        { label: "Миры", route: "#worlds" },
        { label: world.name }
    ]);

    const kindLabel = worldKindLabel(world);
    const hasDescription = world.description && !isPlaceholderText(world.description);
    const hasSummary = world.summary && !isPlaceholderText(world.summary);
    const owner = world.ownerGod && gods[world.ownerGod] ? gods[world.ownerGod].name : null;
    const zoneBadge = world.zone === "outside"
        ? `<span class="worlds-zone-badge worlds-zone-badge--outside">За пределами пузыря</span>`
        : `<span class="worlds-zone-badge worlds-zone-badge--inside">Внутри пузыря</span>`;

    const bodyParts = [];
    bodyParts.push(`
        <div class="worlds-page-meta">
            ${zoneBadge}
            <span class="worlds-page-kind">${escapeHtml(kindLabel)}</span>
            ${owner ? `<span class="worlds-page-owner">${escapeHtml(owner)}</span>` : ""}
        </div>
    `);

    if (hasDescription) {
        bodyParts.push(`<div class="wiki-article"><p>${escapeHtml(world.description)}</p></div>`);
    } else {
        bodyParts.push(`<p class="page-empty">Описание пока не добавлено.</p>`);
    }

    if (world.map) {
        bodyParts.push(`
            <figure class="worlds-map">
                <img src="${escapeHtml(world.map)}" alt="Карта — ${escapeHtml(world.name)}" loading="lazy">
                <figcaption>Карта</figcaption>
            </figure>
        `);
    }

    const lead = hasSummary && world.summary !== world.description ? world.summary : "";

    content.innerHTML = renderWikiPage("Миры", world.name, lead, bodyParts.join(""));
}

function showDimension(dimensionId, syncRoute = true) {
    const content = getWorldsContainer();
    const dimension = dimensions[dimensionId];

    if (!content || !dimension) return;

    if (syncRoute) setWikiRoute(`#worlds/dimension/${encodeURIComponent(dimensionId)}`);
    setBreadcrumbs([
        { label: "Миры", route: "#worlds" },
        { label: "Пространственные явления", route: "#worlds" },
        { label: dimension.name }
    ]);

    const notes = (dimension.notes || []).filter(note => !isPlaceholderText(note));
    const hasDescription = dimension.description && !isPlaceholderText(dimension.description);
    const bodyParts = [];

    if (hasDescription) {
        bodyParts.push(`<p>${escapeHtml(dimension.description)}</p>`);
    }

    if (notes.length) {
        bodyParts.push(`<ul>${notes.map(note => `<li>${escapeHtml(note)}</li>`).join("")}</ul>`);
    }

    content.innerHTML = renderWikiPage(
        "Миры · Пространственные явления",
        dimension.name,
        dimension.summary,
        bodyParts.length
            ? `<div class="wiki-article">${bodyParts.join("")}</div>`
            : (isPlaceholderText(dimension.summary) ? `<p class="page-empty">Описание пока не добавлено.</p>` : "")
    );
}
