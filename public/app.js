/**
 * NexusAI Frontend Application Core
 * Real-time SSE Agent Orchestration, Telemetry Visualizer & Interactive Citations
 */

// Agent Metadata Map
const AGENTS = {
  web: { name: "Web Intelligence", icon: "fa-globe", category: "Search & Answer", streaming: true },
  academic: { name: "Academic Research", icon: "fa-graduation-cap", category: "Search & Answer", streaming: true },
  reddit: { name: "Reddit & Community", icon: "fa-reddit-alien", category: "Search & Answer", streaming: true, isBrand: true },
  youtube: { name: "YouTube Insights", icon: "fa-youtube", category: "Search & Answer", streaming: true, isBrand: true },
  image: { name: "Visual Discovery", icon: "fa-image", category: "Search & List", streaming: false },
  video: { name: "Video Streams", icon: "fa-film", category: "Search & List", streaming: false },
  writing: { name: "Writing Studio", icon: "fa-pen-nib", category: "Specialized Intelligence", streaming: true },
};

// Global App State
const state = {
  currentMode: "web",
  isGenerating: false,
  chatHistory: [],
  sessions: [],
  currentSessionId: null,
  activeSources: [],
};

// DOM Element References
const DOM = {
  sidebar: document.getElementById("app-sidebar"),
  btnSidebarCollapse: document.getElementById("btn-sidebar-collapse"),
  btnMobileSidebar: document.getElementById("btn-mobile-sidebar"),
  btnNewChat: document.getElementById("btn-new-chat"),
  sessionHistoryList: document.getElementById("session-history-list"),
  sidebarAgentList: document.getElementById("sidebar-agent-list"),
  modePillsBar: document.getElementById("mode-pills-bar"),
  badgeIcon: document.getElementById("badge-icon"),
  badgeName: document.getElementById("badge-name"),
  badgeCategory: document.getElementById("badge-category"),
  dropdownModeBtn: document.getElementById("btn-dropdown-mode"),
  dropdownIcon: document.getElementById("dropdown-icon"),
  dropdownName: document.getElementById("dropdown-name"),
  modeMenu: document.getElementById("mode-menu"),
  hintModeText: document.getElementById("hint-mode-text"),
  viewportScroll: document.getElementById("viewport-scroll"),
  welcomeHero: document.getElementById("welcome-hero"),
  researchFeed: document.getElementById("research-feed"),
  searchInput: document.getElementById("search-input"),
  btnSubmitSearch: document.getElementById("btn-submit-search"),
  btnToggleTelemetry: document.getElementById("btn-toggle-telemetry"),
  telemetryDrawer: document.getElementById("telemetry-drawer"),
  btnCloseTelemetry: document.getElementById("btn-close-telemetry"),
  btnExportSession: document.getElementById("btn-export-session"),
  btnOpenSettings: document.getElementById("btn-open-settings"),
  settingsModal: document.getElementById("settings-modal"),
  btnCloseSettings: document.getElementById("btn-close-settings"),
  modalBackdropSettings: document.getElementById("modal-backdrop-settings"),
  imageLightboxModal: document.getElementById("image-lightbox-modal"),
  lightboxImg: document.getElementById("lightbox-img"),
  lightboxTitle: document.getElementById("lightbox-title"),
  lightboxLink: document.getElementById("lightbox-link"),
  btnCloseImgModal: document.getElementById("btn-close-img-modal"),
  modalBackdropImg: document.getElementById("modal-backdrop-img"),
  videoPlayerModal: document.getElementById("video-player-modal"),
  videoPlayerIframe: document.getElementById("video-player-iframe"),
  videoModalTitle: document.getElementById("video-modal-title"),
  videoModalLink: document.getElementById("video-modal-link"),
  btnCloseVidModal: document.getElementById("btn-close-vid-modal"),
  modalBackdropVid: document.getElementById("modal-backdrop-vid"),
  citationTooltip: document.getElementById("citation-tooltip"),
  tooltipNum: document.getElementById("tooltip-num"),
  tooltipTitle: document.getElementById("tooltip-title"),
  tooltipSnippet: document.getElementById("tooltip-snippet"),
  tooltipScore: document.getElementById("tooltip-score"),
  tooltipUrl: document.getElementById("tooltip-url"),
  toastContainer: document.getElementById("toast-container"),
  statusEngineText: document.getElementById("status-engine-text"),
  engineStatusBadge: document.getElementById("engine-status-badge"),
};

