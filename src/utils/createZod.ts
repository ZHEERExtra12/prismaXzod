//@ts-nocheck
import { getDMMF } from "../helpers/DMMF";
import type { ModelName } from "../helpers/model-names";
import { z } from "zod";
import { replacer } from "../helpers/replacer";
import type { PrismaModels } from "../helpers/types";
import type { DMMF } from "@prisma/generator-helper";

/* -----------------------------------------------------------
   1. Map TypeScript primitive → specific Zod constructor
----------------------------------------------------------- */
type TypeToZod<T> =
  T extends string ? z.ZodString :
  T extends number ? z.ZodNumber :
  T extends boolean ? z.ZodBoolean :
  T extends Date ? z.ZodDate :
  z.ZodAny;

/* -----------------------------------------------------------
   2. Build the Zod shape according to generated PrismaModels
----------------------------------------------------------- */
type ZodShapeForModel<M extends ModelName> = {
  [K in keyof PrismaModels[M]]:
    PrismaModels[M][K] extends infer T | undefined
      ? z.ZodOptional<TypeToZod<T>>
      : TypeToZod<PrismaModels[M][K]>;
};

/* -----------------------------------------------------------
   3. Runtime builder: DMMF → Zod object
----------------------------------------------------------- */
export async function createZod<M extends ModelName>(
  model: M
): Promise<z.ZodObject<ZodShapeForModel<M>>> {

  const dmmf = await getDMMF();
  const prismaModel = dmmf.models.find((m: DMMF.Model) => m.name === model);

  if (!prismaModel) {
    throw new Error(`Model ${model} not found`);
  }

  const shape: Record<string, z.ZodTypeAny> = {};

  for (const field of prismaModel.fields) {
    let fieldSchema = replacer(field);

    if (field.isNullable) {
      fieldSchema = fieldSchema.nullable();
    }
    if (!field.isRequired) {
      fieldSchema = fieldSchema.optional();
    }

    shape[field.name] = fieldSchema;
  }

  return z.object(shape) as unknown as z.ZodObject<ZodShapeForModel<M>>;
}
