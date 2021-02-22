const keysType = {
    0: {
        name: 'ECDSA',
        namedCurve: 'P-256',
    },
    1: {
        name: "RSASSA-PKCS1-v1_5",
        modulusLength: 2048,
        publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
        hash: {name: "SHA-256"},
    }
};

const signatureType = {
    "RSASSA-PKCS1-v1_5": {
        name: "RSASSA-PKCS1-v1_5",
        saltLength: 128,
    },
    "ECDSA": {
        name: 'ECDSA',
        hash: { name: 'SHA-256' },
    },
};

function callOnStore(fn) {
    return new Promise((resolve, reject) => {
        const indexedDB = window.mozIndexedDB ||
                        window.webkitIndexedDB ||
                        window.indexedDB ||
                        window.msIndexedDB ||
                        window.shimIndexedDB;

        if (!indexedDB) { reject('IndexedDB is not supported by your browser!') };
        const open = indexedDB.open('Store', 2);

        open.onupgradeneeded = (event) => {
            event.target.result.createObjectStore('MyObjectStore', { keyPath: 'id'});
        };

        open.onerror = () => {
            reject(open.error);
        };

        open.onsuccess = () => {
            const db = open.result;
            const tx = db.transaction('MyObjectStore', 'readwrite');
            const store = tx.objectStore('MyObjectStore');
            fn(store, resolve, reject)
            tx.oncomplete = () => {
                db.close();
            };
        }
    });
};

function KeyStorageHandler(options) {
    this.subtle            = window.crypto.subtle;
    this.jwkToBase64PubKey = options.jwkToBase64PubKey;
};

KeyStorageHandler.prototype.keydataToJWK = function(keydata) {
    return this.subtle.exportKey('jwk', keydata.publicKey);
};

KeyStorageHandler.prototype.generateKey = function() {
    return this.subtle.generateKey(
        keysType[navigator.userAgent.toLowerCase().indexOf('firefox') > -1 ? 1 : 0], // Using RSA for Firefox (bug of firefox);
        false,
        ['sign', 'verify']
    );
};

KeyStorageHandler.prototype.getAlgorithm = function(base64PubKey) {
    return callOnStore((store, resolve) => {
        const data = store.get(base64PubKey);
        data.onsuccess = () => {
            if (data.result) {
                resolve(data.result.keys.privateKey.algorithm.name);
            } else {
                resolve(false);
            }
        };
    });
};

KeyStorageHandler.prototype.signWithKey = async function(base64PubKey, data) {
    const keydata = await callOnStore((store, resolve, reject) => {
        const data = store.get(base64PubKey);
        data.onsuccess = () => {
            if (data.result) {
                resolve(data.result.keys);
            } else {
                reject('key not found');
            };
        };
    });

    return this.subtle.sign(
        signatureType[keydata.privateKey.algorithm.name],
        keydata.privateKey,
        data,
    );
};

KeyStorageHandler.prototype.uploadKey = async function(params = {}) {
    const keydata      = await this.generateKey();
    const jwk          = await this.keydataToJWK(keydata);
    const base64PubKey = this.jwkToBase64PubKey(jwk);

    return await callOnStore((store, resolve, reject) => {
        const setData = store.put({ id: base64PubKey, keys: keydata, ...params });
        setData.onsuccess = () => {
            if (setData.result) {
                resolve(base64PubKey);
            } else {
                reject('key not uploaded');
            };
        };

        setData.onerror = function(e) {
            console.dir(e);
        };
    });
};

KeyStorageHandler.prototype.updateKey = async function(base64PubKey, params = {}) {
    const keydata = await callOnStore((store, resolve) => {
        const data = store.get(base64PubKey);
        data.onsuccess = () => {
            if (data.result) {
                resolve(data.result.keys || undefined);
            } else {
                resolve(undefined);
            }
        };
    });

    return callOnStore((store, resolve, reject) => {
        const setData = store.put({ id: base64PubKey, keys: keydata, ...params });
        setData.onsuccess = () => {
            if (setData.result) {
                resolve(base64PubKey);
            } else {
                reject('key not uploaded');
            };
        };
    });
};

KeyStorageHandler.prototype.loadAllKeys = async function() {
    return callOnStore((store, resolve) => {
        const data = store.getAll(); 
        data.onsuccess = () => {
            if (data.result) {
                let keys = {}
                for (var i in data.result) {
                    keys[data.result[i].id] = data.result[i];
                }
                resolve(keys);
            } else {
                resolve({});
            }
        };
    });
};

KeyStorageHandler.prototype.destroy = function(base64PubKey) {
    return callOnStore((store, resolve) => {
        const data = store.delete(base64PubKey);
        data.onsuccess = () => {
            if (data.result) {
                resolve(true);
            } else {
                resolve(false);
            }
        };
    });
};

export default KeyStorageHandler;