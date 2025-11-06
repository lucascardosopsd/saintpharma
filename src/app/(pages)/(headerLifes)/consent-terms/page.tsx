import { Separator } from "@/components/ui/separator";

export const dynamic = "force-dynamic";

const ConsentTermPage = () => {
  return (
    <div className="min-h-[92svh]">
      <div className="container max-w-4xl mx-auto py-8">
        <div className="px-5 md:px-0 mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3">
            Termo de Consentimento
          </h1>
          <p className="text-muted-foreground">
            Última atualização: 14/03/2025
          </p>
        </div>

        <div className="px-5 md:px-0 space-y-8 pb-12">
          <div className="bg-card rounded-xl p-6 shadow-sm border">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">1. Identificação</h2>
            <ul className="list-disc pl-6 space-y-2 text-foreground">
              <li>
                Nome da Aplicação: <strong className="text-primary">SaintPharma</strong>
              </li>
              <li>
                Responsável: <strong className="text-primary">Cristina Cristina Wandeur</strong>
              </li>
              <li>
                E-mail: <strong className="text-primary">cristinawandeur@gmail.com</strong>
              </li>
            </ul>
          </div>

          <div className="bg-card rounded-xl p-6 shadow-sm border">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              2. Dados Coletados e Finalidade
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-foreground">
              <li>
                <strong>Dados Coletados:</strong> Nome, e-mail, foto de usuário
              </li>
              <li>
                <strong>Finalidade:</strong> Login, criação de certificados e
                contato
              </li>
            </ul>
          </div>

          <div className="bg-card rounded-xl p-6 shadow-sm border">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              3. Consentimento do Usuário
            </h2>
            <p className="text-foreground leading-relaxed">
              Ao aceitar este termo, o usuário concorda com a coleta e uso dos dados
              para as finalidades descritas.
            </p>
          </div>

          <div className="bg-card rounded-xl p-6 shadow-sm border">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              4. Direitos do Usuário
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-foreground">
              <li>Solicitar acesso, correção ou exclusão dos dados</li>
              <li>Revogar o consentimento a qualquer momento</li>
            </ul>
          </div>

          <div className="bg-card rounded-xl p-6 shadow-sm border">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              5. Compartilhamento de Dados
            </h2>
            <p className="text-foreground leading-relaxed">
              Os dados podem ser compartilhados com serviços de banco de dados e
              login, como o Clerk.
            </p>
          </div>

          <div className="bg-card rounded-xl p-6 shadow-sm border">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              6. Tempo de Retenção
            </h2>
            <p className="text-foreground leading-relaxed">
              Os dados serão armazenados até a solicitação de exclusão pelo usuário.
            </p>
          </div>

          <div className="bg-card rounded-xl p-6 shadow-sm border">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              7. Segurança dos Dados
            </h2>
            <p className="text-foreground leading-relaxed">
              Os dados são protegidos por criptografia no banco de dados e nos
              serviços do Clerk.
            </p>
          </div>

          <div className="bg-card rounded-xl p-6 shadow-sm border">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              8. Alterações no Termo
            </h2>
            <p className="text-foreground leading-relaxed">
              Os usuários serão informados sobre eventuais atualizações no termo.
            </p>
          </div>

          <div className="bg-card rounded-xl p-6 shadow-sm border">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              9. Revogação do Consentimento
            </h2>
            <p className="text-foreground leading-relaxed">
              Para revogar o consentimento ou excluir os dados, envie um e-mail para{" "}
              <strong className="text-primary">cristinawandeur@gmail.com</strong>.
            </p>
          </div>

          <Separator className="my-8" />

          <div className="bg-card rounded-xl p-6 shadow-sm border">
            <p className="text-foreground leading-relaxed mb-4">
              Este termo pode ser atualizado periodicamente para atender às
              exigências legais e garantir a transparência.
            </p>
            <p className="text-sm text-muted-foreground">Última atualização: 14/03/2025</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsentTermPage;