// Initialize Application
document.addEventListener("DOMContentLoaded", () => {
  initSessions();
  initEventListeners();
  checkEngineHealth();
  marked.setOptions({
    breaks: true,
    gfm: true,
    highlight: (code, lang) => {
      const language = hljs.getLanguage(lang) ? lang : "plaintext";
      return hljs.highlight(code, { language }).value;
    },
  });
});

/* ==========================================================================
   Event Listeners & State Management
   ========================================================================== */
function initEventListeners() {
  // Sidebar Collapse
  DOM.btnSidebarCollapse.addEventListener("click", () => {
    DOM.sidebar.classList.toggle("collapsed");
  });

  DOM.btnMobileSidebar.addEventListener("click", () => {
    DOM.sidebar.classList.toggle("mobile-open");
  });

  // New Chat
  DOM.btnNewChat.addEventListener("click", startNewSession);

  // Agent Navigation (Sidebar + Mode Pills)
  document.querySelectorAll("[data-mode]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const mode = btn.getAttribute("data-mode");
      if (mode) switchAgentMode(mode);
    });
  });

  // Dropdown Mode Menu
  DOM.dropdownModeBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    DOM.modeMenu.classList.toggle("open");
  });

  document.addEventListener("click", () => {
    DOM.modeMenu.classList.remove("open");
  });

  // Search Input Auto-resize & Keypress
  DOM.searchInput.addEventListener("input", () => {
    DOM.searchInput.style.height = "auto";
    DOM.searchInput.style.height = Math.min(DOM.searchInput.scrollHeight, 120) + "px";
  });

  DOM.searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSearchSubmit();
    }
  });

  DOM.btnSubmitSearch.addEventListener("click", handleSearchSubmit);

  // Starter Prompt Chips
  document.querySelectorAll(".starter-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      const prompt = chip.getAttribute("data-prompt");
      const mode = chip.getAttribute("data-mode") || "web";
      if (mode) switchAgentMode(mode);
      if (prompt) {
        DOM.searchInput.value = prompt;
        handleSearchSubmit();
      }
    });
  });

  // Telemetry Drawer
  DOM.btnToggleTelemetry.addEventListener("click", () => {
    DOM.telemetryDrawer.classList.toggle("open");
  });

  DOM.btnCloseTelemetry.addEventListener("click", () => {
    DOM.telemetryDrawer.classList.remove("open");
  });

  // Export Session
  DOM.btnExportSession.addEventListener("click", exportSession);

  // Settings Modal
  DOM.btnOpenSettings.addEventListener("click", () => {
    loadSettingsModal();
    DOM.settingsModal.classList.add("open");
  });
  DOM.btnCloseSettings.addEventListener("click", () => DOM.settingsModal.classList.remove("open"));
  DOM.modalBackdropSettings.addEventListener("click", () => DOM.settingsModal.classList.remove("open"));

  const btnSaveSettings = document.getElementById("btn-save-settings");
  if (btnSaveSettings) {
    btnSaveSettings.addEventListener("click", saveSettingsModal);
  }

  // Lightbox Close
  DOM.btnCloseImgModal.addEventListener("click", () => DOM.imageLightboxModal.classList.remove("open"));
  DOM.modalBackdropImg.addEventListener("click", () => DOM.imageLightboxModal.classList.remove("open"));
  DOM.btnCloseVidModal.addEventListener("click", () => {
    DOM.videoPlayerIframe.src = "";
    DOM.videoPlayerModal.classList.remove("open");
  });
  DOM.modalBackdropVid.addEventListener("click", () => {
    DOM.videoPlayerIframe.src = "";
    DOM.videoPlayerModal.classList.remove("open");
  });
}

