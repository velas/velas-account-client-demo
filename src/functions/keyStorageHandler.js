import nacl from 'tweetnacl';
import bs58 from 'bs58';

const keysType = {
    'symmetric-encryption-key': {
        name: "AES-CTR",
        counter: new Uint8Array(16),
        length: 128,
        use: ['encrypt', 'decrypt'],
    },

    'asymmetric-encryption-key': {
        name: "RSA-OAEP",
        modulusLength: 2048,
        publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
        hash: {name: "SHA-256"},
        use: ['encrypt', 'decrypt'],
    },

    'jwt-signing-key': {
        name: "RSASSA-PKCS1-v1_5",
        modulusLength: 2048,
        publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
        hash: {name: "SHA-256"},
        use: ['sign', 'verify'],
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

        if (!indexedDB) {
            reject('IndexedDB is not supported by your browser!')
        }

        const open = indexedDB.open('Store', 2);

        open.onupgradeneeded = (event) => {
            event.target.result.createObjectStore('MyObjectStore', {keyPath: 'id'});
        }

        open.onerror = () => {
            reject(open.error);
        }

        open.onsuccess = () => {
            const db = open.result;
            const tx = db.transaction('MyObjectStore', 'readwrite');
            const store = tx.objectStore('MyObjectStore');
            fn(store, resolve, reject)
            tx.oncomplete = () => {
                db.close();
            }
        }
    })
}

export default class KeyStorageHandler {
    constructor(options) {
        this.subtle = window.crypto.subtle;
        this.jwkToBase64PubKey = options.jwkToBase64PubKey;
    }

    getAlgorithm(id) {
        return callOnStore((store, resolve) => {
            const data = store.get(id);
            data.onsuccess = () => {
                if (data.result) {
                    resolve(data.result.keys.webCryptoKeys.privateKey?.algorithm?.name || 'ED25519');
                } else {
                    //TO-DO
                    resolve(false) //change later
                }
            }
        })
    }

    async extract(id) {
        const response = await callOnStore((store, resolve, reject) => {
            const data = store.get(id);
            data.onsuccess = () => {
                if (data.result) {
                    resolve(data.result);
                } else {
                    reject('Error while extracting key: key not found');
                }
            };
        });

        if (response.type === 'symmetric-encryption-key') {
            let encryptedSecret = bs58.decode(response.keys.encryptedSecret);
            let secretKey = await this.subtle.decrypt(
                keysType[response.type],
                response.keys.webCryptoKeys,
                encryptedSecret
            )

            return {
                secretKey: bs58.encode (new Uint8Array(secretKey))
            };
        } else {
            return false;
        }
    }

    async encryptWithAsymmetricEncryptionKey(JWKPubKey, buffer) {
        const importedWebCryptoKeys = await this.subtle.importKey(
            "jwk",
            JWKPubKey,
            keysType['asymmetric-encryption-key'],
            false,
            ["encrypt"]
        );

        return this.subtle.encrypt(
            keysType['asymmetric-encryption-key'],
            importedWebCryptoKeys,
            buffer
        );
    }

    async decryptWithAsymmetricEncryptionKey(id, buffer) {
        const response = await callOnStore((store, resolve, reject) => {
            const data = store.get(id);
            data.onsuccess = () => {
                if (data.result) {
                    resolve(data.result);
                } else {
                    reject('Error while decrypting with asymmetric encryption key: Key not found or incorrect store.');
                }
            };
        });

        if (response.type === 'asymmetric-encryption-key') {
            return await this.subtle.decrypt(
                keysType[response.type],
                response.keys.webCryptoKeys.privateKey,
                buffer
            );
        } else if (response.type !== 'asymmetric-encryption-key' && typeof (response.type) === 'string') {
            throw new Error(`Error while decrypting with asymmetric encryption key: Unsupported key type, expected: asymmetric-encryption-key, got: ${response.type}.`);
        } else {
            throw new Error("Error while decrypting with asymmetric encryption key: Key not found.")
        }
    }

    async updateKey (id, params={}) {
        const response = await callOnStore((store, resolve, reject) => {
            const data = store.get(id);
            data.onsuccess = () => {
                if (data.result) {
                    resolve(data.result);
                } else {
                    reject("Error while updating key: incorrect store or store undefined.");
                }
            };
        });

        return callOnStore((store, resolve, reject) => {
            const setData = store.put({
                id:           response.id,
                pubKey:       response.pubKey,
                keys:         response.keys,
                type:         response.type,
                issuer:       response.issuer,
                ...params,
            });
            setData.onsuccess = () => {
                if (setData.result) {
                    resolve(response.id);
                } else {
                    reject('Error while updating key: incorrect store or store undefined.');
                }
            };
        });
    }

    async loadAllKeys() { // TO-DO: improve error validation, create a reject
        return callOnStore((store, resolve) => {
            const data = store.getAll();
            data.onsuccess = () => {
                if (data.result) {
                    let keys = {}
                    for (let i in data.result) {
                        keys[data.result[i].id] = data.result[i];
                    }
                    resolve(keys);
                } else {
                    resolve({});
                }
            };
        });
    }

    destroy(id) {
        return callOnStore((store,resolve) => {
            const data = store.delete(id);
            data.onsuccess = () => {
                if (data.result) {
                    resolve(true);
                } else {
                    resolve(false)
                }
            }
        })
    }

    async signWithKey(id, payload) {
        const response = await callOnStore((store,resolve,reject) => {
            const data = store.get(id);
            data.onsuccess = () => {
                if (data.result) {
                    resolve(data.result)
                } else {
                    reject('Error while signing with key: key not found or incorrect store.')
                }
            }
        });

        if (response.type === 'jwt-signing-key') {
            return this.subtle.sign(
                signatureType,
                response.keys.webCryptoKeys.privateKey,
                payload,
            );
        } else if (response.type === 'symmetric-encryption-key') {
            const encryptedSecret = bs58.decode(response.keys.encryptedSecret);
            const secret = await this.subtle.decrypt(
                keysType[response.type],
                response.keys.webCryptoKeys,
                encryptedSecret
            );
            return nacl.sign.detached(payload, new Uint8Array(secret));
        } else if (response.type !== 'jwt-signing-key' && response.type !== 'symmetric-encryption-key' && typeof (response.type) === 'string') {
            throw new Error(`Error while signing with key: unsupported key type, expected: jwt-signing-key or symmetric-encryption-key, got: ${response.type}.`)
        } else{
            throw new Error('Error while signing with key: Key not found.');
        }
    }

    async uploadKey({
        id,
        type,
        issuer,
        expires,
        encryptSecret,
        account
    }) {
        const webCryptoKeys = await this.subtle.generateKey(keysType[type], false, keysType[type].use);

        const data = {
            id,
            type,
            issuer,
            expires,
            account,
            keys: { webCryptoKeys}
        };

        if (type === 'symmetric-encryption-key' && encryptSecret) {
            const encrypted = await this.subtle.encrypt(
                keysType[type],
                webCryptoKeys,
                encryptSecret,
            );
            data.keys.encryptedSecret = bs58.encode(new Uint8Array(encrypted));
        } else if (type === 'jwt-signing-key') {
            data.pubKey = this.jwkToBase64PubKey(
                await this.subtle.exportKey('jwk', webCryptoKeys.publicKey)
            );
            data.id = data.id || data.pubKey;
        } else if (type === 'asymmetric-encryption-key') {
            data.pubKey = await this.subtle.exportKey('jwk', webCryptoKeys.publicKey);
            data.id = data.id || data.pubKey;
        }

        return callOnStore((store, resolve, reject) => {
            console.log("CALL ON STORE STORE:", store)
            console.log("CALL ON STORE DATA:",data);
            const setData = store.put(data);

            setData.onsuccess = () => {
                if (setData.result) {
                    resolve(data.pubKey || data.id);
                } else {
                    reject('Error while uploading key: Key not uploaded.');
                }
            };

            setData.onerror = reject;
        });
    }
}
