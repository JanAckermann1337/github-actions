import ftp from "basic-ftp"

example()

async function example() {
  const client = new ftp.Client(300000)
  client.ftp.verbose = true
  try {
    await client.access({
      host: "access806397757.webspace-data.io",
      user: "u99187139-github",
      password: "bd!?r$KJz4!C648S",
      secure: false,
      port: 22,
      secureOptions: {
        enableTrace: true,
        requestCert: true,

      }
    })
    console.log(await client.list())
    await client.uploadFrom("README.md", "README_FTP.md")
    await client.downloadTo("README_COPY.md", "README_FTP.md")
  }
  catch(err) {
    console.log(err)
  }
  client.close()
}