/* ==========================================================================
   Agent Mode Switching
   ========================================================================== */
function switchAgentMode(mode) {
  if (!AGENTS[mode]) return;
  state.currentMode = mode;
  const meta = AGENTS[mode];

  // Update Header Badges
  const iconPrefix = meta.isBrand ? "fa-brands" : "fa-solid";
  DOM.badgeIcon.className = `${iconPrefix} ${meta.icon}`;
  DOM.badgeName.textContent = `${meta.name} Agent`;
  DOM.badgeCategory.textContent = meta.category;

  // Update Dropdown Button
  DOM.dropdownIcon.className = `${iconPrefix} ${meta.icon}`;
  DOM.dropdownName.textContent = meta.name.split(" ")[0];
  DOM.hintModeText.textContent = meta.name;

  // Update Active States across Sidebar, Pills & Dropdown
  document.querySelectorAll("[data-mode]").forEach((el) => {
    if (el.getAttribute("data-mode") === mode) {
      el.classList.add("active");
    } else {
      el.classList.remove("active");
    }
  });

  DOM.modeMenu.classList.remove("open");
  showToast(`Switched to ${meta.name} Agent`, "success");
}

/* ==========================================================================
   Search Execution & Stream Processing
   ========================================================================== */
async function handleSearchSubmit() {
  const query = DOM.searchInput.value.trim();
  if (!query || state.isGenerating) return;

  state.isGenerating = true;
  DOM.btnSubmitSearch.disabled = true;
  DOM.searchInput.value = "";
  DOM.searchInput.style.height = "auto";

  // Hide Welcome Hero, Show Research Feed
  DOM.welcomeHero.style.display = "none";
  DOM.researchFeed.style.display = "flex";

  const mode = state.currentMode;
  const isStreaming = AGENTS[mode].streaming;

  // Update Session State
  if (!state.currentSessionId) {
    state.currentSessionId = "session_" + Date.now();
    state.sessions.unshift({
      id: state.currentSessionId,
      title: query.slice(0, 36) + (query.length > 36 ? "..." : ""),
      timestamp: Date.now(),
      turns: [],
    });
    saveSessions();
    renderSessionHistory();
  }

  // Create UI Turn Elements
  const turnId = "turn_" + Date.now();
  const turnElement = createTurnElement(turnId, query, mode);
  DOM.researchFeed.appendChild(turnElement);
  DOM.viewportScroll.scrollTop = DOM.viewportScroll.scrollHeight;

  // Update Telemetry Stepper
  updateTelemetryPipeline("start", query, mode);

  if (isStreaming) {
    await executeStreamingSearch(turnId, query, mode);
  } else {
    await executeListingSearch(turnId, query, mode);
  }

  state.isGenerating = false;
  DOM.btnSubmitSearch.disabled = false;
}

/* ==========================================================================
   Streaming Agent Pipeline (Web, Academic, Reddit, YouTube, Writing)
   ========================================================================== */
