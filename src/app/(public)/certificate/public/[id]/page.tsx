import { getCertificateById } from "@/actions/certification/getById";
import { getCourseById } from "@/actions/courses/getId";
import { getUserById } from "@/actions/user/getUserByClerk";
import Certificate from "@/components/Certificate";
import { notFound } from "next/navigation";

type PublicCertificatePageProps = {
  params: Promise<{
    id: string;
  }>;
};

const PublicCertificatePage = async ({ params }: PublicCertificatePageProps) => {
  // Next.js 15: params agora é uma Promise e precisa ser aguardado
  const { id: certificateId } = await params;

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
    <div className="min-h-[92svh] bg-gradient-to-br from-background via-primary/5 to-background">
      <div className="container max-w-6xl mx-auto py-8 md:py-12">
        {/* Header Section */}
        <div className="px-5 md:px-0 mb-8 md:mb-12">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <svg
                className="w-8 h-8 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                />
              </svg>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-3 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Certificado de Conclusão
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
              Parabéns! Você concluiu com sucesso o curso
            </p>
            <div className="mt-4 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <p className="text-primary font-semibold text-lg">{course.name}</p>
            </div>
          </div>
        </div>

        {/* Certificate Container */}
        <div className="px-5 md:px-0">
          <div className="relative">
            {/* Decorative elements */}
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-3xl blur-2xl opacity-50 -z-10" />
            
            <div className="relative bg-card rounded-2xl shadow-2xl border border-primary/20 p-4 md:p-8">
              <div className="flex justify-center">
                <Certificate 
                  certificate={certificate} 
                  course={course} 
                  user={clerkUserLike} 
                />
              </div>
            </div>
          </div>

          {/* Info Section */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 px-5 md:px-0">
            <div className="bg-card rounded-xl p-4 border border-primary/10 shadow-sm">
              <p className="text-sm text-muted-foreground mb-1">Carga Horária</p>
              <p className="text-xl font-bold text-primary">{course.workload} horas</p>
            </div>
            <div className="bg-card rounded-xl p-4 border border-primary/10 shadow-sm">
              <p className="text-sm text-muted-foreground mb-1">Data de Conclusão</p>
              <p className="text-xl font-bold text-primary">
                {new Date(certificate.createdAt).toLocaleDateString('pt-BR')}
              </p>
            </div>
            <div className="bg-card rounded-xl p-4 border border-primary/10 shadow-sm">
              <p className="text-sm text-muted-foreground mb-1">Plataforma</p>
              <p className="text-xl font-bold text-primary">SaintPharma Cursos</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicCertificatePage;

