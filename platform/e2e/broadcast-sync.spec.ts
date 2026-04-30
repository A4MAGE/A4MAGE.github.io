/**
 * Broadcast sync tests.
 *
 * Uses real Ably infrastructure via the Ably REST API to publish messages,
 * while the viewer page subscribes via the real Ably WebSocket client.
 * This tests the full path: Ably publish → WebSocket → BroadcastViewer UI.
 *
 * Requires VITE_ABLY_KEY to be set (falls back to the value in .env).
 */

import { test, expect } from "@playwright/test";
import * as https from "https";
import * as fs from "fs";
import * as path from "path";

// ---------------------------------------------------------------------------
// Ably REST helper
// ---------------------------------------------------------------------------

const ABLY_KEY = process.env.VITE_ABLY_KEY ?? "z1mefw.v-CE3A:4OBS0k4wN08O2cqq8YY-68eTc2UtG6YqhxBSFe-BesU";

function ablyPublish(roomId: string, data: object): Promise<void> {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ name: "state", data });
    const [keyId, keySecret] = ABLY_KEY.split(":");
    const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
    const channel = encodeURIComponent(`broadcast:${roomId}`);

    const req = https.request(
      {
        hostname: "rest.ably.io",
        path: `/channels/${channel}/messages`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body),
          Authorization: `Basic ${auth}`,
        },
      },
      (res) => {
        if (res.statusCode && res.statusCode < 300) resolve();
        else {
          let raw = "";
          res.on("data", (d) => (raw += d));
          res.on("end", () => reject(new Error(`Ably ${res.statusCode}: ${raw}`)));
        }
      }
    );
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

// Unique room per test run so tests don't bleed into each other
const RUN_ID = Date.now().toString(36);
const room = (suffix: string) => `e2e-${RUN_ID}-${suffix}`;

// ---------------------------------------------------------------------------
// Tests: viewer UI reacts to real Ably messages
// ---------------------------------------------------------------------------

test.describe("BroadcastViewer — real Ably sync", () => {
  test("shows waiting message when no state published yet", async ({ page }) => {
    const roomId = room("waiting");
    await page.goto(`/broadcast/room/${roomId}`);

    await expect(
      page.getByText("Waiting for host to load a preset")
    ).toBeVisible({ timeout: 8000 });
  });

  test("shows LIVE badge on load", async ({ page }) => {
    const roomId = room("live");
    await page.goto(`/broadcast/room/${roomId}`);

    await expect(
      page.getByText("LIVE", { exact: true })
    ).toBeVisible({ timeout: 8000 });
  });

  test("shows Broadcast Ended when ended=true state is published", async ({ page }) => {
    const roomId = room("ended");
    await page.goto(`/broadcast/room/${roomId}`);

    // Confirm viewer is up
    await expect(page.getByText("LIVE", { exact: true })).toBeVisible({ timeout: 8000 });

    // Publish ended state via Ably REST
    await ablyPublish(roomId, {
      presetData: null,
      audioUrl: null,
      playing: false,
      playbackTime: 0,
      ended: true,
    });

    await expect(page.getByText("Broadcast Ended")).toBeVisible({ timeout: 8000 });
    await expect(page.getByText("The host has stopped broadcasting.")).toBeVisible();
  });

  test("hides waiting message once a preset is published", async ({ page }) => {
    const roomId = room("preset");
    await page.goto(`/broadcast/room/${roomId}`);

    await expect(
      page.getByText("Waiting for host to load a preset")
    ).toBeVisible({ timeout: 8000 });

    // Publish a preset
    await ablyPublish(roomId, {
      presetData: { version: 1, name: "test", layers: [] },
      audioUrl: null,
      playing: false,
      playbackTime: 0,
    });

    await expect(
      page.getByText("Waiting for host to load a preset")
    ).toBeHidden({ timeout: 8000 });
  });
});

// ---------------------------------------------------------------------------
// Host→Viewer round-trip (requires E2E_EMAIL + E2E_PASSWORD)
// ---------------------------------------------------------------------------

