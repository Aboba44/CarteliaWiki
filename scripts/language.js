let currentLanguage = "ru";


function t(key) {
    const value = key.split(".").reduce(function (result, part) {
        return result ? result[part] : null;
    }, i18n[currentLanguage]);

    return value || key;
}

function applyTranslations() {
    document.querySelectorAll("[data-i18n]").forEach(function (element) {
        element.textContent = t(element.dataset.i18n);
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach(function (element) {
        element.placeholder = t(element.dataset.i18nPlaceholder);
    });

    document.querySelectorAll("[data-i18n-aria]").forEach(function (element) {
        element.setAttribute("aria-label", t(element.dataset.i18nAria));
    });

    document.querySelectorAll("[data-i18n-title]").forEach(function (element) {
        element.title = t(element.dataset.i18nTitle);
    });

    document.querySelectorAll("[data-language]").forEach(function (button) {
        button.classList.toggle(
            "is-active",
            button.dataset.language === currentLanguage
        );
    });
}

function setLanguage(language) {
    if (language !== "ru") {
        applyTranslations();
        return;
    }

    currentLanguage = "ru";
    document.documentElement.lang = currentLanguage;
    applyTranslations();

    if (searchIndex.length > 0) {
        searchIndex = buildSearchIndex();
        const input = document.getElementById("site-search-input");
        if (input?.value) renderSearchResults(input.value);
    }
}

/* =========================
   КНОПКА-РОЗЫГРЫШ

   Светлой темы больше нет — кнопка осталась как розыгрыш.
   Звук синтезируется через Web Audio API, без файлов.
   ========================= */
