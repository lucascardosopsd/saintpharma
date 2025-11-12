import prisma from "../src/lib/prisma";
import { startOfWeek, endOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";

async function checkRecentCertificates() {
  console.log("🔍 Verificando certificados recentes...\n");

  try {
    // Calcular limites da semana
    const today = new Date();
    const firstDayOfWeek = startOfWeek(today, { locale: ptBR, weekStartsOn: 0 });
    const lastDayOfWeek = endOfWeek(today, { locale: ptBR, weekStartsOn: 0 });

    console.log("📅 Semana atual:");
    console.log(`   Início: ${firstDayOfWeek.toISOString()}`);
    console.log(`   Fim: ${lastDayOfWeek.toISOString()}`);
    console.log();

    // Buscar todos os certificados recentes (últimos 7 dias)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const allCertificates = await prisma.certificate.findMany({
      where: {
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
      include: {
        User: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log(`📜 Total de certificados nos últimos 7 dias: ${allCertificates.length}\n`);

    for (const cert of allCertificates) {
      const userName = cert.User 
        ? `${cert.User.firstName || ""} ${cert.User.lastName || ""}`.trim() || cert.User.email
        : "Usuário não encontrado";

      const certDate = new Date(cert.createdAt);
      const isInCurrentWeek = certDate >= firstDayOfWeek && certDate <= lastDayOfWeek;

      console.log("=".repeat(80));
      console.log(`📜 Certificado: ${cert.courseTitle}`);
      console.log(`   Usuário: ${userName}`);
      console.log(`   Pontos: ${cert.points}`);
      console.log(`   Criado em: ${certDate.toLocaleString('pt-BR')}`);
      console.log(`   ISO: ${certDate.toISOString()}`);
      console.log(`   Está na semana atual? ${isInCurrentWeek ? "✅ SIM" : "❌ NÃO"}`);
      
      if (!isInCurrentWeek) {
        const daysDiff = Math.floor((today.getTime() - certDate.getTime()) / (1000 * 60 * 60 * 24));
        console.log(`   Diferença: ${daysDiff} dias atrás`);
      }
      console.log();
    }

  } catch (error) {
    console.error("❌ Erro ao verificar certificados:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar se chamado diretamente
checkRecentCertificates()
  .then(() => {
    console.log("✅ Verificação concluída!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Erro:", error);
    process.exit(1);
  });

export default checkRecentCertificates;


