"use server";
import prisma from "@/lib/prisma";
import { CourseProps } from "@/types/course";
import { currentUser } from "@clerk/nextjs/server";
import { getUserByClerk } from "@/actions/user/getUserByClerk";
import { logAuditEvent } from "@/lib/auth";

/**
 * Função auxiliar para garantir que o certificado seja serializável
 */
function serializeCertificate(cert: any) {
  return {
    id: String(cert.id || ''),
    courseCmsId: String(cert.courseCmsId || ''),
    courseTitle: String(cert.courseTitle || ''),
    description: String(cert.description || ''),
    workload: Number(cert.workload || 0),
    points: Number(cert.points || 0),
    userId: cert.userId ? String(cert.userId) : null,
    createdAt: cert.createdAt instanceof Date 
      ? cert.createdAt.toISOString() 
      : typeof cert.createdAt === 'string' 
        ? cert.createdAt 
        : cert.createdAt 
          ? new Date(cert.createdAt).toISOString() 
          : new Date().toISOString(),
    updatedAt: cert.updatedAt instanceof Date 
      ? cert.updatedAt.toISOString() 
      : typeof cert.updatedAt === 'string' 
        ? cert.updatedAt 
        : cert.updatedAt 
          ? new Date(cert.updatedAt).toISOString() 
          : new Date().toISOString(),
  };
}

type CreateCertificationProps = {
  userId: string;
  course: CourseProps;
};

export const createCertificate = async ({
  userId,
  course,
}: CreateCertificationProps) => {
  console.log("[createCertificate] Iniciando criação de certificado", {
    userId,
    courseId: course._id,
    courseName: course.name,
    coursePoints: course.points,
    courseWorkload: course.workload,
  });

  try {
    const certificate = await prisma.certificate.create({
      data: {
        courseCmsId: course._id,
        courseTitle: course.name,
        description: course.description,
        workload: course.workload,
        points: course.points,
        userId: userId,
      },
    });

    console.log("[createCertificate] Certificado criado no banco:", {
      id: certificate.id,
      courseCmsId: certificate.courseCmsId,
      userId: certificate.userId,
      points: certificate.points,
      certificateType: typeof certificate,
      hasId: !!certificate.id,
    });

    // Award points to user for completing the course
    if (course.points && course.points > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          points: {
            increment: course.points,
          },
        },
      });

      console.log(
        `[POINTS] User ${userId} earned ${course.points} points for completing course ${course._id}`
      );
    }

    // Serializar o objeto Prisma para garantir que seja enviado corretamente ao cliente
    const serialized = JSON.parse(JSON.stringify(certificate));
    
    console.log("[createCertificate] Certificado serializado:", {
      id: serialized.id,
      hasId: !!serialized.id,
      keys: Object.keys(serialized),
      serializedType: typeof serialized,
    });

    return serialized;
  } catch (error) {
    console.error("[createCertificate] Erro ao criar certificado:", error);
    if (error instanceof Error) {
      console.error("[createCertificate] Erro detalhado:", {
        message: error.message,
        stack: error.stack,
      });
    }
    throw new Error("Error when create certification");
  }
};

/**
 * Action wrapper que cria certificado com autenticação e auditoria
 * Valida que o usuário está autenticado e que o userId corresponde ao usuário logado
 */