async function executeStreamingSearch(turnId, query, mode) {
  const sourcesContainer = document.getElementById(`${turnId}-sources`);
  const sourcesCarousel = document.getElementById(`${turnId}-carousel`);
  const responseBody = document.getElementById(`${turnId}-body`);
  const telemetryRephrase = document.getElementById("telemetry-rephrase-out");
  const telemetrySearch = document.getElementById("telemetry-search-out");
  const telemetryRerank = document.getElementById("telemetry-rerank-out");
  const vectorScoreList = document.getElementById("vector-score-list");

  let fullResponseText = "";
  let retrievedSources = [];

  const historyParam = encodeURIComponent(JSON.stringify(state.chatHistory));
  const queryParam = encodeURIComponent(query);
  const streamUrl = `/api/search/stream?mode=${mode}&query=${queryParam}&history=${historyParam}`;

  // Animate Stepper Step 1: Rephrase
  updateTelemetryStep("step-rephrase", "active", "Optimizing query for retrieval...");
  telemetryRephrase.textContent = `Optimizing query: "${query}"`;
  telemetryRephrase.classList.add("visible");

  try {
    const response = await fetch(streamUrl);
    if (!response.ok) throw new Error(`HTTP Error ${response.status}`);

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    updateTelemetryStep("step-rephrase", "completed", "Query rephrased");
    updateTelemetryStep("step-search", "active", "Querying search engines...");

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const jsonStr = line.slice(6).trim();
          if (!jsonStr) continue;

          try {
            const payload = JSON.parse(jsonStr);

            if (payload.type === "sources") {
              retrievedSources = payload.data || [];
              state.activeSources = retrievedSources;
              renderSourcesCarousel(sourcesCarousel, retrievedSources);
              sourcesContainer.style.display = "flex";

              // Update Telemetry Step 2 & 3
              updateTelemetryStep("step-search", "completed", `Retrieved ${retrievedSources.length} hits`);
              updateTelemetryStep("step-rerank", "active", "Scoring vector embeddings & cosine similarity...");
              
              telemetrySearch.textContent = `Engines: ${getEnginesByMode(mode).join(", ")} | Hits: ${retrievedSources.length}`;
              telemetrySearch.classList.add("visible");

              renderVectorScores(vectorScoreList, retrievedSources);
              updateTelemetryStep("step-rerank", "completed", `Reranked ${retrievedSources.length} sources (threshold > 0.45)`);
              updateTelemetryStep("step-synthesis", "active", "Streaming cited markdown response...");

            } else if (payload.type === "response") {
              fullResponseText += payload.data;
              responseBody.innerHTML = renderMarkdownWithCitations(fullResponseText, retrievedSources);
              bindCitationTooltips(responseBody, retrievedSources);
              DOM.viewportScroll.scrollTop = DOM.viewportScroll.scrollHeight;
            } else if (payload.type === "done" || payload.type === "end") {
              updateTelemetryStep("step-synthesis", "completed", "Synthesis completed");
            } else if (payload.type === "error") {
              const errMsg = String(payload.data || "");
              if (errMsg.includes("Invalid API Key") || errMsg.includes("invalid_api_key") || errMsg.includes("401")) {
                responseBody.innerHTML = `
                  <div class="synthesis-fallback-note">
                    <div class="hero-chip"><i class="fa-solid fa-key"></i> Notice: Live LLM API Key Unconfigured</div>
                    <p>To enable real-time Groq LLaMA 3.3 streaming inference, open your <code>.env</code> file in <code>Desktop/perplexity clone/.env</code> and set your <code>GROQ_API_KEY</code>.</p>
                    <p style="margin-top: 10px; font-size: 13px; color: var(--text-secondary);">The multi-engine search retriever, cosine vector reranker, image gallery, video player, and follow-up suggestion engines are fully active above!</p>
                  </div>
                `;
              } else {
                showToast(errMsg || "Search execution error", "error");
              }
            }
          } catch (e) {
            // non-json line
          }
        }
      }
    }

    // Save Chat History
    state.chatHistory.push({ role: "user", content: query });
    state.chatHistory.push({ role: "assistant", content: fullResponseText });

    // Fetch and render cognitive follow-up suggestions
    fetchAndRenderSuggestions(turnId);

  } catch (err) {
    responseBody.innerHTML = `<div class="error-msg"><i class="fa-solid fa-triangle-exclamation"></i> Error executing agent pipeline: ${err.message}</div>`;
    showToast(err.message, "error");
  }
}

/* ==========================================================================
   Listing Agent Pipeline (Visual Discovery, Video Streams)
   ========================================================================== */
