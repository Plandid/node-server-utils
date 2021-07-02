const { exec } = require("child_process");
require("dotenv").config();

const package = JSON.parse(require("fs").readFileSync("./package.json"));

const imageName = process.argv[2] ? process.argv[2] : package.name;
const version = process.argv[3] ? process.argv[3] : package.version;

const httpsParam = process.env.HTTPS_PORT ? ` -p 443:${process.env.HTTPS_PORT}` : "";

exec(`docker run -d --rm --env-file .env -p 80:${process.env.PORT}${httpsParam} ${imageName}:${version}`, (error, stdout, stderr) => {
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