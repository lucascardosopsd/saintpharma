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
import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function Page() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [code, setCode] = useState("");
  const [preparingProfile, setPreparingProfile] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const { signUp, setActive } = useSignUp();
  const router = useRouter();

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signUp?.create({
        firstName,
        lastName,
        emailAddress: email,
        password,
      });

      await signUp?.prepareEmailAddressVerification({ strategy: "email_code" });
      setVerifying(true);
      toast.success("Código de verificação enviado para seu email!");
    } catch (err: any) {
      toast.error("Erro ao criar conta. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const completeSignUp = await signUp?.attemptEmailAddressVerification({
        code,
      });

      if (completeSignUp?.status === "complete") {
        await setActive?.({ session: completeSignUp.createdSessionId });
        
        // Aguardar 10 segundos para o registro ser salvo no banco
        toast.success("Conta verificada! Preparando seu perfil...");
        setPreparingProfile(true);
        
        // Contador decrescente
        for (let i = 10; i > 0; i--) {
          setCountdown(i);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        router.push("/");
      }
    } catch (err: any) {
      toast.error("Código inválido. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      await signUp?.authenticateWithRedirect({
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
              {preparingProfile 
                ? "Preparando seu perfil" 
                : verifying 
                ? "Verificar email" 
                : "Criar sua conta"}
            </CardTitle>
            <CardDescription className="text-center">
              {preparingProfile
                ? "Aguarde enquanto configuramos tudo para você"
                : verifying
                ? "Digite o código enviado para seu email"
                : "Comece sua jornada de aprendizado"}
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
            ) : !verifying ? (
              <>
                {/* Botão Google SSO */}
                <Button
                  variant="outline"
                  className="w-full h-12 relative group hover:border-primary/50"
                  onClick={handleGoogleSignUp}
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
                      Ou cadastre-se com
                    </span>
                  </div>
                </div>

                {/* Formulário de Cadastro */}
                <form onSubmit={handleEmailSignUp} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Nome</Label>
                      <Input
                        id="firstName"
                        type="text"
                        placeholder="João"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Sobrenome</Label>
                      <Input
                        id="lastName"
                        type="text"
                        placeholder="Silva"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                        className="h-11"
                      />
                    </div>
                  </div>

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
                    <Label htmlFor="password">Senha</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-11"
                      minLength={8}
                    />
                    <p className="text-xs text-muted-foreground">
                      Mínimo de 8 caracteres
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-11 font-medium"
                    disabled={loading}
                  >
                    {loading ? "Criando conta..." : "Criar conta"}
                  </Button>
                </form>

                <div className="text-center text-sm text-muted-foreground">
                  Já tem uma conta?{" "}
                  <Link href="/sign-in" className="text-primary font-medium hover:underline">
                    Fazer login
                  </Link>
                </div>
              </>
            ) : (
              <form onSubmit={handleVerification} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Código de verificação</Label>
                  <Input
                    id="code"
                    type="text"
                    placeholder="000000"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                    className="h-11 text-center text-lg tracking-widest"
                    maxLength={6}
                  />
                  <p className="text-xs text-muted-foreground text-center">
                    Verifique sua caixa de entrada e spam
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 font-medium"
                  disabled={loading}
                >
                  {loading ? "Verificando..." : "Verificar e continuar"}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => setVerifying(false)}
                >
                  Voltar
                </Button>
              </form>
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
