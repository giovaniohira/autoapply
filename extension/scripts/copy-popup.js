/**
 * Copy popup static assets to dist after tsc.
 * Run from extension directory: node scripts/copy-popup.js
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const src = path.join(root, "src", "popup");
const dest = path.join(root, "dist", "popup");

if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
for (const name of ["popup.html", "popup.css"]) {
	const srcFile = path.join(src, name);
	const destFile = path.join(dest, name);
	if (fs.existsSync(srcFile)) fs.copyFileSync(srcFile, destFile);
}
