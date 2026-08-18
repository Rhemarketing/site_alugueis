import fs from "node:fs/promises";
import { properties, knownHistory, SOURCE_UPDATED_AT } from "../data.js";

const seed = {
  sourceUpdatedAt: SOURCE_UPDATED_AT,
  properties: properties.map(({ history, ...property }) => property),
  history: knownHistory,
};

await fs.mkdir(new URL("../database/", import.meta.url), { recursive: true });
await fs.writeFile(
  new URL("../database/seed-data.json", import.meta.url),
  `${JSON.stringify(seed, null, 2)}\n`,
  "utf8",
);

console.log(`Seed gerado com ${seed.properties.length} imóveis e ${seed.history.length} eventos.`);
