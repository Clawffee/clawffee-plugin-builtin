const { autoSavedJSON } = require("./files");

function currentTime() {
    return new Date().getTime();
}

function currentTimeSegment(interval) {
    const todaysDate = new Date();
    const milliseconds = todaysDate.getTime() - todaysDate.getTimezoneOffset() * 60000;
    return Math.floor(milliseconds / interval);
}

const backup = autoSavedJSON('./config/internal/backup.json', {
    clearing: {},
    cooldown: {},
    cooldownPUser: {}
});

//TODO: keep track of interval in backup

function createClearingObject(backupKey = null, interval = 24 * 60 * 60 * 1000) {
    // clean up interval object
    switch(interval) {
        case 'day': interval = 24 * 60 * 60 * 1000; break;
        case 'hour': interval = 60 * 60 * 1000; break;
        case 'minute': interval = 60 * 1000; break;
        case 'second': interval = 1000; break;
    }
    if(typeof interval !== 'number' || interval <= 0) {
        interval = 24 * 60 * 60 * 1000;
    }

    if(backupKey && !backup.clearing[backupKey]) {
        backup.clearing[backupKey] = {
            lastDate: currentTimeSegment(interval),
            data: {}
        }
    }

    // initial time segment we are in
    let lastDate = backupKey ? backup.clearing[backupKey].lastDate : currentTimeSegment(interval);
    const proxyObj = backupKey ? backup.clearing[backupKey].data : {};

    return new Proxy(proxyObj, {
        get(target, prop) {
            // reset the object
            if(currentTimeSegment(interval) !== lastDate) {
                Object.keys(target).forEach(key => delete target[key]);
            }
            return Reflect.get(target, prop);
        },
        set(target, prop, value) {
            // initialize the object
            if(currentTimeSegment(interval) !== lastDate) {
                Object.keys(target).forEach(key => delete target[key]);
                lastDate = currentTimeSegment(interval);
                if(backupKey) {
                    backup.clearing[backupKey].lastDate = lastDate;
                }
            }
            return Reflect.set(target, prop, value);
        }
    });
}

function createCooldownObject(backupKey = null, cooldown = 24 * 60 * 60 * 1000) {
    // clean up cooldown object
    switch(cooldown) {
        case 'day': cooldown = 24 * 60 * 60 * 1000; break;
        case 'hour': cooldown = 60 * 60 * 1000; break;
        case 'minute': cooldown = 60 * 1000; break;
        case 'second': cooldown = 1000; break;
    }
    if(typeof cooldown !== 'number' || cooldown <= 0) {
        cooldown = 24 * 60 * 60 * 1000;
    }

    if(backupKey && !backup.cooldown[backupKey]) {
        backup.cooldown[backupKey] = {
            lastDate: currentTimeSegment(cooldown),
            data: {}
        }
    }

    // initial time segment we are in
    let lastTime = backupKey ? backup.cooldown[backupKey].lastDate : currentTime();
    const proxyObj = backupKey ? backup.cooldown[backupKey].data : {};

    return new Proxy(proxyObj, {
        get(target, prop) {
            // reset the object
            if(currentTime() > lastTime + cooldown) {
                Object.keys(target).forEach(key => delete target[key]);
            }
            return Reflect.get(target, prop);
        },
        set(target, prop, value) {
            // initialize the object
            if(currentTime() > lastTime + cooldown) {
                Object.keys(target).forEach(key => delete target[key]);
                lastTime = currentTime();
                if(backupKey) {
                    backup.cooldown[backupKey].lastDate = lastDate;
                }
            }
            return Reflect.set(target, prop, value);
        }
    });
}

function createCooldownObjectPerKey(backupKey = null, cooldown = 24 * 60 * 60 * 1000) {
    // clean up cooldown object
    switch(cooldown) {
        case 'day': cooldown = 24 * 60 * 60 * 1000; break;
        case 'hour': cooldown = 60 * 60 * 1000; break;
        case 'minute': cooldown = 60 * 1000; break;
        case 'second': cooldown = 1000; break;
    }
    if(typeof cooldown !== 'number' || cooldown <= 0) {
        cooldown = 24 * 60 * 60 * 1000;
    }

    if(backupKey && !backup.cooldownPUser[backupKey]) {
        backup.cooldownPUser[backupKey] = {}
    }
    const proxyObj = backupKey ? backup.cooldownPUser[backupKey] : {};

    return new Proxy(proxyObj, {
        get(target, prop) {
            const datapoint = Reflect.get(target, prop);
            // reset the object
            if(currentTime() > (datapoint?.lastTime ?? -cooldown) + cooldown) {
                delete target[prop];
                return undefined;
            }
            return datapoint.data;
        },
        set(target, prop, value) {
            return Reflect.set(target, prop, {
                lastTime: currentTime(),
                data: value
            });
        }
    });
}

module.exports = {
    createClearingObject,
    createCooldownObject,
    createCooldownObjectPerKey
}