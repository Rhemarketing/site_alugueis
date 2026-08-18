import assert from "node:assert/strict";
import fs from "node:fs/promises";

const seed = JSON.parse(await fs.readFile(new URL("./database/seed-data.json", import.meta.url), "utf8"));
const schema = await fs.readFile(new URL("./database/schema.sql", import.meta.url), "utf8");
const dockerfile = await fs.readFile(new URL("./Dockerfile", import.meta.url), "utf8");
const entrypoint = await fs.readFile(new URL("./docker/entrypoint.sh", import.meta.url), "utf8");

const reference = new Date("2026-08-14T12:00:00");
const days = (date) => date ? Math.round((new Date(`${date}T12:00:00`) - reference) / 86400000) : null;
const status = (property) => {
  const remaining = days(property.nextAdjustment);
  if (remaining === null) return "internal";
  if (remaining < 0) return "overdue";
  if (remaining <= 30) return "soon";
  if (remaining <= 60) return "attention";
  return "regular";
};

const properties = seed.properties;
assert.equal(properties.length, 36, "A migração deve conter 36 unidades físicas");
assert.equal(new Set(properties.map((property) => property.id)).size, 36, "IDs de imóveis devem ser únicos");
assert.equal(properties.filter((property) => property.occupancy === "Locado").length, 33);
assert.equal(properties.filter((property) => property.occupancy === "Uso interno").length, 3);
assert.equal(properties.reduce((sum, property) => sum + property.rent, 0), 36480);
assert.equal(properties.filter((property) => status(property) === "overdue").length, 2);
assert.equal(properties.filter((property) => status(property) === "soon").length, 6);
assert.equal(properties.filter((property) => status(property) === "attention").length, 1);

for (const table of ["properties", "tenants", "leases", "lease_tenants", "property_events", "rent_adjustments", "payments", "property_charges", "documents", "app_settings"]) {
  assert.match(schema, new RegExp(`CREATE TABLE IF NOT EXISTS ${table}\\b`), `Tabela ausente: ${table}`);
}
assert.match(schema, /FOREIGN KEY \(property_id\) REFERENCES properties\(id\)/);
assert.match(schema, /FOREIGN KEY \(lease_id\) REFERENCES leases\(id\)/);
assert.match(dockerfile, /DB_DATABASE=site_alugueis/);
assert.match(dockerfile, /HEALTHCHECK/);
assert.match(dockerfile, /site-alugueis-entrypoint/);
assert.match(entrypoint, /database\/migrate\.php/);
assert.match(entrypoint, /apache2-foreground|exec "\$@"/);

console.log("✓ seed com 36 unidades e indicadores reconciliados");
console.log("✓ schema relacional preparado para contratos, pagamentos e documentos");
console.log("✓ imagem preparada para migração automática e health check");
