/**
 * Script de migração para popular firstName e lastName a partir do campo name
 * 
 * Execute com: npx tsx scripts/migrate-user-names.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function migrateUserNames() {
  console.log("Iniciando migração de nomes de usuários...");

  try {
    // Buscar todos os usuários que têm name mas não têm firstName/lastName
    const users = await prisma.user.findMany({
      where: {
        name: {
          not: null,
        },
      },
    });

    console.log(`Encontrados ${users.length} usuários para migrar`);

    let migrated = 0;
    let skipped = 0;

    for (const user of users) {
      // Se já tem firstName e lastName, pular
      if (user.firstName && user.lastName) {
        skipped++;
        continue;
      }

      // Se não tem name, pular
      if (!user.name || user.name.trim().length === 0) {
        skipped++;
        continue;
      }

      // Dividir o name em firstName e lastName
      const nameParts = user.name.trim().split(/\s+/);
      const firstName = nameParts[0] || null;
      const lastName = nameParts.slice(1).join(" ").trim() || null;

      // Atualizar o usuário
      await prisma.user.update({
        where: { id: user.id },
        data: {
          firstName: firstName || user.firstName,
          lastName: lastName || user.lastName,
        },
      });

      migrated++;
      const displayName = [firstName, lastName].filter(Boolean).join(" ") || firstName || "Sem nome";
      console.log(`Migrado: ${user.email} -> ${displayName}`);
    }

    console.log(`\nMigração concluída!`);
    console.log(`- Migrados: ${migrated}`);
    console.log(`- Ignorados: ${skipped}`);
  } catch (error) {
    console.error("Erro durante a migração:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar migração
migrateUserNames()
  .then(() => {
    console.log("Migração finalizada com sucesso!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Erro fatal:", error);
    process.exit(1);
  });

