"use client";
import { Avatar, AvatarImage } from "./ui/avatar";
import { User } from "@prisma/client";
import useUserProfileForm from "@/hooks/useUserProfileForm";
import FieldBuilder from "./FieldBuilder";
import { Input } from "./ui/input";
import { Form } from "./ui/form";
import { Button } from "./ui/button";
import { useUser } from "@clerk/nextjs";
import { UserProfileSchema } from "@/validators/userProfile";
import { z } from "zod";
import { User as ClerkUser } from "@clerk/nextjs/server";
import { revalidateRoute } from "@/actions/revalidateRoute";
import { toast } from "sonner";
import { ChangeEvent, useState } from "react";

type UserProfileProps = {
  user: User;
  serverClerkUser: ClerkUser;
  points: number;
};

const UserProfile = ({ user, serverClerkUser, points }: UserProfileProps) => {
  const { user: clerkUser } = useUser();
  const [newImageFile, setNewImageFile] = useState<File | null>(null);

  const form = useUserProfileForm({
    defaultValues: {
      firstName: serverClerkUser?.firstName || "",
      lastName: serverClerkUser?.lastName || "",
      email: serverClerkUser?.emailAddresses[0].emailAddress,
    },
  });

  const onSubmit = async (data: z.infer<typeof UserProfileSchema>) => {
    try {
      clerkUser?.update({
        firstName: data.firstName,
        lastName: data.lastName,
      });

      revalidateRoute({ fullPath: "/" });
    } catch (error) {
      toast.error("Ocorreu um erro ao salvar");
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewImageFile(e.target.files[0]);
    }
  };

  const updateUserImage = async () => {
    try {
      await clerkUser?.setProfileImage({
        file: newImageFile,
      });

      revalidateRoute({ fullPath: "/profile" });

      toast.success("Imagem atualizada");
    } catch (error) {
      toast.error("Erro ao atualizar imagem");
    }
  };

  return (
    <Form {...form}>
      <form
        className="flex flex-col items-center justify-center gap-2 max-w-lg w-full px-5"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <div className="flex items-center justify-center flex-col gap-2">
          <Avatar className="h-44 w-44">
            <AvatarImage
              src={clerkUser?.imageUrl}
              alt="Imagem do usuário"
              height={1000}
              width={1000}
            />
          </Avatar>

          {!newImageFile && (
            <div className="relative w-full">
              <div className="w-full h-10 rounded border border-border  flex items-center justify-center cursor-pointer">
                <p className="text-sm text-primary/80">Atualizar imagem</p>
              </div>
              <Input
                type="file"
                className="absolute w-full top-0 bottom-0 m-0 bg-red-500 opacity-0 cursor-pointer"
                onChange={handleFileChange}
              />
            </div>
          )}

          {newImageFile && <Button onClick={updateUserImage}>Confirmar</Button>}
        </div>
        <div>
          <div className="text-xl flex gap-2 font-semibold text-center text-primary">
            <p>{clerkUser?.firstName}</p>
            <p>{clerkUser?.lastName}</p>
          </div>

          <p className="text-lg font-light text-center">{points} Pontos</p>
        </div>

        <FieldBuilder
          control={form.control}
          fieldElement={<Input />}
          name="firstName"
          title="Primeiro Nome"
        />

        <FieldBuilder
          control={form.control}
          fieldElement={<Input />}
          name="lastName"
          title="Segundo Nome"
        />

        <FieldBuilder
          control={form.control}
          fieldElement={<Input />}
          name="email"
          title="E-mail"
          disabled
        />

        <Button type="submit" className="w-full mt-7">
          Salvar
        </Button>
      </form>
    </Form>
  );
};

export default UserProfile;
