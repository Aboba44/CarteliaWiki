// Точка запуска: применяет язык, открывает маршрут из адреса и включает поиск.
setLanguage("ru");
showSection("home");
handleWikiRoute();
initializeSearch();

window.addEventListener("hashchange", handleWikiRoute);
window.addEventListener("popstate", handleWikiRoute);