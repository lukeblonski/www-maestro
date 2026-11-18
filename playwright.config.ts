import { defineConfig, devices } from "@playwright/test";

// Testy kroków 1–14 scenariusza PRD w przeglądarce, na stronie zbudowanej z
// NEXT_PUBLIC_BASE_PATH=/www-maestro i podanej z out/ pod /www-maestro/.
// Uruchamia je `npm run test:e2e` (lokalnie w obrazie Dockera Playwright, w CI wprost).
const port = Number(process.env.E2E_PORT ?? 3100);
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: "tests/e2e",
  outputDir: "node_modules/.cache/playwright-wyniki",
  reporter: "list",
  forbidOnly: !!process.env.CI,
  use: {
    baseURL,
  },
  projects: [
    {
      name: "telefon-360",
      use: {
        ...devices["Pixel 5"],
        viewport: { width: 360, height: 740 },
      },
    },
    {
      name: "komputer-1280",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 800 },
      },
    },
  ],
  webServer: {
    command: "node scripts/serwer-statyczny.mjs",
    url: `${baseURL}/www-maestro/`,
    reuseExistingServer: false,
  },
});
