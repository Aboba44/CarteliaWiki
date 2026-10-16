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
        author: "От автора"
    };

    return labels[section] || section;
}


function renderWikiCards(items, renderItem) {
    return `
        <div class="wiki-cards">
            ${items.map(renderItem).join("")}
        </div>
    `;
}
