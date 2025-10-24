import { hash } from "@node-rs/argon2";

async function main() {
  const password = "12345678";

  // Force the parameters Better Auth expects
  const hashed = await hash(password, {
    memoryCost: 4096, // m=4096
    timeCost: 3, // t=3
    parallelism: 1, // p=1
    type: 2, // argon2id
  } as any);

  console.log(hashed);
}

main();
