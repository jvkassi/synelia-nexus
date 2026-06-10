import { expect, test } from "@playwright/test";

test.describe("Pages d'authentification", () => {
  test("la page de connexion s'affiche correctement", async ({ page }) => {
    await page.goto("/login");
    await expect(
      page.getByPlaceholder("prenom.nom@synelia.tech")
    ).toBeVisible();
    await expect(page.getByLabel("Mot de passe")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Se connecter" })
    ).toBeVisible();
    await expect(page.getByText("Pas encore de compte ?")).toBeVisible();
  });

  test("la page d'inscription s'affiche correctement", async ({ page }) => {
    await page.goto("/register");
    await expect(
      page.getByPlaceholder("prenom.nom@synelia.tech")
    ).toBeVisible();
    await expect(page.getByLabel("Mot de passe")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "S'inscrire" })
    ).toBeVisible();
    await expect(page.getByText("Déjà un compte ?")).toBeVisible();
  });

  test("navigation de la connexion vers l'inscription", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("link", { name: "Demander un accès" }).click();
    await expect(page).toHaveURL("/register");
  });

  test("navigation de l'inscription vers la connexion", async ({ page }) => {
    await page.goto("/register");
    await page.getByRole("link", { name: "Se connecter" }).click();
    await expect(page).toHaveURL("/login");
  });
});