async function executeListingSearch(turnId, query, mode) {
  const responseBody = document.getElementById(`${turnId}-body`);
  responseBody.innerHTML = `<div class="loading-state"><i class="fa-solid fa-spinner fa-spin"></i> Retrieving media assets for "${query}"...</div>`;

  const historyParam = encodeURIComponent(JSON.stringify(state.chatHistory));
  const queryParam = encodeURIComponent(query);
  const listUrl = `/api/search/list?mode=${mode}&query=${queryParam}&history=${historyParam}`;

  try {
    const res = await fetch(listUrl);
    const result = await res.json();

    if (!result.success) throw new Error(result.error || "Failed to fetch media");

    const items = result.data || [];
    if (items.length === 0) {
      responseBody.innerHTML = `<div class="empty-hint">No visual media found for "${query}".</div>`;
      return;
    }

    if (mode === "image") {
      renderImageGrid(responseBody, items);
    } else if (mode === "video") {
      renderVideoGrid(responseBody, items);
    }

    state.chatHistory.push({ role: "user", content: query });
    state.chatHistory.push({ role: "assistant", content: `Retrieved ${items.length} ${mode} assets.` });

  } catch (err) {
    responseBody.innerHTML = `<div class="error-msg"><i class="fa-solid fa-triangle-exclamation"></i> ${err.message}</div>`;
    showToast(err.message, "error");
  }
}

/* ==========================================================================
   UI Component Builders & Renderers
   ========================================================================== */
function createTurnElement(turnId, query, mode) {
  const meta = AGENTS[mode];
  const div = document.createElement("div");
  div.className = "turn-card";
  div.id = turnId;

  div.innerHTML = `
    <div class="turn-user-query">
      <span class="query-agent-badge"><i class="${meta.isBrand ? "fa-brands" : "fa-solid"} ${meta.icon}"></i> ${meta.name}</span>
      <span>${escapeHtml(query)}</span>
    </div>

    <div class="sources-container" id="${turnId}-sources" style="display: none;">
      <div class="sources-header">
        <i class="fa-solid fa-layer-group"></i>
        <span>Verified Sources</span>
      </div>
      <div class="sources-carousel" id="${turnId}-carousel"></div>
    </div>

    <div class="synthesis-card">
      <div class="synthesis-header">
        <div class="synthesis-title">
          <i class="fa-solid fa-sparkles"></i>
          <span>${meta.name} Synthesis</span>
        </div>
        <div class="synthesis-actions">
          <button class="action-btn" onclick="copyTurnResponse('${turnId}')" title="Copy text">
            <i class="fa-regular fa-copy"></i> Copy
          </button>
        </div>
      </div>
      <div class="synthesis-content" id="${turnId}-body">
        <div class="loading-state"><i class="fa-solid fa-circle-notch fa-spin"></i> Initializing multi-engine retrieval...</div>
      </div>
      <div class="suggestions-box" id="${turnId}-suggestions" style="display: none;">
        <div class="suggestions-title"><i class="fa-solid fa-lightbulb"></i> Suggested Inquiries</div>
        <div class="suggestions-chips" id="${turnId}-suggestion-chips"></div>
      </div>
    </div>
  `;

  return div;
}

function renderSourcesCarousel(container, sources) {
  container.innerHTML = "";
  sources.forEach((src) => {
    const card = document.createElement("a");
    card.className = "source-badge-card";
    card.href = src.url || "#";
    card.target = "_blank";
    card.rel = "noopener noreferrer";

    let domain = "";
    try {
      domain = new URL(src.url).hostname.replace("www.", "");
    } catch {
      domain = src.engine || "web";
    }

    const scorePct = Math.round((src.relevanceScore || 0.85) * 100);

    card.innerHTML = `
      <div class="source-badge-top">
        <span class="source-badge-index">[${src.index}]</span>
        <span class="source-badge-score">${scorePct}% relevance</span>
      </div>
      <div class="source-badge-title" title="${escapeHtml(src.title)}">${escapeHtml(src.title)}</div>
      <div class="source-badge-domain">${escapeHtml(domain)}</div>
    `;

    container.appendChild(card);
  });
}

