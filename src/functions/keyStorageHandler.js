import nacl from 'tweetnacl';
import bs58 from 'bs58';

const keysType = {
    0: {
        name: "AES-CTR",
        counter: new Uint8Array(16),
        length: 128,
    },
    1: {
        name: "RSASSA-PKCS1-v1_5",
        modulusLength: 2048,
        publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
        hash: {name: "SHA-256"},
    }
};

const signatureType = {
    name: "RSASSA-PKCS1-v1_5",
    saltLength: 128,
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

KeyStorageHandler.prototype.generateKey = function(type) {
    if (type !== 'jwt') {
        return this.subtle.generateKey(
            keysType[0],
            false,
            ['encrypt', 'decrypt']
        );
    };

    return this.subtle.generateKey(
        keysType[1],
        false,
        ['sign', 'verify']
    );
};

KeyStorageHandler.prototype.generateOpKey = function() {
    const pair = nacl.sign.keyPair();
    return {
        secretKey: pair.secretKey,
        publicKey: bs58.encode(pair.publicKey),
    }
};

KeyStorageHandler.prototype.getAlgorithm = function(base64PubKey) {
    return callOnStore((store, resolve) => {
        const data = store.get(base64PubKey);
        data.onsuccess = () => {
            if (data.result) {
                resolve(data.result.keys.webCryptoKeys.privateKey?.algorithm?.name || 'ED25519' );
            } else {
                resolve(false);
            }
        };
    });
};

KeyStorageHandler.prototype.extract = async function(base64PubKey) {
    const responce = await callOnStore((store, resolve, reject) => {
        const data = store.get(base64PubKey);
        data.onsuccess = () => {
            if (data.result) {
                resolve(data.result);
            } else {
                reject('key not found');
            };
        };
    });

    if (responce.type === 'jwt') {
        return false
    } else {
        let encryptedSecret = bs58.decode(responce.keys.encryptedSecret);
        let secretKey = await window.crypto.subtle.decrypt(
            keysType[0],
            responce.keys.webCryptoKeys,
            encryptedSecret
        );
    
        return {
            secretKey: bs58.encode(new Uint8Array(secretKey)),
            publicKey: responce.keys.publicKey,
        };
    };
};

KeyStorageHandler.prototype.signWithKey = async function(base64PubKey, payload) {
    const responce = await callOnStore((store, resolve, reject) => {
        const data = store.get(base64PubKey);
        data.onsuccess = () => {
            if (data.result) {
                resolve(data.result);
            } else {
                reject('key not found');
            };
        };
    });

    if (responce.type === 'jwt') {
        return this.subtle.sign(
            signatureType,
            responce.keys.webCryptoKeys.privateKey,
            payload,
        );
    } else {
        let encryptedSecret = bs58.decode(responce.keys.encryptedSecret);
        let secret = await window.crypto.subtle.decrypt(
            keysType[0],
            responce.keys.webCryptoKeys,
            encryptedSecret
        );
    
        return nacl.sign.detached(payload, new Uint8Array(secret));
    };
};

KeyStorageHandler.prototype.uploadKey = async function(params = {}) {  
    const type = params.type || 'jwt';

    const webCryptoKeys = await this.generateKey(type);

    const keydata = { webCryptoKeys }

    if (type !== 'jwt') {
        let operationalKeys = params.keys || await this.generateOpKey();
        keydata.publicKey = operationalKeys.publicKey;

        const secretKey = typeof operationalKeys.secretKey === 'string' 
            ? bs58.decode(operationalKeys.secretKey)
            : operationalKeys.secretKey;
        const encrypted = await window.crypto.subtle.encrypt(
            keysType[0],
            webCryptoKeys,
            secretKey,
        );

        keydata.encryptedSecret = bs58.encode(new Uint8Array(encrypted));
    };

    const base64PubKey = type === 'jwt'
        ? this.jwkToBase64PubKey(await this.keydataToJWK(webCryptoKeys))
        : keydata.publicKey;

    const id = params.id || base64PubKey;

    return await callOnStore((store, resolve, reject) => {
        const setData = store.put({
            ...params,
            id,
            base64PubKey,
            keys: keydata,
            type
        });

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

KeyStorageHandler.prototype.updateKey = async function(id, params = {}) {
    const responce = await callOnStore((store, resolve) => {
        const data = store.get(id);
        data.onsuccess = () => {
            if (data.result) {
                resolve(data.result || undefined);
            } else {
                resolve(undefined);
            }
        };
    });

    return callOnStore((store, resolve, reject) => {
        const setData = store.put({
            id:           responce.id,
            base64PubKey: responce.base64PubKey,
            keys:         responce.keys,
            type:         responce.type,
            ...params,
        });
        setData.onsuccess = () => {
            if (setData.result) {
                resolve(responce.base64PubKey);
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