// Рендер категорий пантеона и отдельной страницы выбранного бога.
/* =========================
   БОГИ
   ========================= */

let currentGodPantheon = "indigenous";

function showGod(god) {
    const content = document.getElementById("gods-content");
    const data = gods[god];

    if (!content) return;

    if (!data) {
        content.innerHTML = renderWikiPage(
            "Боги",
            "Бог не найден",
            "",
            `<p class="page-empty">Проверьте ссылку на статью.</p>`
        );
        return;
    }

    const pantheonId = data.pantheon || "indigenous";
    const pantheon = godPantheons[pantheonId];
    const category = pantheon?.categories[data.category];

    setBreadcrumbs([
        { label: "Боги", route: `#gods/${pantheonId}` },
        ...(category ? [{
            label: category.name,
            route: `#gods/${pantheonId}/category/${data.category}`
        }] : []),
        { label: data.name || god }
    ]);

    const imageHtml = data.image
        ? `<img src="${escapeHtml(data.image)}" alt="Изображение ${escapeHtml(data.name || god)}" decoding="async">`
        : `<span class="god-image-placeholder">${escapeHtml(data.imagePlaceholder || "Изображение пока не добавлено.")}</span>`;

    content.innerHTML = renderWikiPage(
        [pantheon?.name, category?.name].filter(Boolean).join(" · "),
        data.name || god,
        data.title || "",
        `<div class="god-page">
            <div class="god-page-copy">
                <h3>Описание</h3>
                <p>${escapeHtml(data.description || "Описание пока не добавлено.")}</p>
            </div>
            <div class="god-image">${imageHtml}</div>
        </div>`
    );
}