function renderImageGrid(container, images) {
  const grid = document.createElement("div");
  grid.className = "media-result-grid";

  images.forEach((img) => {
    const card = document.createElement("div");
    card.className = "image-card";
    card.innerHTML = `
      <div class="image-thumb-wrap">
        <img src="${img.thumbnail || img.img_src}" alt="${escapeHtml(img.title)}" loading="lazy" />
      </div>
      <div class="image-card-meta">
        <div class="image-card-title">${escapeHtml(img.title)}</div>
      </div>
    `;
    card.addEventListener("click", () => {
      DOM.lightboxImg.src = img.img_src || img.thumbnail;
      DOM.lightboxTitle.textContent = img.title;
      DOM.lightboxLink.href = img.url || img.img_src;
      DOM.imageLightboxModal.classList.add("open");
    });
    grid.appendChild(card);
  });

  container.innerHTML = "";
  container.appendChild(grid);
}

function renderVideoGrid(container, videos) {
  const grid = document.createElement("div");
  grid.className = "media-result-grid";

  videos.forEach((vid) => {
    const card = document.createElement("div");
    card.className = "video-card";
    card.innerHTML = `
      <div class="video-thumb-wrap">
        <img src="${vid.thumbnail || vid.img_src}" alt="${escapeHtml(vid.title)}" loading="lazy" />
        <div class="video-play-overlay"><i class="fa-solid fa-play"></i></div>
      </div>
      <div class="image-card-meta">
        <div class="image-card-title">${escapeHtml(vid.title)}</div>
      </div>
    `;
    card.addEventListener("click", () => {
      DOM.videoPlayerIframe.src = vid.iframe_src || vid.url;
      DOM.videoModalTitle.textContent = vid.title;
      DOM.videoModalLink.href = vid.url;
      DOM.videoPlayerModal.classList.add("open");
    });
    grid.appendChild(card);
  });

  container.innerHTML = "";
  container.appendChild(grid);
}

/* ==========================================================================
   Citation Parser & Tooltip Binding
   ========================================================================== */
function renderMarkdownWithCitations(rawMarkdown, sources) {
  let parsedHtml = marked.parse(rawMarkdown);

  // Replace [1], [2], [1, 2] with interactive citation badges
  parsedHtml = parsedHtml.replace(/\[(\d+)\]/g, (match, p1) => {
    return `<span class="cite-tag" data-cite="${p1}">[${p1}]</span>`;
  });

  return parsedHtml;
}

function bindCitationTooltips(container, sources) {
  const tags = container.querySelectorAll(".cite-tag");
  tags.forEach((tag) => {
    tag.addEventListener("mouseenter", (e) => {
      const idx = parseInt(tag.getAttribute("data-cite"), 10);
      const source = sources.find((s) => s.index === idx);

      if (source) {
        DOM.tooltipNum.textContent = `[${source.index}]`;
        DOM.tooltipTitle.textContent = source.title || "Resource";
        DOM.tooltipSnippet.textContent = source.content || "Click to view full web resource.";
        DOM.tooltipScore.textContent = `${Math.round((source.relevanceScore || 0.85) * 100)}% match`;
        try {
          DOM.tooltipUrl.textContent = new URL(source.url).hostname.replace("www.", "");
        } catch {
          DOM.tooltipUrl.textContent = source.engine || "web";
        }

        const rect = tag.getBoundingClientRect();
        DOM.citationTooltip.style.top = `${rect.bottom + 8}px`;
        DOM.citationTooltip.style.left = `${Math.max(10, Math.min(window.innerWidth - 300, rect.left - 20))}px`;
        DOM.citationTooltip.classList.add("visible");
      }
    });

    tag.addEventListener("mouseleave", () => {
      DOM.citationTooltip.classList.remove("visible");
    });

    tag.addEventListener("click", () => {
      const idx = parseInt(tag.getAttribute("data-cite"), 10);
      const source = sources.find((s) => s.index === idx);
      if (source && source.url) {
        window.open(source.url, "_blank", "noopener,noreferrer");
      }
    });
  });
}

/* ==========================================================================
   Follow-up Suggestions Generator
   ========================================================================== */
