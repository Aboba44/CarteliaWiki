// Небольшие общие помощники: URL-маршруты, хлебные крошки и разметка карточек.
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
        author: "От автора",
        reading: "Чтиво"
    };

    return labels[section] || section;
}


function escapeHtml(value) {
    // Экранирует текст перед вставкой в innerHTML-шаблоны.
    return String(value ?? "").replace(/[&<>"']/g, function (character) {
        return {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            "\"": "&quot;",
            "'": "&#39;"
        }[character];
    });
}

function pluralizeRu(count, one, few, many) {
    // Русские формы множественного числа: 1 раса, 2 расы, 5 рас.
    const value = Math.abs(Number(count) || 0);
    const lastTwo = value % 100;
    const lastOne = value % 10;

    if (lastTwo >= 11 && lastTwo <= 14) return many;
    if (lastOne === 1) return one;
    if (lastOne >= 2 && lastOne <= 4) return few;

    return many;
}

function isPlaceholderText(value) {
    // Отличает служебные заглушки от настоящего текста, чтобы не выводить их в карточках.
    const normalized = String(value || "")
        .trim()
        .toLocaleLowerCase("ru-RU")
        .replace(/ё/g, "е")
        .replace(/\s+/g, " ")
        .replace(/[.!]+$/, "");

    return /^(описание пока не добавлено|определение еще не добавлено|категория пока не проработана|здесь будет( подробное)? описание.*)$/.test(normalized);
}

function renderPageHeader(eyebrow, title, lead) {
    // Единый заголовок страницы раздела: надзаголовок, крупный h1 и лид.
    const hasLead = lead && !isPlaceholderText(lead);

    return `
        <header class="page-header">
            ${eyebrow ? `<p class="page-eyebrow">${escapeHtml(eyebrow)}</p>` : ""}
            <h1 class="page-title">${escapeHtml(title)}</h1>
            ${hasLead ? `<p class="page-lead">${escapeHtml(lead)}</p>` : ""}
        </header>
    `;
}

function renderWikiPage(eyebrow, title, lead, body) {
    // Общая оболочка страницы раздела: центрированный заголовок и содержимое.
    return `
        <article class="wiki-page">
            ${renderPageHeader(eyebrow, title, lead)}
            ${body || ""}
        </article>
    `;
}

function renderWikiSection(title, body) {
    // Внутренний блок главной страницы раздела: центрированный подзаголовок и карточки.
    return `
        <section class="wiki-section">
            <h2 class="wiki-section-title">${escapeHtml(title)}</h2>
            ${body || ""}
        </section>
    `;
}

function renderWikiCards(items, renderItem) {
    return `
        <div class="wiki-cards">
            ${items.map(renderItem).join("")}
        </div>
    `;
}


/* =========================
   MARKDOWN-СТАТЬИ
   ========================= */

const MARKDOWN_LIST_PATTERN = /^(\s*)([-*+]|\d+\.)\s+(.+)$/;

function resolveMarkdownTarget(target, articleUrl) {
    // Внутренние ссылки вида #magic/type/... не трогаем: это маршруты сайта.
    const value = String(target || "").trim();
    if (!value) return null;
    if (value.startsWith("#")) return { href: value, internal: true };

    try {
        const url = new URL(value, articleUrl);
        if (url.protocol !== "http:" && url.protocol !== "https:") return null;
        return { href: url.href, internal: false };
    } catch (error) {
        return null;
    }
}

