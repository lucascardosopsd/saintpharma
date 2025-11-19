import prisma from "../src/lib/prisma";
import { startOfWeek, endOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";

async function checkWeekPoints() {
  console.log("🔍 Verificando pontos da semana atual no ranking...\n");

  try {
    // Calcular limites da semana
    const today = new Date();
    const firstDayOfWeek = startOfWeek(today, { locale: ptBR, weekStartsOn: 0 });
    const lastDayOfWeek = endOfWeek(today, { locale: ptBR, weekStartsOn: 0 });

    console.log("📅 Semana atual:");
    console.log(`   Início: ${firstDayOfWeek.toLocaleDateString('pt-BR')} ${firstDayOfWeek.toLocaleTimeString('pt-BR')}`);
    console.log(`   Fim: ${lastDayOfWeek.toLocaleDateString('pt-BR')} ${lastDayOfWeek.toLocaleTimeString('pt-BR')}`);
    console.log();

    // Buscar todos os usuários
    const users = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
      },
    });

    for (const user of users) {
      // Buscar certificados da semana
      const certificates = await prisma.certificate.findMany({
        where: {
          userId: user.id,
          createdAt: {
            gte: firstDayOfWeek,
            lte: lastDayOfWeek,
          },
        },
        select: {
          id: true,
          courseTitle: true,
          points: true,
          createdAt: true,
        },
      });

      // Buscar exames concluídos da semana
      const completedExams = await prisma.exam.findMany({
        where: {
          userId: user.id,
          complete: true,
          createdAt: {
            gte: firstDayOfWeek,
            lte: lastDayOfWeek,
          },
        },
        select: {
          id: true,
          lectureCMSid: true,
          createdAt: true,
        },
      });

      // Buscar aulas concluídas da semana
      const completedLectures = await prisma.userLecture.findMany({
        where: {
          userId: user.id,
          createdAt: {
            gte: firstDayOfWeek,
            lte: lastDayOfWeek,
          },
        },
        select: {
          id: true,
          lectureCmsId: true,
          courseId: true,
          createdAt: true,
        },
      });

      const certificatePoints = certificates.reduce(
        (sum, cert) => sum + cert.points,
        0
      );
      const examPoints = completedExams.length * 10;
      const lecturePoints = completedLectures.length * 5;
      const weekPoints = certificatePoints + examPoints + lecturePoints;

      const userName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email;

      console.log("=".repeat(80));
      console.log(`👤 ${userName} (${user.email})`);
      console.log("=".repeat(80));
      console.log(`📊 Pontos da semana: ${weekPoints}`);
      console.log(`\n   Certificados desta semana: ${certificates.length} (${certificatePoints} pontos)`);
      if (certificates.length > 0) {
        certificates.forEach((cert, idx) => {
          console.log(`     ${idx + 1}. ${cert.courseTitle} - ${cert.points} pontos`);
          console.log(`        Criado em: ${cert.createdAt.toLocaleDateString('pt-BR')} ${cert.createdAt.toLocaleTimeString('pt-BR')}`);
        });
      }
      console.log(`\n   Exames concluídos desta semana: ${completedExams.length} (${examPoints} pontos)`);
      if (completedExams.length > 0) {
        completedExams.forEach((exam, idx) => {
          console.log(`     ${idx + 1}. Exame ${exam.id} - 10 pontos`);
          console.log(`        Concluído em: ${exam.createdAt.toLocaleDateString('pt-BR')} ${exam.createdAt.toLocaleTimeString('pt-BR')}`);
        });
      }
      console.log(`\n   Aulas concluídas desta semana: ${completedLectures.length} (${lecturePoints} pontos)`);
      if (completedLectures.length > 0) {
        completedLectures.forEach((lecture, idx) => {
          console.log(`     ${idx + 1}. Aula ${lecture.lectureCmsId} - 5 pontos`);
          console.log(`        Concluída em: ${lecture.createdAt.toLocaleDateString('pt-BR')} ${lecture.createdAt.toLocaleTimeString('pt-BR')}`);
        });
      }
      console.log();
    }

  } catch (error) {
    console.error("❌ Erro ao verificar pontos da semana:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar se chamado diretamente
checkWeekPoints()
  .then(() => {
    console.log("✅ Verificação concluída!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Erro:", error);
    process.exit(1);
  });

export default checkWeekPoints;




