async function fetchAndRenderSuggestions(turnId) {
  const box = document.getElementById(`${turnId}-suggestions`);
  const chipsContainer = document.getElementById(`${turnId}-suggestion-chips`);

  try {
    const historyParam = encodeURIComponent(JSON.stringify(state.chatHistory));
    const res = await fetch(`/api/search/list?mode=suggestion&history=${historyParam}`);
    const data = await res.json();

    if (data.success && Array.isArray(data.data) && data.data.length > 0) {
      chipsContainer.innerHTML = "";
      data.data.forEach((queryText) => {
        const chip = document.createElement("button");
        chip.className = "suggestion-chip";
        chip.innerHTML = `<i class="fa-solid fa-arrow-right"></i> <span>${escapeHtml(queryText)}</span>`;
        chip.addEventListener("click", () => {
          DOM.searchInput.value = queryText;
          handleSearchSubmit();
        });
        chipsContainer.appendChild(chip);
      });
      box.style.display = "flex";
      DOM.viewportScroll.scrollTop = DOM.viewportScroll.scrollHeight;
    }
  } catch (err) {
    // silently fail suggestion chips
  }
}

/* ==========================================================================
   Telemetry & Stepper Management
   ========================================================================== */
function updateTelemetryPipeline(phase, query, mode) {
  const steps = ["step-rephrase", "step-search", "step-rerank", "step-synthesis"];
  steps.forEach((stepId) => {
    const el = document.getElementById(stepId);
    el.className = "step-item";
  });

  document.getElementById("status-rephrase").textContent = "Idle";
  document.getElementById("status-search").textContent = "Idle";
  document.getElementById("status-rerank").textContent = "Idle";
  document.getElementById("status-synthesis").textContent = "Idle";

  document.getElementById("telemetry-rephrase-out").classList.remove("visible");
  document.getElementById("telemetry-search-out").classList.remove("visible");
  document.getElementById("telemetry-rerank-out").classList.remove("visible");
  document.getElementById("telemetry-synthesis-out").classList.remove("visible");
}

function updateTelemetryStep(stepId, stateClass, statusText) {
  const el = document.getElementById(stepId);
  if (!el) return;

  el.classList.remove("active", "completed");
  el.classList.add(stateClass);

  const statusEl = el.querySelector(".step-status");
  if (statusEl && statusText) {
    statusEl.textContent = statusText;
  }
}

function renderVectorScores(container, sources) {
  container.innerHTML = "";
  document.getElementById("telemetry-doc-count").textContent = `${sources.length} Docs`;

  sources.slice(0, 8).forEach((src) => {
    const scorePct = Math.round((src.relevanceScore || 0.85) * 100);
    const item = document.createElement("div");
    item.className = "score-bar-item";
    item.innerHTML = `
      <div class="score-bar-info">
        <span>[${src.index}] ${escapeHtml(src.title.slice(0, 26))}...</span>
        <span>${scorePct}%</span>
      </div>
      <div class="score-progress-track">
        <div class="score-progress-fill" style="width: ${scorePct}%"></div>
      </div>
    `;
    container.appendChild(item);
  });
}

function getEnginesByMode(mode) {
  switch (mode) {
    case "academic":
      return ["ArXiv", "Google Scholar", "PubMed", "InternetArchive"];
    case "reddit":
      return ["Reddit"];
    case "youtube":
      return ["YouTube"];
    case "image":
      return ["Bing Images", "Google Images"];
    case "writing":
      return ["LLM Direct (No-Search)"];
    case "web":
    default:
      return ["Google", "Bing", "DuckDuckGo"];
  }
}

/* ==========================================================================
   Sessions & History Persistence
   ========================================================================== */
function initSessions() {
  try {
    const saved = localStorage.getItem("nexus_sessions");
    if (saved) {
      state.sessions = JSON.parse(saved);
      renderSessionHistory();
    }
  } catch (e) {
    state.sessions = [];
  }
}

function saveSessions() {
  try {
    localStorage.setItem("nexus_sessions", JSON.stringify(state.sessions));
  } catch (e) {}
}

