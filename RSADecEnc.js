try { window } catch { console.error("This should be executed in the main browser environment."); process.exit(1); }
async function generateKeyPair() {
	const keyPair = await crypto.subtle.generateKey({
			name: 'RSA-OAEP',
			modulusLength: 2048,
			publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
			hash: 'SHA-256',
		},
		true,
		['encrypt', 'decrypt']
	);
	return keyPair;
}

async function exportKeyPair(keyPair) {
	const publicKeyDer = await crypto.subtle.exportKey('spki', keyPair.publicKey);
	const publicKeyPem = `-----BEGIN PUBLIC KEY-----\n${arrayBufferToBase64(publicKeyDer)}\n-----END PUBLIC KEY-----\n`;

	const privateKeyDer = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey);
	const privateKeyPem = `-----BEGIN PRIVATE KEY-----\n${arrayBufferToBase64(privateKeyDer)}\n-----END PRIVATE KEY-----\n`;

	return {
		publicKeyPem,
		privateKeyPem
	};
}

async function importKeyPair(publicKeyPem, privateKeyPem) {
	const publicKeyDer = base64ToArrayBuffer(publicKeyPem.split('\n').slice(1, -2).join(''));
	const publicKey = await crypto.subtle.importKey('spki', publicKeyDer, {
		name: 'RSA-OAEP',
		hash: 'SHA-256'
	}, true, ['encrypt']);

	const privateKeyDer = base64ToArrayBuffer(privateKeyPem.split('\n').slice(1, -2).join(''));
	const privateKey = await crypto.subtle.importKey('pkcs8', privateKeyDer, {
		name: 'RSA-OAEP',
		hash: 'SHA-256'
	}, true, ['decrypt']);

	return {
		publicKey,
		privateKey
	};
}

async function decryptRSA(ciphertext, privateKey) {
	const decrypted = await crypto.subtle.decrypt({
		name: 'RSA-OAEP'
	}, privateKey, ciphertext);
	const plaintext = new TextDecoder().decode(decrypted);
	return plaintext;
}

function arrayBufferToBase64(buffer) {
	let binary = '';
	const bytes = new Uint8Array(buffer);
	const len = bytes.byteLength;
	for (let i = 0; i < len; i++) {
		binary += String.fromCharCode(bytes[i]);
	}
	return btoa(binary);
}

function base64ToArrayBuffer(base64) {
	const binary = atob(base64);
	const len = binary.length;
	const bytes = new Uint8Array(len);
	for (let i = 0; i < len; i++) {
		bytes[i] = binary.charCodeAt(i);
	}
	return bytes.buffer;
}