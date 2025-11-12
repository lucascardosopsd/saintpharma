import prisma from "../src/lib/prisma";

async function checkAllPoints() {
  console.log("🔍 Verificando TODOS os pontos no banco de dados...\n");

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
      orderBy: {
        points: "desc",
      },
    });

    console.log(`👥 Total de usuários: ${users.length}\n`);

    for (const user of users) {
      // Buscar certificados do usuário
      const certificates = await prisma.certificate.findMany({
        where: { userId: user.id },
        select: {
          id: true,
          courseTitle: true,
          courseCmsId: true,
          points: true,
          createdAt: true,
        },
      });

      // Buscar exames concluídos do usuário
      const completedExams = await prisma.exam.findMany({
        where: {
          userId: user.id,
          complete: true,
        },
        select: {
          id: true,
          lectureCMSid: true,
          createdAt: true,
        },
      });

      // Buscar aulas concluídas do usuário
      const completedLectures = await prisma.userLecture.findMany({
        where: { userId: user.id },
        select: {
          id: true,
          lectureCmsId: true,
          courseId: true,
          createdAt: true,
        },
      });

      // Calcular pontos esperados
      const certificatePoints = certificates.reduce(
        (sum, cert) => sum + cert.points,
        0
      );
      const examPoints = completedExams.length * 10; // 10 pontos por exame
      const lecturePoints = completedLectures.length * 5; // 5 pontos por aula

      // IMPORTANTE: Os pontos de exames e aulas já podem estar incluídos nos pontos do certificado
      // ou podem ser pontos adicionais. Vamos calcular o total esperado de forma conservadora.
      // Assumindo que exames e aulas dão pontos adicionais (não incluídos no certificado)
      const expectedPoints = certificatePoints + examPoints + lecturePoints;
      const currentPoints = user.points;
      const difference = expectedPoints - currentPoints;

      const userName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email;

      console.log("=".repeat(80));
      console.log(`👤 ${userName} (${user.email})`);
      console.log("=".repeat(80));
      console.log(`Pontos atuais no banco: ${currentPoints}`);
      console.log(`\n📊 Detalhamento:`);
      console.log(`   Certificados: ${certificates.length} (${certificatePoints} pontos)`);
      console.log(`   Exames concluídos: ${completedExams.length} (${examPoints} pontos)`);
      console.log(`   Aulas concluídas: ${completedLectures.length} (${lecturePoints} pontos)`);
      console.log(`\n   Total esperado: ${expectedPoints} pontos`);
      console.log(`   Diferença: ${difference > 0 ? "+" : ""}${difference}`);
      
      if (certificates.length > 0) {
        console.log(`\n   Certificados:`);
        certificates.forEach((cert, idx) => {
          console.log(`     ${idx + 1}. ${cert.courseTitle} - ${cert.points} pontos (${cert.createdAt.toLocaleDateString('pt-BR')})`);
        });
      }

      if (completedExams.length > 0) {
        console.log(`\n   Exames concluídos: ${completedExams.length}`);
      }

      if (completedLectures.length > 0) {
        console.log(`\n   Aulas concluídas: ${completedLectures.length}`);
      }

      if (difference !== 0) {
        console.log(`\n   ⚠️  DISCREPÂNCIA ENCONTRADA!`);
      } else {
        console.log(`\n   ✅ Pontos corretos!`);
      }
      console.log();
    }

    // Resumo geral
    console.log("=".repeat(80));
    console.log("📈 RESUMO GERAL");
    console.log("=".repeat(80));
    
    const totalCertificates = await prisma.certificate.count();
    const totalCompletedExams = await prisma.exam.count({
      where: { complete: true },
    });
    const totalCompletedLectures = await prisma.userLecture.count();
    const totalUserPoints = users.reduce((sum, user) => sum + user.points, 0);

    console.log(`Total de certificados: ${totalCertificates}`);
    console.log(`Total de exames concluídos: ${totalCompletedExams}`);
    console.log(`Total de aulas concluídas: ${totalCompletedLectures}`);
    console.log(`Total de pontos dos usuários: ${totalUserPoints}`);
    console.log();

  } catch (error) {
    console.error("❌ Erro ao verificar pontos:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar se chamado diretamente
checkAllPoints()
  .then(() => {
    console.log("✅ Verificação completa concluída!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Erro:", error);
    process.exit(1);
  });

export default checkAllPoints;



