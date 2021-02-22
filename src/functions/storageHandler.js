function StorageHandler() {
    this.storage = window.localStorage;
}

StorageHandler.prototype.getItem = function(key) {
    try {
        return JSON.parse(this.storage.getItem(key));
    } catch (e) {
        console.warn(e);
    }
};

StorageHandler.prototype.getItems = function() {
    var values = {},
        keys = Object.keys(this.storage),
        i = keys.length;

    while ( i-- ) {
        try {
            values[keys[i]] = JSON.parse(this.storage.getItem(keys[i]));
        } catch (_) {};
    }

    return values;
};

StorageHandler.prototype.removeItem = function(key) {
    try {
        return this.storage.removeItem(key);
    } catch (e) {
        console.warn(e);
    }
};

StorageHandler.prototype.setItem = function(key, json, options) {
    try {
        var value = JSON.stringify({ ...json, ...options });
        return this.storage.setItem(key, value);
    } catch (e) {
        console.warn(e);
    }
};

export default StorageHandler;
