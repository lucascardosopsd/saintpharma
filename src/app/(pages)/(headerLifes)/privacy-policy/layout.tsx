import Footer from "@/components/Footer";
import { ReactNode } from "react";

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <>
      {children}
      <Footer />
    </>
  );
};

export default Layout;
