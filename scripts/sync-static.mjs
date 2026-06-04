import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const publicDir = path.join(root, "public");
const sourceIndex = path.join(root, "index.html");
const sourceAssets = path.join(root, "assets");
const targetIndex = path.join(publicDir, "index.html");
const targetAssets = path.join(publicDir, "assets");

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function copyFile(src, dest) {
  ensureDir(path.dirname(dest));
  fs.copyFileSync(src, dest);
}

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  ensureDir(dest);
  fs.cpSync(src, dest, { recursive: true });
}

ensureDir(publicDir);
copyFile(sourceIndex, targetIndex);
copyDir(sourceAssets, targetAssets);
