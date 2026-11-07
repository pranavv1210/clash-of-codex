import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
const roots = ["src/app", "src/components", "src/features"],
  bad = [];
for (const root of roots) walk(root);
function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name),
      s = statSync(p);
    if (s.isDirectory()) walk(p);
    else if (
      /\.(css|tsx?)$/.test(p) &&
      /#[0-9a-f]{3,8}\b/i.test(readFileSync(p, "utf8"))
    )
      bad.push(p);
  }
}
if (bad.length) {
  console.error("Raw hex colors outside tokens.css:", bad);
  process.exit(1);
}
console.log("Token check passed.");
