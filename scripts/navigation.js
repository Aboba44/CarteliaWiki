let currentSection = "home";

function updateActiveNav(section) {
    document.querySelectorAll(".sidebar nav [data-nav-section]").forEach(function (element) {
        const isActive = element.dataset.navSection
            .split(",")
            .map(function (item) { return item.trim(); })
            .includes(section);

        element.classList.toggle("is-active", isActive);
        if (isActive) {
            element.setAttribute("aria-current", "true");
        } else {
            element.removeAttribute("aria-current");
        }
    });
}

function showSection(section, setRootRoute = false, syncGodRoute = true, syncRoute = true) {
    const sections = document.querySelectorAll(".content section");
    const selected = document.getElementById(section);

    if (!selected) return;

    document.querySelector(".app")?.classList.toggle("is-home", section === "home");
    if (section === "home") window.scrollTo(0, 0);

    if (
        syncGodRoute &&
        currentSection === "gods" &&
        section !== "gods" &&
        /^#gods(?:\/|$)/.test(window.location.hash)
    ) {
        window.history.replaceState({ route: section }, "", `#${section}`);
    }

    const sectionChanged = currentSection !== section;
    currentSection = section;
    if (setRootRoute || sectionChanged) {
        setBreadcrumbs(section === "belonging"
            ? [
                { label: "Расы", route: "#races" },
                { label: "Принадлежность" }
            ]
            : [{ label: getSectionLabel(section) }]);
    }

    if (setRootRoute && syncRoute) {
        setWikiRoute(`#${section}`);
    }

    sections.forEach(function (item) {
        item.style.display = "none";
    });

    selected.style.display = section === "home" ? "flex" : "block";
    if (sectionChanged) {
        selected.classList.remove("section-enter");
        void selected.offsetWidth;
        selected.classList.add("section-enter");
    }
    updateActiveNav(section);
    if (section === "gods") {
        renderGods();
    }
}

function closeFactionMenu() {
    document.querySelectorAll(".menu-dropdown").forEach(function (menu) {
        const toggle = menu.querySelector(":scope > button");

        menu.classList.remove("is-open");

        if (toggle) {
            toggle.setAttribute("aria-expanded", "false");
        }
    });
}

function toggleFactionMenu(event) {
    const menu = event.currentTarget.closest(".menu-dropdown");

    if (!menu) return;

    const isOpen = menu.classList.contains("is-open");
    if (isOpen) {
        closeFactionMenu();
        return;
    }

    closeFactionMenu();
    menu.classList.add("is-open");
    event.currentTarget.setAttribute("aria-expanded", "true");
    event.stopPropagation();
}

document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
        closeFactionMenu();
    }
});


/* =========================
   СТАРТОВАЯ СТРАНИЦА
   ========================= */


function handleWikiRoute(force = false) {
    const hash = window.location.hash;
    if (!force && hash === lastResolvedHash) return;
    lastResolvedHash = hash;

    const parts = hash.replace(/^#/, "").split("/").filter(Boolean);
    const section = parts[0] === "races" ? "belonging" : (parts[0] || "home");
    const selected = document.getElementById(section);

    if (!selected) {
        showSection("home", true, false, false);
        return;
    }

    if (section === "gods") {
        handleGodRoute();
        return;
    }

    showSection(section, true, false, false);

    if (section === "church") {
        renderChurchContent();
        const [, branchId, chamberId, type, topicId, detailType, detailId] = parts;
        if (branchId && church.branches[branchId]) {
            showChurchBranch(branchId, false);
            if (chamberId && church.branches[branchId].chambers[chamberId]) {
                showChurchChamber(branchId, chamberId, false);
                if (type === "topic" && /^\d+$/.test(topicId || "")) {
                    openChurchTopic(branchId, chamberId, Number(topicId), false);
                    if (detailType === "order" && detailId) {
                        showOrder(decodeRoutePart(detailId), true, false);
                    }
                }
            }
        }
    } else if (section === "belonging") {
        renderBelongingRoot();
        const [, belongingId, categoryId, raceId] = parts;
        if (belongingId && raceBelongings[belongingId]) {
            showBelonging(belongingId, false);
            if (categoryId && raceBelongings[belongingId].categories[categoryId]) {
                showCreatureCategory(belongingId, categoryId, false);
                if (raceId && races[raceId]) showRace(raceId, categoryId, false);
            }
        }
    } else if (section === "orders") {
        renderOrders();
        if (parts[1] && orders[decodeRoutePart(parts[1])]) {
            showOrder(decodeRoutePart(parts[1]), false, false);
        }
    } else if (section === "worlds") {
        renderWorlds();
        const [, detailType, detailId] = parts;
        if (detailType === "world" && detailId) {
            showWorld(decodeRoutePart(detailId), false);
        } else if (detailType === "dimension" && detailId) {
            showDimension(decodeRoutePart(detailId), false);
        }
    } else if (section === "magic") {
        renderMagicFoundations();
        renderMagicTypes();
        document.getElementById("magic-foundation-info")?.replaceChildren();
        document.getElementById("magic-type-info")?.replaceChildren();

        const [, detailType, detailId] = parts;
        if (detailType === "foundation" && detailId) {
            showMagicFoundation(decodeRoutePart(detailId), false);
        } else if (detailType === "type" && detailId) {
            showMagicType(decodeRoutePart(detailId), false);
        }
    }

}

function decodeRoutePart(value) {
    try {
        return decodeURIComponent(value);
    } catch (error) {
        return value;
    }
}
