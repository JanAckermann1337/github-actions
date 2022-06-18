const Client = require('ssh2-sftp-client');
const args = getProcessArgs();
const sftp = new Client();
const fs = require('fs')
const { join } = require('path')
const logger = {
  all: (msg) => {
    console.log(msg)
  },
  verbose: (msg) => {
    if (args.verbose) {
      console.log(msg)
    }
  }
}

logger.verbose(args)

sftp.connect({
  host: args.host,
  port: args.port,
  username: args.username,
  password: args.password
}).then(async () => {
  logger.all("--------Connected to sftp server--------")

  const uploadDir = args.uploadDir
  const srcDir = join(__dirname, args.srcDir)
  const ignoredFiles = ['.gitignore', 'package-lock.json']
  const ignoredFolders = ['.git','.github','node_modules', '.idea']

  logger.verbose(uploadDir)
  logger.verbose(srcDir)
  logger.verbose(srcDir)

  await ensureDir(uploadDir)
  await cleanUpFolder(uploadDir, ignoredFiles, ignoredFolders)
  await upload(srcDir, uploadDir, ignoredFiles, ignoredFolders)

  logger.all("Deployment complete")
  closeConnection()
}).catch((err) => {
  logger.all(err)
  errorHandler("Error while connecting to server")
})

function getProcessArgs () {
  let args = {}
  process.argv.map((arg) => {
    if(arg.includes("=")) {
      const splittedArgs = arg.split("=")
      args[splittedArgs[0]] = splittedArgs[1]
    }
  })
  return args
}

async function upload (src, dst, ignoredFiles, ignoredFolders) {
  const promises = []
  fs.readdirSync(src).forEach((file) => {
    if(fs.lstatSync(`${src}/${file}`).isDirectory()) {
      if(!ignoredFolders.includes(file)) promises.push(uploadDir(`${src}/${file}`, `${dst}/${file}`))
    } else {
      if(!ignoredFiles.includes(file)) promises.push(uploadFile(`${src}/${file}`, `${dst}/${file}`))
    }
  })
  await Promise.all(promises).then((res) => {
    logger.verbose("Upload complete")
  }).catch((err) => {
    logger.all(err)
  })
}

async function uploadDir (src, dst) {
  return sftp.uploadDir(src, dst).then((res) => {
    logger.verbose(res)
  }).catch((err) => {
    logger.all(err)
    errorHandler("Error while uploading folder")
  })
}

async function uploadFile (src, dst) {
  return sftp.fastPut(src, dst).then((res) => {
    logger.verbose(res)
  }).catch((err) => {
    logger.all(err)
    errorHandler("Error while uploading file")
  })
}

async function cleanUpFolder (uploadDir, ignoredFiles, ignoredFolders) {
  const ls = await sftp.list(uploadDir)
  const folders = ls.filter((item) => {
    return item.type === 'd' && !ignoredFolders.includes(item.name)
  })
  const files =  ls.filter((item) => {
    return item.type === '-' && !ignoredFiles.includes(item.name)
  })
  const rmFiles = files.map((file) => {
    return sftp.delete(`${uploadDir}/${file.name}`);
  })
  const rmFolders = folders.map((folder) => {
    return sftp.rmdir(`${uploadDir}/${folder.name}`, true)
  })
  await Promise.all(rmFiles).then((res) => {
    logger.verbose("Files deleted")
  }).catch((err) => {
    logger.all(err)
  })
  await Promise.all(rmFolders).then((res) => {
    logger.verbose("Folders deleted")
  }).catch((err) => {
    logger.all(err)
  })
}

function ensureDir (dir) {
  return sftp.exists(dir).then((res) => {
    if (res) {
      switch (res) {
        case 'd':
          logger.all('Directory exists')
          break;
        case '-':
          logger.all('File exists')
          break;
        case 'l':
          logger.all('Link exists')
          break;
      }
      return true
    } else {
      errorHandler("Provided directory dose not exists")
    }
  }).catch((err) => {
    logger.all(err)
    errorHandler("Error while checking file")
  })
}

function closeConnection () {
  sftp.end().then((() => {
    logger.all("-----Disconnected from sftp server------")
  })).catch((err) => {
    logger.all(err)
    errorHandler("Error while closing connection file")
  })
}

function errorHandler (msg) {
  closeConnection()
  throw new Error(msg)
}



