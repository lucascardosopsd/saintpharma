import ConsentModal from "@/components/ConsentModal";
import { ReactNode } from "react";

const layout = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <ConsentModal />
      {children}
    </>
  );
};

export default layout;
