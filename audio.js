//@ts-check

const { addPluginScript } = require("../internal/clawffeeInternals");
const { sharedServerData } = require('../internal/internal').server;
const fs = require('fs');

/**
 * Play the provided audio at the given Path
 * @param {string} filePath file path of the file to play
 * @param {number} volume volume at which to play the file in %
 * @param {number} speed speed/pitch at which to play the file in %
 * @returns 
 */
function playAudio(filePath, volume=100, speed=100) {
    const {promise, resolve, reject} = Promise.withResolvers();
    fs.readFile(filePath, (err, data) => {
        if(err) return reject(err);
        if(!data) return;
        sharedServerData.internal.playAudio = {
            url: `data:audio/${filePath.split('.').pop()};base64,${data.toBase64()}`,
            vol: volume,
            spd: speed
        }
        resolve();
    });
    return promise;
}

addPluginScript('audio', 'plugins/builtin/_UI/audioHandler.js');

// And then we can just export that for use anywhere in our codebase.
module.exports = {
    playAudio
}