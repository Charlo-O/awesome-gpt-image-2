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
    activeAgentPrompt: "",
  };

  const els = {
    statCases: document.getElementById("stat-cases"),
    statCategories: document.getElementById("stat-categories"),
    filters: document.getElementById("filters"),
    search: document.getElementById("search"),
    featuredToggle: document.getElementById("toggle-featured"),
    favoritesToggle: document.getElementById("toggle-favorites"),
    resultCount: document.getElementById("result-count"),
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
    modalAgentPrompt: document.getElementById("modal-agent-prompt"),
    copyPrompt: document.getElementById("copy-prompt"),
    copyAgentPrompt: document.getElementById("copy-agent-prompt"),
  };

  const categoryOrder = [
    "ui",
    "infographic",
    "poster",
    "ecommerce",
    "brand",
    "architecture",
    "photo",
    "illustration",
    "character",
    "scene",
    "history",
    "document",
    "other",
  ];

  let favorites = readFavorites();

  init();

  function init() {
    els.statCases.textContent = meta.totalCases || cases.length;
    els.statCategories.textContent =
      meta.totalCategories || new Set(cases.map((item) => item.categoryKey)).size;

    renderFilters();
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
    els.copyAgentPrompt.addEventListener("click", copyActiveAgentPrompt);

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
    state.activeAgentPrompt = formatAgentPrompt(item);
    els.modalImage.src = item.image;
    els.modalImage.alt = item.imageAlt;
    els.modalKicker.textContent = `例 ${item.id} · ${item.categoryLabel}`;
    els.modalTitle.textContent = item.title;
    els.modalSummary.textContent = summarizeCase(item);
    els.modalPrompt.textContent = item.prompt;
    els.modalAgentPrompt.textContent = state.activeAgentPrompt;
    els.copyPrompt.textContent = "复制";
    els.copyAgentPrompt.textContent = "复制";

    els.modalMeta.replaceChildren(
      createPill(item.part),
      createPill(item.source.channel),
      createPill(item.source.label)
    );

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
    state.activeAgentPrompt = "";
  }

  async function copyActivePrompt() {
    await copyText(state.activeCase?.prompt, els.copyPrompt);
  }

  async function copyActiveAgentPrompt() {
    await copyText(state.activeAgentPrompt, els.copyAgentPrompt);
  }

  async function copyText(value, button) {
    if (!value || !button) {
      return;
    }

    try {
      await navigator.clipboard.writeText(value);
      button.textContent = "已复制";
    } catch {
      fallbackCopy(value);
      button.textContent = "已复制";
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

  function summarizeCase(item) {
    const summary = String(item.summary || "").trim();

    if (!summary) {
      return `${item.categoryLabel}案例，打开查看完整提示词与 Agent JSON。`;
    }

    if (/^[{\[]/.test(summary)) {
      return `${item.categoryLabel}案例，已补充结构化 Agent JSON，可直接复制调用。`;
    }

    return summary;
  }

  function formatAgentPrompt(item) {
    return JSON.stringify(buildAgentPrompt(item), null, 2);
  }

  function buildAgentPrompt(item) {
    const context = inspectPrompt(item.prompt);
    const commonConstraints = buildConstraints(item, context);
    const reference = buildReference(item, context);

    switch (item.categoryKey) {
      case "ui":
        return {
          type: "UI Screenshot",
          platform: inferPlatform(item.prompt),
          product: item.title,
          layout: context.layout || "Structured screen layout with clear hierarchy",
          style: {
            theme: context.style || "High-fidelity digital interface",
            source_channel: item.source.channel,
            category: item.categoryLabel,
          },
          content: {
            brief: item.summary,
            reference_case: reference.case,
          },
          constraints: commonConstraints,
          instructions: item.prompt,
        };
      case "infographic":
        return {
          type: "Infographic",
          topic: item.title,
          audience: inferAudience(item),
          structure: {
            title_area: item.title,
            layout: context.layout || "Structured infographic layout",
            reference_case: reference.case,
          },
          style: {
            aesthetic: context.style || "Clear visual hierarchy and readable information design",
            source_channel: item.source.channel,
          },
          constraints: commonConstraints,
          instructions: item.prompt,
        };
      case "poster":
        return {
          type: "Movie Poster",
          theme: item.title,
          typography: {
            headline: item.title,
            layout: context.layout || "Poster composition with strong title hierarchy",
            text_rule: "Keep required text readable and spelled correctly",
          },
          visuals: {
            subject: item.summary,
            style: context.style || "Editorial poster art direction",
            source_channel: item.source.channel,
          },
          vibe: inferMood(item.prompt),
          constraints: commonConstraints,
          instructions: item.prompt,
        };
      case "ecommerce":
        return {
          type: "E-commerce Hero Image",
          product: {
            name: item.title,
            selling_point: item.summary,
            angle: context.layout || "Commercial hero composition",
          },
          setting: {
            background: inferBackground(item.prompt),
            lighting: context.style || "Clean product lighting with readable details",
          },
          copywriting: {
            channel: item.source.channel,
            case_reference: reference.case,
          },
          constraints: commonConstraints,
          instructions: item.prompt,
        };
      case "brand":
        return {
          type: "Brand Identity Design",
          brand: {
            name: item.title,
            industry: inferIndustry(item),
            keywords: collectKeywords(item),
          },
          deliverables: [
            "Logo direction",
            "Color palette",
            "Brand application mockup",
          ],
          style: context.style || "Consistent brand system with clean presentation",
          constraints: commonConstraints,
          instructions: item.prompt,
        };
      case "architecture":
        return {
          type: "Architectural Visualization",
          space: {
            type: item.title,
            function: item.summary,
            materials: inferMaterials(item.prompt),
          },
          environment: inferEnvironment(item.prompt),
          camera: {
            angle: context.layout || "Eye-level or spatial overview",
            lighting: context.style || "Architectural lighting with believable depth",
          },
          render_quality: commonConstraints,
          instructions: item.prompt,
        };
      case "photo":
        return {
          type: "Hyper-realistic Photography",
          subject: {
            description: item.title,
            details: item.summary,
          },
          setting: inferEnvironment(item.prompt),
          camera_specs: {
            gear: inferCameraGear(item.prompt),
            aperture: inferDepthCue(item.prompt),
            lighting: context.style || "Natural or cinematic photography lighting",
          },
          film_aesthetic: inferFilmAesthetic(item.prompt),
          constraints: commonConstraints,
          instructions: item.prompt,
        };
      case "illustration":
        return {
          type: "Artistic Illustration",
          art_style: context.style || "Illustration with clear artistic direction",
          scene: {
            description: item.title,
            details: item.summary,
          },
          palette: inferPalette(item.prompt),
          technique: context.layout || "Illustrative composition with controlled detail",
          mood: inferMood(item.prompt),
          instructions: item.prompt,
        };
      case "character":
        return {
          type: "Character Concept Art",
          character: {
            identity: item.title,
            appearance: item.summary,
            attire: inferAttire(item.prompt),
          },
          pose: context.layout || "Clear hero pose with readable silhouette",
          environment: inferEnvironment(item.prompt),
          style: context.style || "Consistent character sheet or concept art finish",
          instructions: item.prompt,
        };
      case "scene":
        return {
          type: "Narrative Scene",
          story_context: item.title,
          environment: inferEnvironment(item.prompt),
          action: item.summary,
          atmosphere: {
            mood: inferMood(item.prompt),
            lighting: context.style || "Story-driven cinematic lighting",
          },
          camera: context.layout || "Narrative framing with clear focal action",
          instructions: item.prompt,
        };
      case "history":
        return {
          type: "Historical/Oriental Scene",
          setting: item.title,
          subject: {
            identity: inferIdentity(item.prompt),
            clothing: inferClothing(item.prompt),
            action: item.summary,
          },
          style: context.style || "Historically grounded visual storytelling",
          details: inferDetails(item.prompt),
          constraints: `${commonConstraints}; No modern elements`,
          instructions: item.prompt,
        };
      case "document":
        return {
          type: "Editorial Layout",
          document: item.title,
          grid: context.layout || "Structured editorial grid",
          content: {
            summary: item.summary,
            reference_case: reference.case,
          },
          typography: context.style || "Readable publication typography",
          palette: inferPalette(item.prompt),
          instructions: item.prompt,
        };
      default:
        return {
          type: "Custom Generation",
          objective: item.title,
          inputs: {
            subject: item.summary,
            scene: inferEnvironment(item.prompt),
            style: context.style || item.categoryLabel,
            palette: inferPalette(item.prompt),
          },
          quality_constraints: {
            aspect_ratio: context.aspectRatio || "Follow original prompt",
            composition: context.layout || "Clear focal hierarchy",
            fidelity: commonConstraints,
          },
          output_requirements: {
            usage: item.source.channel,
            focus: item.categoryLabel,
          },
          instructions: item.prompt,
        };
    }
  }

  function buildReference(item, context) {
    return {
      case: `例 ${item.id} · ${item.part}`,
      title: item.title,
      category: item.categoryLabel,
      source_channel: item.source.channel,
      aspect_ratio: context.aspectRatio || "",
    };
  }

  function inspectPrompt(prompt) {
    const clean = normalizeWhitespace(prompt);

    return {
      aspectRatio: findMatch(clean, [/\b\d+\s*:\s*\d+\b/i], "Follow original prompt"),
      layout: findMatch(clean, [
        /\b(?:isometric|cutaway|double-page spread|3-column grid|4x4 grid|4×4 grid|card-based feed|single poster only)\b[^.。;\n]*/i,
        /(?:竖版|横版|网格|卡片流|双栏|时间线|流程图|对角构图|居中构图|四列)[^.。;\n]*/i,
      ], ""),
      style: findMatch(clean, [
        /\b(?:cinematic|hyper-realistic|flat vector|editorial|scientific atlas|watercolor|minimalist|kodak portra|concept art)\b[^.。;\n]*/i,
        /(?:水墨|写实|极简|电影感|科普|手绘|厚涂|胶片|高级感)[^.。;\n]*/i,
      ], ""),
    };
  }

  function buildConstraints(item, context) {
    const rules = [
      context.aspectRatio && context.aspectRatio !== "Follow original prompt"
        ? `Aspect ratio ${context.aspectRatio}`
        : null,
      needsReadableText(item) ? "All required text must stay readable and accurate" : null,
      item.categoryKey === "architecture" ? "Preserve believable perspective and material depth" : null,
      item.categoryKey === "photo" ? "Keep realistic skin, material, and lighting detail" : null,
      "Follow the original case prompt faithfully",
    ].filter(Boolean);

    return rules.join("; ");
  }

  function needsReadableText(item) {
    return ["ui", "infographic", "poster", "ecommerce", "brand", "document"].includes(
      item.categoryKey
    );
  }

  function inferPlatform(prompt) {
    const clean = normalizeWhitespace(prompt);

    if (/\bios\b/i.test(clean)) {
      return "iOS";
    }

    if (/\bandroid\b/i.test(clean)) {
      return "Android";
    }

    if (/\bweb\b|网页|网站/.test(clean)) {
      return "Web";
    }

    return "Digital Product Interface";
  }

  function inferAudience(item) {
    if (item.source.channel === "小红书") {
      return "小红书图文读者";
    }

    if (item.source.channel === "X 社区") {
      return "Social media audience";
    }

    return "General audience";
  }

  function inferIndustry(item) {
    const clean = normalizeWhitespace(`${item.title} ${item.prompt}`);

    if (/ai|人工智能|agent/i.test(clean)) {
      return "AI / Technology";
    }

    if (/咖啡|餐饮|food|drink/i.test(clean)) {
      return "Food / Beverage";
    }

    if (/beauty|美妆|护肤|口红/i.test(clean)) {
      return "Beauty";
    }

    return "Creative Brand";
  }

  function inferBackground(prompt) {
    return (
      findMatch(normalizeWhitespace(prompt), [
        /\b(?:studio|gradient|pure white background|white background)\b[^.。;\n]*/i,
        /(?:棚拍|纯白背景|白底|生活方式场景|渐变背景)[^.。;\n]*/i,
      ], "") || "Minimal commercial backdrop"
    );
  }

  function inferEnvironment(prompt) {
    return (
      findMatch(normalizeWhitespace(prompt), [
        /\b(?:in|at)\s+[A-Z][^.。\n;]*/i,
        /\b(?:background|environment|scene)\b[^.。;\n]*/i,
        /(?:场景|背景|环境|空间)[^.。;\n]*/i,
      ], "") || "Follow the environment described in the original prompt"
    );
  }

  function inferCameraGear(prompt) {
    return (
      findMatch(normalizeWhitespace(prompt), [
        /\b(?:shot on|sony|canon|nikon|fujifilm)\b[^.。;\n]*/i,
        /\b\d{2,3}mm\b[^.。;\n]*/i,
      ], "") || "Professional camera setup"
    );
  }

  function inferDepthCue(prompt) {
    return (
      findMatch(normalizeWhitespace(prompt), [
        /\bf\/\d(?:\.\d)?\b[^.。;\n]*/i,
        /\b(?:shallow depth of field|deep depth of field)\b[^.。;\n]*/i,
        /(?:浅景深|深景深)[^.。;\n]*/i,
      ], "") || "Depth of field follows the original prompt"
    );
  }

  function inferFilmAesthetic(prompt) {
    return (
      findMatch(normalizeWhitespace(prompt), [
        /\b(?:kodak|portra|fuji|cinematic|film grain)\b[^.。;\n]*/i,
        /(?:胶片|颗粒感|电影感)[^.。;\n]*/i,
      ], "") || "Realistic finish with controlled texture"
    );
  }

  function inferPalette(prompt) {
    return (
      findMatch(normalizeWhitespace(prompt), [
        /\b(?:palette|color palette|monochrome)\b[^.。;\n]*/i,
        /(?:配色|色彩|主色|辅色|色调)[^.。;\n]*/i,
      ], "") || "Follow the palette in the original prompt"
    );
  }

  function inferMaterials(prompt) {
    return (
      findMatch(normalizeWhitespace(prompt), [
        /\b(?:concrete|glass|timber|metal|stone)\b[^.。;\n]*/i,
        /(?:木|石|金属|玻璃|混凝土)[^.。;\n]*/i,
      ], "") || "Materials follow the original prompt"
    );
  }

  function inferAttire(prompt) {
    return (
      findMatch(normalizeWhitespace(prompt), [
        /\b(?:wearing|attire|costume)\b[^.。;\n]*/i,
        /(?:服饰|服装|穿着|造型)[^.。;\n]*/i,
      ], "") || "Styling follows the original prompt"
    );
  }

  function inferIdentity(prompt) {
    return (
      findMatch(normalizeWhitespace(prompt), [
        /\b(?:identity|character|subject)\b[^.。;\n]*/i,
        /(?:人物|角色|身份|主体)[^.。;\n]*/i,
      ], "") || "Historical subject from the original prompt"
    );
  }

  function inferClothing(prompt) {
    return (
      findMatch(normalizeWhitespace(prompt), [
        /\b(?:clothing|robe|dress|armor)\b[^.。;\n]*/i,
        /(?:服饰|衣着|盔甲|襦裙)[^.。;\n]*/i,
      ], "") || "Historically accurate clothing"
    );
  }

  function inferDetails(prompt) {
    return (
      findMatch(normalizeWhitespace(prompt), [
        /\b(?:details|accurate|architecture)\b[^.。;\n]*/i,
        /(?:细节|建筑|礼制|纹样|器物)[^.。;\n]*/i,
      ], "") || "Preserve historically relevant details from the original prompt"
    );
  }

  function inferMood(prompt) {
    return (
      findMatch(normalizeWhitespace(prompt), [
        /\b(?:mood|vibe|atmosphere)\b[^.。;\n]*/i,
        /(?:氛围|情绪|气质)[^.。;\n]*/i,
      ], "") || "Match the mood of the original prompt"
    );
  }

  function collectKeywords(item) {
    return [
      item.categoryLabel,
      item.source.channel,
      item.part,
    ];
  }

  function findMatch(value, patterns, fallback) {
    for (const pattern of patterns) {
      const match = value.match(pattern);

      if (match) {
        return normalizeWhitespace(match[0]);
      }
    }

    return fallback;
  }

  function normalizeWhitespace(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
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
