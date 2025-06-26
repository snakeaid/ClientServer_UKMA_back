const ALGORITHM = 'AES-CBC';
const KEY_MATERIAL = new TextEncoder().encode('MySuperSecretKeyForEncryption123');
const IV_LENGTH_BYTES = 16;

async function getCryptoKey() {
  return crypto.subtle.importKey('raw', KEY_MATERIAL, { name: 'AES-CBC' }, false, ['encrypt', 'decrypt']);
}

export async function encrypt(plainText: string): Promise<string> {
  const key = await getCryptoKey();
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH_BYTES));
  
  const encoder = new TextEncoder();
  const encodedPlainText = encoder.encode(plainText);

  const cipherText = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
    encodedPlainText
  );

  const encryptedData = new Uint8Array(iv.length + cipherText.byteLength);
  encryptedData.set(iv, 0);
  encryptedData.set(new Uint8Array(cipherText), iv.length);

  return btoa(String.fromCharCode.apply(null, Array.from(encryptedData)));
}

export async function decrypt(encryptedText: string): Promise<string> {
  const key = await getCryptoKey();
  
  const encryptedData = new Uint8Array(atob(encryptedText).split('').map(char => char.charCodeAt(0)));
  
  const iv = encryptedData.slice(0, IV_LENGTH_BYTES);
  const cipherText = encryptedData.slice(IV_LENGTH_BYTES);

  const decrypted = await crypto.subtle.decrypt(
    { name: ALGORITHM, iv },
    key,
    cipherText
  );

  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
} 