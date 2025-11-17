import HeaderWithLives from "@/components/HeaderWithLives";
import Footer from "@/components/Footer";
import { ReactNode } from "react";

const layout = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <HeaderWithLives />
      {children}
      <Footer />
    </>
  );
};

export default layout;
