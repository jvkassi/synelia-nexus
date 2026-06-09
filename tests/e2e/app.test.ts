import { test, expect } from "@playwright/test";

const UNIQUE = Date.now().toString(36);
const EMAIL = `app-${UNIQUE}@synelia.tech`;
const PASSWORD = "synelia123";

async function registerAndLogin(page: any) {
  await page.goto("/register");
  await page.getByLabel("Nom complet").fill("App Tester");
  await page.getByLabel("Adresse e-mail professionnelle").fill(EMAIL);
  await page.getByLabel("Mot de passe").fill(PASSWORD);
  await page.getByRole("button", { name: /Créer mon compte/ }).click();
  await expect(page).toHaveURL("/", { timeout: 12000 });
}

test.describe("App shell", () => {
  test.beforeEach(async ({ page }) => {
    await registerAndLogin(page);
  });

  test("dashboard shows Synelia brand in sidebar", async ({ page }) => {
    await expect(page.locator(".sb-brand .wm")).toContainText("SYNELIA");
  });

  test("sidebar shows project list", async ({ page }) => {
    // Projects section should appear in the sidebar
    await expect(page.locator(".sb-section").first()).toBeVisible();
    // At least one project link rendered
    await expect(page.locator(".sb-proj").first()).toBeVisible();
  });

  test("sidebar navigation links are rendered", async ({ page }) => {
    // Main nav links: Tableau de bord, Bibliothèque, Routines, Artefacts
    await expect(page.locator(".sb-link").first()).toBeVisible();
  });

  test("library page renders prompt grid", async ({ page }) => {
    await page.goto("/library");
    await expect(page.locator(".lib-cats")).toBeVisible({ timeout: 10000 });
    await expect(page.locator(".prompt-card").first()).toBeVisible();
  });

  test("routines page renders task list", async ({ page }) => {
    await page.goto("/routines");
    await expect(page.locator(".tasks-view")).toBeVisible({ timeout: 10000 });
    // At least one routine card
    await expect(page.locator(".rt-card").first()).toBeVisible();
  });

  test("artifacts page renders artifact grid", async ({ page }) => {
    await page.goto("/artifacts");
    await expect(page.locator(".artg-grid")).toBeVisible({ timeout: 10000 });
    await expect(page.locator(".artg-card").first()).toBeVisible();
  });

  test("project page renders conversations tab", async ({ page }) => {
    await page.goto("/w/coris");
    await expect(page.locator(".projhead")).toBeVisible({ timeout: 10000 });
    // Tab bar present
    await expect(page.locator(".ph-tabs")).toBeVisible();
  });
});

test.describe("Admin console", () => {
  test.beforeEach(async ({ page }) => {
    await registerAndLogin(page);
  });

  test("admin page renders overview KPIs", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.locator(".adm-stats")).toBeVisible({ timeout: 10000 });
    await expect(page.locator(".stat-card").first()).toBeVisible();
  });

  test("admin members tab renders team table", async ({ page }) => {
    await page.goto("/admin?tab=members");
    await expect(page.locator(".adm-table")).toBeVisible({ timeout: 10000 });
  });

  test("admin governance tab renders policy toggles", async ({ page }) => {
    await page.goto("/admin?tab=governance");
    await expect(page.locator(".policy-row").first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator(".switch").first()).toBeVisible();
  });
});