function renderSessionHistory() {
  DOM.sessionHistoryList.innerHTML = "";
  state.sessions.forEach((s) => {
    const item = document.createElement("div");
    item.className = `history-item ${s.id === state.currentSessionId ? "active" : ""}`;
    item.textContent = s.title;
    item.addEventListener("click", () => loadSession(s.id));
    DOM.sessionHistoryList.appendChild(item);
  });
}

function startNewSession() {
  state.currentSessionId = null;
  state.chatHistory = [];
  DOM.researchFeed.innerHTML = "";
  DOM.researchFeed.style.display = "none";
  DOM.welcomeHero.style.display = "flex";
  renderSessionHistory();
}

function loadSession(sessionId) {
  const session = state.sessions.find((s) => s.id === sessionId);
  if (!session) return;
  state.currentSessionId = session.id;
  renderSessionHistory();
  showToast(`Loaded session: ${session.title}`, "success");
}

/* ==========================================================================
   Utilities & Diagnostics
   ========================================================================== */
async function checkEngineHealth() {
  try {
    const res = await fetch("/api/health");
    const data = await res.json();
    if (data.status === "healthy") {
      const isLlmConfigured = data.llm?.groq_configured;
      const statusText = isLlmConfigured ? "Groq LLaMA-3.3 Ready" : "Core Ready (No API Key)";
      DOM.statusEngineText.textContent = statusText;
      DOM.engineStatusBadge.querySelector(".status-dot").className = `status-dot ${isLlmConfigured ? "online" : "warning"}`;
    }
  } catch {
    DOM.statusEngineText.textContent = "Offline Mode";
  }
}

async function loadSettingsModal() {
  try {
    const res = await fetch("/api/config");
    const data = await res.json();
    if (data) {
      if (data.groq_api_key_masked) {
        document.getElementById("input-groq-key").placeholder = `Current: ${data.groq_api_key_masked}`;
      }
      if (data.gemini_api_key_masked) {
        document.getElementById("input-gemini-key").placeholder = `Current: ${data.gemini_api_key_masked}`;
      }
      if (data.searxng_url) {
        document.getElementById("input-searxng-url").value = data.searxng_url;
      }
    }
  } catch (e) {}
}

async function saveSettingsModal() {
  const groqKey = document.getElementById("input-groq-key").value.trim();
  const geminiKey = document.getElementById("input-gemini-key").value.trim();
  const searxngUrl = document.getElementById("input-searxng-url").value.trim();

  const payload = {};
  if (groqKey) payload.groq_api_key = groqKey;
  if (geminiKey) payload.gemini_api_key = geminiKey;
  if (searxngUrl) payload.searxng_url = searxngUrl;

  try {
    const res = await fetch("/api/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await res.json();
    if (result.success) {
      showToast("API keys saved & models reloaded successfully!", "success");
      DOM.settingsModal.classList.remove("open");
      checkEngineHealth();
    } else {
      showToast("Failed to update config.", "error");
    }
  } catch (err) {
    showToast("Error updating settings: " + err.message, "error");
  }
}

window.copyTurnResponse = function (turnId) {
  const body = document.getElementById(`${turnId}-body`);
  if (body) {
    navigator.clipboard.writeText(body.innerText);
    showToast("Response copied to clipboard", "success");
  }
};

function exportSession() {
  if (state.chatHistory.length === 0) {
    showToast("No active research session to export.", "error");
    return;
  }

  let md = `# NexusAI Deep Research Session\nExported: ${new Date().toLocaleString()}\n\n`;
  state.chatHistory.forEach((msg) => {
    md += `### ${msg.role === "user" ? "Query" : "Nexus Intelligence"}\n\n${msg.content}\n\n---\n\n`;
  });

  const blob = new Blob([md], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `nexus-research-${Date.now()}.md`;
  a.click();
  URL.revokeObjectURL(url);
  showToast("Session exported to Markdown", "success");
}

function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `<i class="fa-solid ${type === "success" ? "fa-circle-check" : "fa-triangle-exclamation"}"></i> <span>${escapeHtml(message)}</span>`;
  DOM.toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text || "";
  return div.innerHTML;
}
