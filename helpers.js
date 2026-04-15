const fs = require('fs');
if(!fs.existsSync('config/internal/twitch_data.js')) {
    fs.writeFileSync('config/internal/twitch_data.js', 'module.exports = {"IDs":{},"redeems":{}}');
}
const { prefixDefaultFile } = require('../internal/clawffeeInternals.js');
const path = require('path');
const internal = require('../internal/clawffeeInternals.js');

prefixDefaultFile((fullpath) => `const { files, server, twurple, twitch_data, obs, persistent, selfClearing, extras } = require('${path.relative(path.dirname(fullpath), __filename).replaceAll('\\', '/')}');\n`);

const warnfiles = new Set();
module.exports = {
    get files() { return require('./files.js') },
    get server() { return require('./server.js')},
    get subscribable() { return require('./subscribable.js')},
    get twurple() { return require('../twurple/twitch.js')},
    get twitch() {
        const s = internal.getRunningScriptName();
        if(!warnfiles.has(s))
            console.warn('Please do not use helpers.twitch in this version as it will change in future versions, use helpers.twurple instead!');
        warnfiles.add(s);
        return require('../twurple/twitch.js');
    },
    get obs() {return require('./obs.js')},
    get twitch_data() {return require('../../config/internal/twitch_data.js')},
    get persistent() {return require('./persistent.js')},
    get selfClearing() {return require('./selfClearing.js')},
    get extras() { return {
        ...require('./audio.js'),
        get clipboard() {return require('./clipboard.js')}
    }}
}