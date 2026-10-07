(function() {
  "use strict";

  const TOKEN_EXPIRATION_MINUTES = 120;

  function buildAuthorizeUrl(clientId, redirectUri, state) {
    const url = new URL("https://www.arcgis.com/sharing/rest/oauth2/authorize");
    url.searchParams.set("client_id", clientId);
    url.searchParams.set("response_type", "token");
    url.searchParams.set("expiration", TOKEN_EXPIRATION_MINUTES);
    url.searchParams.set("redirect_uri", redirectUri);
    url.searchParams.set("state", state);
    return url.toString();
  }

  function buildEsriAuthCookie(token, expiresIn, protocol, now = Date.now()) {
    const seconds = Number(expiresIn);
    if (!token || !Number.isSafeInteger(seconds) || seconds <= 0 || !Number.isSafeInteger(now + seconds * 1000)) {
      return "";
    }

    const payload = encodeURIComponent(JSON.stringify({
      token: token,
      ssl: protocol === "https:",
      expires: now + seconds * 1000
    }));
    const attrs = ["Path=/", "SameSite=Lax", "Max-Age=" + seconds];
    if (protocol === "https:") {
      attrs.push("Secure");
    }
    return "esri_auth=" + payload + "; " + attrs.join("; ");
  }

  const helpers = { TOKEN_EXPIRATION_MINUTES, buildAuthorizeUrl, buildEsriAuthCookie };
  if (typeof window !== "undefined") {
    window.ClassicArcgisAuthHelpers = helpers;
  }
  if (typeof module !== "undefined" && module.exports) {
    module.exports = helpers;
  }
})();
