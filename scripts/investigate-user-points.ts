/**
 * Script de investigação de pontos dos usuários
 * 
 * Este script verifica:
 * - Pontos armazenados no campo points do User
 * - Certificados de cada usuário e seus pontos
 * - Soma dos pontos dos certificados
 * - Discrepâncias entre pontos do usuário e soma dos certificados
 * 
 * Execute com: npx tsx scripts/investigate-user-points.ts
 * ou: npx tsx scripts/investigate-user-points.ts <clerkId> (para um usuário específico)
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface UserPointsAnalysis {
  userId: string;
  clerkId: string;
  email: string;
  name: string;
  pointsInUser: number;
  certificates: Array<{
    id: string;
    courseTitle: string;
    points: number;
    createdAt: Date;
  }>;
  totalPointsFromCertificates: number;
  discrepancy: number;
  hasDiscrepancy: boolean;
}

async function investigateUserPoints(clerkId?: string) {
  console.log("🔍 Iniciando investigação de pontos dos usuários...\n");

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

    console.log(`📊 Encontrados ${users.length} usuário(s) para analisar\n`);

    const analyses: UserPointsAnalysis[] = [];

    for (const user of users) {
      // Buscar certificados do usuário
      const certificates = await prisma.certificate.findMany({
        where: {
          userId: user.id,
        },
        select: {
          id: true,
          courseTitle: true,
          points: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      // Calcular soma dos pontos dos certificados
      const totalPointsFromCertificates = certificates.reduce(
        (sum, cert) => sum + cert.points,
        0
      );

      // Calcular discrepância
      const discrepancy = totalPointsFromCertificates - (user.points || 0);
      const hasDiscrepancy = discrepancy !== 0;

      const name = [user.firstName, user.lastName]
        .filter(Boolean)
        .join(" ") || user.email || "Sem nome";

      analyses.push({
        userId: user.id,
        clerkId: user.clerkId,
        email: user.email,
        name,
        pointsInUser: user.points || 0,
        certificates: certificates.map((cert) => ({
          id: cert.id,
          courseTitle: cert.courseTitle,
          points: cert.points,
          createdAt: cert.createdAt,
        })),
        totalPointsFromCertificates,
        discrepancy,
        hasDiscrepancy,
      });
    }

    // Exibir resultados
    console.log("=".repeat(80));
    console.log("📋 RELATÓRIO DE PONTOS DOS USUÁRIOS");
    console.log("=".repeat(80));
    console.log();

    for (const analysis of analyses) {
      console.log(`👤 Usuário: ${analysis.name}`);
      console.log(`   📧 Email: ${analysis.email}`);
      console.log(`   🆔 Clerk ID: ${analysis.clerkId}`);
      console.log(`   🆔 User ID: ${analysis.userId}`);
      console.log();
      console.log(`   💰 Pontos no campo 'points' do User: ${analysis.pointsInUser}`);
      console.log(`   📜 Certificados encontrados: ${analysis.certificates.length}`);
      
      if (analysis.certificates.length > 0) {
        console.log(`   📚 Detalhes dos certificados:`);
        analysis.certificates.forEach((cert, index) => {
          console.log(`      ${index + 1}. ${cert.courseTitle}`);
          console.log(`         - Pontos: ${cert.points}`);
          console.log(`         - Data: ${cert.createdAt.toLocaleString("pt-BR")}`);
        });
      }
      
      console.log(`   ➕ Soma dos pontos dos certificados: ${analysis.totalPointsFromCertificates}`);
      console.log();

      if (analysis.hasDiscrepancy) {
        console.log(`   ⚠️  DISCREPÂNCIA ENCONTRADA!`);
        if (analysis.discrepancy > 0) {
          console.log(`   ⚠️  Os certificados somam ${analysis.discrepancy} pontos a MAIS do que está no campo 'points'`);
          console.log(`   ⚠️  O campo 'points' deveria ter: ${analysis.totalPointsFromCertificates}`);
        } else {
          console.log(`   ⚠️  O campo 'points' tem ${Math.abs(analysis.discrepancy)} pontos a MAIS do que a soma dos certificados`);
          console.log(`   ⚠️  A soma dos certificados é: ${analysis.totalPointsFromCertificates}`);
        }
      } else {
        console.log(`   ✅ Pontos estão corretos!`);
      }

      console.log();
      console.log("-".repeat(80));
      console.log();
    }

    // Resumo
    const usersWithDiscrepancy = analyses.filter((a) => a.hasDiscrepancy);
    const usersWithCertificates = analyses.filter((a) => a.certificates.length > 0);
    const totalPointsInUsers = analyses.reduce((sum, a) => sum + a.pointsInUser, 0);
    const totalPointsFromAllCertificates = analyses.reduce(
      (sum, a) => sum + a.totalPointsFromCertificates,
      0
    );

    console.log("=".repeat(80));
    console.log("📊 RESUMO");
    console.log("=".repeat(80));
    console.log(`Total de usuários analisados: ${analyses.length}`);
    console.log(`Usuários com certificados: ${usersWithCertificates.length}`);
    console.log(`Usuários com discrepâncias: ${usersWithDiscrepancy.length}`);
    console.log(`Total de pontos no campo 'points' (todos os usuários): ${totalPointsInUsers}`);
    console.log(`Total de pontos dos certificados (todos os usuários): ${totalPointsFromAllCertificates}`);
    console.log();

    if (usersWithDiscrepancy.length > 0) {
      console.log("⚠️  USUÁRIOS COM DISCREPÂNCIAS:");
      usersWithDiscrepancy.forEach((analysis) => {
        console.log(`   - ${analysis.name} (${analysis.email})`);
        console.log(`     Pontos no User: ${analysis.pointsInUser}`);
        console.log(`     Soma dos certificados: ${analysis.totalPointsFromCertificates}`);
        console.log(`     Diferença: ${analysis.discrepancy > 0 ? '+' : ''}${analysis.discrepancy}`);
      });
      console.log();
      console.log("💡 SUGESTÃO: Execute o script de correção para sincronizar os pontos.");
    } else {
      console.log("✅ Nenhuma discrepância encontrada! Todos os pontos estão corretos.");
    }

    // Buscar também exames e aulas concluídas para verificar se há pontos adicionais
    console.log();
    console.log("=".repeat(80));
    console.log("🔍 VERIFICAÇÃO ADICIONAL: Exames e Aulas");
    console.log("=".repeat(80));
    console.log();

    for (const analysis of analyses) {
      // Buscar exames concluídos
      const completedExams = await prisma.exam.findMany({
        where: {
          userId: analysis.userId,
          complete: true,
        },
        select: {
          id: true,
          createdAt: true,
        },
      });

      // Buscar aulas concluídas
      const completedLectures = await prisma.userLecture.findMany({
        where: {
          userId: analysis.userId,
        },
        select: {
          id: true,
          createdAt: true,
        },
      });

      const examPoints = completedExams.length * 10; // 10 pontos por exame
      const lecturePoints = completedLectures.length * 5; // 5 pontos por aula

      if (completedExams.length > 0 || completedLectures.length > 0) {
        console.log(`👤 ${analysis.name}:`);
        console.log(`   📝 Exames concluídos: ${completedExams.length} (${examPoints} pontos)`);
        console.log(`   📚 Aulas concluídas: ${completedLectures.length} (${lecturePoints} pontos)`);
        console.log(`   📜 Certificados: ${analysis.certificates.length} (${analysis.totalPointsFromCertificates} pontos)`);
        const totalExpected = analysis.totalPointsFromCertificates + examPoints + lecturePoints;
        console.log(`   ➕ Total esperado (certificados + exames + aulas): ${totalExpected}`);
        console.log(`   💰 Pontos atuais no User: ${analysis.pointsInUser}`);
        const totalDiscrepancy = totalExpected - analysis.pointsInUser;
        if (totalDiscrepancy !== 0) {
          console.log(`   ⚠️  Diferença total: ${totalDiscrepancy > 0 ? '+' : ''}${totalDiscrepancy}`);
        } else {
          console.log(`   ✅ Pontos totais corretos!`);
        }
        console.log();
      }
    }

  } catch (error) {
    console.error("❌ Erro durante a investigação:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Obter Clerk ID do argumento da linha de comando (opcional)
const clerkId = process.argv[2];

// Executar investigação
investigateUserPoints(clerkId)
  .then(() => {
    console.log("\n✅ Investigação finalizada!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Erro fatal:", error);
    process.exit(1);
  });


