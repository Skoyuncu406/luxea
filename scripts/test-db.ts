import "dotenv/config";

import { prisma } from "../src/lib/prisma";

async function main() {
  const [
    categories,
    products,
    orders,
  ] = await Promise.all([
    prisma.category.count(),
    prisma.product.count(),
    prisma.order.count(),
  ]);

  console.log(
    "LUXEA PostgreSQL bağlantısı başarılı:"
  );

  console.log({
    categories,
    products,
    orders,
  });
}

main()
  .catch((error) => {
    console.error(
      "Database test başarısız:",
      error
    );

    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });