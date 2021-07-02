const fs = require("fs");

let packageJson = JSON.parse(fs.readFileSync("./package.json"));

let [major, minor, patch] = packageJson.version.split(".");

packageJson.version = `${major}.${parseInt(minor) + 1}.${0}`;

fs.writeFileSync("./package.json", JSON.stringify(packageJson, null, 2));