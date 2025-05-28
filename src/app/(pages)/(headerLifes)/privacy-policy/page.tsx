import { Separator } from "@/components/ui/separator";
export const dynamic = "force-dynamic";
const PrivacyPolicyPage = () => {
  return (
    <div className="flex flex-col items-center p-5 gap-5 max-w-[600px] mx-auto h-[calc(100svh-180px)] overflow-y-auto">
      <div>
        <p className="text-2xl font-semibold text-primary">Ámbito e Objetivo</p>
        <p>
          A SainTPharma preza pela transparência e segurança no tratamento dos
          dados pessoais de seus usuários. Esta Política de Privacidade tem como
          objetivo explicar como coletamos, utilizamos e protegemos as
          informações fornecidas, em conformidade com a Lei Geral de Proteção de
          Dados (LGPD)
        </p>
      </div>

      <div>
        <p className="text-2xl font-semibold text-primary">
          1. Informações Coletadas
        </p>
        <p>
          Para o funcionamento adequado da plataforma, coletamos os seguintes
          dados pessoais: Nome, e-mail e telefone
        </p>
        <ul className="list-disc pl-5">
          <li>Nome</li>
          <li>E-mail</li>
          <li>Telefone</li>
        </ul>
        <p>
          A coleta desses dados ocorre por meio da integração com o serviço de
          autenticação Clerk.
        </p>
      </div>

      <div className="w-full">
        <p className="text-2xl font-semibold text-primary">
          2. Finalidade da Coleta de Dados
        </p>
        <p>Os dados coletados são utilizados para as seguintes finalidades:</p>

        <ul className="list-disc pl-5">
          <li className="">Melhorar a experiência do usuário na plataforma;</li>
          <li>Emissão de certificados de cursos realizados;</li>
          <li>Customização do layout e interação com a plataforma</li>
        </ul>
      </div>

      <div className="w-full">
        <p className="text-2xl font-semibold text-primary">
          3. Armazenamento e Segurança
        </p>
        <p>
          Os dados fornecidos pelos usuários são armazenados em um banco de
          dados não relacional MongoDB, respeitando padrões de segurança e boas
          práticas de proteção da informação.
        </p>
        <p>
          A autenticação e o acesso à plataforma são realizados através da
          ferramenta Clerk, que implementa mecanismos de segurança adequados.
        </p>
        <p>
          Os dados serão mantidos enquanto a conta do usuário estiver ativa na
          plataforma.
        </p>
      </div>

      <div className="w-full">
        <p className="text-2xl font-semibold text-primary">
          4. Direitos dos Usuários
        </p>
        <p>
          Nos termos da LGPD, os usuários possuem os seguintes direitos sobre
          seus dados pessoais:
        </p>

        <ul className="list-disc pl-5">
          <li>Excluir a conta e todas as informações associadas;</li>
          <li>Customizar dados pessoais, como nome e foto de perfil.</li>
        </ul>

        <p>
          Os direitos podem ser exercidos diretamente através das configurações
          na plataforma.
        </p>
      </div>

      <div className="w-full">
        <p className="text-2xl font-semibold text-primary">5. Uso de Cookies</p>
        <p>
          Utilizamos apenas cookies de sessão para garantir o correto
          funcionamento da plataforma durante o uso. Esses cookies são
          temporários e são apagados assim que o navegador é fechado.
        </p>
      </div>

      <div className="w-full">
        <p className="text-2xl font-semibold text-primary">6. Contato</p>
        <p>
          Em caso de dúvidas, sugestões ou solicitações relacionadas aos seus
          dados pessoais, entre em contato com a nossa responsável pelo
          tratamento de dados:
        </p>

        <ul className="list-disc pl-5">
          <li>Elaine Cristina Wandeur</li>
          <li>E-mail: cristinawandeur@gmail.com</li>
        </ul>
      </div>

      <div className="w-full">
        <p className="text-2xl font-semibold text-primary">
          7. Legislação Aplicável
        </p>
        <p>
          Esta Política de Privacidade é regida e interpretada de acordo com as
          normas da Lei Geral de Proteção de Dados (LGPD) - Lei nº 13.709/2018,
          vigente no Brasil
        </p>
      </div>

      <Separator />

      <div>
        <p>
          A presente Política de Privacidade pode ser atualizada periodicamente,
          visando sempre o melhor cumprimento das obrigações legais e
          transparência com os usuários.
        </p>

        <p>Última atualização: 17/12/2024</p>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
