const files = require('./files.js');
const server = require('./server.js');
const subscribable = require('./subscribable.js');
const twitch = require('../twurple/twitch.js');
const fs = require('fs');
if(!fs.existsSync('config/internal/twitch_data.js')) {
    fs.writeFileSync('config/internal/twitch_data.js', 'module.exports = {"IDs":{},"redeems":{}}');
}
const twitch_data = require('../../config/internal/twitch_data.js');
const obs = require('./obs.js');
const persistent = require('./persistent.js');
const selfClearing = require('./selfClearing.js');
const { prefixDefaultFile } = require('../internal/clawffeeInternals.js');
const path = require('path');
const internal = require('../internal/clawffeeInternals.js');
const clipboard = require('./clipboard.js');

prefixDefaultFile((fullpath) => `const { files, server, twurple, twitch_data, obs, persistent, selfClearing, extras } = require('${path.relative(path.dirname(fullpath), __filename).replaceAll('\\', '/')}');\n`);

const warnfiles = new Set();
module.exports = {
    files,
    server,
    subscribable,
    twurple: twitch,
    twitch: new Proxy(twitch, {
        get(target, p, receiver) {
            const s = internal.getRunningScriptName();
            if(!warnfiles.has(s))
                console.warn('Please do not use helpers.twitch in this version as it will change in future versions, use helpers.twurple instead!');
            warnfiles.add(s);
            return Reflect.get(target, p, receiver);
        }
    }),
    obs,
    twitch_data,
    persistent,
    selfClearing,
    extras: {
        ...require('./audio.js'),
        clipboard
    }
}