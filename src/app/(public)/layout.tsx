import Footer from "@/components/Footer";
import HeaderWithLives from "@/components/HeaderWithLives";
import { ReactNode } from "react";

const HomeLayout = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <HeaderWithLives />
      {children}
      <Footer />
    </>
  );
};

export default HomeLayout;
