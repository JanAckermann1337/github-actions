import { deploy, excludeDefaults } from "@samkirkland/ftp-deploy";

async function deployMyCode() {
  console.log("🚚 Deploy started");
  await deploy({
    server: "access806397757.webspace-data.io",
    username: "u99187139-github",
    password: `bd!?r$KJz4!C648S`, // note: I'm using backticks here ` so I don't have to escape quotes
    exclude: [...excludeDefaults],
    port: 22,
    protocol: 'ftps',
    "log-level": "verbose",
    security: "loose"
  });
  console.log("🚀 Deploy done!");
}

deployMyCode().catch((err) => {
  console.log(err)
});
