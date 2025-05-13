"use client";
import { ReactNode } from "react";

const Layout = ({ children }: { children: ReactNode }) => {
  return <div className="flex flex-col">{children}</div>;
};

export default Layout;
