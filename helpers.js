const files = require('./files');
const server = require('./server');
const subscribable = require('./subscribable');
const twitch = require('./twitch');
const twitch_data = require('./twitch_data');
const obs = require('./obs');
const persistent = require('./persistent');
const selfClearing = require('./selfClearing');
const { prefixDefaultFile } = require('../internal/clawffeeInternals');
const path = require('path');

prefixDefaultFile((fullpath) => `const { files, server, twitch, twitch_data, obs, persistent, selfClearing } = require('${path.posix.relative(path.dirname(fullpath), __filename)}');\n`);

module.exports = {
    files,
    server,
    subscribable,
    twitch,
    obs,
    twitch_data,
    persistent,
    selfClearing
}