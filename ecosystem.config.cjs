module.exports = {
  apps: [{
    name: 'etaly-app',
    script: 'node_modules/.bin/remix-serve',
    args: './build/server/index.js',
    cwd: '/var/www/etaly-app',
    env_production: {
      NODE_ENV: 'production',
      PORT: 4000
    },
    env: {
      NODE_ENV: 'production',
      PORT: 4000
    }
  }]
}
