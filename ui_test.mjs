import assert from "node:assert/strict";
import fs from "node:fs/promises";

const html = await fs.readFile(new URL("./index.html", import.meta.url), "utf8");
const css = await fs.readFile(new URL("./styles.css", import.meta.url), "utf8");
const app = await fs.readFile(new URL("./app.js", import.meta.url), "utf8");
const bootstrapApi = await fs.readFile(new URL("./api/bootstrap.php", import.meta.url), "utf8");
const activityApi = await fs.readFile(new URL("./api/activities.php", import.meta.url), "utf8");

for (const id of ["app", "sidebar", "propertyDrawer", "modalBackdrop", "globalSearch"]) {
  assert.match(html, new RegExp(`id=["']${id}["']`), `Elemento obrigatório ausente: ${id}`);
}
for (const view of ["dashboard", "properties", "agenda", "history", "documents", "settings"]) {
  assert.match(html + app, new RegExp(view), `Visão obrigatória ausente: ${view}`);
}

assert.match(css, /@media \(max-width: 880px\)/);
assert.match(css, /@media \(max-width: 620px\)/);
assert.match(app, /api\/bootstrap\.php/, "O frontend deve carregar os dados pela API");
assert.match(app, /api\/activities\.php/, "Acompanhamentos devem ser persistidos pela API");
assert.doesNotMatch(app, /localStorage/, "Dados operacionais não devem ficar apenas no navegador");
assert.match(bootstrapApi, /FROM properties p/);
assert.match(activityApi, /INSERT INTO property_events/);

console.log("✓ interface integrada à API MySQL");
console.log("✓ histórico operacional persistido no servidor");
