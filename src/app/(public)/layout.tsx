import Footer from "@/components/Footer";
import AddToHomeScreen from "@/components/pwaPrompt/AddAppToHomeScreen";
import { ReactNode } from "react";

const HomeLayout = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <AddToHomeScreen />
      {children}
      <Footer />
    </>
  );
};

export default HomeLayout;
