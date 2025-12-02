// kyber.ts
import { MlKem1024 } from "mlkem";

export class Kyber {
  private impl: MlKem1024;

  constructor() {
    this.impl = new MlKem1024();
  }

  async generateKeyPair() {
    const [publicKey, secretKey] = await this.impl.generateKeyPair();
    return { publicKey, secretKey };
  }

  async encryptSharedKey(publicKey: Uint8Array) {
    // encapsula e gera CT + SS
    const [ciphertext, sharedSecret] = await this.impl.encap(publicKey);
    return { ciphertext, sharedSecret };
  }

  async decryptSharedKey(ciphertext: Uint8Array, secretKey: Uint8Array) {
    const sharedSecret = await this.impl.decap(ciphertext, secretKey);
    return sharedSecret;
  }
}

// exemplo de uso
export async function example() {
  const receiver = new Kyber();
  const sender = new Kyber();

  const { publicKey, secretKey } = await receiver.generateKeyPair();
  const { ciphertext, sharedSecret: ssSender } =
    await sender.encryptSharedKey(publicKey);

  const ssReceiver = await receiver.decryptSharedKey(ciphertext, secretKey);

  return {
    ssSender,
    ssReceiver,
    equal: Buffer.compare(ssSender, ssReceiver) === 0,
  };
}
