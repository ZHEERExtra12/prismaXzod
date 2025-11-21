import { readFileSync } from "fs";
import { dirname, resolve } from "path";
import { pathToFileURL } from "url";
import { createRequire } from "module";

/**
 * Get the custom Prisma output path if defined in generator block
 */

export function CustomOutput(schemaPath: string): string | null {
    const raw = readFileSync(schemaPath, "utf8");
    const dir = dirname(schemaPath);
  
    const match = raw.match(
      /generator\s+client\s*\{[\s\S]*?output\s*=\s*["'](.+?)["']/m
    );
  
    if (!match) return null;
  
    return resolve(dir, match[1] ?? "");
  }

  
/**
 * Load Prisma client from either @prisma/client or a custom output
 */
export type PrismaClientNamespace = Record<string, any>;

export async function LoadClient(customPath?: string): Promise<PrismaClientNamespace | null> {
  if (customPath) {
    const resolvedPath = resolve(customPath);

    const pathsToTry = [
      resolvedPath,
      `${resolvedPath}.js`,
      resolve(customPath, "index.js"),
    ];

    // Try ESM
    for (const pathToTry of pathsToTry) {
      try {
        const fileUrl = pathToFileURL(pathToTry).href;
        const client = await import(fileUrl);
        const prisma = client?.Prisma ?? client?.default?.Prisma ?? null;
        if (prisma) return prisma as PrismaClientNamespace;
      } catch {}
    }

    // Try CJS
    for (const pathToTry of pathsToTry) {
      try {
        const require = createRequire(import.meta.url);
        const client = require(pathToTry);
        const prisma = client?.Prisma ?? client?.default?.Prisma ?? null;
        if (prisma) return prisma as PrismaClientNamespace;
      } catch {}
    }
  }

  // Fallback to local @prisma/client
  try {
    // const client = await import("@prisma/client");
    // return (client as any).Prisma ?? (client as any).default?.Prisma ?? null;
  } catch {}

  return null;
}
