import HeaderWithLives from "@/components/HeaderWithLives";
import { ReactNode } from "react";

const layout = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <HeaderWithLives />
      {children}
    </>
  );
};

export default layout;
