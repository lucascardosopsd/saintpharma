import Footer from "@/components/Footer";
import HeaderWithLives from "@/components/HeaderWithLives";
import AddToHomeScreen from "@/components/pwaPrompt/AddAppToHomeScreen";
import { ReactNode } from "react";

const HomeLayout = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <HeaderWithLives />
      <AddToHomeScreen />
      {children}
      <Footer />
    </>
  );
};

export default HomeLayout;
