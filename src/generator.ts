// import { getDMMF } from "./helpers/DMMF.js";
// import GenerateModelNames from "./GenerateModelNames.js";

// const dmmf = await getDMMF();
// GenerateModelNames(dmmf);

// import pkg from "@prisma/generator-helper";
// const { generatorHandler } = pkg;
// import onGenerate from "./onGenerate";
// import onManifest from "./onManifest";

// generatorHandler({
//   onManifest,
//   onGenerate
// });

import { getDMMF} from "./helpers/DMMF";
import GenerateModelNames from "./helpers/GenerateModelNames";
import TypeGen from "./helpers/typeGen";

const dmmf = await getDMMF();

GenerateModelNames(dmmf);
TypeGen(dmmf);