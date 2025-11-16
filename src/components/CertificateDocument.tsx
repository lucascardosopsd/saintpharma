import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import { CourseProps } from "@/types/course";
import { Certificate as CertificateType } from "@prisma/client";
import { User } from "@clerk/nextjs/server";
import { format } from "date-fns";

type CertificateDocumentProps = {
  course: CourseProps;
  user: User;
  certificate: CertificateType;
  signatureUrl?: string;
  logoUrl?: string;
};

// Definir estilos
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 48,
    position: "relative",
  },
  border: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    border: "12px solid #1e40af", // primary color
  },
  watermark: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    height: 400,
    opacity: 0.03,
  },
  container: {
    flex: 1,
    position: "relative",
    zIndex: 1,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  platformText: {
    fontSize: 11,
    color: "#1e40af",
    fontWeight: "bold",
    marginBottom: 12,
  },
  stars: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  star: {
    fontSize: 16,
    color: "#1e40af",
  },
  title: {
    fontSize: 56,
    fontWeight: "bold",
    color: "#1e40af",
    textTransform: "uppercase",
    letterSpacing: 2,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 1,
    fontWeight: "medium",
  },
  courseBadge: {
    backgroundColor: "#eff6ff",
    border: "2px solid #93c5fd",
    borderRadius: 16,
    padding: 16,
    paddingHorizontal: 40,
    marginBottom: 16,
    alignItems: "center",
  },
  courseName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e40af",
    marginBottom: 4,
    textAlign: "center",
  },
  courseHours: {
    fontSize: 12,
    color: "#3b82f6",
    textAlign: "center",
    fontWeight: "medium",
  },
  studentName: {
    fontSize: 64,
    color: "#1e40af",
    marginBottom: 20,
    textAlign: "center",
    fontStyle: "italic",
  },
  certificationText: {
    fontSize: 14,
    color: "#374151",
    textAlign: "center",
    marginBottom: 16,
    maxWidth: 600,
    lineHeight: 1.6,
  },
  dateBadge: {
    backgroundColor: "#eff6ff",
    border: "2px solid #93c5fd",
    borderRadius: 12,
    padding: 12,
    paddingHorizontal: 32,
    alignItems: "center",
  },
  dateText: {
    fontSize: 14,
    color: "#1e40af",
    fontWeight: "bold",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: "auto",
    gap: 32,
  },
  descriptionSection: {
    flex: 2,
  },
  descriptionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 11,
    color: "#000000",
    lineHeight: 1.6,
  },
  signatureSection: {
    flex: 1,
    alignItems: "center",
    minWidth: 200,
  },
  signatureImage: {
    width: 120,
    height: 56,
    marginBottom: 4,
    objectFit: "contain",
  },
  signatureLine: {
    width: "100%",
    height: 2,
    backgroundColor: "#374151",
    marginVertical: 4,
  },
  signatureName: {
    fontSize: 16,
    color: "#1e40af",
    textAlign: "center",
    fontStyle: "italic",
    marginTop: 4,
  },
  signatureTitle: {
    fontSize: 10,
    color: "#6b7280",
    textAlign: "center",
    fontWeight: "medium",
    marginTop: 2,
  },
});

const CertificateDocument = ({
  course,
  user,
  certificate,
  signatureUrl,
  logoUrl,
}: CertificateDocumentProps) => {
  const description = certificate.description || course.description || "";

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        {/* Borda decorativa */}
        <View style={styles.border} />

        {/* Logo de fundo (watermark) */}
        {logoUrl && (
          <Image
            src={logoUrl}
            style={styles.watermark}
            cache={false}
          />
        )}

        {/* Container principal */}
        <View style={styles.container}>
          {/* Cabeçalho */}
          <View style={styles.header}>
            <Text style={styles.platformText}>
              Plataforma EAD: www.saintpharmacursos.com.br
            </Text>

            {/* Estrelas */}
            <View style={styles.stars}>
              {[...Array(5)].map((_, i) => (
                <Text key={i} style={styles.star}>
                  ★
                </Text>
              ))}
            </View>

            {/* Título CERTIFICADO */}
            <Text style={styles.title}>CERTIFICADO</Text>
            <Text style={styles.subtitle}>De Conclusão</Text>
          </View>

          {/* Nome do Curso */}
          <View style={{ alignItems: "center", marginBottom: 16 }}>
            <View style={styles.courseBadge}>
              <Text style={styles.courseName}>{course.name}</Text>
              <Text style={styles.courseHours}>({course.workload} Horas)</Text>
            </View>
          </View>

          {/* Nome do Aluno */}
          <View style={{ alignItems: "center", marginBottom: 20 }}>
            <Text style={styles.studentName}>
              {user?.firstName} {user?.lastName}
            </Text>
          </View>

          {/* Texto de certificação */}
          <View style={{ alignItems: "center", marginBottom: 16 }}>
            <Text style={styles.certificationText}>
              A SaintPharma cursos afirma por meio deste documento, que o(a)
              respectivo(a) aluno(a) concluiu com êxito esta formação
              profissionalizante em nossa plataforma EAD.
            </Text>

            {/* Data de conclusão */}
            <View style={styles.dateBadge}>
              <Text style={styles.dateText}>
                Período de conclusão:{" "}
                {format(new Date(certificate.createdAt), "dd/MM/yyyy")}
              </Text>
            </View>
          </View>

          {/* Rodapé - Descrição e Assinatura */}
          <View style={styles.footer}>
            {/* Conteúdo da formação - lado esquerdo */}
            {description && (
              <View style={styles.descriptionSection}>
                <Text style={styles.descriptionTitle}>
                  Conteúdo da formação
                </Text>
                <Text style={styles.descriptionText}>{description}</Text>
              </View>
            )}

            {/* Assinatura - lado direito */}
            <View
              style={[
                styles.signatureSection,
                !description && { marginLeft: "auto" },
              ]}
            >
              {/* Assinatura */}
              {signatureUrl && (
                <Image
                  src={signatureUrl}
                  style={styles.signatureImage}
                  cache={false}
                />
              )}
              <View style={styles.signatureLine} />
              <Text style={styles.signatureName}>
                Elaine Cristina Wandeur da Costa
              </Text>
              <Text style={styles.signatureTitle}>
                Mestre em ensino e saúde
              </Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default CertificateDocument;

