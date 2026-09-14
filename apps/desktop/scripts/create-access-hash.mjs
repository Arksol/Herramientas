import bcrypt from "bcryptjs";

const accessCode = process.argv[2];

if (!accessCode || accessCode.length < 8) {
  console.error("Uso: npm run access-hash -- \"un-código-de-al-menos-8-caracteres\"");
  process.exit(1);
}

console.log(await bcrypt.hash(accessCode, 12));