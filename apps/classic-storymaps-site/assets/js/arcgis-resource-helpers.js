(function() {
  "use strict";

  function shouldSendArcgisToken(url) {
    try {
      const parsed = new URL(url);
      return parsed.protocol === "https:"
        && (parsed.hostname === "www.arcgis.com" || parsed.hostname.endsWith(".maps.arcgis.com"))
        && parsed.pathname.startsWith("/sharing/rest/content/");
    } catch {
      return false;
    }
  }

  function withArcgisToken(url, token) {
    if (!token || !shouldSendArcgisToken(url)) {
      return url;
    }
    const parsed = new URL(url);
    parsed.searchParams.set("token", token);
    return parsed.toString();
  }

  const helpers = { shouldSendArcgisToken, withArcgisToken };
  if (typeof window !== "undefined") {
    window.ClassicArcgisResourceHelpers = helpers;
  }
  if (typeof module !== "undefined" && module.exports) {
    module.exports = helpers;
  }
})();
