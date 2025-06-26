package ua.edu.ukma.clientserver.util;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;

class EncryptionUtilTest {

    @Test
    void testEncryptDecrypt() {
        String originalText = "This is a secret message.";
        String encryptedText = EncryptionUtil.encrypt(originalText);
        String decryptedText = EncryptionUtil.decrypt(encryptedText);

        assertNotEquals(originalText, encryptedText);
        assertEquals(originalText, decryptedText);
    }

    @Test
    void testEncryptWithEmptyString() {
        String originalText = "";
        String encryptedText = EncryptionUtil.encrypt(originalText);
        String decryptedText = EncryptionUtil.decrypt(encryptedText);

        assertNotEquals(originalText, encryptedText);
        assertEquals(originalText, decryptedText);
    }

    @Test
    void testEncryptWithJson() {
        String originalText = "{\"name\":\"test\", \"value\":123}";
        String encryptedText = EncryptionUtil.encrypt(originalText);
        String decryptedText = EncryptionUtil.decrypt(encryptedText);

        assertNotEquals(originalText, encryptedText);
        assertEquals(originalText, decryptedText);
    }
} 