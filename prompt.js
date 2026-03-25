const originals = {
    prompt: prompt,
    alert: alert,
    confirm: confirm,
}
const {spawnSync, spawn} = require('child_process')

function setMac() {
   globalThis.prompt = () => console.error('Prompt, alert and confirm are not yet implemented for Windows') || "";
   globalThis.alert = () => console.error('Prompt, alert and confirm are not yet implemented for Windows') || "";
   globalThis.confirm = () => console.error('Prompt, alert and confirm are not yet implemented for Windows') || "";
}
function setWindows() {
   globalThis.prompt = () => console.error('Prompt, alert and confirm are not yet implemented for Windows') || "";
   globalThis.alert = () => console.error('Prompt, alert and confirm are not yet implemented for Windows') || "";
   globalThis.confirm = () => console.error('Prompt, alert and confirm are not yet implemented for Windows') || "";
}

function setLinux() {
    const yad = spawnSync('which', ['yad'], { stdio: 'ignore' }).status == 0;
    if(yad) {
        globalThis.prompt = (message, _default=undefined) => {
            let text;
            if(_default) text = spawnSync('yad', ['--entry', '--entry-text', String(_default), '--text', "\n  " + String(message) + "  ", '--title=Clawffee', '--on-top', '--text-align=center']).stdout.toString();
            else text = spawnSync('yad', ['--entry', '--text', "\n  " + message + "  ", '--title=Clawffee', '--on-top', '--text-align=center']).stdout.toString();
            return text.substring(0, text.length -1);
        }
        globalThis.confirm = (message) => {
            return spawnSync('yad', ['--entry', "\n  " + String(message) + "  ", '--title=Clawffee', '--on-top', '--text-align=center']).status == 0;
        }
    } else {
        globalThis.prompt = console.error('Prompt and confirm depend on yad on linux, please install yad and restart clawffee!') || "";
        globalThis.confirm = console.error('Prompt and confirm depend on yad on linux, please install yad and restart clawffee!') || false;
    }
    const notify = spawnSync('which', ['notify-send'], { stdio: 'ignore' }).status == 0;
    if(notify) {
        globalThis.alert = (message) => spawn('notify-send', ['-a', 'Clawffee', String(message ?? 'Alert from clawffee!')])
    } else {
        globalThis.alert = console.error('alert depends on notify-send on linux, please install notify-send and restart clawffee!');
    }
}

switch(process.platform) {
    case 'darwin': setMac(); break;
    case 'win32': setWindows();
    default: setLinux(); break;
}