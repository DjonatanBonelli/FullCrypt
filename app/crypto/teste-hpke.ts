import { generateHpkeKeyPair, encryptBytesWithHpke, decryptBytesWithHpke, b64uEncode, b64uDecode } from "./hpke-kem.ts";

async function testHpke() {
  /* 
  const { publicKey, privateKey } = await generateHpkeKeyPair();
  console.log("Public Key (base64url):", b64uEncode(Uint8Array.from(publicKey)));
  console.log("Private Key (base64url):", b64uEncode(Uint8Array.from(privateKey))); */

  
  //const rawPub = await fetchUserPublicKey("l@l.c");
  //console.log("Fetched Public Key:", rawPub);
  const sk = b64uDecode("b7cxPc2tsKzqo90fzDvccHOIklR9y7-R5259Gww6TCq6apL7mlq5G5cHgl8b9uMITTmv0Uvuw4lzZ66sKDRNTA");
  const pk = b64uDecode("LwlJQ-9-my4fJJEupQnqje1ncveI9NRxgNcEzP520omq0oZeK78pVfPq_QuPTNXaFo7ar6A-mZuFWTdTICz6J9RgyVF16_xKZoIVl3lVJ0SsRv-Az76YJ_K_wveUo5qEIjOv10wNDC4zdwJJ68xjFALZ-qsuJBt3SrRkedqmune8HGvOuxki90oPSyyWGv5a5Q5IYLYeVtCV5pzd_SebkCIs04H1lQENRTDUdsspuDPsAq0Vbm1K-kj42U-6r-RukbS_Wz35GAdFAzhPRhT3tuH3H_s42Y6qnG0uP9djtUjOXrFA2cmCPo20Ga27V7b9SWqomK0VJA5KRiBl9IL90AUBZ4e7w3ZLdBLLNOjm-F_gfFXHAnJ6fEzSo2dwDeiBZ0vdQe8PYXSq0dbvtmdLMyuCcqqCH3Cak4iwvlTu3Sticy5sIsodsBbV5d69M9vFCDip_CZ7UohXlVx3gV_EyJaDL9ONVOdADHKcCZmNGLli07HsUxKSOaANih5qG_PoG-iV935rBhoP_BuEnMiA3d9pONusy5AUuLwJ9yzt1f69bcjulq9N2Rh5OI-Cq0Il_hIJ_64Vy44McJ0gdAXdI-n4fQayhDfKcFIDWLtAq4lQF9Mj7fRR_5nBTQQ2rX6_HOaYPO_7I6_miTCBntGiCFSVX38pS_1I4VRoG17NfwmuZLAKuo4babxGIw6kEFuEraHOKBSEQtKzvlGVtmbni8XrBjcuwBRm1TXD1cXZeByQ3N97TKCXC8XczfvtwXfrJf5IJV2i4Aymhdh0kXWnfk-3dBJ2ISwR5bP60yVclXzyRyNue39BmR1sWOD29VAEuk7OLwhSyiB4KKzAl-6DW9nq2owhiNGLJYsnj32erHRjbwLJiFXQ39K3um95lQg57hOfIiSGzI2cy6_SllDgh5kPT5HLLLIIJba0WBl9zKlUpdN487p0VMblWcKgJadnJnaZud8EMW_zczXFDbDB1OQi2NdDWGT4oVnB_Ae5bMXxMeF71yIVpQU62owCxOsk5ymUsp5wLd_RN_y611MUI2qGz7i2Rvj3wMK5yNbR7nGXA1HJHHOVabzEx5yObzHPNtAu5u95UOXVU6LQCXKJ0lIOgkd_j-OWLiwb_YTf9x9CQMfo5WluY4HdN4bGq8XbYZ_-zOTCr0bEGW3DRITY8D9pGRoJByCoVSqEdQg34zlqlYEsCC-s_ZoYOjA7IOO6BK3-R5IxGypkXiK1q56HLsi0amtPJO-uYFSGBiiBxiBV-qeYPZhHlZdLiO7xhPWMovsgWPCh1pL6zcwEbYcBUYSI2v4kcrR30VhIcpIvIRlBxsEIOX4uIM2JmTFBkQ5yFpEZpYt8Ac6H_B4uksXYtEAez1vfZQCbYvdmTd9ke2VxkpUiWxhp_y50nuJC63PzGH8EKg0n_i-QZNsbi-h-EFzcCpTCbLEKx5j6MuSedFI");

  const plaintext = new TextEncoder().encode("Hello HPKE");

  const { enc, ciphertext } = await encryptBytesWithHpke(pk, plaintext);

  console.log("Encrypted enc:", enc);
  console.log("Encrypted ciphertext:", ciphertext);

  const decrypted = await decryptBytesWithHpke(sk, enc, ciphertext);

  console.log("Decrypted:", new TextDecoder().decode(decrypted));

}

testHpke();
