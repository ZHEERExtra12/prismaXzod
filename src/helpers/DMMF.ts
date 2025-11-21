import { LoadClient } from "./output";
import { findSchemaPrisma } from "./findSchema";
import { CustomOutput } from "./output";
import { join } from "path";

export async function getDMMF() {
  const schema = findSchemaPrisma();
  const outputPath = schema ? CustomOutput(schema) : null;

  // try to load prisma client from the correct location
  const pathsToTry = [
      outputPath,
      join(process.cwd(), "node_modules/.prisma/client"),
      join(process.cwd(), ".prisma/client")
  ];

  let prismaClientModule = null;

  for (const p of pathsToTry) {
      try {
          prismaClientModule = await LoadClient(p ?? undefined);
          if (prismaClientModule) break;
      } catch {}
  }

  if (!prismaClientModule?.dmmf?.datamodel) {
      throw new Error(JSON.stringify({
          schemaFound: schema ?? false,
          customOutput: outputPath ?? false,
          clientLoaded: false,
          triedPaths: pathsToTry
      }, null, 2));
  }

  return prismaClientModule.dmmf.datamodel;
}
