import Header from "@/components/Header";
import { ReactNode } from "react";

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <Header backIcon />
      {children}
    </>
  );
};

export default Layout;
