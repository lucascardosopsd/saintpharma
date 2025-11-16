import prisma from "../src/lib/prisma";

async function recalculatePoints() {
  console.log("🔄 Recalculando pontos de todos os usuários...\n");

  try {
    // Buscar todos os usuários
    const users = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        points: true,
      },
    });

    console.log(`👥 Total de usuários: ${users.length}\n`);

    let totalFixed = 0;
    let totalErrors = 0;

    for (const user of users) {
      try {
        // Buscar certificados do usuário
        const certificates = await prisma.certificate.findMany({
          where: { userId: user.id },
          select: { points: true },
        });

        // Buscar exames concluídos do usuário
        const completedExams = await prisma.exam.findMany({
          where: {
            userId: user.id,
            complete: true,
          },
          select: { id: true },
        });

        // Buscar aulas concluídas do usuário
        const completedLectures = await prisma.userLecture.findMany({
          where: { userId: user.id },
          select: { id: true },
        });

        // Calcular pontos esperados
        const certificatePoints = certificates.reduce(
          (sum, cert) => sum + cert.points,
          0
        );
        const examPoints = completedExams.length * 10; // 10 pontos por exame
        const lecturePoints = completedLectures.length * 5; // 5 pontos por aula

        // Total esperado
        const expectedPoints = certificatePoints + examPoints + lecturePoints;
        const currentPoints = user.points;
        const difference = expectedPoints - currentPoints;

        const userName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email;

        if (difference !== 0) {
          // Atualizar pontos
          await prisma.user.update({
            where: { id: user.id },
            data: { points: expectedPoints },
          });

          console.log(
            `✅ ${userName}: ${currentPoints} → ${expectedPoints} pontos (${difference > 0 ? "+" : ""}${difference})`
          );
          console.log(
            `   Certificados: ${certificatePoints} | Exames: ${examPoints} | Aulas: ${lecturePoints}`
          );
          totalFixed++;
        } else {
          console.log(`✓ ${userName}: ${currentPoints} pontos (correto)`);
        }
      } catch (error) {
        console.error(`❌ Erro ao recalcular pontos de ${user.email}:`, error);
        totalErrors++;
      }
    }

    console.log("\n" + "=".repeat(80));
    console.log("📊 RESULTADO");
    console.log("=".repeat(80));
    console.log(`✅ Usuários corrigidos: ${totalFixed}`);
    console.log(`❌ Erros: ${totalErrors}`);
    console.log();

  } catch (error) {
    console.error("❌ Erro ao recalcular pontos:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar se chamado diretamente
recalculatePoints()
  .then(() => {
    console.log("✅ Recalculação concluída!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Erro:", error);
    process.exit(1);
  });

export default recalculatePoints;
















