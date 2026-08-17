import fs from "node:fs/promises";

const root = new URL("./", import.meta.url);
const [html, css, data, app] = await Promise.all([
  fs.readFile(new URL("index.html", root), "utf8"),
  fs.readFile(new URL("styles.css", root), "utf8"),
  fs.readFile(new URL("data.js", root), "utf8"),
  fs.readFile(new URL("app.js", root), "utf8"),
]);

const bundledData = data.replaceAll("export const ", "const ");
const bundledApp = app.replace(/^import .*?;\s*/m, "");
const output = html
  .replace(/\s*<link rel="icon"[^>]*>/, "")
  .replace('<link rel="stylesheet" href="styles.css" />', `<style>\n${css}\n</style>`)
  .replace('<script type="module" src="app.js"></script>', `<script>\n${bundledData}\n${bundledApp}\n</script>`);

const dist = new URL("dist/", root);
await fs.mkdir(dist, { recursive: true });
await fs.writeFile(new URL("Espaco_VIP_Gestao_de_Imoveis.html", dist), output);
console.log("✓ versão HTML única gerada");
