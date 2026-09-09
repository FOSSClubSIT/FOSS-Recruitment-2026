import { prisma } from "./lib/prisma";

async function main() {
  try {
    const users = await prisma.user.findMany();
    console.log(users);
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
