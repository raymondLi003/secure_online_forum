


async function generateKeyPair(){
    // generate a RSA key pair with web cryto apo
    return window.crypto.subtle.generateKey(
        {
            name:"RSASSA-PKCS1-v1_5",
            modulusLength: 2048,
            publicExponent: new Uint8Array([1,0,1]),
            hash:{name: "SHA-256"},
        },
        true,
        ["sign","verify"]
    );
}


function arrayToBase64(arrayBuffer) {
    let binary = '';
    let bytes = new Uint8Array(arrayBuffer);
    let len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

// convert a base64 string to an array buffer
function base64ToArrayBuffer(base64) {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}
async function exportPrivateKey(privateKey) {
    try{
        const exported = await window.crypto.subtle.exportKey(
            "pkcs8",
            privateKey
        );
        const exportedAsString = arrayToBase64(exported);
        const exportedAsPem = `-----BEGIN PRIVATE KEY-----\n${exportedAsString}\n-----END PRIVATE KEY-----`;
        return exportedAsPem;
    }catch(err){
        console.error("cannnot export private key " + err);
    }

}

async function exportPublicKey(publicKey) {
    try{
        const exported = await window.crypto.subtle.exportKey(
            "spki",
            publicKey
        );
        const exportedAsString = arrayToBase64(exported);
        const exportedAsPem = `-----BEGIN PUBLIC KEY-----\n${exportedAsString}\n-----END PUBLIC KEY-----`;
        return exportedAsPem;
    }catch(err){
        console.error("cannot export public key " + err);
    }

}

// generate a RSA key pair for encryption
async function generateEncryptionKeyPair() {
    try {
        const keyPair = await window.crypto.subtle.generateKey(
            {
                name: "RSA-OAEP",
                modulusLength: 2048,
                publicExponent: new Uint8Array([1, 0, 1]),
                hash: { name: "SHA-256" },
            },
            true,
            ["encrypt", "decrypt"]
        );
        return keyPair;
    } catch (e) {
        console.error('Error generating encryption key pair:', e);
    }
}
async function generateAndExportEncryptionKeys() {
    try {
        const keyPair = await generateEncryptionKeyPair();

        if (!keyPair) {
            throw new Error("Key pair generation failed");
        }

        const publicKeyPem = await exportPublicKey(keyPair.publicKey);
        const privateKeyPem = await exportPrivateKey(keyPair.privateKey);
        console.log(publicKeyPem);
        console.log(privateKeyPem);
        return { encryptionPubKey: publicKeyPem, encryptionPrivKey: privateKeyPem };
    } catch (e) {
        console.error('Error generating and exporting keys:', e);
    }
}



async function promptForPrivateKey(privateKeyArmored){
    // create a text area to store the key
    console.log(privateKeyArmored);
    const textArea = document.createElement('textarea');
    textArea.value = privateKeyArmored;
    document.body.appendChild(textArea);

    // Inform the user to manually copy and save the key securely
    alert('Please copy your private key and save it in a secure location.');
}

// import the private key to do the signing
async function importPrivateKey(pem) {
    // Fetch the part of the PEM string between header and footer
    const pemHeader = "-----BEGIN PRIVATE KEY-----";
    const pemFooter = "-----END PRIVATE KEY-----";
    // clear the header and footer
    const pemContents = pem.replace(pemHeader, '').replace(pemFooter, '').trim();
    
    // Base64 decode the string to get the binary data
    const binaryDerString = atob(pemContents);
    
    // Convert the binary string to an ArrayBuffer
    const binaryDer = str2ab(binaryDerString);
    // Import the binary DER string into a CryptoKey object
    return window.crypto.subtle.importKey(
        "pkcs8",
        binaryDer,
        {
            name: "RSASSA-PKCS1-v1_5",
            hash: "SHA-256", // Specify the hash algorithm here
        },
        true,
        ["sign"]
    );
}
// Import the private key for decryption
async function importPrivateDecryptionKey(pem) {
    // Fetch the part of the PEM string between header and footer
    const pemHeader = "-----BEGIN PRIVATE KEY-----";
    const pemFooter = "-----END PRIVATE KEY-----";
    // Clear the header and footer
    const pemContents = pem.replace(pemHeader, '').replace(pemFooter, '').trim();

    // Base64 decode the string to get the binary data
    const binaryDerString = atob(pemContents);

    // Convert the binary string to an ArrayBuffer
    const binaryDer = str2ab(binaryDerString);

    // Import the binary DER string into a CryptoKey object
    return window.crypto.subtle.importKey(
        "pkcs8",
        binaryDer,
        {
            name: "RSA-OAEP",
            hash: {name: "SHA-256"}, 
        },
        true,
        ["decrypt"] // Specify "decrypt" usage for the private key
    );
}

// import the public key from the server to encrypt the group message
async function importPublicEncryptionKey(pem) {
    
    // Fetch the part of the PEM string between header and footer
    const pemHeader = "-----BEGIN PUBLIC KEY-----";
    const pemFooter = "-----END PUBLIC KEY-----";
    // Clear the header and footer
    const pemContents = pem.replace(pemHeader, '').replace(pemFooter, '').trim();
    
    // Base64 decode the string to get the binary data
    const binaryDerString = atob(pemContents);
    
    // Convert the binary string to an ArrayBuffer
    const binaryDer = str2ab(binaryDerString);
    
    // Import the binary DER string into a CryptoKey object
    return window.crypto.subtle.importKey(
        "spki",
        binaryDer,
        {
            name: "RSA-OAEP",
            hash: {name: "SHA-256"}, 
        },
        true,
        ["encrypt"]
    );
}

// convert string to array buffer
function str2ab(str) {
    const buf = new ArrayBuffer(str.length);
    const bufView = new Uint8Array(buf);
    for (let i = 0, strLen = str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    return buf;
}

// use user's private key to sign the nonce generated by the server
async function signNonce(privateKey, nonce){
    try{
        const encoder = new TextEncoder();
        // encode the nonce to a uint8array for signing 
        const data = encoder.encode(nonce);
        const crytpoPrivateKey = await importPrivateKey(privateKey);
        const signature = await window.crypto.subtle.sign(
            "RSASSA-PKCS1-v1_5",
            crytpoPrivateKey,
            data
        );
        return new Uint8Array(signature);
    }catch(e){
        console.error('cannot sign the nonce' + e);
    }
}
function validPrivateKey(privateKey){
    return privateKey.includes('-----BEGIN PRIVATE KEY-----') && privateKey.includes('-----END PRIVATE KEY-----');
}

async function encryptMessage(publicKey, message){
    try{
        const crytpoPublicKey = await importPublicEncryptionKey(publicKey);
        

        const encoder = new TextEncoder();
        
        const data = encoder.encode(message);

        const encrypted = await window.crypto.subtle.encrypt(
            {
                name: "RSA-OAEP",
            },
            crytpoPublicKey,
            data
        );
        const base64StringMessage = arrayToBase64(encrypted);

        return base64StringMessage;
    }catch(e){
        console.error('cannot encrypt the message' + e);
    }
}

async function decryptMessage(privateKeyPem, encryptedDataBase64) {
   
    const privateKey = await importPrivateDecryptionKey(privateKeyPem);

    // Convert base64 string to ArrayBuffer
    const encryptedDataArrayBuffer = base64ToArrayBuffer(encryptedDataBase64);
    
    // Decrypt the data
    const decrypted = await window.crypto.subtle.decrypt(
        {
            name: "RSA-OAEP"
        },
        privateKey,
        encryptedDataArrayBuffer
    );
    // Convert the decrypted ArrayBuffer back to Uint8Array
    const decryptedDataUint8Array = new Uint8Array(decrypted);
    // convert it back from Uint8Array to string
    const result = new TextDecoder().decode(decryptedDataUint8Array)

    return result;
}

export {
    generateKeyPair,
    generateEncryptionKeyPair,
    arrayToBase64,
    exportPrivateKey,
    exportPublicKey,promptForPrivateKey,
    signNonce,
    validPrivateKey,
    encryptMessage,
    decryptMessage,
    generateAndExportEncryptionKeys,

};