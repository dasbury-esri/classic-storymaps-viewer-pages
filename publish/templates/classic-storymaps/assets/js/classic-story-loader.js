(function() {
  "use strict";

  var APP_ID_REGEX = /^[a-f0-9]{32}$/i;
  var AUTH_STORAGE_KEY = "arcgis_access_token";
  var ARC_BASE = "https://www.arcgis.com/sharing/rest";

  var VIEWER_BY_APP = {
    maptour: "/templates/classic-storymaps/maptour/index.html",
    swipe: "/templates/classic-storymaps/swipe/index.html",
    mapjournal: "/templates/classic-storymaps/mapjournal/index.html",
    mapseries: "/templates/classic-storymaps/mapseries/index.html",
    cascade: "/templates/classic-storymaps/cascade/index.html",
    shortlist: "/templates/classic-storymaps/shortlist/index.html",
    crowdsource: "/templates/classic-storymaps/crowdsource/index.html",
    basic: "/templates/classic-storymaps/basic/index.html"
  };

  var APP_LABEL_BY_ID = {
    maptour: "Map Tour",
    swipe: "Swipe",
    mapjournal: "Map Journal",
    mapseries: "Map Series",
    cascade: "Cascade",
    shortlist: "Shortlist",
    crowdsource: "Crowdsource",
    basic: "Basic"
  };

  var DEMO_APP_TYPE_BY_ID = {
    maptour: "Story Map Tour",
    swipe: "Story Map Swipe",
    mapjournal: "Story Map Journal",
    mapseries: "Story Map Series",
    cascade: "Story Map Cascade",
    shortlist: "Story Map Shortlist",
    crowdsource: "Story Map Crowdsource",
    basic: "Story Map Basic"
  };

  function sanitize(value) {
    return (value || "").trim();
  }

  function normalizeId(value) {
    return sanitize(value).toLowerCase();
  }

  function encodePath(path) {
    return String(path || "")
      .split("/")
      .map(function(part) { return encodeURIComponent(part); })
      .join("/");
  }

  function setClass(el, base, kind) {
    el.className = base + (kind ? " " + kind : "");
  }

  function getStoredToken() {
    try {
      return sessionStorage.getItem(AUTH_STORAGE_KEY);
    } catch (_) {
      return null;
    }
  }

  function getCookieToken() {
    var m = document.cookie.match(/(?:^|;\s*)esri_auth=([^;]+)/);
    if (!m) {
      return null;
    }

    try {
      var decoded = decodeURIComponent(m[1]);
      var parsed = JSON.parse(decoded);
      return parsed && parsed.token ? parsed.token : null;
    } catch (_) {
      return null;
    }
  }

  function getToken() {
    return getStoredToken() || getCookieToken();
  }

  function downloadBlob(filename, blob) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function() {
      URL.revokeObjectURL(url);
      a.remove();
    }, 0);
  }

  function downloadJson(filename, value) {
    var text = JSON.stringify(value, null, 2);
    downloadBlob(filename, new Blob([text], { type: "application/json" }));
  }

  async function fetchArcgisJson(path, token, extraParams) {
    var params = new URLSearchParams();
    params.set("f", "json");
    if (token) {
      params.set("token", token);
    }

    if (extraParams) {
      Object.keys(extraParams).forEach(function(key) {
        if (extraParams[key] !== undefined && extraParams[key] !== null) {
          params.set(key, String(extraParams[key]));
        }
      });
    }

    var url = ARC_BASE + path + "?" + params.toString();
    var response = await fetch(url);
    var json = await response.json();
    if (json && json.error) {
      throw new Error(json.error.message || "ArcGIS REST error");
    }
    return json;
  }

  async function tryFetchItemData(itemId, token) {
    try {
      return await fetchArcgisJson("/content/items/" + encodeURIComponent(itemId) + "/data", token);
    } catch (_) {
      return null;
    }
  }

  function classifyClassic(item) {
    var keywords = Array.isArray(item && item.typeKeywords) ? item.typeKeywords : [];
    var joined = keywords.join("|").toLowerCase();
    var type = String((item && item.type) || "").toLowerCase();
    var url = String((item && item.url) || "").toLowerCase();

    function has(fragment) {
      return joined.indexOf(fragment) !== -1;
    }

    function hasAny(fragments) {
      for (var i = 0; i < fragments.length; i += 1) {
        if (has(fragments[i])) {
          return true;
        }
      }
      return false;
    }

    if (hasAny(["story map tour", "storymaptour", "maptour"]) || url.indexOf("/maptour/") !== -1) return "maptour";
    if (hasAny(["story map swipe", "story map spyglass", "storymapswipe", "storymapspyglass", "mapswipe", "mapspyglass"]) || url.indexOf("/swipe/") !== -1) return "swipe";
    if (hasAny(["story map journal", "storymapjournal", "mapjournal"]) || url.indexOf("/mapjournal/") !== -1) return "mapjournal";
    if (hasAny(["story map series", "storymapseries", "mapseries"]) || url.indexOf("/mapseries/") !== -1) return "mapseries";
    if (hasAny(["story map cascade", "storymapcascade", "mapcascade"]) || url.indexOf("/cascade/") !== -1) return "cascade";
    if (hasAny(["story map shortlist", "storymapshortlist", "mapshortlist", "shortlist"]) || url.indexOf("/shortlist/") !== -1) return "shortlist";
    if (hasAny(["story map crowdsource", "storymapcrowdsource", "mapcrowdsource", "crowdsource"]) || url.indexOf("/crowdsource/") !== -1) return "crowdsource";
    if (hasAny(["story map basic", "storymapbasic", "mapbasic"]) || url.indexOf("/basic/") !== -1) return "basic";

    if (type === "web mapping application" && has("story map")) {
      return "unknown-classic";
    }

    return null;
  }

  function extractAppId(value) {
    if (!value) {
      return null;
    }

    var str = String(value);
    var match = str.match(/[?&]appid=([a-f0-9]{32})/i);
    if (match) {
      return normalizeId(match[1]);
    }

    match = str.match(/\b([a-f0-9]{32})\b/i);
    return match ? normalizeId(match[1]) : null;
  }

  function findFirstAppIdInObject(node, maxDepth) {
    function walk(value, depth) {
      if (depth > maxDepth || value == null) {
        return null;
      }

      if (typeof value === "string") {
        return extractAppId(value);
      }

      if (Array.isArray(value)) {
        for (var i = 0; i < value.length; i += 1) {
          var found = walk(value[i], depth + 1);
          if (found) return found;
        }
        return null;
      }

      if (typeof value === "object") {
        var keys = Object.keys(value);
        for (var k = 0; k < keys.length; k += 1) {
          var next = walk(value[keys[k]], depth + 1);
          if (next) return next;
        }
      }

      return null;
    }

    return walk(node, 0);
  }

  async function tryFetchWebPageAppId(url) {
    try {
      var response = await fetch(url, { method: "GET" });
      if (!response.ok) return null;
      var text = await response.text();
      return extractAppId(text);
    } catch (_) {
      return null;
    }
  }

  async function resolveClassicStory(seedId, token) {
    var visited = {};
    var chain = [];

    async function resolveOne(itemId, depth) {
      if (!itemId || depth > 4 || visited[itemId]) {
        return null;
      }

      visited[itemId] = true;
      var item = await fetchArcgisJson("/content/items/" + encodeURIComponent(itemId), token);
      var itemData = await tryFetchItemData(item.id, token);
      var classicType = classifyClassic(item);

      chain.push({
        id: item.id,
        title: item.title || "(Untitled)",
        type: item.type || "(Unknown)",
        classicType: classicType || "none"
      });

      if (classicType) {
        return {
          item: item,
          itemData: itemData,
          classicType: classicType,
          chain: chain
        };
      }

      var nextId = extractAppId(item.url);
      if (!nextId && itemData) {
        nextId = findFirstAppIdInObject(itemData, 6);
      }

      if (!nextId && item.url && /^https?:/i.test(item.url)) {
        nextId = await tryFetchWebPageAppId(item.url);
      }

      if (nextId && !visited[nextId]) {
        return resolveOne(nextId, depth + 1);
      }

      return {
        item: item,
        itemData: itemData,
        classicType: null,
        chain: chain
      };
    }

    return resolveOne(seedId, 0);
  }

  function getViewerUrl(classicType, appId) {
    var base = VIEWER_BY_APP[classicType];
    if (!base) {
      return null;
    }
    return base + "?appid=" + encodeURIComponent(normalizeId(appId));
  }

  function isLikelyImageUrl(value) {
    var str = String(value || "").toLowerCase();
    if (!/^https?:\/\//.test(str) && str.indexOf("/sharing/rest/content/items/") === -1) {
      return false;
    }
    return /(\.jpg|\.jpeg|\.png|\.gif|\.webp|\.bmp|\.tif|\.tiff)(\?|$)/.test(str) || str.indexOf("/sharing/rest/content/items/") !== -1;
  }

  function collectImageRefs(node) {
    var refs = [];

    function walk(value, path, context) {
      if (value == null) {
        return;
      }

      if (typeof value === "string") {
        if (isLikelyImageUrl(value)) {
          refs.push({
            path: path,
            title: context.title || "",
            caption: context.caption || "",
            altText: context.altText || "",
            url: value
          });
        }
        return;
      }

      if (Array.isArray(value)) {
        for (var i = 0; i < value.length; i += 1) {
          walk(value[i], path + "[" + i + "]", context);
        }
        return;
      }

      if (typeof value === "object") {
        var nextContext = {
          title: context.title,
          caption: context.caption,
          altText: context.altText
        };

        if (typeof value.title === "string") nextContext.title = value.title;
        if (typeof value.name === "string" && !nextContext.title) nextContext.title = value.name;
        if (typeof value.caption === "string") nextContext.caption = value.caption;
        if (typeof value.alt_text === "string") nextContext.altText = value.alt_text;
        if (typeof value.altText === "string") nextContext.altText = value.altText;
        if (typeof value.alt === "string") nextContext.altText = value.alt;

        Object.keys(value).forEach(function(key) {
          walk(value[key], path ? path + "." + key : key, nextContext);
        });
      }
    }

    walk(node, "", { title: "", caption: "", altText: "" });
    return refs;
  }

  function toCsv(rows) {
    function esc(value) {
      var text = String(value == null ? "" : value);
      if (/[",\n]/.test(text)) {
        return '"' + text.replace(/"/g, '""') + '"';
      }
      return text;
    }

    var header = ["usage_path", "title", "caption", "alt_text", "image_url", "downloaded"];
    var lines = [header.join(",")];

    rows.forEach(function(row) {
      lines.push([
        esc(row.path),
        esc(row.title),
        esc(row.caption),
        esc(row.altText),
        esc(row.url),
        esc(row.downloaded)
      ].join(","));
    });

    return lines.join("\n");
  }

  function addTokenToResourceUrl(url, token) {
    if (!token) {
      return url;
    }

    var u = String(url || "");
    if (u.indexOf("token=") !== -1) {
      return u;
    }

    var sep = u.indexOf("?") === -1 ? "?" : "&";
    return u + sep + "token=" + encodeURIComponent(token);
  }

  async function appendResourcesAndImages(zip, state, token, setStatus) {
    setStatus("Collecting item resources...", "warn");

    var item = state.item;
    var itemData = state.itemData;
    var hasFiles = false;

    var resources = [];
    try {
      var list = await fetchArcgisJson("/content/items/" + encodeURIComponent(item.id) + "/resources", token, { num: 100 });
      resources = Array.isArray(list.resources) ? list.resources : [];
    } catch (_) {
      resources = [];
    }

    for (var i = 0; i < resources.length; i += 1) {
      var entry = resources[i];
      var resourcePath = entry.resource || entry.path || entry.name;
      if (!resourcePath) continue;

      var resourceUrl = ARC_BASE + "/content/items/" + encodeURIComponent(item.id) + "/resources/" + encodePath(resourcePath);
      resourceUrl = addTokenToResourceUrl(resourceUrl, token);

      try {
        var r = await fetch(resourceUrl);
        if (!r.ok) continue;
        var blob = await r.blob();
        zip.file("resources/" + resourcePath, blob);
        hasFiles = true;
      } catch (_) {
        // Best effort for resources.
      }
    }

    var refs = itemData ? collectImageRefs(itemData) : [];
    var seen = {};
    var filteredRefs = [];

    refs.forEach(function(ref) {
      var key = String(ref.url || "").trim();
      if (!key || seen[key]) return;
      seen[key] = true;
      filteredRefs.push(ref);
    });

    for (var j = 0; j < filteredRefs.length; j += 1) {
      var ref = filteredRefs[j];
      var fetchUrl = ref.url;

      if (fetchUrl.indexOf("/sharing/rest/content/items/") !== -1) {
        fetchUrl = addTokenToResourceUrl(fetchUrl, token);
      }

      try {
        var imgRes = await fetch(fetchUrl);
        if (!imgRes.ok) {
          ref.downloaded = "no";
          continue;
        }

        var imgBlob = await imgRes.blob();
        var ext = "bin";
        var extMatch = String(ref.url).match(/\.([a-z0-9]{2,5})(?:\?|$)/i);
        if (extMatch) {
          ext = extMatch[1].toLowerCase();
        }

        var name = "linked-images/image-" + String(j + 1).padStart(3, "0") + "." + ext;
        zip.file(name, imgBlob);
        ref.downloaded = "yes";
        hasFiles = true;
      } catch (_) {
        ref.downloaded = "no";
      }
    }

    if (filteredRefs.length) {
      zip.file("image-reference-report.csv", toCsv(filteredRefs));
      hasFiles = true;
    }

    return { hasFiles: hasFiles };
  }

  async function buildResourceZip(state, token, setStatus) {
    if (!window.JSZip) {
      throw new Error("JSZip is not available on this page.");
    }

    var zip = new window.JSZip();
    var summary = await appendResourcesAndImages(zip, state, token, setStatus);

    if (!summary.hasFiles) {
      throw new Error("No item resources or image references were found for this item.");
    }

    setStatus("Creating ZIP archive...", "warn");
    var zipBlob = await zip.generateAsync({ type: "blob" });
    return zipBlob;
  }

  async function buildAllZip(state, token, setStatus) {
    if (!window.JSZip) {
      throw new Error("JSZip is not available on this page.");
    }

    var zip = new window.JSZip();
    zip.file("item-description.json", JSON.stringify(state.item, null, 2));
    if (state.itemData) {
      zip.file("item-data.json", JSON.stringify(state.itemData, null, 2));
    }

    await appendResourcesAndImages(zip, state, token, setStatus);

    setStatus("Creating ZIP archive...", "warn");
    var zipBlob = await zip.generateAsync({ type: "blob" });
    return zipBlob;
  }

  function ensureUi(form, statusEl) {
    var titleEl = document.getElementById("story-title");
    if (!titleEl) {
      titleEl = document.createElement("p");
      titleEl.id = "story-title";
      titleEl.className = "status";
      titleEl.style.marginTop = "2px";
      statusEl.insertAdjacentElement("afterend", titleEl);
    }

    var row = document.getElementById("story-loader-actions");
    if (!row) {
      row = document.createElement("div");
      row.id = "story-loader-actions";
      row.className = "loader-actions-wrap";
      row.style.marginTop = "6px";

      row.innerHTML = "" +
        '<div class="actions">' +
          '<button id="open-story-btn" type="button" disabled>Open Story Viewer</button>' +
        '</div>' +
        '<div class="loader-downloads">' +
          '<div class="loader-downloads-label">Downloads:</div>' +
          '<div class="loader-downloads-separator" aria-hidden="true"></div>' +
          '<div class="actions">' +
            '<button id="download-item-btn" type="button" disabled>Item Description (JSON)</button>' +
            '<button id="download-data-btn" type="button" disabled>Story Data (JSON)</button>' +
            '<button id="download-zip-btn" type="button" disabled>Resources and Images (ZIP)</button>' +
            '<button id="download-all-btn" type="button" disabled>Download All</button>' +
          '</div>' +
        '</div>';

      var actions = form.querySelector(".actions");
      if (actions) {
        actions.insertAdjacentElement("afterend", row);
      } else {
        form.appendChild(row);
      }
    }

    return {
      titleEl: titleEl,
      openBtn: document.getElementById("open-story-btn"),
      downloadItemBtn: document.getElementById("download-item-btn"),
      downloadDataBtn: document.getElementById("download-data-btn"),
      downloadZipBtn: document.getElementById("download-zip-btn"),
      downloadAllBtn: document.getElementById("download-all-btn")
    };
  }

  function inferViewerConfig() {
    var demoLink = document.getElementById("demo-link");
    var href = demoLink && demoLink.getAttribute("href") ? demoLink.getAttribute("href") : "";
    var appId = extractAppId(href);

    var viewerPath = "";
    if (href) {
      var split = href.split("?");
      viewerPath = split[0] || "";
    }

    var runtimeMatch = viewerPath.match(/\/classic-storymaps\/([^\/]+)\/index\.html$/i);
    var runtimeId = runtimeMatch ? runtimeMatch[1].toLowerCase() : null;

    return {
      defaultAppId: appId,
      runtimeId: runtimeId,
      demoLink: demoLink
    };
  }

  function setDisabled(button, disabled) {
    button.disabled = !!disabled;
    button.style.opacity = disabled ? "0.6" : "1";
    button.style.cursor = disabled ? "not-allowed" : "pointer";
  }

  function ensureLayoutStyles() {
    if (document.getElementById("classic-loader-layout-style")) {
      return;
    }

    var style = document.createElement("style");
    style.id = "classic-loader-layout-style";
    style.textContent = "" +
      ".loader-top-nav{margin-bottom:10px;}" +
      ".loader-actions-wrap{display:grid;gap:8px;}" +
      ".loader-downloads-label{font-size:0.85rem;color:var(--ink-1);font-weight:600;}" +
      ".loader-downloads-separator{height:1px;background:var(--line);opacity:0.7;margin:2px 0 6px;}" +
      ".loader-appid-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;align-items:center;}" +
      ".loader-appid-row button{white-space:nowrap;}" +
      "@media (max-width:620px){.loader-appid-row{grid-template-columns:1fr;}}";
    document.head.appendChild(style);
  }

  function applyLauncherLayout(form, panel, appIdInput, submitButton) {
    ensureLayoutStyles();

    var backLink = form.querySelector(".actions .text-link");
    if (backLink && panel && !backLink.closest(".loader-top-nav")) {
      var nav = document.createElement("div");
      nav.className = "loader-top-nav";
      nav.appendChild(backLink);

      var eyebrow = panel.querySelector(".eyebrow");
      if (eyebrow) {
        panel.insertBefore(nav, eyebrow);
      } else {
        panel.insertBefore(nav, panel.firstChild);
      }
    }

    if (appIdInput && submitButton && !appIdInput.closest(".loader-appid-row")) {
      var row = document.createElement("div");
      row.className = "loader-appid-row";
      appIdInput.insertAdjacentElement("beforebegin", row);
      row.appendChild(appIdInput);
      row.appendChild(submitButton);
    }

    var actions = form.querySelector(".actions");
    if (actions && !actions.querySelector("button") && !actions.querySelector("a")) {
      actions.style.display = "none";
    }
  }

  function init() {
    var form = document.getElementById("launch-form");
    var appIdInput = document.getElementById("appid");
    var statusEl = document.getElementById("appid-status");
    var panel = document.querySelector(".panel");

    if (!form || !appIdInput || !statusEl) {
      return;
    }

    var viewerConfig = inferViewerConfig();
    var launcherAppLabel = APP_LABEL_BY_ID[viewerConfig.runtimeId] || "Story";
    var demoAppType = DEMO_APP_TYPE_BY_ID[viewerConfig.runtimeId] || "story map";
    var ui = ensureUi(form, statusEl);
    var state = {
      item: null,
      itemData: null,
      classicType: null,
      viewerUrl: null
    };

    if (viewerConfig.demoLink) {
      viewerConfig.demoLink.textContent = "If you'd like to view an example " + demoAppType + ", click here";
    }

    function setStatus(msg, kind) {
      statusEl.textContent = msg || "";
      setClass(statusEl, "status", kind || "");
    }

    function setTitle(msg, kind) {
      ui.titleEl.textContent = msg || "";
      setClass(ui.titleEl, "status", kind || "");
    }

    function resetButtons() {
      setDisabled(ui.openBtn, true);
      setDisabled(ui.downloadItemBtn, true);
      setDisabled(ui.downloadDataBtn, true);
      setDisabled(ui.downloadZipBtn, true);
      setDisabled(ui.downloadAllBtn, true);
    }

    function applyFoundState(result) {
      state.item = result.item;
      state.itemData = result.itemData;
      state.classicType = result.classicType;
      state.viewerUrl = result.classicType ? getViewerUrl(result.classicType, result.item.id) : null;

      var appLabel = APP_LABEL_BY_ID[result.classicType] || launcherAppLabel;
      var chainText = result.chain.map(function(c) {
        return c.id;
      }).join(" -> ");

      setTitle("Found: " + (result.item.title || "(Untitled)") + " [" + appLabel + "]", "warn");
      setStatus("Resolved item chain: " + chainText, "warn");

      setDisabled(ui.openBtn, !state.viewerUrl);
      setDisabled(ui.downloadItemBtn, false);
      setDisabled(ui.downloadDataBtn, !state.itemData);
      setDisabled(ui.downloadZipBtn, false);
      setDisabled(ui.downloadAllBtn, false);

      ui.openBtn.textContent = "Open " + appLabel + " Viewer";
    }

    function disableForLoad() {
      resetButtons();
      setTitle("");
    }

    form.addEventListener("submit", async function(evt) {
      evt.preventDefault();

      var appId = normalizeId(appIdInput.value);
      if (!appId) {
        setStatus("Enter an app ID to continue.", "warn");
        appIdInput.focus();
        disableForLoad();
        return;
      }

      if (!APP_ID_REGEX.test(appId)) {
        setStatus("App ID must be 32 hexadecimal characters (a-f, 0-9).", "error");
        appIdInput.focus();
        disableForLoad();
        return;
      }

      disableForLoad();
      setStatus("Loading ArcGIS item and evaluating classic story pointers...", "warn");

      try {
        var token = getToken();
        var result = await resolveClassicStory(appId, token);

        if (!result || !result.item) {
          setStatus("Unable to load item details for that app ID.", "error");
          return;
        }

        if (!result.classicType) {
          setTitle("Found item title: '" + (result.item.title || "(Untitled)") + "' (" + (result.item.type || "Unknown") + ")", "warn");
          setStatus("An item was found, but could not be fully identified as a Classic Story Map", "error");
          state.item = result.item;
          state.itemData = result.itemData;
          setDisabled(ui.downloadItemBtn, false);
          setDisabled(ui.downloadDataBtn, !result.itemData);
          setDisabled(ui.downloadZipBtn, false);
          setDisabled(ui.downloadAllBtn, false);
          return;
        }

        applyFoundState(result);
      } catch (error) {
        setStatus("Load failed: " + (error && error.message ? error.message : "Unexpected error."), "error");
        disableForLoad();
      }
    });

    appIdInput.addEventListener("input", function() {
      if (!sanitize(appIdInput.value)) {
        setStatus("");
        setTitle("");
        resetButtons();
      }
    });

    ui.openBtn.addEventListener("click", function() {
      if (!state.viewerUrl) return;
      window.location.href = state.viewerUrl;
    });

    ui.downloadItemBtn.addEventListener("click", function() {
      if (!state.item) return;
      downloadJson("item-description-" + state.item.id + ".json", state.item);
    });

    ui.downloadDataBtn.addEventListener("click", async function() {
      if (!state.item) return;

      if (!state.itemData) {
        var token = getToken();
        state.itemData = await tryFetchItemData(state.item.id, token);
      }

      if (!state.itemData) {
        setStatus("Item data JSON is not available for this item.", "warn");
        return;
      }

      downloadJson("item-data-" + state.item.id + ".json", state.itemData);
      setStatus("Item data JSON downloaded.", "warn");
      setDisabled(ui.downloadDataBtn, false);
    });

    ui.downloadZipBtn.addEventListener("click", async function() {
      if (!state.item) return;

      try {
        setDisabled(ui.downloadZipBtn, true);
        var token = getToken();

        if (!state.itemData) {
          state.itemData = await tryFetchItemData(state.item.id, token);
        }

        var zipBlob = await buildResourceZip(state, token, setStatus);
        downloadBlob("resources-and-images-" + state.item.id + ".zip", zipBlob);
        setStatus("Resources and images ZIP downloaded.", "warn");
      } catch (error) {
        setStatus("ZIP download failed: " + (error && error.message ? error.message : "Unexpected error."), "error");
      } finally {
        setDisabled(ui.downloadZipBtn, false);
      }
    });

    ui.downloadAllBtn.addEventListener("click", async function() {
      if (!state.item) return;

      try {
        setDisabled(ui.downloadAllBtn, true);
        var token = getToken();

        if (!state.itemData) {
          state.itemData = await tryFetchItemData(state.item.id, token);
        }

        var zipBlob = await buildAllZip(state, token, setStatus);
        downloadBlob("classic-story-all-" + state.item.id + ".zip", zipBlob);
        setStatus("Download All ZIP created.", "warn");
      } catch (error) {
        setStatus("Download All failed: " + (error && error.message ? error.message : "Unexpected error."), "error");
      } finally {
        setDisabled(ui.downloadAllBtn, false);
      }
    });

    var params = new URLSearchParams(window.location.search);
    var prefill = normalizeId(params.get("appid") || viewerConfig.defaultAppId || "");
    if (prefill) {
      appIdInput.value = prefill;
    }

    var submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.textContent = "Load " + launcherAppLabel;
    }

    var backToCatalog = form.querySelector(".text-link");
    if (backToCatalog) {
      backToCatalog.textContent = "Back to Catalog";
    }

    ui.openBtn.textContent = "Open " + launcherAppLabel + " Viewer";
    ui.downloadItemBtn.textContent = "Item Description (JSON)";
    ui.downloadDataBtn.textContent = launcherAppLabel + " Data (JSON)";
    ui.downloadZipBtn.textContent = "Resources and Images (ZIP)";
    ui.downloadAllBtn.textContent = "Download All";

    if (submitButton) {
      applyLauncherLayout(form, panel, appIdInput, submitButton);
    }

    if (viewerConfig.demoLink && viewerConfig.defaultAppId && viewerConfig.runtimeId) {
      var defaultViewer = getViewerUrl(viewerConfig.runtimeId, viewerConfig.defaultAppId);
      if (defaultViewer) {
        viewerConfig.demoLink.setAttribute("href", defaultViewer);
      }
    }

    resetButtons();
  }

  window.ClassicStoryLoader = {
    init: init
  };
})();