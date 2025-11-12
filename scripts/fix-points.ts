import prisma from "../src/lib/prisma";

// Importar a função checkPoints sem executar o script
async function runCheckPoints() {
  // Reimplementar a lógica de verificação aqui para evitar execução automática
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

  const usersMap = new Map<string, {
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
  }>();

  for (const cert of certificates) {
    if (!cert.userId || !cert.User) continue;

    if (!usersMap.has(cert.userId)) {
      usersMap.set(cert.userId, {
        id: cert.User.id,
        firstName: cert.User.firstName,
        lastName: cert.User.lastName,
        email: cert.User.email,
        points: cert.User.points,
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

  return { discrepancies, usersMap, certificates };
}

async function fixPoints() {
  console.log("🔧 Corrigindo pontos no banco de dados...\n");

  try {
    // Primeiro, verificar os pontos
    const { discrepancies } = await runCheckPoints();

    if (discrepancies.length === 0) {
      console.log("✅ Não há pontos para corrigir!");
      return;
    }

    console.log(`\n🔨 Corrigindo ${discrepancies.length} usuários...\n`);

    let fixed = 0;
    let errors = 0;

    for (const disc of discrepancies) {
      try {
        const newPoints = disc.expectedPoints;

        await prisma.user.update({
          where: { id: disc.userId },
          data: { points: newPoints },
        });

        console.log(
          `✅ ${disc.userName}: ${disc.currentPoints} → ${newPoints} pontos (+${disc.difference})`
        );
        fixed++;
      } catch (error) {
        console.error(
          `❌ Erro ao corrigir pontos de ${disc.userName}:`,
          error
        );
        errors++;
      }
    }

    console.log("\n" + "=".repeat(80));
    console.log("📊 RESULTADO DA CORREÇÃO");
    console.log("=".repeat(80));
    console.log(`✅ Corrigidos: ${fixed}`);
    console.log(`❌ Erros: ${errors}`);
    console.log();

    // Verificar novamente após correção
    console.log("🔍 Verificando novamente...\n");
    const { discrepancies: remainingDiscrepancies } = await runCheckPoints();
    if (remainingDiscrepancies.length === 0) {
      console.log("✅ Todos os pontos foram corrigidos com sucesso!");
    } else {
      console.log(`⚠️  Ainda há ${remainingDiscrepancies.length} discrepâncias restantes.`);
    }
  } catch (error) {
    console.error("❌ Erro ao corrigir pontos:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar se chamado diretamente
fixPoints()
  .then(() => {
    console.log("✅ Correção concluída!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Erro:", error);
    process.exit(1);
  });

export default fixPoints;

