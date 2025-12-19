const files = require('./files');
const server = require('./server');
const subscribable = require('./subscribable');
const twitch = require('./twitch');
const twitch_data = require('./twitch_data');
const obs = require('./obs');
const persistent = require('./persistent');
const selfClearing = require('./selfClearing');
const { prefixDefaultFile } = require('../internal/clawffeeInternals');

prefixDefaultFile("const { files, server, twitch, twitch_data, obs, persistent, selfClearing } = require('#helpers');\n");

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