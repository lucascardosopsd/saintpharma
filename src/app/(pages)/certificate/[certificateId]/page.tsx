import { getCertificateById } from "@/actions/certification/getById";
import { getCourseById } from "@/actions/courses/getId";
import { getClerkUser } from "@/actions/user/getClerkUser";
import Certificate from "@/components/Certificate";

type CertificatePageProps = {
  params: Promise<{
    certificateId: string;
  }>;
};

const CertificatePage = async ({ params }: CertificatePageProps) => {
  const { certificateId: id } = await params;

  const user = await getClerkUser();

  const certificate = await getCertificateById({ id });

  const course = await getCourseById({ id: certificate?.courseCmsId! });

  return (
    <>
      <div className="w-full max-w-[800px] mx-auto flex flex-col gap-5 h-screen items-center justify-center">
        <Certificate certificate={certificate!} course={course} user={user!} />
      </div>
    </>
  );
};

export default CertificatePage;
