"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import { Button } from "./ui/button";
import { deleteAccount } from "@/actions/user/deleteAccount";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

const DeleteAccountModal = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      await deleteAccount();
      toast.success("Conta excluída com sucesso");
      router.push("/");
    } catch (error) {
      toast.error("Erro ao excluir conta. Tente novamente.");
      console.error("Erro ao excluir conta:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" className="w-full mt-4">
          <Trash2 className="w-4 h-4 mr-2" />
          Excluir Conta
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir Conta</AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação não pode ser desfeita. Isso excluirá permanentemente sua
            conta e removerá todos os seus dados de nossos servidores, incluindo:
            <br />
            <br />
            • Seu perfil e informações pessoais
            <br />
            • Certificados obtidos
            <br />
            • Progresso em cursos e aulas
            <br />
            • Histórico de exames
            <br />
            • Pontuação e conquistas
            <br />
            <br />
            Tem certeza de que deseja excluir sua conta?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteAccount}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Excluindo..." : "Sim, excluir conta"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteAccountModal;