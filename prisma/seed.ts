import { prisma } from "~/utils/db.server";
import bcrypt from "bcryptjs";

async function seed() {
  console.log("🌱 Seeding...");
  console.time(`🌱 Database has been seeded`);

  console.time(`🧑 Created admin user`);

  await prisma.user.create({
    select: { id: true },
    data: {
      email: "admin@ts.co.id",
      username: "admin_tm",
      name: "Admin",
      password: await bcrypt.hash("Admin123!", 16),
    },
  });
  console.time(`🧑 Created admin user success`);

  console.timeEnd(`🌱 Database has been seeded`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
