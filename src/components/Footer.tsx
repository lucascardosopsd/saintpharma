import Link from "next/link";

const Footer = () => {
  return (
    <div className="border-t border-border flex flex-col tablet:flex-row tablet:items-center justify-between w-full p-5">
      <p className="text-primary font-semibold">SainTPharma Cursos</p>

      <div>
        <Link href="/privacy-policy" className="text-primary">
          <p>Politica de privacidade</p>
        </Link>

        <Link href="mailto:cristinawandeur@gmail.com" className="text-primary">
          <p>Contato</p>
        </Link>
      </div>
    </div>
  );
};

export default Footer;
