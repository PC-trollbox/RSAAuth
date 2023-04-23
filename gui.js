function AsyncFileReader(file) {
    return new Promise(function(resolve) {
        let reader = new FileReader();
        reader.readAsText(file);
        reader.onload = async function(event) {
            resolve(event.target.result);
        }
    });
}

/**
 * Imagination Auth GUI
 * @param {Array} fileEls An array of two file elements. FIRST IS A PUBLIC KEY, SECOND IS A PRIVATE ONE.
 * @param {Function} startLogonProcess A function to start logon process to show an overlay or something.
 * @param {Function} prompt An async or normal function that requests the input of a person.
 * @param {Function} endLogonProcess A function which ends logon process. May have an error in the argument.
 * @returns don't matter
 */
async function imaginationAuthGUI(fileEls = [], startLogonProcess = new Function(), prompt = (()=>"42"), endLogonProcess = new Function()) {
    startLogonProcess();
    if (!isSecureContext) return endLogonProcess("Authentication failed: Insecure\nData needs to be transferred securely (over HTTPS or localhost) to allow authentication.");
    let pubkey_data = localStorage.getItem("pubk");
    let privkey_data = localStorage.getItem("privk");
    if (fileEls.length >= 2) {
        try {
            pubkey_data = await AsyncFileReader(fileEls[0]);
            privkey_data = await AsyncFileReader(fileEls[1]);
        } catch {}
    }
    if (!privkey_data || !pubkey_data) return endLogonProcess("Authentication failed: No Data\nRequired a public and a private key to be supplied. Check for both files to be valid.");
    localStorage.setItem("pubk", pubkey_data);
    localStorage.setItem("privk", privkey_data);
    let result = await fetch("/getEncryptedSecret?pubkey=" + encodeURIComponent(pubkey_data));
    if (!result.ok) return endLogonProcess("Authentication failed: " + result.statusText + "\n" + await result.text())
    if (privkey_data.startsWith("encrypted:")) {
        let password = await prompt("Enter your passphrase, then press Enter:");
        try {
            privkey_data = await decryptAES(JSON.parse(privkey_data.replace("encrypted:", "")), password);
        } catch (e) {
            return endLogonProcess("Key decryption failed:\n" + e.toString());
        }
    }
    let keyp = await importKeyPair(pubkey_data, privkey_data);
    try {
        let token = await decryptRSA(await result.text(), keyp.privateKey);
        document.cookie = "token=" + encodeURIComponent(token);
        location.reload();
    } catch (e) {
        return endLogonProcess("Decryption failed:\n" + e.toString());
    }
    endLogonProcess();
}

function isKeySaved() {
    return !!localStorage.getItem("pubk") && !!localStorage.getItem("privk");
}

/**
 * Imagination saved encryptions
 * @param {Array} fileEls An array of two file elements. FIRST IS A PUBLIC KEY, SECOND IS A PRIVATE ONE.
 * @param {Function} startLogonProcess A function to start logon process to show an overlay or something.
 * @param {Function} prompt An async or normal function that requests the input of a person.
 * @param {Function} confirm An async or normal function that requests the input of a person, which is returnes as a boolean yes/no.
 * @param {Function} endLogonProcess A function which ends logon process. May have an error in the argument.
 * @returns don't matter
 */
async function imaginationSavedEncrypt(fileEls = [], startLogonProcess = new Function(), prompt = (()=>"42"), confirm = (()=>true), endLogonProcess = new Function()) {
    startLogonProcess();
    if (!isSecureContext) return endLogonProcess("Authentication failed: Insecure\nData needs to be transferred securely (over HTTPS or localhost) to allow authentication.");
    let pubkey_data = localStorage.getItem("pubk");
    let privkey_data = localStorage.getItem("privk");
    if (fileEls.length >= 2) {
        try {
            pubkey_data = await AsyncFileReader(fileEls[0]);
            privkey_data = await AsyncFileReader(fileEls[1]);
        } catch {}
    }
    if (!privkey_data || !pubkey_data) return endLogonProcess("Authentication failed: No Data\nRequired a public and a private key to be supplied. Check for both files to be valid.");
    localStorage.setItem("pubk", pubkey_data);
    localStorage.setItem("privk", privkey_data);
    
    let encryptMark = privkey_data.startsWith("encrypted:");
    if (encryptMark) {
        if (confirm("Authentication Security: Key Passphrases\nThe key is already encrypted. Would you like to decrypt the key?")) {
            let password = prompt("Authentication Security: Key Passphrases\nEnter your passphrase, then press Enter:");
            try {
                localStorage.setItem("privk", await decryptAES(JSON.parse(privkey_data.replace("encrypted:", "")), password));
            } catch (e) {
                return endLogonProcess("Authentication Security: Key Passphrases\nSeems like your passphrase was not correct. Try again later.\n\n-----BEGIN TECHNICAL INFO-----\n" +  + e.toString() + "\n-----END TECHNICAL INFO-----");
            }
        }
    } else {
        let password = prompt("Enter a new passphrase, then press Enter:");
        try {
            localStorage.setItem("privk", "encrypted:" + JSON.stringify(await encryptAES(privkey_data, password)));
        } catch (e) {
            return endLogonProcess("Authentication Security: Key Passphrases\n" + e.toString());
        }
    }
    endLogonProcess();
}