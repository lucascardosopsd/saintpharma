import prisma from "../src/lib/prisma";

interface CertificateWithUser {
  id: string;
  courseTitle: string;
  courseCmsId: string;
  points: number;
  userId: string | null;
  createdAt: Date;
  user?: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
    points: number;
  } | null;
}

interface UserWithCertificates {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  points: number;
  certificates: Array<{
    id: string;
    courseTitle: string;
    courseCmsId: string;
    points: number;
    createdAt: Date;
  }>;
}

async function checkPoints() {
  console.log("🔍 Verificando pontos no banco de dados...\n");

  try {
    // Buscar todos os certificados com informações do usuário
    const certificates = await prisma.certificate.findMany({
      include: {
        User: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            points: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log(`📜 Total de certificados encontrados: ${certificates.length}\n`);

    // Agrupar por usuário
    const usersMap = new Map<string, UserWithCertificates>();

    for (const cert of certificates) {
      if (!cert.userId) {
        console.log(`⚠️  Certificado ${cert.id} não tem userId associado`);
        continue;
      }

      if (!usersMap.has(cert.userId)) {
        const user = cert.User;
        if (!user) {
          console.log(`⚠️  Usuário ${cert.userId} não encontrado para certificado ${cert.id}`);
          continue;
        }

        usersMap.set(cert.userId, {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          points: user.points,
          certificates: [],
        });
      }

      const userData = usersMap.get(cert.userId)!;
      userData.certificates.push({
        id: cert.id,
        courseTitle: cert.courseTitle,
        courseCmsId: cert.courseCmsId,
        points: cert.points,
        createdAt: cert.createdAt,
      });
    }

    console.log(`👥 Total de usuários com certificados: ${usersMap.size}\n`);

    // Verificar discrepâncias
    const discrepancies: Array<{
      userId: string;
      userName: string;
      currentPoints: number;
      expectedPoints: number;
      difference: number;
      certificates: Array<{ courseTitle: string; points: number }>;
    }> = [];

    for (const [userId, userData] of usersMap.entries()) {
      const expectedPoints = userData.certificates.reduce(
        (sum, cert) => sum + cert.points,
        0
      );
      const currentPoints = userData.points;
      const difference = expectedPoints - currentPoints;

      if (difference !== 0) {
        const userName = `${userData.firstName || ""} ${userData.lastName || ""}`.trim() || userData.email;
        discrepancies.push({
          userId,
          userName,
          currentPoints,
          expectedPoints,
          difference,
          certificates: userData.certificates.map((c) => ({
            courseTitle: c.courseTitle,
            points: c.points,
          })),
        });
      }
    }

    // Exibir resultados
    console.log("=".repeat(80));
    console.log("📊 RELATÓRIO DE PONTOS");
    console.log("=".repeat(80));
    console.log();

    if (discrepancies.length === 0) {
      console.log("✅ Todos os pontos estão corretos!\n");
    } else {
      console.log(`❌ Encontradas ${discrepancies.length} discrepâncias:\n`);

      for (const disc of discrepancies) {
        console.log(`👤 Usuário: ${disc.userName}`);
        console.log(`   Email: ${usersMap.get(disc.userId)?.email}`);
        console.log(`   Pontos atuais: ${disc.currentPoints}`);
        console.log(`   Pontos esperados: ${disc.expectedPoints}`);
        console.log(`   Diferença: ${disc.difference > 0 ? "+" : ""}${disc.difference}`);
        console.log(`   Certificados:`);
        disc.certificates.forEach((cert, idx) => {
          console.log(`     ${idx + 1}. ${cert.courseTitle} - ${cert.points} pontos`);
        });
        console.log();
      }
    }

    // Estatísticas gerais
    console.log("=".repeat(80));
    console.log("📈 ESTATÍSTICAS GERAIS");
    console.log("=".repeat(80));
    console.log();

    const totalCertificates = certificates.length;
    const totalPointsInCertificates = certificates.reduce(
      (sum, cert) => sum + cert.points,
      0
    );
    const totalUserPoints = Array.from(usersMap.values()).reduce(
      (sum, user) => sum + user.points,
      0
    );

    console.log(`Total de certificados: ${totalCertificates}`);
    console.log(`Total de pontos nos certificados: ${totalPointsInCertificates}`);
    console.log(`Total de pontos dos usuários: ${totalUserPoints}`);
    console.log(
      `Diferença total: ${totalPointsInCertificates - totalUserPoints}`
    );
    console.log();

    // Opção de correção
    if (discrepancies.length > 0) {
      console.log("=".repeat(80));
      console.log("🔧 CORREÇÃO");
      console.log("=".repeat(80));
      console.log();
      console.log("Para corrigir os pontos, execute:");
      console.log("  npm run fix-points");
      console.log();
    }

    return { discrepancies, usersMap, certificates };
  } catch (error) {
    console.error("❌ Erro ao verificar pontos:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar se chamado diretamente
const isMainModule = process.argv[1]?.endsWith('check-points.ts') || 
                     process.argv[1]?.includes('check-points');

if (isMainModule) {
  checkPoints()
    .then(() => {
      console.log("✅ Verificação concluída!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Erro:", error);
      process.exit(1);
    });
}

export default checkPoints;

