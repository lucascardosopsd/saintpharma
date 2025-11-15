"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import Logo from "@/components/Logo";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function Page() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [preparingProfile, setPreparingProfile] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const { signIn, setActive } = useSignIn();
  const router = useRouter();

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signIn?.create({
        identifier: email,
        password,
      });

      if (result?.status === "complete") {
        await setActive?.({ session: result.createdSessionId });
        
        // Aguardar 10 segundos para sincronização com o banco
        toast.success("Login realizado! Preparando seu perfil...");
        setPreparingProfile(true);
        
        // Contador decrescente
        for (let i = 10; i > 0; i--) {
          setCountdown(i);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        router.push("/");
      }
    } catch (err: any) {
      toast.error("Erro ao fazer login. Verifique suas credenciais.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signIn?.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/",
      });
    } catch (err) {
      toast.error("Erro ao conectar com o Google");
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Logo />
        </div>

        <Card className="border-2 shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              {preparingProfile ? "Preparando seu perfil" : "Bem-vindo de volta"}
            </CardTitle>
            <CardDescription className="text-center">
              {preparingProfile
                ? "Aguarde enquanto carregamos seus dados"
                : "Entre com sua conta para continuar"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {preparingProfile ? (
              <div className="py-8 space-y-6">
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold text-primary">{countdown}</span>
                    </div>
                  </div>
                </div>
                <p className="text-center text-muted-foreground text-sm">
                  Sincronizando seus dados...
                </p>
              </div>
            ) : (
              <>
                {/* Botão Google SSO */}
                <Button
              variant="outline"
              className="w-full h-12 relative group hover:border-primary/50"
              onClick={handleGoogleSignIn}
              type="button"
            >
              <Image
                src="/google-logo.svg"
                alt="Google"
                width={20}
                height={20}
                className="absolute left-4"
              />
              <span className="font-medium">Continuar com Google</span>
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Ou continue com
                </span>
              </div>
            </div>

            {/* Formulário de Email */}
            <form onSubmit={handleEmailSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Senha</Label>
                  <Link
                    href="/reset-password"
                    className="text-sm text-primary hover:underline"
                  >
                    Esqueceu a senha?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-11 font-medium"
                disabled={loading}
              >
                {loading ? "Entrando..." : "Entrar"}
              </Button>
            </form>

            <div className="text-center text-sm text-muted-foreground">
              Não tem uma conta?{" "}
              <Link href="/sign-up" className="text-primary font-medium hover:underline">
                Criar conta
              </Link>
            </div>
              </>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Ao continuar, você concorda com nossos{" "}
          <Link href="/terms" className="underline hover:text-primary">
            Termos de Serviço
          </Link>{" "}
          e{" "}
          <Link href="/privacy" className="underline hover:text-primary">
            Política de Privacidade
          </Link>
        </p>
      </div>
    </div>
  );
}
