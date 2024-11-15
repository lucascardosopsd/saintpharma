import { getCourseById } from "@/actions/courses/getId";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { useClerkUser } from "@/hooks/clerkUser";
import { getUrlParam } from "@/tools/getUrlParm";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { PortableText, PortableTextComponents } from "next-sanity";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Separator } from "@/components/ui/separator";

type CoursePageProps = {
  params?: Promise<{
    id: string;
  }>;
};

const CoursePage = async ({ params }: CoursePageProps) => {
  const id = (await params)?.id;

  if (!id) {
    redirect("/");
  }

  const course = await getCourseById({ id });
  const user = await useClerkUser();

  const serializers: PortableTextComponents = {
    types: {
      youtubeUrl: ({ value }) => {
        const videoId = getUrlParam(value.url, "v");

        return (
          <iframe
            className="rounded w-full h-[400px] tablet:h-[500px]"
            src={`https://www.youtube.com/embed/${videoId}`}
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        );
      },
      image: ({ value }) => {
        if (!value?.imageUrl) return null;
        return (
          <figure>
            <Image
              height={1000}
              width={1000}
              className="w-full h-auto max-w-[500px] mx-auto"
              src={value.imageUrl}
              alt={value.caption || "Imagem"}
            />
            {value.caption && <figcaption>{value.caption}</figcaption>}
          </figure>
        );
      },
    },
    block: {
      normal: ({ children }) => (
        <p className="my-4 [&>a]:text-primary">{children}</p>
      ),
      h1: ({ children }) => (
        <h1 className="text-4xl font-semibold text-primary">{children}</h1>
      ),
      h2: ({ children }) => (
        <h2 className="text-3xl font-semibold text-primary">{children}</h2>
      ),
      h3: ({ children }) => (
        <h3 className="text-2xl font-semibold text-primary">{children}</h3>
      ),
      h4: ({ children }) => (
        <h4 className="text-xl font-semibold text-primary">{children}</h4>
      ),
      h5: ({ children }) => (
        <h5 className="text-lg font-semibold text-primary">{children}</h5>
      ),
      h6: ({ children }) => (
        <h6 className="text-md font-semibold text-primary">{children}</h6>
      ),
    },

    marks: {
      strong: ({ children }) => (
        <strong className="font-bold">{children}</strong>
      ),
      em: ({ children }) => <em className="italic">{children}</em>,
    },
  };

  return (
    <div>
      <Header user={user} />
      <div className="w-full max-w-[1200px] mx-auto h-[90svh] overflow-y-auto ">
        <div className="h-[250px] w-full relative flex items-end  group overflow-hidden cursor-pointer">
          <Image
            src={course.banner.asset.url}
            alt="Imagem curso"
            height={1000}
            width={1000}
            className="w-full h-full  object-cover absolute -z-50 left-0 top-0 group-hover:scale-125 transition-all"
          />

          <div className="h-full w-full absolute left-0 top-0 bg-gradient-to-t from-primary to-transparent z-10 tablet:rounded" />
        </div>

        <div className="flex justify-between bg-primary p-5 w-full z-50 text-background font-semibold">
          <p className="text-semibold">{course.name}</p>
          <p className="text-semibold">{course.workload} hrs</p>
        </div>

        <div className="p-5">
          <PortableText value={course.content} components={serializers} />
        </div>

        <Separator orientation="horizontal" />

        <div className="flex flex-col w-full items-center justify-center h-[400px] max-w-[500px] mx-auto px-5">
          <SignedIn>
            <p className="text-2xl text-primary font-semibold">
              Curso concluído
            </p>
            <p>Garanta seu certificado</p>
            <Link href="#" className="w-full">
              <Button size="lg" className="w-full text-lg">
                Certificar
              </Button>
            </Link>
          </SignedIn>

          <SignedOut>
            <p className="text-2xl text-primary font-semibold">
              Curso concluído
            </p>
            <p>Faça login para a certificação</p>
            <Link href="/sign-in" className="w-full">
              <Button size="lg" className="w-full text-lg">
                Entrar
              </Button>
            </Link>
          </SignedOut>
        </div>
      </div>
    </div>
  );
};

export default CoursePage;
