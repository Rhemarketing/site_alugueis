import assert from "node:assert/strict";
import fs from "node:fs/promises";

const html = await fs.readFile(new URL("./index.html", import.meta.url), "utf8");
const css = await fs.readFile(new URL("./styles.css", import.meta.url), "utf8");
const app = await fs.readFile(new URL("./app.js", import.meta.url), "utf8");
const bundle = await fs.readFile(new URL("./dist/Espaco_VIP_Gestao_de_Imoveis.html", import.meta.url), "utf8");

for (const id of ["app", "sidebar", "propertyDrawer", "modalBackdrop", "globalSearch"]) {
  assert.match(html, new RegExp(`id=["']${id}["']`), `Elemento obrigatório ausente: ${id}`);
}

for (const view of ["dashboard", "properties", "agenda", "history", "documents", "settings"]) {
  assert.match(html + app, new RegExp(view), `Visão obrigatória ausente: ${view}`);
}

assert.match(css, /@media \(max-width: 880px\)/, "Breakpoint de tablet deve existir");
assert.match(css, /@media \(max-width: 620px\)/, "Breakpoint móvel deve existir");
assert.match(css, /\.property-drawer\.open/, "Estado aberto do painel lateral deve existir");
assert.match(app, /localStorage\.setItem/, "Histórico local deve ser persistido");
assert.match(app, /exportCsv/, "Exportação CSV deve estar implementada");
assert.match(app, /getNextSteps/, "Próximos passos devem ser calculados por imóvel");
assert.doesNotMatch(bundle, /src="app\.js"|href="styles\.css"/, "Versão única não deve depender de arquivos externos");
const bundledScript = bundle.match(/<script>([\s\S]*)<\/script>/)?.[1];
assert.ok(bundledScript, "Script incorporado deve existir");
new Function(bundledScript);

console.log("✓ estrutura das seis áreas do painel validada");
console.log("✓ responsividade, detalhes, histórico local, exportação e HTML único validados");
