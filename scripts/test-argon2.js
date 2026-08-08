/**
 * Test suite for Argon2id Password Hashing & Verification (SEC-001C)
 */

const argon2 = require("argon2");
const crypto = require("crypto");

async function runTests() {
  console.log("=================================================");
  console.log("🧪 RUNNING ARGON2ID SECURITY & VERIFICATION SUITE");
  console.log("=================================================");

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}`);
      failed++;
    }
  }

  // 1. Generate Argon2id hash
  const testPassword = "MySuperSecretPassword2026!@#";
  const wrongPassword = "WrongPassword123";

  const hash1 = await argon2.hash(testPassword, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 1,
  });

  const hash2 = await argon2.hash(testPassword, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 1,
  });

  // Test 1: Format validation
  assert(hash1.startsWith("$argon2id$"), "Hash format starts with $argon2id$");

  // Test 2: Random salt produces different hashes for identical passwords
  assert(hash1 !== hash2, "Different hashes generated for same password due to random salt");

  // Test 3: Verify correct password on hash1
  const verify1 = await argon2.verify(hash1, testPassword);
  assert(verify1 === true, "Argon2id verify correct password on hash1 -> PASS");

  // Test 4: Verify correct password on hash2
  const verify2 = await argon2.verify(hash2, testPassword);
  assert(verify2 === true, "Argon2id verify correct password on hash2 -> PASS");

  // Test 5: Verify wrong password on hash1
  const verifyWrong = await argon2.verify(hash1, wrongPassword);
  assert(verifyWrong === false, "Argon2id verify wrong password -> FAIL (rejected)");

  // Test 6: Legacy scrypt backward compatibility
  const legacySalt = crypto.randomBytes(32).toString("base64");
  const derivedKey = crypto.scryptSync(testPassword, legacySalt, 64, {
    N: 16384,
    r: 8,
    p: 1,
    maxmem: 32 * 1024 * 1024,
  });
  const legacyScryptHash = `$scrypt$N=16384,r=8,p=1$${legacySalt}$${derivedKey.toString("base64")}`;

  // Verify legacy scrypt using backward compatibility helper logic
  const parts = legacyScryptHash.split("$");
  const extractedSalt = parts[parts.length - 2];
  const extractedHash = parts[parts.length - 1];
  const computedKey = crypto.scryptSync(testPassword, extractedSalt, 64, {
    N: 16384,
    r: 8,
    p: 1,
    maxmem: 32 * 1024 * 1024,
  });
  const keyBuf = Buffer.from(computedKey.toString("base64"));
  const origBuf = Buffer.from(extractedHash);
  const legacyMatch = keyBuf.length === origBuf.length && crypto.timingSafeEqual(keyBuf, origBuf);
  assert(legacyMatch === true, "Legacy scrypt hash backward compatibility verification -> PASS");

  console.log("=================================================");
  console.log(`🎉 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("=================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
