/**
 * Writes the database schema to `docs/` for the project submission.
 *
 *   npm run schema
 *
 * SRS §1.9 asks for "SQL script files (.sql) OR schema files containing
 * database and table definitions". This project uses MongoDB, so the
 * equivalent is emitted two ways:
 *
 *   docs/schema.md   — human-readable collection/field/index reference
 *   docs/schema.json — machine-readable, generated from the live Mongoose
 *                      models rather than written by hand, so it cannot drift
 *                      out of step with the code
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import mongoose from "mongoose";

import { connectToDatabase } from "../src/lib/db.js";
import "../src/models/index.js";

function describe(schemaPath) {
  const options = schemaPath.options ?? {};
  const caster = schemaPath.caster;

  // Arrays report as "Array"; the element type is on the caster.
  const type = caster?.instance
    ? `${caster.instance}[]`
    : schemaPath.instance === "Array"
      ? "Mixed[]"
      : schemaPath.instance;

  return {
    path: schemaPath.path,
    type,
    required: Boolean(options.required),
    unique: Boolean(options.unique),
    default:
      options.default !== undefined && typeof options.default !== "function"
        ? JSON.stringify(options.default)
        : undefined,
    enum: options.enum ?? caster?.options?.enum ?? undefined,
    ref: options.ref ?? caster?.options?.ref ?? undefined,
  };
}

async function run() {
  await connectToDatabase();

  const collections = [];

  for (const name of Object.keys(mongoose.models).sort()) {
    const model = mongoose.models[name];
    const fields = [];

    model.schema.eachPath((path, schemaPath) => {
      if (path === "__v") return;
      fields.push(describe(schemaPath));
    });

    const indexes = model.schema.indexes().map(([keys, options]) => ({
      keys: keys,
      options: options ?? {},
    }));

    let documentCount = 0;
    try {
      documentCount = await model.estimatedDocumentCount();
    } catch {
      // A collection that does not exist yet simply has no documents.
    }
    collections.push({
      model: name,
      collection: model.collection.name,
      fields,
      indexes,
      documentCount,
    });
  }

  const outDir = join(process.cwd(), "docs");
  mkdirSync(outDir, { recursive: true });

  // ── JSON ──────────────────────────────────────────────────────────────
  writeFileSync(
    join(outDir, "schema.json"),
    JSON.stringify(
      {
        database: mongoose.connection.name,
        generatedAt: new Date().toISOString(),
        engine: "MongoDB (Mongoose)",
        collections,
      },
      null,
      2,
    ),
  );

  // ── Markdown ──────────────────────────────────────────────────────────
  const lines = [
    "# Fan Hub Plus — Database Schema",
    "",
    `Database: \`${mongoose.connection.name}\` · Engine: MongoDB · ODM: Mongoose`,
    "",
    "Generated from the live Mongoose models by `npm run schema`, so it cannot",
    "drift out of step with the code. Do not edit by hand.",
    "",
    "## Collections at a glance",
    "",
    "| Collection | Model | Fields | Indexes | Documents |",
    "| --- | --- | ---: | ---: | ---: |",
    ...collections.map(
      (c) =>
        `| \`${c.collection}\` | ${c.model} | ${c.fields.length} | ${c.indexes.length} | ${c.documentCount} |`,
    ),
    "",
  ];

  for (const collection of collections) {
    lines.push(
      `## \`${collection.collection}\``,
      "",
      `Mongoose model: **${collection.model}**`,
      "",
      "| Field | Type | Required | Unique | Enum / Ref | Default |",
      "| --- | --- | :-: | :-: | --- | --- |",
    );

    for (const field of collection.fields) {
      const constraint = field.ref
        ? `→ ${field.ref}`
        : field.enum
          ? field.enum.map((v) => `\`${v}\``).join(", ")
          : "";
      lines.push(
        `| \`${field.path}\` | ${field.type} | ${field.required ? "yes" : ""} | ${
          field.unique ? "yes" : ""
        } | ${constraint} | ${field.default ? `\`${field.default}\`` : ""} |`,
      );
    }

    if (collection.indexes.length > 0) {
      lines.push("", "**Indexes**", "");
      for (const index of collection.indexes) {
        const keys = Object.entries(index.keys)
          .map(([key, value]) => `${key}: ${value}`)
          .join(", ");
        const options = Object.keys(index.options).length
          ? ` — ${JSON.stringify(index.options)}`
          : "";
        lines.push(`- \`{ ${keys} }\`${options}`);
      }
    }

    lines.push("");
  }

  lines.push(
    "## Relationships",
    "",
    "- **User → Category** — many-to-many, denormalised as `user.favoriteCategories[]`.",
    "- **Category → Content / CharacterProfile / MerchandiseItem / Event** — one-to-many via the `category` enum field.",
    "- **User → Bookmark / Rating / Feedback / FanSubmission / ChatbotQuery / ActivityLog** — one-to-many.",
    "- **Content → Rating** — one-to-many, aggregated onto `content.ratingSum` / `ratingCount`.",
    "- **Bookmark → any of Content / CharacterProfile / MerchandiseItem / Event** — polymorphic,",
    "  addressed by the `(targetType, targetId)` pair rather than a typed foreign key.",
    "- **FanSubmission → Content** — set on approval via `publishedContentId`.",
    "",
  );

  writeFileSync(join(outDir, "schema.md"), lines.join("\n"));

  console.log(`✓ Wrote docs/schema.md and docs/schema.json`);
  console.log(
    `  ${collections.length} collections, ${collections.reduce((n, c) => n + c.fields.length, 0)} fields`,
  );

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((error) => {
  console.error("✗ Schema export failed:", error);
  process.exit(1);
});
