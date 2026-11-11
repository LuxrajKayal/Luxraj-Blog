/*
 * Luxraj Blog — Editor's Desk content renderer.
 * Loaded only by site/pages/editorial.html.
 */
const root = document.querySelector("[data-editorial-root]");

if (root) {
  const contentUrl = "../content/editorial-notes.md";
  const fallbackUrl = "../assets/images/editorial/editorial-default.svg";
  const el = {
    type: root.querySelector("[data-entry-type]"),
    date: root.querySelector("[data-entry-date]"),
    title: root.querySelector("[data-entry-title]"),
    body: root.querySelector("[data-entry-body]"),
    image: root.querySelector("[data-entry-image]"),
    credit: root.querySelector("[data-entry-credit]"),
    index: root.querySelector("[data-entry-index]"),
    total: root.querySelector("[data-entry-total]"),
    newer: root.querySelector("[data-editorial-newer]"),
    older: root.querySelector("[data-editorial-older]"),
    status: root.querySelector("[data-editorial-status]")
  };
  let entries = [];
  let currentIndex = 0;

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => {
      switch (character) {
        case "&": return "&amp;";
        case "<": return "&lt;";
        case ">": return "&gt;";
        case '"': return "&quot;";
        default: return "&#39;";
      }
    });
  }

  function safeHref(value) {
    const url = String(value || "").trim();
    return (/^https:\/\//i.test(url) || /^mailto:/i.test(url) ||
      /^(?:\.\.?\/|\/(?!\/)|#)/.test(url)) ? url : "";
  }

  function inlineMarkdown(value) {
    const pattern = /\[([^\]]+)\]\(([^)\s]+)\)|\x60([^\x60]+)\x60|\*\*([^*]+)\*\*|\*([^*]+)\*/g;
    let result = "";
    let cursor = 0;
    for (const match of value.matchAll(pattern)) {
      result += escapeHtml(value.slice(cursor, match.index));
      if (match[1] !== undefined) {
        const href = safeHref(match[2]);
        const label = escapeHtml(match[1]);
        if (!href) result += label;
        else {
          const external = /^https:\/\//i.test(href);
          const attrs = external ? ' target="_blank" rel="noopener noreferrer"' : "";
          result += '<a href="' + escapeHtml(href) + '"' + attrs + '>' + label + '</a>';
        }
      } else if (match[3] !== undefined) result += "<code>" + escapeHtml(match[3]) + "</code>";
      else if (match[4] !== undefined) result += "<strong>" + escapeHtml(match[4]) + "</strong>";
      else if (match[5] !== undefined) result += "<em>" + escapeHtml(match[5]) + "</em>";
      cursor = match.index + match[0].length;
    }
    return result + escapeHtml(value.slice(cursor));
  }

  function renderMarkdown(markdown) {
    const lines = String(markdown || "").replace(/\r/g, "").trim().split("\n");
    const output = [];
    let paragraph = [];
    let items = [];
    let listType = "";

    function flushParagraph() {
      if (!paragraph.length) return;
      output.push("<p>" + inlineMarkdown(paragraph.join(" ")) + "</p>");
      paragraph = [];
    }
    function flushList() {
      if (!items.length) return;
      const tag = listType === "ordered" ? "ol" : "ul";
      output.push("<" + tag + ">" + items.map((item) => "<li>" + inlineMarkdown(item) + "</li>").join("") + "</" + tag + ">");
      items = [];
      listType = "";
    }

    for (const raw of lines) {
      const line = raw.trim();
      if (!line) {
        flushParagraph();
        flushList();
        continue;
      }
      const heading = line.match(/^(#{2,4})\s+(.+)$/);
      const unordered = line.match(/^[-*]\s+(.+)$/);
      const ordered = line.match(/^\d+\.\s+(.+)$/);
      const quote = line.match(/^>\s?(.*)$/);
      if (heading) {
        flushParagraph(); flushList();
        const level = heading[1].length;
        output.push("<h" + level + ">" + inlineMarkdown(heading[2]) + "</h" + level + ">");
      } else if (unordered || ordered) {
        flushParagraph();
        const nextType = ordered ? "ordered" : "unordered";
        if (listType && listType !== nextType) flushList();
        listType = nextType;
        items.push((unordered || ordered)[1]);
      } else if (quote) {
        flushParagraph(); flushList();
        output.push("<blockquote><p>" + inlineMarkdown(quote[1]) + "</p></blockquote>");
      } else {
        flushList();
        paragraph.push(line);
      }
    }
    flushParagraph();
    flushList();
    return output.join("");
  }

  function parseValue(raw) {
    const value = raw.trim();
    if (value.startsWith('"')) {
      try { return JSON.parse(value); }
      catch { throw new Error("A quoted entry value is invalid JSON."); }
    }
    return value;
  }

  function parseEntries(markdown) {
    const blocks = Array.from(
      String(markdown).matchAll(/<!--\s*ENTRY\s*-->([\s\S]*?)<!--\s*END ENTRY\s*-->/g),
      (match) => match[1]
    );
    if (!blocks.length) throw new Error("No editorial entries were found.");

    const parsed = blocks.map((block, index) => {
      const marker = "<!-- BODY -->";
      const splitAt = block.indexOf(marker);
      if (splitAt < 0) throw new Error("Entry " + (index + 1) + " is missing its BODY marker.");

      const meta = Object.create(null);
      for (const line of block.slice(0, splitAt).split(/\r?\n/)) {
        const match = line.match(/^([a-z_]+):\s*(.*)$/i);
        if (match) meta[match[1].toLowerCase()] = parseValue(match[2]);
      }

      for (const field of ["date", "type", "title"]) {
        if (!meta[field] || !String(meta[field]).trim()) {
          throw new Error("Entry " + (index + 1) + " is missing " + field + ".");
        }
      }
      if (!/^\d{4}-\d{2}-\d{2}$/.test(meta.date) ||
          Number.isNaN(Date.parse(meta.date + "T12:00:00"))) {
        throw new Error("Entry " + (index + 1) + " has an invalid date.");
      }
      if (!["Daily", "Weekly", "Monthly"].includes(meta.type)) {
        throw new Error("Entry " + (index + 1) + " must use Daily, Weekly or Monthly.");
      }

      const image = String(meta.image || "").trim();
      if (image && !safeHref(image)) throw new Error("Entry " + (index + 1) + " has an unsafe image URL.");
      const imageSource = String(meta.image_source || "").trim();
      if (imageSource && !/^https:\/\//i.test(imageSource)) {
        throw new Error("Entry " + (index + 1) + " has an invalid image source URL.");
      }
      const body = block.slice(splitAt + marker.length).trim();
      if (!body) throw new Error("Entry " + (index + 1) + " has no editorial text.");

      return {
        id: String(meta.id || "entry-" + (index + 1)),
        date: meta.date,
        type: meta.type,
        title: String(meta.title).trim(),
        image,
        imageAlt: String(meta.image_alt || meta.title).trim(),
        imageCredit: String(meta.image_credit || "").trim(),
        imageSource,
        body
      };
    });

    const ids = new Set();
    for (const entry of parsed) {
      if (ids.has(entry.id)) throw new Error("Duplicate entry id: " + entry.id);
      ids.add(entry.id);
    }
    return parsed.sort((a, b) => b.date.localeCompare(a.date));
  }

  function renderCredit(entry, isFallback) {
    el.credit.replaceChildren();
    if (isFallback) {
      el.credit.textContent = "Original illustration by Luxraj Blog";
      return;
    }
    if (!entry.imageCredit) {
      el.credit.textContent = "Reference image";
      return;
    }
    el.credit.append(document.createTextNode("Photo by "));
    if (entry.imageSource) {
      const link = document.createElement("a");
      link.href = entry.imageSource;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = entry.imageCredit;
      el.credit.append(link);
    } else {
      el.credit.append(document.createTextNode(entry.imageCredit));
    }
  }

  function renderEntry(index) {
    const entry = entries[index];
    if (!entry) return;
    currentIndex = index;
    el.type.textContent = entry.type;
    el.date.dateTime = entry.date;
    el.date.textContent = new Intl.DateTimeFormat("en-GB", {
      day: "numeric", month: "long", year: "numeric"
    }).format(new Date(entry.date + "T12:00:00"));
    el.title.textContent = entry.title;
    el.body.innerHTML = renderMarkdown(entry.body);
    el.index.textContent = String(index + 1).padStart(2, "0");
    el.total.textContent = String(entries.length).padStart(2, "0");
    el.newer.disabled = index === 0;
    el.older.disabled = index === entries.length - 1;
    el.status.textContent = "Entry " + (index + 1) + " of " + entries.length;

    const isFallback = !entry.image;
    el.image.onerror = () => {
      if (el.image.dataset.fallbackAttempted === "true") {
        el.image.onerror = null;
        el.image.hidden = true;
        return;
      }
      el.image.dataset.fallbackAttempted = "true";
      el.image.alt = "Luxraj Blog editorial fallback illustration";
      el.image.src = fallbackUrl;
      renderCredit(entry, true);
    };
    el.image.hidden = false;
    el.image.dataset.fallbackAttempted = String(isFallback);
    el.image.alt = isFallback ? "Luxraj Blog editorial fallback illustration" : entry.imageAlt;
    el.image.src = isFallback ? fallbackUrl : entry.image;
    renderCredit(entry, isFallback);
  }

  async function loadNotes() {
    try {
      const response = await fetch(contentUrl, { cache: "no-cache" });
      if (!response.ok) throw new Error("Editorial notes could not be loaded (HTTP " + response.status + ").");
      entries = parseEntries(await response.text());
      renderEntry(0);
      el.status.textContent = entries.length + " editorial entries loaded.";
    } catch (error) {
      console.error("[Luxraj Editor's Desk]", error);
      el.title.textContent = "The editorial notes could not be loaded.";
      el.body.textContent = "Check that editorial-notes.md is available in the site's content folder.";
      el.status.textContent = error.message || "Unable to load editorial content.";
      el.newer.disabled = true;
      el.older.disabled = true;
      el.index.textContent = "—";
      el.total.textContent = "—";
      el.image.onerror = null;
      el.image.src = fallbackUrl;
      el.credit.textContent = "Original illustration by Luxraj Blog";
    }
  }

  el.newer.addEventListener("click", () => {
    if (currentIndex > 0) renderEntry(currentIndex - 1);
  });
  el.older.addEventListener("click", () => {
    if (currentIndex < entries.length - 1) renderEntry(currentIndex + 1);
  });
  loadNotes();
}
