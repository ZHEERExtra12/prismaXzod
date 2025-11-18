import { readFileSync, existsSync } from "fs";
import { join, dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Find the Prisma schema file by searching common locations
 */
function findPrismaSchema(): string | null {
  const searchPaths = [
    "prisma/schema.prisma",
    "src/prisma/schema.prisma",
    "app/prisma/schema.prisma",
    "lib/prisma/schema.prisma",
    "schema.prisma",
  ];

  // Start from process.cwd() (user's project root)
  const cwd = process.cwd();
  
  for (const relativePath of searchPaths) {
    const fullPath = join(cwd, relativePath);
    if (existsSync(fullPath)) {
      return fullPath;
    }
  }

  // Also try searching from the package's location (for development)
  const packageDir = resolve(__dirname, "../../../");
  for (const relativePath of searchPaths) {
    const fullPath = join(packageDir, relativePath);
    if (existsSync(fullPath)) {
      return fullPath;
    }
  }

  return null;
}

/**
 * Parse the output path from schema.prisma generator config
 */

function getPrismaOutputPath(schemaPath: string): string | null {
  try {
    const schemaContent = readFileSync(schemaPath, "utf-8");
    const schemaDir = dirname(schemaPath);
    
    // Match generator client { ... output = "..." ... }
    const outputMatch = schemaContent.match(/generator\s+\w+\s*\{[^}]*output\s*=\s*["']([^"']+)["']/s);
    
    if (outputMatch && outputMatch[1]) {
      const outputPath = outputMatch[1];
      const resolvedPath = resolve(schemaDir, outputPath);
      return resolvedPath;
    }
  } catch (error) {
    // Silently fail
  }
  
  return null;
}

/**
 * Try to import Prisma client from a given path
 * Uses createRequire for better compatibility with absolute paths
 * The path should point to the client file (e.g., .../generated/prisma/client)
 */
async function tryImportPrisma(path: string): Promise<any> {
  const require = createRequire(import.meta.url);
  const resolvedPath = resolve(path);
  
  try {
    // Try importing directly (path already includes /client)
    const mod = require(resolvedPath);
    return mod.Prisma || mod.default?.Prisma || null;
  } catch {
    // If direct import fails, try with /index suffix as fallback
    try {
      const mod = require(join(resolvedPath, "index"));
      return mod.Prisma || mod.default?.Prisma || null;
    } catch {
      return null;
    }
  }
}

/**
 * Try to load Prisma client from common locations
 * Looks for generated/prisma/client in various locations
 */
async function findPrismaClient(): Promise<any> {
  const commonPaths = [
    "prisma/generated/prisma/client",
    "src/prisma/generated/prisma/client",
    "app/prisma/generated/prisma/client",
    "lib/prisma/generated/prisma/client",
    "generated/prisma/client",
  ];

  const cwd = process.cwd();
  
  for (const relativePath of commonPaths) {
    const fullPath = resolve(cwd, relativePath);
    const prisma = await tryImportPrisma(fullPath);
    if (prisma) {
      return prisma;
    }
  }

  return null;
}

export async function getDMMF() {
  // Try the standard @prisma/client
  let Prisma1: any = null;
  try {
    const mod = await import("@prisma/client");
    Prisma1 = mod.Prisma;
  } catch {
    Prisma1 = null;
  }

  // Try to find and load from custom generated location
  let Prisma2: any = null;
  
  // Find schema.prisma and read output path, then append /client
  const schemaPath = findPrismaSchema();
  if (schemaPath) {
    const outputPath = getPrismaOutputPath(schemaPath);
    if (outputPath) {
      const clientPath = join(outputPath, "client");
      Prisma2 = await tryImportPrisma(clientPath);
    }
  }
  
  // Try common locations if approach didn't work
  if (!Prisma2) {
    Prisma2 = await findPrismaClient();
  }

  // Extract dmmf from both clients 
  const dmmf1 = Prisma1?.dmmf ?? null;
  const dmmf2 = Prisma2?.dmmf ?? null;

  const datamodel =
    dmmf1?.datamodel ??
    dmmf2?.datamodel ??
    null;

  if (!datamodel) {
    throw new Error("No Prisma models found in any Prisma client.");
  }

  return datamodel;
}