#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const REPO_ROOT = process.cwd();
const PROBE_JSON = path.join(
  REPO_ROOT,
  "docs/testing/artifacts/storymaps-org-viewer-probe-2026-03-17.json"
);
const OUT_JSON = path.join(
  REPO_ROOT,
  "docs/testing/artifacts/phase5-s10f-top10-browser-runtime-validation-2026-03-17.json"
);
const OUT_MD = path.join(
  REPO_ROOT,
  "docs/testing/phase5-s10f-top10-browser-runtime-validation-2026-03-17.md"
);

const MAX_CONSOLE_SAMPLES = 6;
const MAX_FAILED_REQUEST_SAMPLES = 6;

async function loadChromium() {
  try {
    const mod = await import("playwright");
    return mod.chromium;
  } catch (err) {
    const modulesDir = process.env.PLAYWRIGHT_NODE_MODULES;
    if (!modulesDir) {
      throw err;
    }

    const moduleFile = path.join(modulesDir, "playwright", "index.mjs");
    const mod = await import(pathToFileURL(moduleFile).href);
    return mod.chromium;
  }
}

function isReadyRecord(record) {
  return record?.diagnosis === "readyForManualRuntimeLoadTest";
}

function toTop10(records) {
  return records
    .filter(isReadyRecord)
    .filter((r) => Number.isFinite(r.numViews))
    .sort((a, b) => b.numViews - a.numViews)
    .slice(0, 10);
}

function toIsoNow() {
  return new Date().toISOString();
}

function summarizeFailureReasons(result) {
  const reasons = [];
  if (result.documentStatus !== 200) reasons.push(`docStatus=${result.documentStatus ?? "n/a"}`);
  if (!result.appDataRequestObserved) reasons.push("noAppDataRequest");
  if (result.pageErrors.length > 0) reasons.push("pageError");
  return reasons.join(", ") || "none";
}

function toMarkdown(report) {
  const lines = [];
  lines.push("# Phase 5 S10f - Top 10 Browser Runtime Validation");
  lines.push("");
  lines.push(`Date: ${report.context.date}`);
  lines.push(`Viewer Base: ${report.context.viewerBase}`);
  lines.push(`Source Artifact: ${report.context.sourceArtifact}`);
  lines.push("");
  lines.push("## Scope");
  lines.push("- Selected top 10 highest-view records from the latest ready-for-manual-runtime set.");
  lines.push("- Per record, loaded the viewer URL in headless Chromium and observed document status, app-data traffic, and runtime script errors.");
  lines.push("");
  lines.push("## Summary");
  lines.push(`- Total tested: ${report.summary.total}`);
  lines.push(`- Pass: ${report.summary.pass}`);
  lines.push(`- Fail: ${report.summary.fail}`);
  lines.push("");
  lines.push("## Pass/Fail Matrix");
  lines.push("| Result | Runtime | App ID | Views | Document HTTP | App Data Request | Page Errors | Console Errors | Viewer URL |");
  lines.push("|---|---|---|---:|---:|---|---:|---:|---|");

  for (const row of report.results) {
    lines.push(
      `| ${row.result} | ${row.runtime} | ${row.appId} | ${row.numViews} | ${row.documentStatus ?? "-"} | ${row.appDataRequestObserved ? "yes" : "no"} | ${row.pageErrors.length} | ${row.consoleErrors.length} | ${row.viewerUrl} |`
    );
  }

  lines.push("");
  lines.push("## Failure Details");
  const failures = report.results.filter((r) => r.result === "FAIL");
  if (failures.length === 0) {
    lines.push("- None");
  } else {
    for (const f of failures) {
      lines.push(`- ${f.runtime} ${f.appId}: ${summarizeFailureReasons(f)}`);
      if (f.pageErrors.length > 0) {
        lines.push(`  - pageErrors: ${f.pageErrors.join(" | ")}`);
      }
      if (f.failedRequests.length > 0) {
        lines.push(`  - failedRequests: ${f.failedRequests.join(" | ")}`);
      }
      if (f.consoleErrors.length > 0) {
        lines.push(`  - consoleErrors: ${f.consoleErrors.join(" | ")}`);
      }
    }
  }

  lines.push("");
  lines.push("## Notes");
  lines.push("- Pass criteria: document HTTP 200, at least one successful app-data response containing the appid, and zero uncaught page errors.");
  lines.push("- This validation is browser-level and stronger than reachability checks, but it is still synthetic automation, not human UX verification.");
  return lines.join("\n");
}