function renderGods(pantheonId = currentGodPantheon) {
    const content = document.getElementById("gods-content");
    const pantheon = godPantheons[pantheonId];

    if (!content || !pantheon) return;

    currentGodPantheon = pantheonId;

    setBreadcrumbs([
        { label: "Боги", route: "#gods" },
        { label: pantheon.name }
    ]);

    content.innerHTML = renderWikiPage(
        "Пантеон",
        pantheon.name,
        "Выберите категорию или бога, чтобы открыть статью.",
        `<div id="god-list" class="god-list"></div>`
    );

    const list = document.getElementById("god-list");
    if (!list) return;

    const categories = new Map();

    Object.entries(gods).forEach(function ([key, data]) {
        if ((data.pantheon || "indigenous") !== pantheonId || data.standalone) return;

        const category = data.category || "uncategorized";
        if (!categories.has(category)) {
            categories.set(category, []);
        }
        categories.get(category).push([key, data]);
    });

    list.replaceChildren();

    const pantheonCategoryOrder = pantheonId === "indigenous"
        ? ["senior", "junior", "demigod", "heraldKitil", "heraldIbel", "heraldAlimesa"]
        : Object.keys(pantheon.categories);
    const categoryKeys = [
        ...pantheonCategoryOrder,
        ...Array.from(categories.keys()).filter(function (key) {
            return !pantheon.categories[key];
        })
    ];
    const heraldCategories = ["heraldKitil", "heraldIbel", "heraldAlimesa"];
    const heraldColumns = document.createElement("div");
    heraldColumns.className = "god-herald-columns";

    const heraldHeading = document.createElement("h3");
    heraldHeading.className = "god-category god-herald-heading";

    const heraldToggle = document.createElement("button");
    heraldToggle.type = "button";
    heraldToggle.className = "god-category-toggle";
    heraldToggle.id = "god-herald-definition-toggle";
    heraldToggle.textContent = "Вестники";
    heraldToggle.setAttribute("aria-label", heraldToggle.textContent);
    heraldToggle.setAttribute("aria-expanded", "false");

    const sharedHeraldDefinition = document.createElement("div");
    sharedHeraldDefinition.className = "god-category-definition";
    sharedHeraldDefinition.id = "god-herald-definition";
    sharedHeraldDefinition.setAttribute("role", "region");
    sharedHeraldDefinition.setAttribute("aria-labelledby", heraldToggle.id);
    sharedHeraldDefinition.textContent = heraldDefinition || "Определение пока не добавлено.";
    sharedHeraldDefinition.hidden = true;

    heraldToggle.setAttribute("aria-controls", sharedHeraldDefinition.id);
    heraldToggle.addEventListener("click", function () {
        const isExpanded = heraldToggle.getAttribute("aria-expanded") === "true";
        heraldToggle.setAttribute("aria-expanded", String(!isExpanded));
        sharedHeraldDefinition.hidden = isExpanded;
    });
    heraldHeading.appendChild(heraldToggle);

    categoryKeys.forEach(function (categoryKey, index) {
        const items = categories.get(categoryKey) || [];
        const category = pantheon.categories[categoryKey];
        const isHeraldCategory = heraldCategories.includes(categoryKey);
        const heading = document.createElement("h3");
        heading.className = "god-category";
        let definition = null;

        if (isHeraldCategory) {
            const label = document.createElement("span");
            label.className = "god-herald-category-label";
            label.textContent = category?.name || categoryKey;
            heading.appendChild(label);
        } else {
            const toggle = document.createElement("button");
            toggle.type = "button";
            toggle.className = "god-category-toggle";
            toggle.id = `god-category-toggle-${index}`;
            toggle.textContent = category?.name || (categoryKey === "uncategorized" ? "Без категории" : categoryKey);
            toggle.setAttribute("aria-label", toggle.textContent);
            toggle.setAttribute("aria-expanded", "false");

            definition = document.createElement("div");
            definition.className = "god-category-definition";
            definition.id = `god-category-definition-${index}`;
            definition.setAttribute("role", "region");
            definition.setAttribute("aria-labelledby", toggle.id);
            definition.textContent = category?.definition || "Определение пока не добавлено.";
            definition.hidden = true;

            toggle.setAttribute("aria-controls", definition.id);
            toggle.addEventListener("click", function () {
                const isExpanded = toggle.getAttribute("aria-expanded") === "true";
                toggle.setAttribute("aria-expanded", String(!isExpanded));
                definition.hidden = isExpanded;
            });

            heading.appendChild(toggle);
        }

        const categoryBlock = document.createElement("div");
        categoryBlock.className = "god-category-block";
        categoryBlock.id = `god-category-${categoryKey}`;

        const group = document.createElement("div");
        group.className = "god-buttons";
        if (categoryKey === "senior" || categoryKey === "junior") {
            group.classList.add("god-buttons-aligned");
        }

        items.forEach(function ([key, data]) {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "god-button";
            if (data.image) {
                button.classList.add("god-button-has-image");
            }

            const name = document.createElement("strong");
            name.className = "god-button-name";
            name.textContent = data.name || key;
            if ((data.name || key).length > 30) {
                button.classList.add("god-button-wide");
            }

            if (data.image) {
                const image = document.createElement("img");
                image.className = "god-button-image";
                image.src = data.image;
                image.alt = "";
                image.loading = "lazy";
                image.decoding = "async";
                button.appendChild(image);
            } else {
                const imagePlaceholder = document.createElement("span");
                imagePlaceholder.className = "god-button-image-placeholder";
                imagePlaceholder.setAttribute("aria-hidden", "true");
                button.appendChild(imagePlaceholder);
            }

            const overlay = document.createElement("span");
            overlay.className = "god-button-overlay";
            overlay.appendChild(name);

            if (data.title) {
                const title = document.createElement("span");
                title.className = "god-button-title";
                title.textContent = data.title;
                overlay.appendChild(title);
            }

            const description = document.createElement("span");
            description.className = "god-button-description";
            const fullDescription = data.description || "Описание пока не добавлено.";
            description.textContent = fullDescription.length > 118
                ? `${fullDescription.slice(0, 115).trimEnd()}...`
                : fullDescription;
            overlay.appendChild(description);
            button.appendChild(overlay);

            button.addEventListener("pointerdown", function (event) {
                if (event.pointerType !== "touch") return;

                button.touchStartX = event.clientX;
                button.touchStartY = event.clientY;
                button.touchMoved = false;
            });
            button.addEventListener("pointermove", function (event) {
                if (event.pointerType !== "touch" || button.touchMoved) return;

                const distanceX = event.clientX - button.touchStartX;
                const distanceY = event.clientY - button.touchStartY;
                button.touchMoved = Math.hypot(distanceX, distanceY) > 10;
            });
            button.addEventListener("pointercancel", function () {
                button.touchMoved = true;
            });
            button.addEventListener("click", function (event) {
                activateGodButton(button, key, event);
            });
            group.appendChild(button);
        });

        if (items.length === 0) {
            const emptyState = document.createElement("p");
            emptyState.className = "god-empty-state";
            emptyState.textContent = "Боги пока не добавлены.";
            group.appendChild(emptyState);
        }

        categoryBlock.appendChild(heading);
        if (!isHeraldCategory) {
            categoryBlock.appendChild(definition);
        }
        categoryBlock.appendChild(group);

        if (isHeraldCategory) {
            if (!heraldColumns.isConnected) {
                list.append(heraldHeading, sharedHeraldDefinition);
                list.appendChild(heraldColumns);
            }
            heraldColumns.appendChild(categoryBlock);
        } else {
            list.appendChild(categoryBlock);
        }
    });
}

