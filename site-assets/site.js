(function () {
  const cases = Array.isArray(window.GPT_IMAGE_CASES) ? window.GPT_IMAGE_CASES : [];
  const meta = window.GPT_IMAGE_META || {};
  const favoritesKey = "awesome_gpt_image_2_favorites_v1";
  const state = {
    query: "",
    category: "all",
    featuredOnly: false,
    favoritesOnly: false,
    activeCase: null,
  };

  const els = {
    statCases: document.getElementById("stat-cases"),
    statFeatured: document.getElementById("stat-featured"),
    statCategories: document.getElementById("stat-categories"),
    filters: document.getElementById("filters"),
    search: document.getElementById("search"),
    featuredToggle: document.getElementById("toggle-featured"),
    favoritesToggle: document.getElementById("toggle-favorites"),
    resultCount: document.getElementById("result-count"),
    featuredStrip: document.getElementById("featured-strip"),
    grid: document.getElementById("case-grid"),
    modal: document.getElementById("modal"),
    modalBackdrop: document.getElementById("modal-backdrop"),
    modalClose: document.getElementById("modal-close"),
    modalImage: document.getElementById("modal-image"),
    modalKicker: document.getElementById("modal-kicker"),
    modalTitle: document.getElementById("modal-title"),
    modalMeta: document.getElementById("modal-meta"),
    modalSummary: document.getElementById("modal-summary"),
    modalPrompt: document.getElementById("modal-prompt"),
    modalLinks: document.getElementById("modal-links"),
    copyPrompt: document.getElementById("copy-prompt"),
  };

  const categoryOrder = [
    "ui",
    "infographic",
    "poster",
    "commerce",
    "space",
    "photo",
    "illustration",
    "character",
    "document",
    "other",
  ];

  let favorites = readFavorites();

  init();

  function init() {
    els.statCases.textContent = meta.totalCases || cases.length;
    els.statFeatured.textContent = meta.totalFeatured || cases.filter((item) => item.featured).length;
    els.statCategories.textContent =
      meta.totalCategories || new Set(cases.map((item) => item.categoryKey)).size;

    renderFilters();
    renderFeaturedStrip();
    bindEvents();
    render();
  }

  function bindEvents() {
    els.search.addEventListener("input", (event) => {
      state.query = event.target.value.trim();
      render();
    });

    els.featuredToggle.addEventListener("click", () => {
      state.featuredOnly = !state.featuredOnly;
      els.featuredToggle.setAttribute("aria-pressed", String(state.featuredOnly));
      render();
    });

    els.favoritesToggle.addEventListener("click", () => {
      state.favoritesOnly = !state.favoritesOnly;
      els.favoritesToggle.setAttribute("aria-pressed", String(state.favoritesOnly));
      render();
    });

    els.modalBackdrop.addEventListener("click", closeModal);
    els.modalClose.addEventListener("click", closeModal);
    els.copyPrompt.addEventListener("click", copyActivePrompt);

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && els.modal.classList.contains("is-open")) {
        closeModal();
      }
    });
  }

  function renderFilters() {
    const categories = [...new Map(cases.map((item) => [
      item.categoryKey,
      { key: item.categoryKey, label: item.categoryLabel },
    ])).values()].sort(
      (a, b) => categoryOrder.indexOf(a.key) - categoryOrder.indexOf(b.key)
    );

    const all = createFilterButton("all", `全部 ${cases.length}`);
    els.filters.append(all);

    for (const category of categories) {
      const count = cases.filter((item) => item.categoryKey === category.key).length;
      els.filters.append(createFilterButton(category.key, `${category.label} ${count}`));
    }
  }

  function createFilterButton(key, label) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "filter-button";
    button.textContent = label;
    button.dataset.category = key;
    button.addEventListener("click", () => {
      state.category = key;
      for (const item of els.filters.querySelectorAll(".filter-button")) {
        item.classList.toggle("is-active", item.dataset.category === key);
      }
      render();
    });

    if (key === "all") {
      button.classList.add("is-active");
    }

    return button;
  }

  function renderFeaturedStrip() {
    const featured = cases.filter((item) => item.featured).slice(0, 4);
    els.featuredStrip.replaceChildren(...featured.map(createFeatureTile));
  }

  function render() {
    const visible = cases.filter(matchesState);
    els.resultCount.textContent = `${visible.length} / ${cases.length}`;

    if (visible.length === 0) {
      const empty = document.createElement("div");
      empty.className = "empty-state";
      empty.textContent = "没有找到匹配案例。";
      els.grid.replaceChildren(empty);
      return;
    }

    els.grid.replaceChildren(...visible.map(createCaseCard));
  }

  function matchesState(item) {
    if (state.category !== "all" && item.categoryKey !== state.category) {
      return false;
    }

    if (state.featuredOnly && !item.featured) {
      return false;
    }

    if (state.favoritesOnly && !favorites.has(item.slug)) {
      return false;
    }

    if (!state.query) {
      return true;
    }

    return normalize(item.searchText).includes(normalize(state.query));
  }

  function createFeatureTile(item) {
    const tile = document.createElement("article");
    tile.className = "feature-tile";

    const img = document.createElement("img");
    img.src = item.image;
    img.alt = item.imageAlt;
    img.loading = "lazy";

    const button = document.createElement("button");
    button.type = "button";
    button.addEventListener("click", () => openModal(item));

    const copy = document.createElement("div");
    copy.className = "feature-copy";
    copy.innerHTML = `<span>例 ${item.id}</span><strong>${escapeHtml(item.title)}</strong>`;

    button.append(copy);
    tile.append(img, button);
    return tile;
  }

  function createCaseCard(item) {
    const article = document.createElement("article");
    article.className = "case-card";

    const media = document.createElement("div");
    media.className = "card-media";

    const img = document.createElement("img");
    img.src = item.image;
    img.alt = item.imageAlt;
    img.loading = "lazy";

    const badge = document.createElement("span");
    badge.className = "card-badge";
    badge.textContent = `例 ${item.id}`;

    const mediaButton = document.createElement("button");
    mediaButton.type = "button";
    mediaButton.className = "media-open";
    mediaButton.setAttribute("aria-label", `打开例 ${item.id}`);
    mediaButton.addEventListener("click", () => openModal(item));

    const favorite = document.createElement("button");
    favorite.type = "button";
    favorite.className = "favorite-button";
    favorite.setAttribute("aria-label", "收藏案例");
    favorite.textContent = favorites.has(item.slug) ? "♥" : "♡";
    favorite.classList.toggle("is-active", favorites.has(item.slug));
    favorite.addEventListener("click", (event) => {
      event.stopPropagation();
      toggleFavorite(item.slug);
      favorite.textContent = favorites.has(item.slug) ? "♥" : "♡";
      favorite.classList.toggle("is-active", favorites.has(item.slug));

      if (state.favoritesOnly) {
        render();
      }
    });

    media.append(img, badge, mediaButton, favorite);

    const openButton = document.createElement("button");
    openButton.type = "button";
    openButton.className = "case-button";
    openButton.addEventListener("click", () => openModal(item));

    const body = document.createElement("div");
    body.className = "card-body";
    body.innerHTML = `
      <h3 class="card-title">${escapeHtml(item.title)}</h3>
      <p class="card-summary">${escapeHtml(item.summary)}</p>
      <div class="card-meta">
        <span>${escapeHtml(item.categoryLabel)}</span>
        <span>${escapeHtml(item.source.channel)}</span>
      </div>
    `;

    openButton.append(body);
    article.append(media, openButton);
    return article;
  }

  function openModal(item) {
    state.activeCase = item;
    els.modalImage.src = item.image;
    els.modalImage.alt = item.imageAlt;
    els.modalKicker.textContent = `例 ${item.id} · ${item.categoryLabel}`;
    els.modalTitle.textContent = item.title;
    els.modalSummary.textContent = item.summary;
    els.modalPrompt.textContent = item.prompt;
    els.copyPrompt.textContent = "复制";

    els.modalMeta.replaceChildren(
      createPill(item.part),
      createPill(item.source.channel),
      createPill(item.source.label)
    );

    const links = [createLink(item.docsPath, "Markdown")];

    if (item.source.url) {
      links.push(createLink(item.source.url, "来源"));
    }

    els.modalLinks.replaceChildren(...links);
    els.modal.classList.add("is-open");
    els.modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    els.modalClose.focus();
  }

  function closeModal() {
    els.modal.classList.remove("is-open");
    els.modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    state.activeCase = null;
  }

  async function copyActivePrompt() {
    if (!state.activeCase) {
      return;
    }

    try {
      await navigator.clipboard.writeText(state.activeCase.prompt);
      els.copyPrompt.textContent = "已复制";
    } catch {
      fallbackCopy(state.activeCase.prompt);
      els.copyPrompt.textContent = "已复制";
    }
  }

  function fallbackCopy(value) {
    const textarea = document.createElement("textarea");
    textarea.value = value;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    document.body.append(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
  }

  function createPill(value) {
    const pill = document.createElement("span");
    pill.className = "meta-pill";
    pill.textContent = value;
    return pill;
  }

  function createLink(href, label) {
    const link = document.createElement("a");
    link.href = href;
    link.textContent = label;

    if (/^https?:\/\//.test(href)) {
      link.target = "_blank";
      link.rel = "noreferrer";
    }

    return link;
  }

  function toggleFavorite(slug) {
    if (favorites.has(slug)) {
      favorites.delete(slug);
    } else {
      favorites.add(slug);
    }

    writeFavorites();
  }

  function readFavorites() {
    try {
      return new Set(JSON.parse(localStorage.getItem(favoritesKey) || "[]"));
    } catch {
      return new Set();
    }
  }

  function writeFavorites() {
    try {
      localStorage.setItem(favoritesKey, JSON.stringify([...favorites]));
    } catch {
      return;
    }
  }

  function normalize(value) {
    return String(value || "").toLowerCase();
  }

  function escapeHtml(value) {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }
})();
