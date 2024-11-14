"use client";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { ptBRLocale } from "@sanity/locale-pt-br";

// Go to https://www.sanity.io/docs/api-versioning to learn how API versioning works
import { dataset, projectId } from "./src/sanity/env";
import { schema } from "./src/sanity/schemaTypes";
import { structure } from "./src/sanity/structure";

export default defineConfig({
  basePath: "/studio",
  projectId,
  dataset,
  // Add and edit the content schema in the './sanity/schemaTypes' folder
  schema,
  plugins: [structureTool({ structure }), ptBRLocale()],
});
