import Image from "next/image";
import Link from "next/link";

const Logo = () => {
  return (
    <Link href="/" className="flex gap-1 items-center">
      <Image
        src="/logo.png"
        alt="Logo"
        height={1000}
        width={1000}
        className="h-10 w-auto"
      />
      <p className="font-bold text-primary">SainTPharma</p>
    </Link>
  );
};

export default Logo;
