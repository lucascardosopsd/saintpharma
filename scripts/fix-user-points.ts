/**
 * Script de correção de pontos dos usuários
 * 
 * Este script corrige os pontos dos usuários baseado nos certificados, exames e aulas.
 * 
 * Execute com: npx tsx scripts/fix-user-points.ts
 * ou: npx tsx scripts/fix-user-points.ts <clerkId> (para um usuário específico)
 * ou: npx tsx scripts/fix-user-points.ts --dry-run (para simular sem fazer alterações)
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface FixResult {
  userId: string;
  clerkId: string;
  email: string;
  name: string;
  oldPoints: number;
  newPoints: number;
  difference: number;
  fixed: boolean;
}

async function fixUserPoints(clerkId?: string, dryRun: boolean = false) {
  console.log("🔧 Iniciando correção de pontos dos usuários...");
  if (dryRun) {
    console.log("⚠️  MODO DRY-RUN: Nenhuma alteração será feita no banco de dados\n");
  }
  console.log();

  try {
    // Buscar usuários
    const whereClause = clerkId ? { clerkId } : {};
    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        clerkId: true,
        email: true,
        firstName: true,
        lastName: true,
        points: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log(`📊 Encontrados ${users.length} usuário(s) para processar\n`);

    const results: FixResult[] = [];

    for (const user of users) {
      // Buscar certificados do usuário
      const certificates = await prisma.certificate.findMany({
        where: {
          userId: user.id,
        },
        select: {
          points: true,
        },
      });

      // Buscar exames concluídos
      const completedExams = await prisma.exam.findMany({
        where: {
          userId: user.id,
          complete: true,
        },
        select: {
          id: true,
        },
      });

      // Buscar aulas concluídas
      const completedLectures = await prisma.userLecture.findMany({
        where: {
          userId: user.id,
        },
        select: {
          id: true,
        },
      });

      // Calcular pontos totais
      const certificatePoints = certificates.reduce(
        (sum, cert) => sum + cert.points,
        0
      );
      const examPoints = completedExams.length * 10; // 10 pontos por exame
      const lecturePoints = completedLectures.length * 5; // 5 pontos por aula
      const totalPoints = certificatePoints + examPoints + lecturePoints;

      const oldPoints = user.points || 0;
      const difference = totalPoints - oldPoints;
      const needsFix = difference !== 0;

      const name = [user.firstName, user.lastName]
        .filter(Boolean)
        .join(" ") || user.email || "Sem nome";

      if (needsFix) {
        if (!dryRun) {
          // Atualizar pontos do usuário
          await prisma.user.update({
            where: { id: user.id },
            data: {
              points: totalPoints,
            },
          });
        }

        results.push({
          userId: user.id,
          clerkId: user.clerkId,
          email: user.email,
          name,
          oldPoints,
          newPoints: totalPoints,
          difference,
          fixed: true,
        });

        console.log(`✅ ${dryRun ? '[DRY-RUN] ' : ''}Corrigido: ${name}`);
        console.log(`   Pontos antigos: ${oldPoints}`);
        console.log(`   Pontos novos: ${totalPoints}`);
        console.log(`   Diferença: ${difference > 0 ? '+' : ''}${difference}`);
        console.log(`   Detalhes:`);
        console.log(`     - Certificados: ${certificates.length} (${certificatePoints} pontos)`);
        console.log(`     - Exames: ${completedExams.length} (${examPoints} pontos)`);
        console.log(`     - Aulas: ${completedLectures.length} (${lecturePoints} pontos)`);
        console.log();
      } else {
        results.push({
          userId: user.id,
          clerkId: user.clerkId,
          email: user.email,
          name,
          oldPoints,
          newPoints: totalPoints,
          difference: 0,
          fixed: false,
        });
      }
    }

    // Resumo
    const fixedUsers = results.filter((r) => r.fixed);
    const totalPointsAdded = fixedUsers.reduce((sum, r) => sum + r.difference, 0);

    console.log("=".repeat(80));
    console.log("📊 RESUMO");
    console.log("=".repeat(80));
    console.log(`Total de usuários processados: ${results.length}`);
    console.log(`Usuários corrigidos: ${fixedUsers.length}`);
    console.log(`Total de pontos ajustados: ${totalPointsAdded > 0 ? '+' : ''}${totalPointsAdded}`);
    console.log();

    if (dryRun && fixedUsers.length > 0) {
      console.log("💡 Execute o script sem --dry-run para aplicar as correções.");
    } else if (!dryRun && fixedUsers.length > 0) {
      console.log("✅ Correções aplicadas com sucesso!");
    } else {
      console.log("✅ Todos os pontos já estão corretos!");
    }

  } catch (error) {
    console.error("❌ Erro durante a correção:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Processar argumentos da linha de comando
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const clerkId = args.find((arg) => !arg.startsWith("--"));

// Executar correção
fixUserPoints(clerkId, dryRun)
  .then(() => {
    console.log("\n✅ Processo finalizado!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Erro fatal:", error);
    process.exit(1);
  });


