import { requireAuth } from "@/lib/authGuard";
import { getUserByClerk } from "@/actions/user/getUserByClerk";
import { getExamById } from "@/actions/exam/getExamById";
import ExamAttemptsHistory from "@/components/ExamAttemptsHistory";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface ExamHistoryPageProps {
  params: {
    id: string;
  };
}

const ExamHistoryPage = async ({ params }: ExamHistoryPageProps) => {
  await requireAuth();
  const { id: examId } = params;

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
    <div className="flex flex-col h-[92svh]">
      {/* Header */}
      <div className="border-b bg-background p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4">
            <Link href={`/exam/${examId}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar ao Exame
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Histórico de Tentativas</h1>
              <p className="text-muted-foreground">
                Visualize todas as suas tentativas neste exame
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto">
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
