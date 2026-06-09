import { test, expect } from "@playwright/test";

const UNIQUE = Date.now().toString(36);
const TEST_EMAIL = `test-${UNIQUE}@synelia.tech`;
const TEST_PASSWORD = "synelia123";
const TEST_NAME = "Test User";

test.describe("Auth flow", () => {
  test("register creates account and redirects to dashboard", async ({ page }) => {
    await page.goto("/register");

    await expect(page.getByText("Créer mon compte")).toBeVisible();

    await page.getByLabel("Nom complet").fill(TEST_NAME);
    await page.getByLabel("Adresse e-mail professionnelle").fill(TEST_EMAIL);
    await page.getByLabel("Mot de passe").fill(TEST_PASSWORD);

    await page.getByRole("button", { name: /Créer mon compte/ }).click();

    // Should redirect to the app dashboard after successful registration
    await expect(page).toHaveURL("/", { timeout: 10000 });
  });

  test("login with valid credentials redirects to dashboard", async ({ page }) => {
    // First register the account
    await page.goto("/register");
    const email = `login-${UNIQUE}@synelia.tech`;
    await page.getByLabel("Nom complet").fill(TEST_NAME);
    await page.getByLabel("Adresse e-mail professionnelle").fill(email);
    await page.getByLabel("Mot de passe").fill(TEST_PASSWORD);
    await page.getByRole("button", { name: /Créer mon compte/ }).click();
    await expect(page).toHaveURL("/", { timeout: 10000 });

    // Sign out by navigating to login
    await page.goto("/login");
    await expect(page.getByText("Bon retour")).toBeVisible();

    await page.getByLabel("Adresse e-mail professionnelle").fill(email);
    await page.getByLabel("Mot de passe").fill(TEST_PASSWORD);
    await page.getByRole("button", { name: /Se connecter/ }).click();

    await expect(page).toHaveURL("/", { timeout: 10000 });
  });

  test("login with wrong password shows error", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel("Adresse e-mail professionnelle").fill("nobody@synelia.tech");
    await page.getByLabel("Mot de passe").fill("wrongpassword");
    await page.getByRole("button", { name: /Se connecter/ }).click();

    await expect(page.getByText(/Adresse e-mail ou mot de passe incorrect/)).toBeVisible({ timeout: 8000 });
  });

  test("unauthenticated visit to / redirects to login", async ({ page }) => {
    await page.goto("/");
    // Without a session, should redirect to login
    await expect(page).toHaveURL(/\/login/, { timeout: 8000 });
  });
});
