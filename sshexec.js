const {NodeSSH} = require('node-ssh')
const ssh = new NodeSSH()

ssh.connect({
  host: '217.160.175.19',
  username: 'root',
  password: '3__#HsPbRi'
}).then(async () => {
  await ssh.execCommand('chmod 777 /srv', { cwd:'/srv' }).then(function(result) {
    console.log('chmod worked!!')
    if(result.stderr) {
      console.log('STDERR: ' + result.stderr)
    }
  })
  await ssh.execCommand('npm install', { cwd:'/srv' }).then(function(result) {
    console.log('Packages installed!!')
    if(result.stderr) {
      console.log('STDERR: ' + result.stderr)
    }
  })
  await ssh.execCommand('pm2 kill', { cwd:'/srv' }).then(function(result) {
    console.log('Node server stoped!!')
    if(result.stderr) {
      console.log('STDERR: ' + result.stderr)
    }
  })
  await ssh.execCommand('NODE_ENV=production DB_PASSWORD=ErIc13196a! pm2 start index.js -l pm2errors', { cwd:'/srv' }).then(function(result) {
    console.log('Node server started!!')
    if(result.stderr) {
      console.log('STDERR: ' + result.stderr)
    }
  })
  ssh.dispose()
}).catch((err) => {
  throw new Error(err)
})
