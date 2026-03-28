//@ts-check

const { spawn, spawnSync } = require('child_process');
/**
 * 
 * @returns {[(text: string) => void, () => string | null]}
 */
function getFunc() {
    switch(process.platform) {
        // https://stackoverflow.com/a/13735363
        case 'darwin': return [
            (text) => {
                var proc = spawn('pbcopy'); 
                proc.stdin.write(String(text ?? "")); 
                proc.stdin.end();
            }, 
            () => spawnSync('pbpaste').stdout.toString()
        ];
        // On Windows we can offload the work to PowerShell:
        case 'win32': return [
            (text) => {

            },
            () => ""
        ];
        default: 
            if(spawnSync('which', ['wl-copy']).status == 0) {
                return [
                    (text) => spawn('wl-copy', ['-n', '--type', 'text/plain', '--', String(text ?? "")]),
                    () => spawnSync('wl-paste', ['-n', '--type', 'text/plain']).stdout.toString()
                ];
            }
            return [
                (text) => {
                    var proc = spawn('xclip', ['-i']); 
                    proc.stdin.write(String(text ?? "")); 
                    proc.stdin.end();
                },
                () => spawnSync('xclip', ['-o']).stdout.toString()
            ];
    }
}
const funcs = getFunc();

// And then we can just export that for use anywhere in our codebase.
module.exports = {
    /**
     * Play the provided audio at the given Path
     * @param {string} filePath file path of the file to play
     * @param {number} volume volume at which to play the file
     */
    setClipboardText: funcs[0],
    getClipboardText: funcs[1],
    onClipboardChange: () => {
        console.warn('not yet implemented');
    }
}