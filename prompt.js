const originals = {
    prompt: prompt,
    alert: alert,
    confirm: confirm,
}
const {spawnSync, spawn} = require('child_process')

function setMac() {
    globalThis.prompt = () => console.error('Prompt, alert and confirm are not yet implemented for MacOS') || "";
    globalThis.alert = () => console.error('Prompt, alert and confirm are not yet implemented for MacOS') || "";
    globalThis.confirm = () => console.error('Prompt, alert and confirm are not yet implemented for MacOS') || "";
}

function setWindows() {
    const promptTemplate = `
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

$form = New-Object System.Windows.Forms.Form
$form.Text = 'Clawffee'
$form.Size = New-Object System.Drawing.Size(300,170)
$form.StartPosition = 'CenterScreen'

$okButton = New-Object System.Windows.Forms.Button
$okButton.UseVisualStyleBackColor = 1;
$okButton.FlatStyle = [System.Windows.Forms.FlatStyle]::Popup
$okButton.Location = New-Object System.Drawing.Point(25,80)
$okButton.Size = New-Object System.Drawing.Size(75,23)
$okButton.Text = 'OK'
$okButton.DialogResult = [System.Windows.Forms.DialogResult]::OK
$form.AcceptButton = $okButton
$form.Controls.Add($okButton)

$cancelButton = New-Object System.Windows.Forms.Button
$cancelButton.UseVisualStyleBackColor = 1;
$cancelButton.FlatStyle = [System.Windows.Forms.FlatStyle]::Popup
$cancelButton.Location = New-Object System.Drawing.Point(150,80)
$cancelButton.Size = New-Object System.Drawing.Size(75,23)
$cancelButton.Text = 'Cancel'
$cancelButton.DialogResult = [System.Windows.Forms.DialogResult]::Cancel
$form.CancelButton = $cancelButton
$form.Controls.Add($cancelButton)

$label = New-Object System.Windows.Forms.Label
$label.FlatStyle = [System.Windows.Forms.FlatStyle]::Popup
$label.Location = New-Object System.Drawing.Point(10,8)
$label.Size = New-Object System.Drawing.Size(280,40)
$label.Text = 'BODY'
$label.Margin.Bottom = 129
$form.Controls.Add($label)

$textBox = New-Object System.Windows.Forms.TextBox
$textBox.BorderStyle = 1;
$textBox.Location = New-Object System.Drawing.Point(10,48)
$textBox.Size = New-Object System.Drawing.Size(260,48)
$textBox.Text = 'DEFAULT'
$form.Controls.Add($textBox)

$form.Topmost = $true
$form.Add_Shown({$textBox.Select()})
$result = $form.ShowDialog()

if ($result -eq [System.Windows.Forms.DialogResult]::OK)
{
    $textBox.Text
    exit 0
}
exit 1
    `.trim();
    const alertTemplate = `
[Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] > $null
$Template = [Windows.UI.Notifications.ToastNotificationManager]::GetTemplateContent([Windows.UI.Notifications.ToastTemplateType]::ToastText02)

$RawXml = [xml] $Template.GetXml()
($RawXml.toast.visual.binding.text|Where-Object {$_.id -eq "1"}).AppendChild($RawXml.CreateTextNode('Clawffee')) > $null
($RawXml.toast.visual.binding.text|Where-Object {$_.id -eq "2"}).AppendChild($RawXml.CreateTextNode('DATA')) > $null

$SerializedXml = New-Object Windows.Data.Xml.Dom.XmlDocument
$SerializedXml.LoadXml($RawXml.OuterXml)

$Toast = [Windows.UI.Notifications.ToastNotification]::new($SerializedXml)
$Toast.Tag = "Clawffee"
$Toast.Group = "Clawffee"

$Notifier = [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier("Clawffee")
$Notifier.Show($Toast);
    `.trim();
    const confirmTemplate = `Add-Type -AssemblyName PresentationCore,PresentationFramework;if([System.Windows.MessageBox]::Show('BODY','Clawffee',[System.Windows.MessageBoxButton]::YesNo) -eq [System.Windows.MessageBoxResult]::Yes){exit 0}else{exit 1}`
    globalThis.prompt = (message, _default) => {
        _default ??= '';
        const text = spawnSync(`powershell`, [
            promptTemplate.replace('DEFAULT', String(_default).replaceAll("'","''")).replace('BODY', String(message).replaceAll("'","''"))
        ]).stdout.toString();
        return text.substring(0,text.length-1);
    }
    globalThis.alert = (message) => {
        const text = spawnSync(`powershell`, [
            alertTemplate.replace('BODY', String(message).replaceAll("'","''"))
        ]).stdout.toString();
        return text.substring(0,text.length-1);
    }
    globalThis.confirm = (message) => {
        const text = spawnSync(`powershell`, [
            confirmTemplate.replace('BODY', String(message).replaceAll("'","''"))
        ]).stdout.toString();
        return text.substring(0,text.length-1);
    }
}

function setLinux() {
    const yad = spawnSync('which', ['yad'], { stdio: 'ignore' }).status == 0;
    if(yad) {
        globalThis.prompt = (message, _default=undefined) => {
            let text;
            if(_default) text = spawnSync('yad', ['--entry', '--entry-text', String(_default), '--text', "\n  " + String(message) + "  ", '--title=Clawffee', '--on-top', '--text-align=center']).stdout.toString();
            else text = spawnSync('yad', ['--entry', '--text', "\n  " + String(message) + "  ", '--title=Clawffee', '--on-top', '--text-align=center']).stdout.toString();
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
    case 'win32': setWindows(); break;
    default: setLinux(); break;
}