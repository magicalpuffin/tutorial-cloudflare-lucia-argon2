// src/lib/server/argon2.ts
export class CloudflareArgon2 {
  private serviceBinding: Fetcher;
  private memorySize: number;
  private iterations: number;
  private parallelism: number;

  constructor(
    serviceBinding: Fetcher,
    options?: {
      memorySize?: number;
      iterations?: number;
      tagLength?: number;
      parallelism?: number;
    }
  ) {
    this.serviceBinding = serviceBinding;
    this.memorySize = options?.memorySize ?? 19456;
    this.iterations = options?.iterations ?? 2;
    this.parallelism = options?.parallelism ?? 1;
  }

  public async hash(password: string) {
    const resp = await this.serviceBinding.fetch("http://internal/hash", {
      method: "POST",
      body: JSON.stringify({
        password: password,
        options: {
          timeCost: this.iterations,
          memoryCost: this.memorySize,
          parallelism: this.parallelism,
        },
      }),
    });

    const { hash }: { hash: string } = await resp.json();

    return hash;
  }
  public async verify(hash: string, password: string) {
    const resp = await this.serviceBinding.fetch("http://internal/verify", {
      method: "POST",
      body: JSON.stringify({ password: password, hash: hash }),
    });
    const { matches }: { matches: boolean } = await resp.json();

    return matches;
  }
}
