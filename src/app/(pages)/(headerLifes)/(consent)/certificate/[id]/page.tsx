import { getCertificateById } from "@/actions/certification/getById";
import { getCourseById } from "@/actions/courses/getId";
import { getClerkUser } from "@/actions/user/getClerkUser";
import Certificate from "@/components/Certificate";
import { requireAuth } from "@/lib/authGuard";

type CertificatePageProps = {
  params: {
    id: string;
  };
};

const CertificatePage = async ({ params }: CertificatePageProps) => {
  await requireAuth();
  const { id } = params;

  const user = await getClerkUser();

  const certificate = await getCertificateById({ id });

  const course = await getCourseById({ id: certificate?.courseCmsId! });

  if (!course) {
    return (
      <div className="h-[92svh] w-full flex items-center justify-center">
        <p>Este curso não está mais disponível.</p>
      </div>
    );
  }

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
          <Certificate certificate={certificate!} course={course} user={user!} />
        </div>
      </div>
    </div>
  );
};

export default CertificatePage;
