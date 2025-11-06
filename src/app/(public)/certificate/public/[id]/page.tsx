import { getCertificateById } from "@/actions/certification/getById";
import { getCourseById } from "@/actions/courses/getId";
import { getUserById } from "@/actions/user/getUserByClerk";
import Certificate from "@/components/Certificate";
import { notFound } from "next/navigation";

type PublicCertificatePageProps = {
  params: {
    id: string;
  };
};

const PublicCertificatePage = async ({ params }: PublicCertificatePageProps) => {
  const { id: certificateId } = params;

  // Buscar certificado
  const certificate = await getCertificateById({ id: certificateId });

  if (!certificate) {
    notFound();
  }

  // Buscar curso
  const course = await getCourseById({ id: certificate.courseCmsId });

  if (!course) {
    return (
      <div className="h-[92svh] w-full flex items-center justify-center">
        <p>Este curso não está mais disponível.</p>
      </div>
    );
  }

  // Buscar usuário pelo ID do banco
  if (!certificate.userId) {
    return (
      <div className="h-[92svh] w-full flex items-center justify-center">
        <p>Certificado inválido.</p>
      </div>
    );
  }

  const user = await getUserById(certificate.userId);

  if (!user) {
    return (
      <div className="h-[92svh] w-full flex items-center justify-center">
        <p>Usuário não encontrado.</p>
      </div>
    );
  }

  // Converter dados do usuário do banco para formato compatível com o componente Certificate
  // O componente espera um User do Clerk, mas vamos criar um objeto compatível
  const clerkUserLike = {
    id: user.clerkId,
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    emailAddresses: [{ emailAddress: user.email }],
    imageUrl: user.profileImage || "",
    primaryEmailAddressId: user.email,
  } as any;

  return (
    <div className="min-h-[92svh]">
      <div className="container max-w-4xl mx-auto py-8">
        <div className="px-5 md:px-0 mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
            Certificado
          </h1>
          <p className="text-muted-foreground">
            Certificado de conclusão do curso: {course.name}
          </p>
        </div>

        <div className="px-5 md:px-0 flex justify-center">
          <Certificate 
            certificate={certificate} 
            course={course} 
            user={clerkUserLike} 
          />
        </div>
      </div>
    </div>
  );
};

export default PublicCertificatePage;

