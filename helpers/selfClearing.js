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

const data = {
    clearing: [],
    cooldown: [],
    cooldownPUser: []
}

function cleanUp() {
    function cleanUpClearing(obj) {
        if(currentTimeSegment(obj.interval) === obj.lastDate) return;
        Object.keys(obj.data).forEach(key => delete obj.data[key]);
        obj.lastDate = currentTimeSegment(obj.interval);
        return;
    }

    data.clearing.forEach(v => cleanUpClearing(v.deref()));
    Object.values(backup.clearing).forEach(cleanUpClearing);

    function cleanUpCooldown(obj) {
        if(currentTime() === obj.lastDate + obj.cooldown) return;
        Object.keys(obj.data).forEach(key => delete obj.data[key]);
        obj.lastDate = currentTime();
        return;
    }

    data.cooldown.forEach(v => cleanUpCooldown(v.deref()));
    Object.values(backup.cooldown).forEach(cleanUpCooldown);

    function cleanUpCooldownPUser(obj) {
        Object.keys(obj.data).forEach((v) => {
            if(currentTime() > obj.lastDate + obj.cooldown) {
                delete obj.data[v];
            }
        })
    }

    data.cooldownPUser.forEach(v => cleanUpCooldownPUser(v.deref()));
    Object.values(backup.cooldownPUser).forEach(cleanUpCooldownPUser);
}

cleanUp();
setInterval(cleanUp, 60 * 60 * 1000);

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

    let obj;
    if(backupKey) {
        if(!backup.clearing[backupKey]) {
            backup.clearing[backupKey] = {
                lastDate: currentTimeSegment(interval),
                data: {}
            }
        }
        obj = backup.clearing[backupKey];
    } {
        obj = {
            lastDate: currentTimeSegment(interval),
            data: {}
        };
        data.clearing.push(new WeakRef(obj));
    }
    obj.interval = interval;

    return new Proxy(obj.data, {
        get(target, prop) {
            // reset the object
            if(currentTimeSegment(interval) !== obj.lastDate) {
                Object.keys(target).forEach(key => delete target[key]);
            }
            return Reflect.get(target, prop);
        },
        set(target, prop, value) {
            // initialize the object
            if(currentTimeSegment(interval) !== obj.lastDate) {
                Object.keys(target).forEach(key => delete target[key]);
                obj.lastDate = currentTimeSegment(interval);
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

    let obj;
    if(backupKey) {
        if(!backup.cooldown[backupKey]) {
            backup.cooldown[backupKey] = {
                lastDate: currentTime(),
                data: {}
            }
        }
        obj = backup.cooldown[backupKey];
    } {
        obj = {
            lastDate: currentTime(),
            data: {}
        };
        data.cooldown.push(new WeakRef(obj));
    }
    obj.cooldown = cooldown;

    return new Proxy(obj.data, {
        get(target, prop) {
            // reset the object
            if(currentTime() > obj.lastDate + cooldown) {
                Object.keys(target).forEach(key => delete target[key]);
            }
            return Reflect.get(target, prop);
        },
        set(target, prop, value) {
            // initialize the object
            if(currentTime() > obj.lastDate + cooldown) {
                Object.keys(target).forEach(key => delete target[key]);
                obj.lastDate = currentTime();
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

    let obj;
    if(backupKey) {
        if(!backup.cooldownPUser[backupKey]) {
            backup.cooldownPUser[backupKey] = {
                data: {}
            };
        }
        obj = backup.cooldown[backupKey];
    } {
        obj = {
            data: {}
        };
        data.cooldownPUser.push(new WeakRef(obj));
    }
    obj.cooldown = cooldown;

    return new Proxy(obj.data, {
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
                data: value,
            });
        }
    });
}

module.exports = {
    createClearingObject,
    createCooldownObject,
    createCooldownObjectPerKey
}