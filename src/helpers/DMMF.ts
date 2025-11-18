import { findSchemaPrisma } from "./findSchema";
import { CustomOutput } from "./output";
import { LoadClient } from "./output";
import { join } from "path";

export async function getDMMF() {
  // Find schema
  const schema = findSchemaPrisma();

  // Read output (may be null)
  const outputPath = schema ? CustomOutput(schema) : null;

  // Try to load client
  const Prisma = await LoadClient(
    outputPath ? join(outputPath, "index.js") : undefined
  );

  if (!Prisma?.dmmf?.datamodel) {
    throw new Error(
      JSON.stringify(
        {
          schemaFound: schema ?? false,
          customOutput: outputPath ?? false,
          clientLoaded: Boolean(Prisma),
        },
        null,
        2
      )
    );
  }

  return Prisma.dmmf.datamodel;
}