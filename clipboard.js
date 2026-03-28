//@ts-check

const { spawn, spawnSync } = require('child_process');
/**
 * 
 * @returns {[(text: string) => void, () => string]}
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
                spawn('powershell', ['Set-Clipboard', '-Value', `'${String(text ?? "").replaceAll("'","''")}'`]).stdout.toString()
            },
            () => spawnSync('powershell', ['Get-Clipboard']).stdout.toString()
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

module.exports = {
    /**
     * Write the given text into the clipboard
     * @param {string} text the text that should be inserted into the clipboard
     */
    setClipboardText: funcs[0],
    /**
     * Read the given text from the clipboard (can return an empty string if the clipboard couldn't be read)
     * @returns {string} the clipboard text
     */
    getClipboardText: funcs[1],
    onClipboardChange: () => {
        console.warn('not yet implemented');
    }
}