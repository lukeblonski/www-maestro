import { defineConfig } from "@playwright/test";

// Testy bez przeglądarki, na komputerze, bez serwera strony:
// - projekt `repo` (krok 16) uruchamia `npm run verify`;
// - projekt `readme` (krok 15) uruchamia `npm run test:e2e` po testach w przeglądarce.
export default defineConfig({
  outputDir: "node_modules/.cache/playwright-wyniki",
  reporter: "list",
  forbidOnly: !!process.env.CI,
  projects: [
    { name: "repo", testDir: "tests/repo" },
    { name: "readme", testDir: "tests/readme" },
  ],
});
