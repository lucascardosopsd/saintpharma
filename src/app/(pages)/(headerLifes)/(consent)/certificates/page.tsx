import { getUserCertificates } from "@/actions/certification/getUserCertificates";
import { getUserByClerk } from "@/actions/user/getUserByClerk";
import { requireAuth } from "@/lib/authGuard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";
import { Award, Clock, Calendar, ExternalLink, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

const CertificatesPage = async () => {
  await requireAuth();
  const user = await getUserByClerk();
  
  if (!user) {
    return (
      <div className="min-h-[92svh] flex items-center justify-center">
        <p>Usuário não encontrado</p>
      </div>
    );
  }

  const certificates = await getUserCertificates({ userId: user.id });

  // Next.js 15: revalidatePath não pode ser usado durante o render
  // A revalidação deve ser feita em Server Actions quando necessário

  return (
    <div className="min-h-[92svh]">
      <div className="container max-w-4xl mx-auto py-8">
        {/* Header */}
        <div className="px-5 md:px-0 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div className="text-center md:text-left flex-1">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3">
                Meus Certificados
              </h1>
              <p className="text-muted-foreground">
                {certificates.length === 0
                  ? "Você ainda não possui certificados"
                  : `${certificates.length} certificado${certificates.length > 1 ? "s" : ""} concluído${certificates.length > 1 ? "s" : ""}`}
              </p>
            </div>
            <div className="flex justify-center md:justify-end">
              <Link href="/">
                <Button variant="outline" size="sm" className="gap-2">
                  <Home className="h-4 w-4" />
                  Início
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Certificates List */}
        {certificates.length === 0 ? (
          <div className="px-5 md:px-0">
            <Card className="text-center py-12">
              <CardContent className="flex flex-col items-center justify-center gap-4">
                <Award className="h-16 w-16 text-muted-foreground/50" />
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Nenhum certificado ainda
                  </h3>
                  <p className="text-muted-foreground">
                    Complete cursos para receber certificados de conclusão
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="px-5 md:px-0 space-y-4">
            {certificates.map((certificate) => (
              <Card
                key={certificate.id}
                className="w-full transition-all duration-300 hover:shadow-lg hover:border-primary/50"
              >
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-2">
                        <Award className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                        <CardTitle className="text-xl font-bold text-foreground">
                          {certificate.courseTitle}
                        </CardTitle>
                      </div>
                      <CardDescription className="text-base mt-2">
                        {certificate.description}
                      </CardDescription>
                    </div>
                    <div className="flex-shrink-0">
                      <Link href={`/certificate/${certificate.id}`}>
                        <Button variant="default" className="w-full md:w-auto">
                          Ver Certificado
                          <ExternalLink className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap items-center gap-4">
                    <Badge variant="secondary" className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      {certificate.workload} horas
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1.5">
                      <Award className="h-3.5 w-3.5" />
                      {certificate.points} pontos
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      {format(new Date(certificate.createdAt), "dd/MM/yyyy", {
                        locale: ptBR,
                      })}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CertificatesPage;

