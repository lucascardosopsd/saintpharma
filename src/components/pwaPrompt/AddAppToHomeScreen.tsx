"use client";

import { useState, useEffect } from "react";
import { setCookie, getCookie } from "cookies-next";

import useUserAgent from "@/hooks/useUserAgent";
import AddToIosSafari from "./deviceAlerts/AddToIosSafari";
import AddToMobileChrome from "./deviceAlerts/AddToMobileChrome";
import AddToMobileChromeIos from "./deviceAlerts/AddToMobileChromeIos";

type AddToHomeScreenPromptType = "safari" | "chrome" | "chromeIos" | "";
const COOKIE_NAME = "addToHomeScreenPrompt";

export default function AddToHomeScreen() {
  const [displayPrompt, setDisplayPrompt] =
    useState<AddToHomeScreenPromptType>("");
  const { userAgent, isMobile, isStandalone, isIOS } = useUserAgent();

  const doNotShowAgain = () => {
    // Create date 1 year from now
    const date = new Date();
    date.setFullYear(date.getFullYear() + 1);
    setCookie(COOKIE_NAME, "dontShow", { expires: date }); // Set cookie for a year
    setDisplayPrompt("");
  };

  useEffect(() => {
    const addToHomeScreenPromptCookie = getCookie(COOKIE_NAME);

    if (!addToHomeScreenPromptCookie) {
      // Only show prompt if user is on mobile and app is not installed
      if (isMobile && !isStandalone) {
        console.log(userAgent);
        userAgent === "Safari" && setDisplayPrompt("safari");
        userAgent === "Chrome" && setDisplayPrompt("chrome");
        userAgent === "ChromeiOS" && setDisplayPrompt("chromeIos");
      }
    }
  }, [userAgent, isMobile, isStandalone, isIOS]);

  const Prompt = () => (
    <>
      {
        {
          "safari": <AddToIosSafari doNotShowAgain={doNotShowAgain} />,
          "chrome": <AddToMobileChrome doNotShowAgain={doNotShowAgain} />,
          "chromeIos": <AddToMobileChromeIos doNotShowAgain={doNotShowAgain} />,
          "": <></>,
        }[displayPrompt]
      }
    </>
  );

  return <Prompt />;
}
