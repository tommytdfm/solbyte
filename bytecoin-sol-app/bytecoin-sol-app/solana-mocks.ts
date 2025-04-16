// Mock implementations for Solana classes and functions
export class PublicKey {
  private keyValue: string;

  constructor(key: string) {
    this.keyValue = key;
  }

  toString() {
    return this.keyValue;
  }

  equals(other: PublicKey) {
    return this.keyValue === other.toString();
  }

  toBase58() {
    return this.keyValue;
  }
}

export const clusterApiUrl = (network: string) => {
  return `https://api.${network}.solana.com`;
};

export const Connection = class {
  constructor(endpoint: string) {
    // Mock constructor
  }

  getBalance() {
    return Promise.resolve(5000000000); // 5 SOL in lamports
  }

  getTokenAccountsByOwner() {
    return Promise.resolve({
      value: []
    });
  }
};