export const createCertificateForUser = async ({
  course,
}: {
  course: CourseProps;
}) => {
  console.log("[createCertificateForUser] Iniciando processo", {
    courseId: course._id,
    courseName: course.name,
    courseType: typeof course,
    courseKeys: Object.keys(course || {}),
  });

  try {
    // Validar autenticação
    console.log("[createCertificateForUser] Verificando autenticação...");
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      console.error("[createCertificateForUser] Usuário não autenticado");
      throw new Error("Usuário não autenticado");
    }

    console.log("[createCertificateForUser] Usuário autenticado:", {
      clerkId: clerkUser.id,
      email: clerkUser.emailAddresses[0]?.emailAddress,
    });

    // Buscar usuário no banco de dados
    console.log("[createCertificateForUser] Buscando usuário no banco...");
    const user = await getUserByClerk(clerkUser);
    
    if (!user) {
      console.error("[createCertificateForUser] Usuário não encontrado no banco");
      throw new Error("Usuário não encontrado");
    }

    const userName = user.firstName && user.lastName 
      ? `${user.firstName} ${user.lastName}` 
      : user.firstName || "Usuário";
    
    console.log("[createCertificateForUser] Usuário encontrado:", {
      userId: user.id,
      userName: userName,
      userType: typeof user,
      userKeys: Object.keys(user || {}),
    });

    // Verificar se já existe certificado para este curso
    console.log("[createCertificateForUser] Verificando certificado existente...", {
      userId: user.id,
      courseCmsId: course._id,
    });

    const existingCertificate = await prisma.certificate.findFirst({
      where: {
        userId: user.id,
        courseCmsId: course._id,
      },
    });

    if (existingCertificate) {
      console.log("[createCertificateForUser] Certificado já existe:", {
        id: existingCertificate.id,
        courseCmsId: existingCertificate.courseCmsId,
        hasId: !!existingCertificate.id,
      });

      try {
        // Serializar o objeto Prisma para garantir que seja enviado corretamente ao cliente
        const serialized = JSON.parse(JSON.stringify(existingCertificate));
        
        console.log("[createCertificateForUser] Certificado existente serializado:", {
          id: serialized.id,
          hasId: !!serialized.id,
          keys: Object.keys(serialized),
          serializedString: JSON.stringify(serialized),
        });

        // Garantir que temos um objeto válido com ID
        if (!serialized || !serialized.id) {
          console.error("[createCertificateForUser] Erro na serialização do certificado existente");
          throw new Error("Erro ao serializar certificado existente");
        }

        // Usar função auxiliar para garantir serialização correta
        const result = serializeCertificate(serialized);

        // Validar que o objeto pode ser serializado
        try {
          const testSerialization = JSON.stringify(result);
          console.log("[createCertificateForUser] Serialização testada com sucesso, tamanho:", testSerialization.length);
        } catch (serializeError) {
          console.error("[createCertificateForUser] Erro ao serializar resultado:", serializeError);
          throw new Error("Erro ao serializar certificado");
        }

        // Validar antes de retornar
        if (!result.id) {
          throw new Error("Certificado existente não tem ID válido");
        }

        console.log("[createCertificateForUser] Retornando certificado existente:", {
          result,
          resultString: JSON.stringify(result),
          hasId: !!result.id,
        });

        // Retornar objeto serializado explicitamente
        return JSON.parse(JSON.stringify(result));
      } catch (error) {
        console.error("[createCertificateForUser] Erro ao processar certificado existente:", error);
        throw error;
      }
    }

    console.log("[createCertificateForUser] Nenhum certificado existente, criando novo...");

    // Criar certificado
    const certificate = await createCertificate({
      userId: user.id,
      course,
    });

    console.log("[createCertificateForUser] Certificado retornado de createCertificate:", {
      certificate: certificate,
      type: typeof certificate,
      isNull: certificate === null,
      isUndefined: certificate === undefined,
      hasId: certificate?.id ? true : false,
      id: certificate?.id,
      keys: certificate ? Object.keys(certificate) : [],
    });

    // Validar que o certificado foi criado corretamente
    if (!certificate || !certificate.id) {
      console.error("[createCertificateForUser] Certificado inválido:", {
        certificate,
        hasCertificate: !!certificate,
        hasId: certificate?.id ? true : false,
        id: certificate?.id,
      });
      throw new Error("Erro ao criar certificado: certificado inválido");
    }

    console.log("[createCertificateForUser] Certificado válido, adicionando log de auditoria...");

    // Log de auditoria
    logAuditEvent(user.id, "CREATE", "certificate", certificate.id, {
      courseTitle: course.name,
      courseId: course._id,
      points: certificate.points,
      workload: certificate.workload,
    });

    console.log("[createCertificateForUser] Retornando certificado final:", {
      id: certificate.id,
      hasId: !!certificate.id,
      keys: Object.keys(certificate),
    });

    // Usar função auxiliar para garantir serialização correta
    const result = serializeCertificate(certificate);

    // Validar que o objeto pode ser serializado
    try {
      const testSerialization = JSON.stringify(result);
      console.log("[createCertificateForUser] Serialização testada com sucesso, tamanho:", testSerialization.length);
    } catch (serializeError) {
      console.error("[createCertificateForUser] Erro ao serializar resultado:", serializeError);
      throw new Error("Erro ao serializar certificado");
    }

    // Validar antes de retornar
    if (!result.id) {
      throw new Error("Certificado criado não tem ID válido");
    }

    console.log("[createCertificateForUser] Retornando certificado criado:", {
      result,
      resultString: JSON.stringify(result),
      hasId: !!result.id,
    });

    // Retornar objeto serializado explicitamente
    return JSON.parse(JSON.stringify(result));
  } catch (error) {
    console.error("[createCertificateForUser] Erro capturado:", error);
    if (error instanceof Error) {
      console.error("[createCertificateForUser] Detalhes do erro:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
    }
    throw error;
  }
};
