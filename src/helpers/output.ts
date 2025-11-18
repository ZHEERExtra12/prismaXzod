import { readFileSync } from "fs";
import { dirname, resolve } from "path";


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
export async function LoadClient(customPath?: string): Promise<any | null> {
    // 1: If custom output exists → try loading THAT
    if (customPath) {
      try {
        const client = await import(customPath);
        return client?.Prisma ?? client?.default?.Prisma ?? null;
      } catch (_) {}
    }
  
    // 2: Otherwise → use default Prisma client
    try {
      const client = await import("@prisma/client");
      return client.Prisma ?? null;
    } catch (_) {}
  
    return null;
  }