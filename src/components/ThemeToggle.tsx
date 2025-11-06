"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Evita hidratação mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="default" size="icon" className="p-1 group">
        <Sun className="h-4 w-4 stroke-primary group-hover:stroke-primary-foreground transition-colors" />
      </Button>
    );
  }

  return (
    <Button
      variant="default"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-1 group"
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4 stroke-primary group-hover:stroke-primary-foreground transition-colors" />
      ) : (
        <Moon className="h-4 w-4 stroke-primary group-hover:stroke-primary-foreground transition-colors" />
      )}
    </Button>
  );
}

