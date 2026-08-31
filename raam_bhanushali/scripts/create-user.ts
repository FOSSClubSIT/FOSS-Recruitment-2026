import "dotenv/config";
import bcrypt from "bcrypt";
import { prisma } from "../src/lib/prisma";

async function main() {
  const email = "admin@resumeforge.com";
  const password = "Password123!";

  const hashedPassword = await bcrypt.hash(password, 10);

  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (existingUser) {
    console.log("User already exists");
    return;
  }

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name: "Admin User",
    },
  });

  console.log("User created:");
  console.log(user.email);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });