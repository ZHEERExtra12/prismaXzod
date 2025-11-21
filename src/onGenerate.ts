import { GeneratorOptions } from "@prisma/generator-helper";
import fs from "node:fs";
import path from "node:path";

export default async function onGenerate(options: GeneratorOptions) {
  const models = options.dmmf.datamodel.models;

  const union = models.map(m => `"${m.name}"`).join(" | ");
  const content = `export type ModelName = ${union};`;

  const outDir = options.generator.output?.value;
  if (!outDir) throw new Error("No output dir");

  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "model-names.ts"), content);
}
