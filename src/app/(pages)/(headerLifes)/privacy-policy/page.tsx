import { Separator } from "@/components/ui/separator";
export const dynamic = "force-dynamic";
const PrivacyPolicyPage = () => {
  return (
    <div className="min-h-[92svh]">
      <div className="container max-w-4xl mx-auto py-8">
        <div className="px-5 md:px-0 mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3">
            Política de Privacidade
          </h1>
          <p className="text-muted-foreground">
            Última atualização: 17/12/2024
          </p>
        </div>

        <div className="px-5 md:px-0 space-y-8 pb-12">
          <div className="bg-card rounded-xl p-6 shadow-sm border">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Ámbito e Objetivo</h2>
            <p className="text-foreground leading-relaxed">
              A SainTPharma preza pela transparência e segurança no tratamento dos
              dados pessoais de seus usuários. Esta Política de Privacidade tem como
              objetivo explicar como coletamos, utilizamos e protegemos as
              informações fornecidas, em conformidade com a Lei Geral de Proteção de
              Dados (LGPD)
            </p>
          </div>

          <div className="bg-card rounded-xl p-6 shadow-sm border">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">1. Informações Coletadas</h2>
            <p className="text-foreground leading-relaxed mb-4">
              Para o funcionamento adequado da plataforma, coletamos os seguintes
              dados pessoais:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground mb-4">
              <li>Nome</li>
              <li>E-mail</li>
              <li>Telefone</li>
            </ul>
            <p className="text-foreground leading-relaxed">
              A coleta desses dados ocorre por meio da integração com o serviço de
              autenticação Clerk.
            </p>
          </div>

          <div className="bg-card rounded-xl p-6 shadow-sm border">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              2. Finalidade da Coleta de Dados
            </h2>
            <p className="text-foreground leading-relaxed mb-4">Os dados coletados são utilizados para as seguintes finalidades:</p>
            <ul className="list-disc pl-6 space-y-2 text-foreground">
              <li>Melhorar a experiência do usuário na plataforma;</li>
              <li>Emissão de certificados de cursos realizados;</li>
              <li>Customização do layout e interação com a plataforma</li>
            </ul>
          </div>

          <div className="bg-card rounded-xl p-6 shadow-sm border">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              3. Armazenamento e Segurança
            </h2>
            <div className="space-y-4 text-foreground leading-relaxed">
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
          </div>

          <div className="bg-card rounded-xl p-6 shadow-sm border">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              4. Direitos dos Usuários
            </h2>
            <p className="text-foreground leading-relaxed mb-4">
              Nos termos da LGPD, os usuários possuem os seguintes direitos sobre
              seus dados pessoais:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground mb-4">
              <li>Excluir a conta e todas as informações associadas;</li>
              <li>Customizar dados pessoais, como nome e foto de perfil.</li>
            </ul>
            <p className="text-foreground leading-relaxed">
              Os direitos podem ser exercidos diretamente através das configurações
              na plataforma.
            </p>
          </div>

          <div className="bg-card rounded-xl p-6 shadow-sm border">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">5. Uso de Cookies</h2>
            <p className="text-foreground leading-relaxed">
              Utilizamos apenas cookies de sessão para garantir o correto
              funcionamento da plataforma durante o uso. Esses cookies são
              temporários e são apagados assim que o navegador é fechado.
            </p>
          </div>

          <div className="bg-card rounded-xl p-6 shadow-sm border">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">6. Contato</h2>
            <p className="text-foreground leading-relaxed mb-4">
              Em caso de dúvidas, sugestões ou solicitações relacionadas aos seus
              dados pessoais, entre em contato com a nossa responsável pelo
              tratamento de dados:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground">
              <li>Elaine Cristina Wandeur</li>
              <li>E-mail: cristinawandeur@gmail.com</li>
            </ul>
          </div>

          <div className="bg-card rounded-xl p-6 shadow-sm border">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              7. Legislação Aplicável
            </h2>
            <p className="text-foreground leading-relaxed">
              Esta Política de Privacidade é regida e interpretada de acordo com as
              normas da Lei Geral de Proteção de Dados (LGPD) - Lei nº 13.709/2018,
              vigente no Brasil
            </p>
          </div>

          <Separator className="my-8" />

          <div className="bg-card rounded-xl p-6 shadow-sm border">
            <p className="text-foreground leading-relaxed mb-4">
              A presente Política de Privacidade pode ser atualizada periodicamente,
              visando sempre o melhor cumprimento das obrigações legais e
              transparência com os usuários.
            </p>
            <p className="text-sm text-muted-foreground">Última atualização: 17/12/2024</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
