"use client";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import Link from "next/link";

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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Termos de consentimento</DialogTitle>
          <DialogDescription>
            Você deve aceitar os termos de consentimento para continuar na nossa
            aplicação.
          </DialogDescription>
        </DialogHeader>

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

        <DialogFooter>
          <Button type="submit" onClick={acceptTerms} disabled={!isChecked}>
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConsentModal;
