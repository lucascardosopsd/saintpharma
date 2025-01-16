import { getCertificateById } from "@/actions/certification/getById";
import { getCourseById } from "@/actions/courses/getId";
import { getClerkUser } from "@/actions/user/getClerkUser";
import Certificate from "@/components/Certificate";

type CertificatePageProps = {
  params: {
    certificateId: string;
  };
};

const CertificatePage = async ({ params }: CertificatePageProps) => {
  const { certificateId: id } = params;

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
    <>
      <div className="w-full max-w-[800px] mx-auto flex flex-col gap-5 h-screen items-center justify-center pb-20">
        <Certificate certificate={certificate!} course={course} user={user!} />
      </div>
    </>
  );
};

export default CertificatePage;
