export function encryptKryptos(message, key) {
    key = key.toUpperCase();
    let encryptedMessage = [];
    let keyIndex = 0;

    for (let i = 0; i < message.length; i++) {
        const char = message[i];
        if (/[a-z]/i.test(char)) {
            const base = char === char.toUpperCase() ? 'A' : 'a';
            const shift = key.charCodeAt(keyIndex % key.length) - 'A'.charCodeAt(0);
            const originalPosition = char.charCodeAt(0) - base.charCodeAt(0);
            const newPosition = (originalPosition + shift) % 26;
            encryptedMessage.push(String.fromCharCode(newPosition + base.charCodeAt(0)));
            keyIndex++;
        } else {
            encryptedMessage.push(char);
        }
    }

    return encryptedMessage.join('');
}

export function decryptKryptos(ciphertext, key) {
    key = key.toUpperCase();
    let decryptedMessage = [];
    let keyIndex = 0;

    for (let i = 0; i < ciphertext.length; i++) {
        const char = ciphertext[i];
        if (/[a-z]/i.test(char)) {
            const base = char === char.toUpperCase() ? 'A' : 'a';
            const shift = key.charCodeAt(keyIndex % key.length) - 'A'.charCodeAt(0);
            const originalPosition = char.charCodeAt(0) - base.charCodeAt(0);
            const newPosition = (originalPosition - shift + 26) % 26;
            decryptedMessage.push(String.fromCharCode(newPosition + base.charCodeAt(0)));
            keyIndex++;
        } else {
            decryptedMessage.push(char);
        }
    }

    return decryptedMessage.join('');
}