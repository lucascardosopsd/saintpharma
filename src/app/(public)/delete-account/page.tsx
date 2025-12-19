import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DeleteAccountPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full space-y-6 p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground">Excluir Conta</h1>
          <p className="mt-2 text-muted-foreground">
            Deseja excluir sua conta do SaintPharma? Para solicitar a exclusão,
            entre em contato conosco através do WhatsApp.
          </p>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <h3 className="font-semibold text-foreground">
              Como solicitar a exclusão:
            </h3>
            <ol className="mt-2 space-y-2 text-sm text-muted-foreground">
              <li>1. Clique no botão abaixo para abrir o WhatsApp</li>
              <li>2. Envie a mensagem pré-preenchida</li>
              <li>3. Aguarde o nosso retorno para confirmar a exclusão</li>
            </ol>
          </div>

          <div className="text-center">
            <Button asChild className="w-full">
              <Link href="https://wa.me/5517996484654?text=Quero%20solicitar%20a%20exclus%C3%A3o%20da%20minha%20a%20conta%20no%20saintpharma">
                Solicitar Exclusão via WhatsApp
              </Link>
            </Button>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <p>Tempo médio de resposta: 24-48 horas</p>
            <p className="mt-1">
              Atenção: Após a exclusão, seus dados não poderão ser recuperados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
