import { prisma } from "../src/lib/prisma";

async function main() {
  const userId =
    "cmsmyqotb00005cunmxsfhms6";

  const orderId =
    "cmskrrtc800007kunrhnktc1s";

  const user =
    await prisma.user.findUnique({
      where: {
        id: userId,
      },

      select: {
        id: true,
        email: true,
      },
    });

  if (!user) {
    throw new Error(
      "Test kullanıcısı bulunamadı."
    );
  }

  const order =
    await prisma.order.findUnique({
      where: {
        id: orderId,
      },

      select: {
        id: true,
        customerEmail: true,
        userId: true,
      },
    });

  if (!order) {
    throw new Error(
      "Test siparişi bulunamadı."
    );
  }

console.log(
  "Sipariş e-postası:",
  order.customerEmail
);

console.log(
  "Kullanıcı e-postası:",
  user.email
);

/*
 * Bu script yalnızca mevcut eski test siparişini
 * test kullanıcısına bağlamak için çalıştırılıyor.
 *
 * Production akışında böyle bir bypass kullanılmamalıdır.
 */

  const updated =
    await prisma.order.update({
      where: {
        id: orderId,
      },

      data: {
        userId: user.id,
      },

      select: {
        id: true,
        trackingCode: true,
        userId: true,
        customerEmail: true,
      },
    });

  console.log(
    "Sipariş kullanıcıya bağlandı:"
  );

  console.log(updated);
}

main()
  .catch((error) => {
    console.error(error);

    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });