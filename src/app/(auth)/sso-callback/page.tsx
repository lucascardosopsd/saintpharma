"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Logo from "@/components/Logo";

export default function SSOCallback() {
  const router = useRouter();
  const { handleRedirectCallback } = useClerk();
  const [countdown, setCountdown] = useState(10);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        await handleRedirectCallback({}, async (to: string) => {
          // Callback success - redirect to target URL
          return Promise.resolve();
        });
        
        // Aguardar 10 segundos para o registro ser salvo no banco
        toast.success("Login realizado! Preparando seu perfil...");
        setIsProcessing(false);
        
        // Contador decrescente
        for (let i = 10; i > 0; i--) {
          setCountdown(i);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        router.push("/");
      } catch (error) {
        toast.error("Erro ao processar login. Tente novamente.");
        router.push("/sign-in");
      }
    };

    handleCallback();
  }, [handleRedirectCallback, router]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Logo />
        </div>

        <Card className="border-2 shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              {isProcessing ? "Processando login" : "Preparando seu perfil"}
            </CardTitle>
            <CardDescription className="text-center">
              {isProcessing
                ? "Aguarde enquanto validamos suas credenciais"
                : "Aguarde enquanto carregamos seus dados"}
            </CardDescription>
          </CardHeader>
          <CardContent className="py-8 space-y-6">
            <div className="flex justify-center">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary"></div>
                {!isProcessing && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary">{countdown}</span>
                  </div>
                )}
              </div>
            </div>
            <p className="text-center text-muted-foreground text-sm">
              {isProcessing ? "Validando suas credenciais..." : "Sincronizando seus dados..."}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

