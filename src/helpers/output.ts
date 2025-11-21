import { existsSync, readFileSync } from "fs";
import { resolve, dirname, join } from "path";
import { pathToFileURL } from "url";
import { createRequire } from "module";

/**
 * Detect custom client output from schema.prisma
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
 * SUPER BULLETPROOF CLIENT LOADER
 */
export async function LoadClient(customOutputPath?: string) {
  const require = createRequire(import.meta.url);

  const searchPaths: string[] = [];

  // 1️⃣ CUSTOM OUTPUT (exact user config)
  if (customOutputPath) {
    searchPaths.push(
      resolve(customOutputPath),
      resolve(customOutputPath, "index"),
      resolve(customOutputPath, "index.js"),
      resolve(customOutputPath, "index.mjs"),
      resolve(customOutputPath, "index.ts"),
      resolve(customOutputPath, "index.tsx"),
    );
  }

  // 2️⃣ DEFAULT PRISMA OUTPUT (runtime client)
  const defaultClientPaths = [
    ".prisma/client",
    "node_modules/.prisma/client",
    join(process.cwd(), "node_modules/.prisma/client"),
    join(process.cwd(), ".prisma/client")
  ];

  defaultClientPaths.forEach(p => {
    searchPaths.push(
      resolve(p),
      resolve(p, "index.js"),
      resolve(p, "index.mjs")
    );
  });

  // Filter to only existing files/folders
  const existing = searchPaths.filter(p => existsSync(p));

  for (const p of existing) {
    // Try ESM import first
    try {
      const fileUrl = pathToFileURL(p).href;
      const mod = await import(fileUrl);
      const prisma = mod?.Prisma || mod?.default?.Prisma;
      if (prisma) return prisma;
    } catch {}

    // Try CJS fallback
    try {
      const mod = require(p);
      const prisma = mod?.Prisma || mod?.default?.Prisma;
      if (prisma) return prisma;
    } catch {}
  }

  console.error("❌ Prisma client NOT found in any expected paths:");
  for (const p of searchPaths) console.error("   -", p);

  return null;
}
