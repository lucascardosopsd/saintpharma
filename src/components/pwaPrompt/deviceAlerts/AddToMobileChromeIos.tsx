import { ArrowUp, Share, SquarePlus } from "lucide-react";
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
        <AlertDialogContent className="rounded h-screen flex items-center justify-center flex-col">
          <ArrowUp className="text-4xl absolute top-[10px] right-[10px] text-primary z-50 animate-bounce" />

          <div className="flex flex-col gap-2 items-center justify-center text-lg">
            <p>1.Abra o Safari</p>
            <div className="flex gap-2">
              <p>2.Clique no icone de compartilhar</p>
              <Share className="text-4xl" />
            </div>
          </div>
          <div className="flex flex-col gap-2 items-center justify-center text-lg w-full px-4">
            <p className="text-center">3. Role para baixo:</p>

            <div className="flex">
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