function appendMarkdownInline(container, text, articleUrl) {
    // Поддерживает ссылки, картинки, жирный текст, курсив и код.
    const tokenPattern = /(!?\[[^\]]*\]\([^)]+\)|\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g;
    let lastIndex = 0;
    let match;

    while ((match = tokenPattern.exec(text)) !== null) {
        container.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
        const token = match[0];
        const imageMatch = token.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
        const linkMatch = token.match(/^\[([^\]]*)\]\(([^)]+)\)$/);

        if (imageMatch || linkMatch) {
            const label = imageMatch ? imageMatch[1] : linkMatch[1];
            const target = imageMatch ? imageMatch[2] : linkMatch[2];
            const resolved = resolveMarkdownTarget(target, articleUrl);

            if (!resolved || (imageMatch && resolved.internal)) {
                container.appendChild(document.createTextNode(token));
            } else if (imageMatch) {
                const image = document.createElement("img");
                image.src = resolved.href;
                image.alt = label;
                image.loading = "lazy";
                image.decoding = "async";
                container.appendChild(image);
            } else {
                const link = document.createElement("a");
                link.href = resolved.href;
                link.textContent = label;
                if (!resolved.internal) {
                    link.rel = "noopener";
                }
                container.appendChild(link);
            }
        } else {
            const element = token.startsWith("**")
                ? document.createElement("strong")
                : token.startsWith("`")
                    ? document.createElement("code")
                    : document.createElement("em");
            const delimiterLength = token.startsWith("**") ? 2 : 1;
            element.textContent = token.slice(delimiterLength, -delimiterLength);
            container.appendChild(element);
        }

        lastIndex = tokenPattern.lastIndex;
    }

    container.appendChild(document.createTextNode(text.slice(lastIndex)));
}

function renderMarkdownList(lines, startIndex, baseIndent, articleUrl) {
    const firstMatch = lines[startIndex].match(MARKDOWN_LIST_PATTERN);
    const ordered = /^\d/.test(firstMatch[2]);
    const list = document.createElement(ordered ? "ol" : "ul");
    let index = startIndex;

    while (index < lines.length) {
        const match = lines[index].match(MARKDOWN_LIST_PATTERN);
        if (!match) break;

        const indent = match[1].replace(/\t/g, "    ").length;
        if (indent < baseIndent) break;

        if (indent > baseIndent) {
            const nested = renderMarkdownList(lines, index, indent, articleUrl);
            const lastItem = list.lastElementChild;
            if (!lastItem) break;
            lastItem.appendChild(nested.list);
            index = nested.nextIndex;
            continue;
        }

        if (/^\d/.test(match[2]) !== ordered) break;

        const item = document.createElement("li");
        appendMarkdownInline(item, match[3], articleUrl);
        list.appendChild(item);
        index += 1;
    }

    return { list, nextIndex: index };
}

function splitMarkdownTableRow(line) {
    return line.trim()
        .replace(/^\|/, "")
        .replace(/\|$/, "")
        .split("|")
        .map(cell => cell.trim());
}

function isMarkdownTableSeparator(line) {
    const cells = splitMarkdownTableRow(line);
    return cells.length > 0 && cells.every(cell => /^:?-{3,}:?$/.test(cell));
}

