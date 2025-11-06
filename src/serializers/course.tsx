import { getUrlParam } from "@/tools/getUrlParm";
import { PortableTextComponents } from "next-sanity";
import Image from "next/image";

export const LecturePageSerializer: PortableTextComponents = {
  types: {
    youtubeUrl: ({ value }) => {
      const videoId = getUrlParam(value.url, "v");

      return (
        <div className="my-8 rounded-xl overflow-hidden shadow-lg">
          <iframe
            style={{
              width: "100%",
            }}
            className="rounded-xl w-full h-[400px] md:h-[500px] lg:h-[600px]"
            src={`https://www.youtube.com/embed/${videoId}`}
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      );
    },
    image: ({ value }) => {
      if (!value?.imageUrl) return null;
      return (
        <figure className="my-8">
          <div className="rounded-xl overflow-hidden shadow-lg">
            <Image
              height={1000}
              width={1000}
              className="w-full h-auto object-cover"
              src={value.imageUrl}
              alt={value.caption || "Imagem"}
            />
          </div>
          {value.caption && (
            <figcaption className="text-center text-sm text-muted-foreground mt-3 italic">
              {value.caption}
            </figcaption>
          )}
        </figure>
      );
    },
  },
  block: {
    normal: ({ children }) => (
      <p className="my-6 text-foreground leading-relaxed text-base md:text-lg [&>a]:text-primary [&>a]:font-medium hover:[&>a]:underline">{children}</p>
    ),
    h1: ({ children }) => (
      <h1 className="text-4xl md:text-5xl font-bold text-foreground mt-10 mb-6 leading-tight">{children}</h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-8 mb-4 leading-tight">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-2xl md:text-3xl font-bold text-foreground mt-6 mb-3 leading-tight">{children}</h3>
    ),
    h4: ({ children }) => (
      <h4 className="text-xl md:text-2xl font-semibold text-foreground mt-6 mb-3">{children}</h4>
    ),
    h5: ({ children }) => (
      <h5 className="text-lg md:text-xl font-semibold text-foreground mt-4 mb-2">{children}</h5>
    ),
    h6: ({ children }) => (
      <h6 className="text-base md:text-lg font-semibold text-foreground mt-4 mb-2">{children}</h6>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-primary pl-6 my-6 italic text-muted-foreground text-lg">{children}</blockquote>
    ),
    ul: ({ children }) => (
      <ul className="my-6 space-y-2 list-disc list-inside text-foreground">{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className="my-6 space-y-2 list-decimal list-inside text-foreground">{children}</ol>
    ),
  },

  marks: {
    link: ({ children, value }) => {
      const { href, target } = value;

      if (!href) return children;

      const isExternal = href.startsWith("http");

      return (
        <a
          href={href}
          target={isExternal ? "_blank" : target || "_self"}
          rel={isExternal ? "noopener noreferrer" : undefined}
          className="text-primary underline hover:text-primary-dark transition-colors"
        >
          {children}
        </a>
      );
    },
    strong: ({ children }) => <strong className="font-bold">{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,
  },
};
