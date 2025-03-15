"use client";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";

const ConsentModal = () => {
  const [open, setOpen] = useState(false);
  const [isChecked, setChecked] = useState(false);

  const getConsent = () => {
    const isConsentChecked = JSON.parse(
      localStorage.getItem("consent") || "false"
    );

    !isConsentChecked ? setOpen(true) : null;
  };

  const acceptTerms = () => {
    localStorage.setItem("consent", "true");
    setOpen(false);
  };

  useEffect(() => {
    getConsent();
  }, []);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Termos de consentimento</AlertDialogTitle>
          <AlertDialogDescription>
            Você deve aceitar os termos de consentimento para continuar na nossa
            aplicação.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            id="checkboxConsent"
            checked={isChecked}
            onChange={(e) => setChecked(e.target.checked)}
            className="h-8 w-8"
          />
          <label htmlFor="checkboxConsent" className="text-primary">
            <Link href="/consent-terms">Ler termos de consentimento</Link>
          </label>
        </div>

        <AlertDialogFooter>
          <Button type="submit" onClick={acceptTerms} disabled={!isChecked}>
            Confirmar
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConsentModal;
