import { Separator } from "@/components/ui/separator";

const ConsentTermPage = () => {
  return (
    <div className="flex flex-col items-center p-5 gap-5 max-w-[600px] mx-auto h-[calc(100svh-180px)] overflow-y-auto">
      <div>
        <p className="text-2xl font-semibold text-primary">
          Termo de Consentimento
        </p>
      </div>

      <div>
        <p className="text-2xl font-semibold text-primary">1. Identificação</p>
        <ul className="list-disc pl-5">
          <li>
            Nome da Aplicação: <strong>SaintPharma</strong>
          </li>
          <li>
            Responsável: <strong>Cristina Cristina Wandeur</strong>
          </li>
          <li>
            E-mail: <strong>cristinawandeur@gmail.com</strong>
          </li>
        </ul>
      </div>

      <div>
        <p className="text-2xl font-semibold text-primary">
          2. Dados Coletados e Finalidade
        </p>
        <ul className="list-disc pl-5">
          <li>
            <strong>Dados Coletados:</strong> Nome, e-mail, foto de usuário
          </li>
          <li>
            <strong>Finalidade:</strong> Login, criação de certificados e
            contato
          </li>
        </ul>
      </div>

      <div>
        <p className="text-2xl font-semibold text-primary">
          3. Consentimento do Usuário
        </p>
        <p>
          Ao aceitar este termo, o usuário concorda com a coleta e uso dos dados
          para as finalidades descritas.
        </p>
      </div>

      <div>
        <p className="text-2xl font-semibold text-primary">
          4. Direitos do Usuário
        </p>
        <ul className="list-disc pl-5">
          <li>Solicitar acesso, correção ou exclusão dos dados</li>
          <li>Revogar o consentimento a qualquer momento</li>
        </ul>
      </div>

      <div>
        <p className="text-2xl font-semibold text-primary">
          5. Compartilhamento de Dados
        </p>
        <p>
          Os dados podem ser compartilhados com serviços de banco de dados e
          login, como o Clerk.
        </p>
      </div>

      <div>
        <p className="text-2xl font-semibold text-primary">
          6. Tempo de Retenção
        </p>
        <p>
          Os dados serão armazenados até a solicitação de exclusão pelo usuário.
        </p>
      </div>

      <div>
        <p className="text-2xl font-semibold text-primary">
          7. Segurança dos Dados
        </p>
        <p>
          Os dados são protegidos por criptografia no banco de dados e nos
          serviços do Clerk.
        </p>
      </div>

      <div>
        <p className="text-2xl font-semibold text-primary">
          8. Alterações no Termo
        </p>
        <p>
          Os usuários serão informados sobre eventuais atualizações no termo.
        </p>
      </div>

      <div>
        <p className="text-2xl font-semibold text-primary">
          9. Revogação do Consentimento
        </p>
        <p>
          Para revogar o consentimento ou excluir os dados, envie um e-mail para{" "}
          <strong>cristinawandeur@gmail.com</strong>.
        </p>
      </div>

      <Separator />

      <div>
        <p>
          Este termo pode ser atualizado periodicamente para atender às
          exigências legais e garantir a transparência.
        </p>
        <p>Última atualização: 14/03/2025</p>
      </div>
    </div>
  );
};

export default ConsentTermPage;
