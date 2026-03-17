(function() {
  "use strict";

  var BASE_PATH = "/viewers";
  var LEGACY_BASE_PATHS = ["/templates/classic-storymaps"];

  var APP_REGISTRY = {
    maptour: {
      runtimeFolder: "maptour",
      label: "Map Tour",
      demoType: "Story Map Tour",
      classifyFragments: ["story map tour", "storymaptour", "maptour"]
    },
    swipe: {
      runtimeFolder: "swipe",
      label: "Swipe",
      demoType: "Story Map Swipe",
      classifyFragments: ["story map swipe", "story map spyglass", "storymapswipe", "storymapspyglass", "mapswipe", "mapspyglass"]
    },
    mapjournal: {
      runtimeFolder: "mapjournal",
      label: "Map Journal",
      demoType: "Story Map Journal",
      classifyFragments: ["story map journal", "storymapjournal", "mapjournal"]
    },
    mapseries: {
      runtimeFolder: "mapseries",
      label: "Map Series",
      demoType: "Story Map Series",
      classifyFragments: ["story map series", "storymapseries", "mapseries"]
    },
    cascade: {
      runtimeFolder: "cascade",
      label: "Cascade",
      demoType: "Story Map Cascade",
      classifyFragments: ["story map cascade", "storymapcascade", "mapcascade"]
    },
    shortlist: {
      runtimeFolder: "shortlist",
      label: "Shortlist",
      demoType: "Story Map Shortlist",
      classifyFragments: ["story map shortlist", "storymapshortlist", "mapshortlist", "shortlist"]
    },
    crowdsource: {
      runtimeFolder: "crowdsource",
      label: "Crowdsource",
      demoType: "Story Map Crowdsource",
      classifyFragments: ["story map crowdsource", "storymapcrowdsource", "mapcrowdsource", "crowdsource"]
    },
    basic: {
      runtimeFolder: "basic",
      label: "Basic",
      demoType: "Story Map Basic",
      classifyFragments: ["story map basic", "storymapbasic", "mapbasic"]
    }
  };

  var CATALOG_APPS = [
    {
      runtime: "maptour",
      title: "Classic Story Map Tour",
      state: "supported",
      description: "Sequential place-based story format linking photos and captions to map locations.",
      image: "assets/images/map-tour.png",
      launchRoute: "maptour-launcher.html",
      action: "Open Launcher"
    },
    {
      runtime: "swipe",
      title: "Classic Story Map Swipe",
      state: "supported",
      description: "Map comparison experience with slider and spyglass patterns.",
      image: "assets/images/swipe.jpg",
      launchRoute: "swipe-launcher.html",
      action: "Open Launcher"
    },
    {
      runtime: "mapjournal",
      title: "Classic Story Map Journal",
      state: "supported",
      description: "Narrative panel plus map canvas with guided launch support for canonical appid routes.",
      image: "assets/images/map-journal.jpg",
      launchRoute: "mapjournal-launcher.html",
      action: "Open Launcher"
    },
    {
      runtime: "mapseries",
      title: "Classic Story Map Series (Tabbed, Bulleted or Side Accordion Layout)",
      state: "supported",
      description: "Tabbed sequence of maps and narrative content.",
      image: "assets/images/map-series-tabbed-viewer.jpg",
      launchRoute: "mapseries-launcher.html",
      action: "Open Launcher"
    },
    {
      runtime: "cascade",
      title: "Story Map Cascade",
      state: "supported",
      description: "Immersive long-form layout combining maps, media, and narrative sections.",
      image: "assets/images/cascade.jpg",
      launchRoute: "cascade-launcher.html",
      action: "Open Launcher"
    },
    {
      runtime: "shortlist",
      title: "Classic Story Map Shortlist",
      state: "supported",
      description: "Themed place list with map-extent aware tab behavior.",
      image: "assets/images/shortlist.jpg",
      launchRoute: "shortlist-launcher.html",
      action: "Open Launcher"
    },
    {
      runtime: "crowdsource",
      title: "Story Map Crowdsource",
      state: "queued",
      description: "Public contribution workflow with moderation and approval. Viewer support is currently in progress.",
      image: "assets/images/crowdsource.jpg",
      action: "In Progress"
    },
    {
      runtime: "basic",
      title: "Classic Story Map Basic",
      state: "supported",
      description: "Minimal map-first viewer with optional title and legend.",
      image: "assets/images/basic.jpg",
      launchRoute: "basic-launcher.html",
      action: "Open Launcher"
    }
  ];

  function getRuntimeViewerByApp() {
    var map = {};
    Object.keys(APP_REGISTRY).forEach(function(runtime) {
      var entry = APP_REGISTRY[runtime];
      map[runtime] = BASE_PATH + "/" + entry.runtimeFolder + "/index.html";
    });
    return map;
  }

  function classifyClassicRuntimeFromItem(item) {
    var keywords = Array.isArray(item && item.typeKeywords) ? item.typeKeywords : [];
    var normalizedKeywords = keywords.map(function(keyword) {
      return String(keyword || "").toLowerCase();
    });
    var itemType = String((item && item.type) || "").toLowerCase();
    var itemUrl = String((item && item.url) || "").toLowerCase();

    function hasFragment(fragment) {
      return normalizedKeywords.some(function(keyword) {
        return keyword.indexOf(fragment) !== -1;
      });
    }

    function hasAny(fragments) {
      for (var i = 0; i < fragments.length; i += 1) {
        if (hasFragment(fragments[i])) {
          return true;
        }
      }
      return false;
    }

    var runtimes = Object.keys(APP_REGISTRY);
    for (var j = 0; j < runtimes.length; j += 1) {
      var runtime = runtimes[j];
      var runtimeInfo = APP_REGISTRY[runtime];
      if (hasAny(runtimeInfo.classifyFragments) || itemUrl.indexOf("/" + runtimeInfo.runtimeFolder + "/") !== -1) {
        return runtime;
      }
    }

    if (itemType === "web mapping application" && hasFragment("story map")) {
      return "unknown-classic";
    }

    return null;
  }

  window.ClassicStoryMapsConfig = {
    basePath: BASE_PATH,
    legacyBasePaths: LEGACY_BASE_PATHS,
    appRegistry: APP_REGISTRY,
    catalogApps: CATALOG_APPS,
    runtimeViewerByApp: getRuntimeViewerByApp(),
    classifyClassicRuntimeFromItem: classifyClassicRuntimeFromItem
  };
})();