function isMobileGodLayout() {
    return window.matchMedia("(max-width: 700px)").matches;
}

function activateGodButton(button, godKey, event) {
    if (!isMobileGodLayout()) {
        openGodPage(godKey);
        return;
    }

    if (button.touchMoved) {
        button.touchMoved = false;
        delete button.dataset.lastTap;
        button.classList.remove("is-tap-ready");
        return;
    }

    const now = Date.now();
    const lastTap = Number(button.dataset.lastTap || 0);
    const isKeyboardActivation = event.detail === 0;

    if (isKeyboardActivation || now - lastTap <= 600) {
        delete button.dataset.lastTap;
        button.classList.remove("is-tap-ready");
        openGodPage(godKey);
        return;
    }

    button.dataset.lastTap = String(now);
    button.classList.add("is-tap-ready");
    window.setTimeout(function () {
        if (Number(button.dataset.lastTap) === now) {
            delete button.dataset.lastTap;
            button.classList.remove("is-tap-ready");
        }
    }, 650);
}

function showGods(pantheonId = "indigenous", addHistory = true) {
    if (!godPantheons[pantheonId]) return;

    currentGodPantheon = pantheonId;
    closeFactionMenu();

    const route = `#gods/${pantheonId}`;
    if (addHistory && window.location.hash !== route) {
        setWikiRoute(route);
    }

    showSection("gods", true, false, false);
}

function openGodPage(god) {
    const data = gods[god];
    if (!data) return;

    const pantheonId = data.pantheon || "indigenous";
    if (!godPantheons[pantheonId]) return;
    closeFactionMenu();

    if (currentSection !== "gods" || currentGodPantheon !== pantheonId) {
        showGods(pantheonId);
    }

    setWikiRoute(`#gods/${pantheonId}/god/${encodeURIComponent(god)}`);
    showGod(god);
}

function handleGodRoute() {
    const parts = window.location.hash.slice(1).split("/");
    if (parts[0] !== "gods") return false;

    let pantheonId = parts[1] || "indigenous";
    let viewType = parts[2];
    let itemId = parts[3];

    if (!godPantheons[pantheonId]) {
        const legacyGod = gods[pantheonId];
        if (legacyGod) {
            pantheonId = legacyGod.pantheon || "indigenous";
            viewType = "god";
            itemId = parts[1];
        } else {
            pantheonId = "indigenous";
            viewType = undefined;
            itemId = undefined;
        }
    }

    if (viewType !== "category" && viewType !== "god" && viewType) {
        const legacyGod = gods[viewType];
        if (legacyGod) {
            itemId = viewType;
            viewType = "god";
            pantheonId = legacyGod.pantheon || pantheonId;
        }
    }

    currentGodPantheon = pantheonId;
    showSection("gods", true, false, false);

    if (viewType === "category" && godPantheons[pantheonId].categories[itemId]) {
        const category = godPantheons[pantheonId].categories[itemId];
        setBreadcrumbs([
            { label: "Боги", route: `#gods/${pantheonId}` },
            { label: category.name }
        ]);
        document.getElementById(`god-category-${itemId}`)?.scrollIntoView({ block: "start" });
    } else if (viewType === "god") {
        let godKey = itemId;
        try {
            godKey = decodeURIComponent(godKey);
        } catch (error) {
            godKey = itemId;
        }

        if (gods[godKey]) {
            showGod(godKey);
        }
    }

    return true;
}

