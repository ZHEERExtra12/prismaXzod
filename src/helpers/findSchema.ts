import { existsSync } from "fs";
import { join } from "path";

/**
 * Find schema.prisma in sane, common places only
 */
export function findSchemaPrisma(): string | null {
  const possible = [
    "prisma/schema.prisma",
    "schema.prisma",
    "src/prisma/schema.prisma",
    "app/prisma/schema.prisma",
    "lib/prisma/schema.prisma",
  ];

  const cwd = process.cwd();

  for (const p of possible) {
    const full = join(cwd, p);
    if (existsSync(full)) return full;
  }

  return null;
}