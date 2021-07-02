const { exec } = require("child_process");

const package = JSON.parse(require("fs").readFileSync("./package.json"));

const imageName = process.argv[2] ? process.argv[2] : package.name;
const version = package.version;

exec(`docker build -t ${imageName}:${version} ./`, (error, stdout, stderr) => {
    if (error) {
        console.log(`error: ${error.message}`);
        return;
    }
    if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
    }
    console.log(`stdout: ${stdout}`);
});