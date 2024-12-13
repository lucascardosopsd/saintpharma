import { ArrowDown, Share, SquarePlus } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface Props {
  doNotShowAgain: () => void;
}

export default function AddToMobileChromeIos(props: Props) {
  const { doNotShowAgain } = props;
  const [open, setOpen] = useState(true);

  return (
    <>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTitle></AlertDialogTitle>
        <AlertDialogContent className="rounded h-svh flex items-center justify-center flex-col">
          <ArrowDown className="text-4xl absolute mx-auto bottom-2 text-primary z-50 animate-bounce" />

          <div className="flex gap-2 items-center justify-center text-lg">
            <p>1.Clique no icone de compartilhar</p>
            <Share className="text-4xl" />
          </div>
          <div className="flex flex-col gap-2 items-center justify-center text-lg w-full px-4">
            <p className="text-center">2. Role para baixo</p>

            <div className="flex gap-2">
              <p>3. Adicionar à tela de Início</p>
              <SquarePlus />
            </div>
          </div>

          <div className="flex flex-col w-full">
            <AlertDialogCancel asChild>
              <Button>Fechar</Button>
            </AlertDialogCancel>

            <AlertDialogCancel className="border-none" asChild>
              <p onClick={doNotShowAgain}>Não mostrar novamente</p>
            </AlertDialogCancel>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
