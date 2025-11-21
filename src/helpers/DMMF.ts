import type { DMMF } from "@prisma/generator-helper";
import { findSchemaPrisma } from "./findSchema";
import { CustomOutput, LoadClient } from "./output";
import { join } from "path";

export async function getDMMF(): Promise<DMMF.Datamodel> {
  const schema = findSchemaPrisma();

  const outputPath = schema ? CustomOutput(schema) : null;

  // Try custom output first, fallback to default
  const prismaClientModule = await LoadClient(
    outputPath ? join(outputPath, "client") : undefined
  );

  
  console.log(prismaClientModule);
  const dmmf = prismaClientModule?.dmmf?.datamodel;

  if (!dmmf) {
    throw new Error(
      JSON.stringify(
        {
          schemaFound: schema ?? false,
          customOutput: outputPath ?? false,
          clientLoaded: Boolean(prismaClientModule),
        },
        null,
        2
      )
    );
  }

  return dmmf as DMMF.Datamodel;
}
