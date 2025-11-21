import { getDMMF } from "./helpers/DMMF.js";
import GenerateModelNames from "./GenerateModelNames.js";

const dmmf = await getDMMF();
GenerateModelNames(dmmf);