function renderMarkdownTable(lines, startIndex, articleUrl) {
    const headerCells = splitMarkdownTableRow(lines[startIndex]);
    const separators = splitMarkdownTableRow(lines[startIndex + 1]);
    const alignments = separators.map(cell => {
        const left = cell.startsWith(":");
        const right = cell.endsWith(":");
        if (left && right) return "center";
        if (right) return "right";
        if (left) return "left";
        return "";
    });

    const table = document.createElement("table");
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");

    headerCells.forEach((cellText, cellIndex) => {
        const cell = document.createElement("th");
        cell.textContent = "";
        appendMarkdownInline(cell, cellText, articleUrl);
        if (alignments[cellIndex]) cell.style.textAlign = alignments[cellIndex];
        headerRow.appendChild(cell);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    let index = startIndex + 2;

    while (index < lines.length) {
        const line = lines[index].trim();
        if (!line || !line.includes("|")) break;

        const cells = splitMarkdownTableRow(line);
        if (!cells.length) break;

        const row = document.createElement("tr");
        cells.forEach((cellText, cellIndex) => {
            const cell = document.createElement("td");
            appendMarkdownInline(cell, cellText, articleUrl);
            if (alignments[cellIndex]) cell.style.textAlign = alignments[cellIndex];
            row.appendChild(cell);
        });
        tbody.appendChild(row);
        index += 1;
    }

    table.appendChild(tbody);
    return { table, nextIndex: index };
}

function isMarkdownBlockStart(lines, index) {
    const line = lines[index]?.trim() || "";
    if (!line) return true;
    if (/^(#{1,6})\s+/.test(line)) return true;
    if (MARKDOWN_LIST_PATTERN.test(line)) return true;
    if (line.startsWith(">")) return true;
    if (/^(?:-{3,}|\*{3,}|_{3,})$/.test(line)) return true;
    if (line.includes("|") && index + 1 < lines.length && isMarkdownTableSeparator(lines[index + 1])) return true;
    return false;
}

function renderMarkdownArticle(markdown, articleUrl, options = {}) {
    // Преобразует поддерживаемый Markdown в DOM-элементы, не вставляя текст как HTML.
    const body = document.createElement("div");
    body.className = options.bodyClass || "wiki-article";
    const lines = String(markdown || "").replace(/\r\n?/g, "\n").split("\n");
    let index = 0;
    let headingIndex = 0;

    while (index < lines.length) {
        const line = lines[index].trim();
        if (!line) {
            index += 1;
            continue;
        }

        if (line.includes("|") && index + 1 < lines.length && isMarkdownTableSeparator(lines[index + 1])) {
            const result = renderMarkdownTable(lines, index, articleUrl);
            body.appendChild(result.table);
            index = result.nextIndex;
            continue;
        }

        if (/^(?:-{3,}|\*{3,}|_{3,})$/.test(line)) {
            body.appendChild(document.createElement("hr"));
            index += 1;
            continue;
        }

        const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
        if (headingMatch) {
            const level = headingMatch[1].length;
            const heading = document.createElement(`h${level}`);
            appendMarkdownInline(heading, headingMatch[2], articleUrl);
            if (level === 2 || level === 3) {
                headingIndex += 1;
                heading.id = `section-${headingIndex}`;
            }
            body.appendChild(heading);
            index += 1;
            continue;
        }

        const listMatch = line.match(MARKDOWN_LIST_PATTERN);
        if (listMatch) {
            const indent = listMatch[1].replace(/\t/g, "    ").length;
            const result = renderMarkdownList(lines, index, indent, articleUrl);
            body.appendChild(result.list);
            index = result.nextIndex;
            continue;
        }

        if (line.startsWith(">")) {
            const quote = document.createElement("blockquote");
            while (index < lines.length && lines[index].trim().startsWith(">")) {
                const quoteLine = lines[index].trim().replace(/^>\s?/, "");
                const paragraph = document.createElement("p");
                appendMarkdownInline(paragraph, quoteLine, articleUrl);
                quote.appendChild(paragraph);
                index += 1;
            }
            body.appendChild(quote);
            continue;
        }

        const paragraphLines = [line];
        index += 1;
        while (index < lines.length && !isMarkdownBlockStart(lines, index)) {
            paragraphLines.push(lines[index].trim());
            index += 1;
        }

        const paragraph = document.createElement("p");
        appendMarkdownInline(paragraph, paragraphLines.join(" "), articleUrl);
        body.appendChild(paragraph);
    }

    return body;
}

function buildMarkdownToc(articleBody) {
    if (!articleBody) return [];

    return Array.from(articleBody.querySelectorAll("h2, h3"))
        .map(heading => ({
            level: heading.tagName === "H2" ? 2 : 3,
            id: heading.id,
            text: heading.textContent.trim()
        }))
        .filter(item => item.id && item.text);
}

function renderMarkdownToc(items) {
    if (!items || items.length < 2) return "";

    return `
        <details class="magic-toc" open>
            <summary>Содержание</summary>
            <nav aria-label="Содержание статьи">
                <ul>
                    ${items.map(item => `
                        <li class="magic-toc-item magic-toc-item--${item.level}">
                            <button class="magic-toc-link" type="button" data-target="${escapeHtml(item.id)}">${escapeHtml(item.text)}</button>
                        </li>
                    `).join("")}
                </ul>
            </nav>
        </details>
    `;
}

function markdownToPlainText(markdown) {
    // Грубая очистка Markdown для поискового индекса.
    return String(markdown || "")
        .replace(/```[\s\S]*?```/g, " ")
        .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
        .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
        .replace(/^\s{0,3}#{1,6}\s+/gm, " ")
        .replace(/^\s*>\s?/gm, " ")
        .replace(/^\s*(?:[-*+]|\d+\.)\s+/gm, " ")
        .replace(/[|`*_~]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}
