setLanguage("ru");
showSection("home");
handleWikiRoute();
initializeSearch();

window.addEventListener("hashchange", handleWikiRoute);
window.addEventListener("popstate", handleWikiRoute);