import { requireAuth } from "@/lib/authGuard";
import { getUserByClerk } from "@/actions/user/getUserByClerk";
import { getExamById } from "@/actions/exam/getExamById";
import ExamAttemptsHistory from "@/components/ExamAttemptsHistory";
import { Button } from "@/components/ui/button";
import { ArrowLeft, History } from "lucide-react";
import Link from "next/link";

interface ExamHistoryPageProps {
  params: Promise<{
    id: string;
  }>;
}

const ExamHistoryPage = async ({ params }: ExamHistoryPageProps) => {
  await requireAuth();
  // Next.js 15: params agora é uma Promise e precisa ser aguardado
  const { id: examId } = await params;

  const user = await getUserByClerk();
  const exam = await getExamById({ id: examId });

  if (!exam || !user) {
    return (
      <div className="flex items-center justify-center h-[92svh]">
        <div className="text-center">
          <p className="text-red-600">Exame não encontrado</p>
          <Link href="/">
            <Button className="mt-4">Voltar ao Início</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[92svh]">
      <div className="container max-w-4xl mx-auto py-8">
        {/* Navigation */}
        <div className="px-5 md:px-0 mb-8">
          <Link href={`/exam/${examId}`}>
            <Button variant="ghost" className="group">
              <ArrowLeft className="h-4 w-4 mr-2 stroke-primary group-hover:stroke-accent-foreground transition-colors" />
              Voltar ao Exame
            </Button>
          </Link>
        </div>

        {/* Header */}
        <div className="px-5 md:px-0 mb-8">
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-6 md:p-8 border border-primary/20">
            <div className="flex items-center gap-3 mb-3">
              <History className="h-6 w-6 text-primary" />
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                Histórico de Tentativas
              </h1>
            </div>
            <p className="text-muted-foreground">
              Visualize todas as suas tentativas neste exame e acompanhe seu progresso
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="px-5 md:px-0">
          <ExamAttemptsHistory
            examId={examId}
            userId={user.id}
            onAttemptClick={(attemptId) => {
              // This could open a modal or navigate to a detailed view
              console.log("Attempt clicked:", attemptId);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ExamHistoryPage;
