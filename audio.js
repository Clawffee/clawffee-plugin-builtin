//@ts-check
// lightly adjusted from https://stackoverflow.com/a/79286769
// will get a better implementation one day

// You can either use spawn or exec, the choice is often purely aesthetic,
// but spawn() doesn't spawn a shell, which is what we want here.
const { spawn, spawnSync } = require('child_process');

/**
 * 
 * @returns {(filePath: string, volume: number) => void}
 */
function getFunc() {
    switch(process.platform) {
        // On MacOS, we have afplay available:
        case 'darwin': return (filePath, volume=100) => spawn(`afplay`, [filePath]); 
        // On Windows we can offload the work to PowerShell:
        case 'win32': return (filePath, volume=100) => {
            // protection against command injection
            const escapedPath = filePath.replaceAll("'", "''");
            if(volume != 100) console.warn('volume is not implemented for windows, a more future proof solution will come.');
            spawn(`powershell`, [
                `-c`,
                `(`,
                `New-Object`,
                `Media.SoundPlayer`,
                `'${escapedPath}'`,
                `).PlaySync();`
            ]);
        }
        default: 
            // And on everything else, i.e. linux/unix, we can use aplay, which comes
            // preinstalled but doesn't play mp3 files, or we can use ffplay (the audio
            // player that comes with ffmpeg), which does, but requires an install.
            if(spawnSync('which', ['ffplay'], { stdio: 'ignore' }).status == 0)
                return (filePath, volume=100) => spawn(`ffplay`, 
                    ['-autoexit', '-nodisp', '-vn', '-volume', String(volume), '-i', filePath]
                );
            return (filePath, volume=100) => {
                if(volume != 100) console.warn('volume is not implemented for aplay, a more future proof solution will come.');
                return spawn(`aplay`, [filePath]);
            }
    }
}
/**
 * Play the provided audio at the given Path
 * @param {string} filePath file path of the file to play
 * @param {number} volume volume at which to play the file
 * @returns 
 */
const playAudio = getFunc();

// And then we can just export that for use anywhere in our codebase.
module.exports = {
    playAudio
}