async function main() {
  const chromium = await loadChromium();
  const probe = JSON.parse(await fs.readFile(PROBE_JSON, "utf8"));
  const targets = toTop10(probe.records || []);

  if (targets.length === 0) {
    throw new Error("No eligible records found in probe artifact.");
  }

  const launchOptions = { headless: true };
  if (process.env.PLAYWRIGHT_CHANNEL) {
    launchOptions.channel = process.env.PLAYWRIGHT_CHANNEL;
  }

  const browser = await chromium.launch(launchOptions);
  const context = await browser.newContext();

  const results = [];

  try {
    for (const target of targets) {
      const page = await context.newPage();
      const consoleErrors = [];
      const pageErrors = [];
      const failedRequests = [];
      let documentStatus = null;
      let appDataRequestObserved = false;

      page.on("console", (msg) => {
        if (msg.type() === "error" && consoleErrors.length < MAX_CONSOLE_SAMPLES) {
          consoleErrors.push(msg.text());
        }
      });

      page.on("pageerror", (err) => {
        if (pageErrors.length < MAX_CONSOLE_SAMPLES) {
          pageErrors.push(err.message || String(err));
        }
      });

      page.on("requestfailed", (req) => {
        if (failedRequests.length < MAX_FAILED_REQUEST_SAMPLES) {
          failedRequests.push(`${req.method()} ${req.url()} (${req.failure()?.errorText || "failed"})`);
        }
      });

      page.on("response", (resp) => {
        const url = resp.url();
        if (url.includes(target.appId) && resp.status() >= 200 && resp.status() < 400) {
          appDataRequestObserved = true;
        }
      });

      const start = Date.now();
      try {
        const resp = await page.goto(target.viewerUrl, {
          waitUntil: "domcontentloaded",
          timeout: 60000,
        });
        documentStatus = resp?.status() ?? null;
        await page.waitForTimeout(8000);
      } catch (err) {
        if (pageErrors.length < MAX_CONSOLE_SAMPLES) {
          pageErrors.push(`navigationError: ${err.message || String(err)}`);
        }
      }
      const durationMs = Date.now() - start;

      const result =
        documentStatus === 200 && appDataRequestObserved && pageErrors.length === 0 ? "PASS" : "FAIL";

      results.push({
        runtime: target.runtime,
        appId: target.appId,
        title: target.title,
        numViews: target.numViews,
        viewerUrl: target.viewerUrl,
        documentStatus,
        appDataRequestObserved,
        pageErrors,
        consoleErrors,
        failedRequests,
        durationMs,
        result,
      });

      await page.close();
      console.log(`[${result}] ${target.runtime} ${target.appId} views=${target.numViews}`);
    }
  } finally {
    await context.close();
    await browser.close();
  }

  const pass = results.filter((r) => r.result === "PASS").length;
  const fail = results.length - pass;

  const report = {
    context: {
      date: toIsoNow(),
      viewerBase: probe?.context?.viewerBase,
      sourceArtifact: path.relative(REPO_ROOT, PROBE_JSON),
      generatedAt: toIsoNow(),
      method: "playwright-headless-chromium",
      selection: "top10-highest-numViews-readyForManualRuntimeLoadTest",
    },
    summary: {
      total: results.length,
      pass,
      fail,
    },
    results,
  };

  await fs.mkdir(path.dirname(OUT_JSON), { recursive: true });
  await fs.writeFile(OUT_JSON, JSON.stringify(report, null, 2));
  await fs.writeFile(OUT_MD, `${toMarkdown(report)}\n`);

  console.log("\nValidation complete");
  console.log(`JSON: ${path.relative(REPO_ROOT, OUT_JSON)}`);
  console.log(`MD: ${path.relative(REPO_ROOT, OUT_MD)}`);
  console.log(`Summary: pass=${pass} fail=${fail} total=${results.length}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
