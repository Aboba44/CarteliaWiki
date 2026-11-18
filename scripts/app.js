// Точка запуска: применяет язык, открывает маршрут из адреса и включает поиск.
setLanguage("ru");
showSection("home");
handleWikiRoute();
initializeSearch();

// Браузер прокручивает страницу к секции с id из адреса (#belonging и т. п.)
// уже после запуска скриптов — возвращаем страницу к началу.
if ("scrollRestoration" in window.history) {
    window.history.scrollRestoration = "manual";
}

window.addEventListener("load", function () {
    window.scrollTo(0, 0);

    // Браузер иногда докручивает к секции уже после load — повторяем после паузы.
    window.setTimeout(function () {
        window.scrollTo(0, 0);
    }, 60);
});

window.addEventListener("hashchange", handleWikiRoute);
window.addEventListener("popstate", handleWikiRoute);