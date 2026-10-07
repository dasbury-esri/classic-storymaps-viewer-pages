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

  function parseAuthReturn(hash, storedState) {
    if (typeof hash !== "string" || !storedState || typeof storedState.state !== "string" || !storedState.state) {
      return null;
    }
    const returnPath = storedState.returnPath;
    if (typeof returnPath !== "string" || !returnPath.startsWith("/") || returnPath.startsWith("//") || /[\\\u0000-\u001f\u007f]/.test(returnPath)) {
      return null;
    }

    const params = new URLSearchParams(hash.startsWith("#") ? hash.substring(1) : hash);
    if (params.has("error") || params.getAll("state").length !== 1 || params.get("state") !== storedState.state
      || params.getAll("access_token").length !== 1 || params.getAll("expires_in").length !== 1) {
      return null;
    }
    const token = params.get("access_token");
    const expiresIn = Number(params.get("expires_in"));
    return token && Number.isSafeInteger(expiresIn) && expiresIn > 0
      ? { token, expiresIn, returnPath }
      : null;
  }

  const helpers = { TOKEN_EXPIRATION_MINUTES, buildAuthorizeUrl, buildEsriAuthCookie, parseAuthReturn };
  if (typeof window !== "undefined") {
    window.ClassicArcgisAuthHelpers = helpers;
  }
  if (typeof module !== "undefined" && module.exports) {
    module.exports = helpers;
  }
})();
