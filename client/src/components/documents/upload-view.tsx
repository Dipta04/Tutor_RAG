"use client";

import { useRef, useState } from "react";

import { IconFile, IconUpload } from "@/components/icons";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, Select } from "@/components/ui/field";
import { PageHeader } from "@/components/ui/page-header";
import { Spinner } from "@/components/ui/spinner";
import { apiRequest, messageFrom } from "@/lib/api-client";
import type { UploadResponse } from "@/lib/types";
import { cn } from "@/lib/utils";

interface IndexedDoc {
  id: string;
  name: string;
  grade: number;
  chunks: number;
}

const GRADES = Array.from({ length: 12 }, (_, index) => index + 1);
const MAX_MB = 25;

export function UploadView() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [grade, setGrade] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [indexed, setIndexed] = useState<IndexedDoc[]>([]);

  function pick(candidate: File | null | undefined) {
    setError(null);
    setSuccess(null);

    if (!candidate) return;

    if (!candidate.name.toLowerCase().endsWith(".pdf")) {
      setError("Only PDF files can be indexed.");
      return;
    }

    if (candidate.size > MAX_MB * 1024 * 1024) {
      setError(`That file is larger than ${MAX_MB} MB.`);
      return;
    }

    setFile(candidate);
  }

  async function upload() {
    if (!file) return;

    setBusy(true);
    setError(null);
    setSuccess(null);

    const body = new FormData();
    body.append("file", file);
    body.append("grade", String(grade));

    try {
      const data = await apiRequest<UploadResponse>("/api/documents", { method: "POST", body });

      setIndexed((current) => [
        { id: data.doc_id, name: file.name, grade: data.grade, chunks: data.chunks ?? 0 },
        ...current,
      ]);
      setSuccess(`${file.name} is now searchable for grade ${data.grade}.`);
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
    } catch (caught) {
      setError(messageFrom(caught));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-8 sm:px-6">
      <PageHeader
        title="Documents"
        description="Upload a PDF and students in the grade you choose can ask questions about it."
      />

      {error ? <Alert tone="error" className="mb-5">{error}</Alert> : null}
      {success ? <Alert tone="success" className="mb-5">{success}</Alert> : null}

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          pick(event.dataTransfer.files?.[0]);
        }}
        className={cn(
          "rounded-2xl border border-dashed px-6 py-10 text-center transition-colors",
          dragging ? "border-accent bg-accent/5" : "border-line bg-surface/40",
        )}
      >
        <IconUpload className="mx-auto h-6 w-6 text-ink-muted" />
        <p className="mt-3 text-sm text-ink">
          {file ? file.name : "Drop a PDF here, or choose a file"}
        </p>
        <p className="mt-1 text-xs text-ink-faint">
          {file
            ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
            : `PDF only, up to ${MAX_MB} MB`}
        </p>

        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          onChange={(event) => pick(event.target.files?.[0])}
          className="sr-only"
          id="document-file"
        />
        <Button size="sm" className="mt-4" onClick={() => inputRef.current?.click()}>
          Choose file
        </Button>
      </div>

      <div className="mt-5 space-y-4">
        <Field label="Grade" htmlFor="document-grade" hint="Students in this grade will be able to search it.">
          <Select
            id="document-grade"
            value={grade}
            onChange={(event) => setGrade(Number(event.target.value))}
          >
            {GRADES.map((value) => (
              <option key={value} value={value}>
                Grade {value}
              </option>
            ))}
          </Select>
        </Field>

        <Button variant="primary" onClick={upload} disabled={!file || busy}>
          {busy ? <Spinner /> : null}
          {busy ? "Indexing document" : "Upload and index"}
        </Button>

        {busy ? (
          <p className="text-xs text-ink-faint">
            Large PDFs take a while: every page is split, embedded and stored.
          </p>
        ) : null}
      </div>

      {indexed.length > 0 ? (
        <section className="mt-10">
          <h2 className="mb-3 text-sm font-medium text-ink-muted">Indexed in this session</h2>
          <ul className="space-y-2">
            {indexed.map((doc) => (
              <li
                key={doc.id}
                className="flex items-center gap-3 rounded-xl border border-line px-3.5 py-3"
              >
                <IconFile className="h-4 w-4 shrink-0 text-ink-muted" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm">{doc.name}</span>
                  <span className="block text-xs text-ink-faint">
                    Grade {doc.grade} · {doc.chunks} chunks
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
