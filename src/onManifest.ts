import type { GeneratorManifest } from '@prisma/generator-helper';

export default function onManifest(): GeneratorManifest {
  return {
    defaultOutput: './generated',
    prettyName: 'Prisma X Zod Generator',
    version: '0.0.1',
  };
}