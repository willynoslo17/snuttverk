#!/usr/bin/env node
/**
 * Manual helper (not a build step).
 * Usage: node scripts/set-base-url.mjs https://snuttverk.no
 * Replaces BASE_URL in HTML, sitemap.xml, robots.txt, JSON-LD and site.config.json.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const configPath = path.join(root, "site.config.json");

const next = process.argv[2];
if (!next || !/^https:\/\/[^\s/]+$/i.test(next.replace(/\/$/, ""))) {
  console.error("Usage: node scripts/set-base-url.mjs https://example.com");
  process.exit(1);
}

const newBase = next.replace(/\/$/, "");
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
const oldBase = (config.BASE_URL || "").replace(/\/$/, "");

if (!oldBase) {
  console.error("BASE_URL missing in site.config.json");
  process.exit(1);
}

if (oldBase === newBase) {
  console.log(`BASE_URL already ${newBase}`);
  process.exit(0);
}

const targets = [];
function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    if (name === "node_modules" || name === ".git") continue;
    const full = path.join(dir, name);
    const st = fs.statSync(full);
    if (st.isDirectory()) walk(full);
    else if (/\.(html|xml|txt|json|js|mjs)$/i.test(name)) targets.push(full);
  }
}
walk(root);

let changed = 0;
for (const file of targets) {
  const raw = fs.readFileSync(file, "utf8");
  if (!raw.includes(oldBase)) continue;
  fs.writeFileSync(file, raw.split(oldBase).join(newBase));
  changed += 1;
  console.log("updated", path.relative(root, file));
}

config.BASE_URL = newBase;
fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + "\n");
console.log(`BASE_URL: ${oldBase} → ${newBase} (${changed} files)`);
