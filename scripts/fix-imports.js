import fs from "node:fs";
import path from "node:path";

const dist = "./dist";

function walk(dir) {
  for (const file of fs.readdirSync(dir)) {
    const full = path.join(dir, file);

    if (fs.statSync(full).isDirectory()) walk(full);
    else if (file.endsWith(".js")) fix(full);
  }
}

function fix(file) {
  let code = fs.readFileSync(file, "utf8");

  code = code.replace(
    /from\s+['"](\.\/[^'"]+)['"]/g,
    'from "$1.js"'
  );

  fs.writeFileSync(file, code);
}

walk(dist);
console.log("✨ Imports fixed");