test.describe("Broadcast host→viewer round-trip", () => {
  test("viewer receives playing state from host within 8s", async ({
    browser,
  }) => {
    const email = process.env.E2E_EMAIL;
    const password = process.env.E2E_PASSWORD;

    if (!email || !password) {
      test.skip(true, "E2E_EMAIL / E2E_PASSWORD not set");
      return;
    }

    const hostCtx = await browser.newContext();
    const viewerCtx = await browser.newContext();
    const hostPage = await hostCtx.newPage();
    const viewerPage = await viewerCtx.newPage();

    // Sign in on host context
    await hostPage.goto("/signin");
    await hostPage.fill('input[type="email"]', email);
    await hostPage.fill('input[type="password"]', password);
    await hostPage.click('button[type="submit"]');
    await hostPage.waitForURL(/\/(broadcast|profile)/, { timeout: 12_000 });

    // Start a room
    await hostPage.goto("/broadcast");
    await hostPage.getByRole("button", { name: /start.*room/i }).click();
    await hostPage.waitForURL(/\/broadcast\/host\//, { timeout: 10_000 });

    // Extract share link
    const shareUrl = await hostPage.locator("code").textContent({ timeout: 6_000 });
    const roomPath = new URL(shareUrl!.trim()).pathname;

    // Open viewer in second context
    await viewerPage.goto(roomPath);
    await expect(viewerPage.getByText("LIVE", { exact: true })).toBeVisible({ timeout: 8000 });

    // Host presses Space to play — viewer should stop showing "waiting"
    await hostPage.keyboard.press("Space");

    // Give it up to 8s for the state to propagate via Ably
    await expect(
      viewerPage.getByText("Waiting for host to load a preset")
    ).toBeHidden({ timeout: 8000 });

    await hostCtx.close();
    await viewerCtx.close();
  });

  test("viewer gets audio src after host uploads audio", async ({ browser }) => {
    const email = process.env.E2E_EMAIL;
    const password = process.env.E2E_PASSWORD;
    if (!email || !password) {
      test.skip(true, "E2E_EMAIL / E2E_PASSWORD not set");
      return;
    }

    const audioFixture = path.resolve(__dirname, "fixtures/tone.mp3");
    if (!fs.existsSync(audioFixture)) {
      test.skip(true, "e2e/fixtures/tone.mp3 not found");
      return;
    }

    const hostCtx = await browser.newContext();
    const viewerCtx = await browser.newContext();
    const hostPage = await hostCtx.newPage();
    const viewerPage = await viewerCtx.newPage();

    await hostPage.goto("/signin");
    await hostPage.fill('input[type="email"]', email);
    await hostPage.fill('input[type="password"]', password);
    await hostPage.click('button[type="submit"]');
    await hostPage.waitForURL(/\/(broadcast|profile)/, { timeout: 12_000 });

    await hostPage.goto("/broadcast");
    await hostPage.getByRole("button", { name: /start.*room/i }).click();
    await hostPage.waitForURL(/\/broadcast\/host\//, { timeout: 10_000 });

    const shareUrl = await hostPage.locator("code").textContent({ timeout: 6_000 });
    const roomPath = new URL(shareUrl!.trim()).pathname;

    // Upload audio file from host
    const fileInput = hostPage.locator('input[type="file"]');
    await fileInput.setInputFiles(audioFixture);
    // Wait for upload to finish (button goes from "Uploading…" back to "↑ Upload Audio")
    await expect(hostPage.getByText("Uploading…")).toBeHidden({ timeout: 20_000 });

    // Open viewer
    await viewerPage.goto(roomPath);
    await expect(viewerPage.getByText("LIVE", { exact: true })).toBeVisible({ timeout: 8000 });

    // The EnginePlayer mounts an <audio> element once audioSource is set
    const audioSrc = await viewerPage.waitForFunction(
      () => {
        const el = document.querySelector("audio");
        return el?.src && el.src.startsWith("http") ? el.src : null;
      },
      { timeout: 10_000 }
    );

    expect(await audioSrc.jsonValue()).toBeTruthy();

    await hostCtx.close();
    await viewerCtx.close();
  });
});
