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

type UserProfileProps = {
  user: User;
  serverClerkUser: ClerkUser;
  points: number;
};

const UserProfile = ({ user, serverClerkUser, points }: UserProfileProps) => {
  const { user: clerkUser } = useUser();

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

  return (
    <Form {...form}>
      <form
        className="flex flex-col items-center justify-center gap-2 container px-5"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <Avatar className="h-44 w-44">
          <AvatarImage
            src={clerkUser?.imageUrl}
            alt="Imagem do usuário"
            height={1000}
            width={1000}
          />
        </Avatar>
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
