import { NextResponse } from "next/server";
import { createCertificate } from "@/actions/certification/create";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, course } = body;

    const certificate = await createCertificate({ userId, course });

    return NextResponse.json({ certificate }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao criar certificado" }, { status: 500 });
  }
}