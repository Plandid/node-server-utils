const { exec } = require("child_process");

const version = JSON.parse(require("fs").readFileSync("./package.json")).version;

exec(`git tag ${version}`, (error, stdout, stderr) => {
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