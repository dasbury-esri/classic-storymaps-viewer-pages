#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";

const CLASSIC_TYPE_HINTS = [
  "3dviz",
  "attachmentviewer",
  "basic",
  "cascade",
  "compare",
  "crowd",
  "embed",
  "journal",
  "minim",
  "onepane",
  "series",
  "shortlist",
  "swipe",
  "spyglass",
  "maptour"
];

const TYPE_TO_RUNTIME = [
  { match: /cascade/, runtime: "cascade" },
  { match: /journal/, runtime: "mapjournal" },
  { match: /series/, runtime: "mapseries" },
  { match: /shortlist/, runtime: "shortlist" },
  { match: /swipe|spyglass/, runtime: "swipe" },
  { match: /maptour|tour/, runtime: "maptour" },
  { match: /crowd/, runtime: "crowdsource" },
  { match: /basic|3dviz|compare|minim|onepane|attachmentviewer|embed/, runtime: "basic" }
];

function getArg(name, fallback = "") {
  const prefix = `--${name}=`;
  const raw = process.argv.find((arg) => arg.startsWith(prefix));
  if (!raw) {
    return fallback;
  }
  return raw.slice(prefix.length);
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function toDate(ts) {
  if (!Number.isFinite(ts)) {
    return "";
  }
  return new Date(ts).toISOString();
}

function inferTypeFromUrl(url) {
  if (!url) {
    return "unknown";
  }
  try {
    const parsed = new URL(url);
    const seg = parsed.pathname.split("/").filter(Boolean)[1] || "unknown";
    return seg.toLowerCase();
  } catch {
    return "unknown";
  }
}

function inferRuntime(type) {
  const normalized = `${type || ""}`.toLowerCase();
  for (const rule of TYPE_TO_RUNTIME) {
    if (rule.match.test(normalized)) {
      return rule.runtime;
    }
  }
  return null;
}

function extractAppId(url) {
  if (!url) {
    return null;
  }
  try {
    const parsed = new URL(url);
    return parsed.searchParams.get("appid");
  } catch {
    return null;
  }
}

function isClassicType(type) {
  const lower = `${type || ""}`.toLowerCase();
  return CLASSIC_TYPE_HINTS.some((hint) => lower.includes(hint));
}

async function fetchJson(url) {
  try {
    const response = await fetch(url);
    const body = await response.json().catch(() => ({}));
    return { ok: response.ok, status: response.status, body, error: null };
  } catch (error) {
    return {
      ok: false,
      status: null,
      body: {},
      error: error?.message || "fetchFailed"
    };
  }
}

async function fetchWithRetries(url, attempts = 3) {
  let lastError = null;
  for (let i = 1; i <= attempts; i += 1) {
    try {
      const response = await fetch(url, { redirect: "follow" });
      return {
        ok: response.ok,
        status: response.status,
        error: null
      };
    } catch (error) {
      lastError = error;
      if (i < attempts) {
        await new Promise((resolve) => setTimeout(resolve, 250 * i));
      }
    }
  }

  return {
    ok: false,
    status: null,
    error: lastError?.message || "fetchFailed"
  };
}

async function resolveOrgId(domain) {
  const portalSelf = await fetchJson(`https://${domain}/sharing/rest/portals/self?f=json`);
  if (portalSelf.ok && portalSelf.body?.id) {
    return {
      orgId: portalSelf.body.id,
      orgName: portalSelf.body.name || "",
      source: `https://${domain}/sharing/rest/portals/self?f=json`
    };
  }

  throw new Error(`Unable to resolve orgId for ${domain}: HTTP ${portalSelf.status || "n/a"}${portalSelf.error ? ` (${portalSelf.error})` : ""}`);
}

async function fetchAllResults(query) {
  const all = [];
  let start = 1;

  while (true) {
    const encodedQuery = encodeURIComponent(query);
    const url = `https://story.maps.arcgis.com/sharing/rest/search?q=${encodedQuery}&num=100&start=${start}&f=json`;
    const result = await fetchJson(url);
    if (!result.ok) {
      throw new Error(`Search failed at start=${start}, HTTP ${result.status || "n/a"}${result.error ? ` (${result.error})` : ""}`);
    }

    const rows = Array.isArray(result.body?.results) ? result.body.results : [];
    all.push(...rows);

    const next = result.body?.nextStart;
    if (!next || next === -1) {
      break;
    }

    start = next;
  }

  return all;
}

async function probeItem(appId) {
  if (!appId) {
    return {
      itemHttpStatus: null,
      itemStatus: "missingAppId",
      access: null,
      owner: null,
      title: null,
      itemType: null,
      numViews: null
    };
  }

  const itemUrl = `https://www.arcgis.com/sharing/rest/content/items/${appId}?f=json`;
  const itemResp = await fetchJson(itemUrl);

  if (!itemResp.ok) {
    return {
      itemHttpStatus: itemResp.status,
      itemStatus: itemResp.status === 404 ? "notFound" : (itemResp.error ? "networkError" : "httpError"),
      access: null,
      owner: null,
      title: null,
      itemType: null,
      numViews: null,
      itemProbeError: itemResp.error || null
    };
  }

  const body = itemResp.body || {};
  if (body.error) {
    const errCode = body.error.code;
    const errMsg = body.error.message || "";
    let status = "errorPayload";
    if (errCode === 400 || errCode === 403) {
      status = "notAuthorized";
    } else if (errCode === 404) {
      status = "notFound";
    }

    return {
      itemHttpStatus: itemResp.status,
      itemStatus: status,
      access: null,
      owner: null,
      title: null,
      itemType: null,
      numViews: null,
      itemProbeError: errMsg || `arcgisError:${errCode}`
    };
  }

  const access = body.access || null;

  return {
    itemHttpStatus: itemResp.status,
    itemStatus: access === "public" ? "public" : access ? `access:${access}` : "unknown",
    access,
    owner: body.owner || null,
    title: body.title || null,
    itemType: body.type || null,
    numViews: Number.isFinite(body.numViews) ? body.numViews : null,
    itemProbeError: null
  };
}

async function probeViewer(viewerUrl) {
  if (!viewerUrl) {
    return { viewerHttpStatus: null, viewerReachable: false, viewerProbeError: null };
  }

  const response = await fetchWithRetries(viewerUrl, 3);
  return {
    viewerHttpStatus: response.status,
    viewerReachable: response.ok,
    viewerProbeError: response.error
  };
}

function diagnose(row) {
  if (!row.appId) {
    return "missingAppIdInSourceUrl";
  }
  if (!row.runtime) {
    return "unsupportedRuntimeMapping";
  }
  if (!row.viewerReachable) {
    return "viewerRouteUnreachable";
  }
  if (row.itemStatus === "notFound") {
    return "appItemNotFound";
  }
  if (row.itemStatus.startsWith("access:") && row.itemStatus !== "access:public") {
    return "appItemNotPublic";
  }
  if (row.itemStatus === "httpError") {
    return "itemEndpointHttpError";
  }
  if (row.itemStatus === "networkError") {
    return "itemEndpointNetworkError";
  }
  if (row.itemStatus === "notAuthorized") {
    return "appItemNotAuthorized";
  }
  if (row.itemStatus === "errorPayload") {
    return "appItemErrorPayload";
  }
  if (row.itemStatus === "public") {
    return "readyForManualRuntimeLoadTest";
  }
  return "unknownNeedsManualInspection";
}

function summarize(rows) {
  const byDiagnosis = new Map();
  const byRuntime = new Map();

  for (const row of rows) {
    byDiagnosis.set(row.diagnosis, (byDiagnosis.get(row.diagnosis) || 0) + 1);
    const runtimeKey = row.runtime || "unmapped";
    byRuntime.set(runtimeKey, (byRuntime.get(runtimeKey) || 0) + 1);
  }

  return {
    total: rows.length,
    byDiagnosis: Object.fromEntries([...byDiagnosis.entries()].sort((a, b) => b[1] - a[1])),
    byRuntime: Object.fromEntries([...byRuntime.entries()].sort((a, b) => b[1] - a[1]))
  };
}

function toMarkdown(context, summary, rows, outputJsonPath) {
  const topFailures = rows
    .filter((r) => r.diagnosis !== "readyForManualRuntimeLoadTest")
    .slice(0, 50);

  const topReady = rows
    .filter((r) => r.diagnosis === "readyForManualRuntimeLoadTest")
    .slice(0, 25);

  const diagnosisLines = Object.entries(summary.byDiagnosis)
    .map(([k, v]) => `- ${k}: ${v}`)
    .join("\n");

  const runtimeLines = Object.entries(summary.byRuntime)
    .map(([k, v]) => `- ${k}: ${v}`)
    .join("\n");

  const failureTable = [
    "| Runtime | App ID | Diagnosis | Item Status | Viewer HTTP | Source URL |",
    "|---|---|---|---|---:|---|",
    ...topFailures.map((r) => `| ${r.runtime || "(none)"} | ${r.appId || "(none)"} | ${r.diagnosis} | ${r.itemStatus} | ${r.viewerHttpStatus ?? "-"} | ${r.url || ""} |`)
  ].join("\n");

  const readyTable = [
    "| Runtime | App ID | Views | Viewer URL |",
    "|---|---|---:|---|",
    ...topReady.map((r) => `| ${r.runtime || "(none)"} | ${r.appId || "(none)"} | ${r.numViews ?? "-"} | ${r.viewerUrl || ""} |`)
  ].join("\n");

  return [
    "# Phase 5 S10e - StoryMaps Org Viewer Probe",
    "",
    `Date: ${context.date}`,
    `Domain: ${context.domain}`,
    `Org ID: ${context.orgId}`,
    `Org Name: ${context.orgName}`,
    `Viewer Base: ${context.viewerBase}`,
    `Source Query: ${context.query}`,
    "",
    "## Scope",
    "- Pulled classic Web Mapping Application items using the same REST search pattern used by classic-story-search.",
    "- Mapped source item URL types to this repo's supported runtimes.",
    "- Probed each mapped viewer URL and ArcGIS item endpoint.",
    "- Classified failures into actionable diagnosis buckets.",
    "",
    "## Summary",
    `- Total records evaluated: ${summary.total}`,
    diagnosisLines,
    "",
    "### Runtime Distribution",
    runtimeLines,
    "",
    "## Highest-Priority Failures",
    failureTable,
    "",
    "## Ready For Manual Runtime Load Verification",
    readyTable,
    "",
    "## Notes",
    "- This probe validates route reachability and item accessibility, not full browser render behavior.",
    "- Full load validation still requires browser execution against viewer URLs (console/network checks).",
    `- Machine-readable artifact: ${outputJsonPath}`,
    ""
  ].join("\n");
}

async function main() {
  const domain = getArg("domain", "story.maps.arcgis.com");
  const viewerBase = getArg("viewerBase", "https://classicstorymaps.com/viewers").replace(/\/$/, "");
  const max = Number.parseInt(getArg("max", "200"), 10);
  const outDir = getArg("outDir", "docs/testing/artifacts");
  const date = todayIso();

  const { orgId, orgName } = await resolveOrgId(domain);
  const query = `orgid:${orgId} AND access:public AND type:\"Web Mapping Application\"`;

  const allResults = await fetchAllResults(query);

  const classicRows = allResults
    .map((item) => {
      const sourceType = inferTypeFromUrl(item.url);
      const runtime = inferRuntime(sourceType);
      const appId = extractAppId(item.url);
      const viewerUrl = runtime && appId ? `${viewerBase}/${runtime}/index.html?appid=${appId}` : null;
      return {
        id: item.id || null,
        title: item.title || null,
        owner: item.owner || null,
        sourceType,
        runtime,
        appId,
        url: item.url || null,
        created: Number.isFinite(item.created) ? item.created : null,
        modified: Number.isFinite(item.modified) ? item.modified : null,
        numViews: Number.isFinite(item.numViews) ? item.numViews : null,
        viewerUrl,
        isClassicHintMatch: isClassicType(sourceType)
      };
    })
    .filter((row) => row.isClassicHintMatch)
    .sort((a, b) => (b.numViews || 0) - (a.numViews || 0))
    .slice(0, Number.isFinite(max) ? max : 200);

  const probed = [];
  for (const row of classicRows) {
    const itemProbe = await probeItem(row.appId);
    const viewerProbe = await probeViewer(row.viewerUrl);

    const full = {
      ...row,
      ...itemProbe,
      ...viewerProbe,
      createdIso: row.created ? toDate(row.created) : null,
      modifiedIso: row.modified ? toDate(row.modified) : null
    };

    full.diagnosis = diagnose(full);
    probed.push(full);
  }

  const summary = summarize(probed);

  const context = {
    date,
    domain,
    orgId,
    orgName,
    viewerBase,
    query
  };

  await fs.mkdir(outDir, { recursive: true });
  const jsonPath = path.join(outDir, `storymaps-org-viewer-probe-${date}.json`);
  const mdPath = path.join("docs/testing", `phase5-s10e-storymaps-org-viewer-probe-${date}.md`);

  await fs.writeFile(jsonPath, `${JSON.stringify({ context, summary, records: probed }, null, 2)}\n`, "utf8");
  await fs.writeFile(mdPath, `${toMarkdown(context, summary, probed, jsonPath)}\n`, "utf8");

  console.log(JSON.stringify({ summary, jsonPath, mdPath }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
