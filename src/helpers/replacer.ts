import { z } from "zod";
import type { DMMF } from "@prisma/generator-helper";

export function replacer(field: DMMF.Field): z.ZodTypeAny {
  switch (field.type) {
    case "String":
      return z.string();

    case "Int":
      return z.number().int();

    case "DateTime":
      return z.date();

    case "Boolean":
      return z.boolean();

    default:
      return z.any();
  }
}
