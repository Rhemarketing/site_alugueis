import assert from "node:assert/strict";
import { properties } from "./data.js";

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

assert.equal(properties.length, 36, "A base deve conter 36 unidades físicas");
assert.equal(new Set(properties.map((property) => property.id)).size, 36, "IDs de imóveis devem ser únicos");
assert.equal(properties.filter((property) => property.occupancy === "Locado").length, 33, "Devem existir 33 unidades locadas");
assert.equal(properties.filter((property) => property.occupancy === "Uso interno").length, 3, "Devem existir 3 salas de uso interno");
assert.equal(properties.reduce((sum, property) => sum + property.rent, 0), 36480, "Receita base mensal deve reconciliar");
assert.equal(properties.filter((property) => status(property) === "overdue").length, 2, "Devem existir 2 reajustes atrasados");
assert.equal(properties.filter((property) => status(property) === "soon").length, 6, "Devem existir 6 reajustes em até 30 dias");
assert.equal(properties.filter((property) => status(property) === "attention").length, 1, "Deve existir 1 reajuste entre 31 e 60 dias");
assert.ok(properties.every((property) => property.code && property.tenant && property.type), "Cadastros essenciais devem estar preenchidos");

console.log("✓ 36 unidades validadas");
console.log("✓ ocupação, receita e prioridades reconciliadas com a base consolidada");
