import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, data } = body;
    
    console.log("Clerk webhook received:", { type, userId: data?.id });

    // Verificar se é um evento de delete
    if (type === "user.deleted") {
      const { id: clerkId } = data;
      
      if (!clerkId) {
        console.error("ClerkId não encontrado no evento de delete");
        return new NextResponse("ClerkId é obrigatório para delete", { status: 400 });
      }

      // Buscar usuário no banco pelo clerkId
      const user = await prisma.user.findFirst({ 
        where: { clerkId },
        include: {
          certificates: true,
          lectures: true,
          Exam: true,
          Damage: true
        }
      });

      if (!user) {
        console.log(`Usuário com clerkId ${clerkId} não encontrado no banco`);
        return new NextResponse("Usuário não encontrado", { status: 404 });
      }

      // Deletar dados relacionados e o usuário
      await prisma.$transaction(async (tx) => {
        // Deletar certificados
        await tx.certificate.deleteMany({
          where: { userId: user.id }
        });

        // Deletar aulas do usuário
        await tx.userLecture.deleteMany({
          where: { userId: user.id }
        });

        // Deletar exames
        await tx.exam.deleteMany({
          where: { userId: user.id }
        });

        // Deletar danos/vidas
        await tx.damage.deleteMany({
          where: { userId: user.id }
        });

        // Deletar o usuário
        await tx.user.delete({
          where: { id: user.id }
        });
      });

      console.log(`Usuário ${user.email} (${clerkId}) deletado com sucesso do banco de dados`);
      return new NextResponse("Usuário deletado com sucesso", { status: 200 });
    }

    // Eventos de criação/atualização (comportamento original)
    if (type === "user.created" || type === "user.updated") {
      const { id, email_addresses, first_name, last_name, image_url } = data;
      const email = email_addresses[0]?.email_address;

      if (!email) {
        console.error("Email não encontrado nos dados do usuário");
        return new NextResponse("Email é obrigatório", { status: 400 });
      }

      // Processar firstName e lastName
      const firstName = first_name?.trim() || 'Usuário';
      const lastName = last_name?.trim() || null;

      const exists = await prisma.user.findFirst({ where: { email } });

      if (exists) {
        await prisma.user.update({
          where: { email },
          data: {
            clerkId: id,
            email,
            firstName: firstName,
            lastName: lastName,
            profileImage: image_url || "",
          },
        });
        console.log(`Usuário ${email} atualizado no banco de dados`);
      } else {
        await prisma.user.create({
          data: {
            clerkId: id,
            email,
            firstName: firstName,
            lastName: lastName,
            profileImage: image_url || "",
          },
        });
        console.log(`Usuário ${email} criado no banco de dados`);
      }

      return new NextResponse("Usuário processado com sucesso", { status: 200 });
    }

    // Evento não reconhecido
    console.log(`Evento não processado: ${type}`);
    return new NextResponse("Evento não processado", { status: 200 });
    
  } catch (error) {
    console.error("Erro no webhook do Clerk:", error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
}
