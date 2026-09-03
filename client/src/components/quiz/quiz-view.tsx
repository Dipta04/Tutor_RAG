"use client";

import { useMemo, useState } from "react";

import { IconCheck, IconClose, IconFile, IconRefresh } from "@/components/icons";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, Select, TextInput } from "@/components/ui/field";
import { PageHeader } from "@/components/ui/page-header";
import { Spinner } from "@/components/ui/spinner";
import { apiRequest, messageFrom } from "@/lib/api-client";
import { parseQuiz } from "@/lib/quiz";
import type { QuizCheckResponse, QuizResponse } from "@/lib/types";
import { cn, percentage } from "@/lib/utils";

type Stage = "setup" | "answering" | "result";

const COUNTS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export function QuizView() {
  const [stage, setStage] = useState<Stage>("setup");
  const [topic, setTopic] = useState("");
  const [count, setCount] = useState(3);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [quiz, setQuiz] = useState<QuizResponse | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [result, setResult] = useState<QuizCheckResponse | null>(null);

  const questions = useMemo(() => (quiz ? parseQuiz(quiz.quiz) : []), [quiz]);
  const allAnswered = questions.length > 0 && questions.every((q) => answers[q.number]);

  function resetToSetup() {
    setStage("setup");
    setQuiz(null);
    setAnswers({});
    setResult(null);
    setError(null);
  }

  async function generate() {
    const cleanTopic = topic.trim();
    if (!cleanTopic) return;

    setBusy(true);
    setError(null);

    try {
      const data = await apiRequest<QuizResponse>("/api/quiz", {
        method: "POST",
        body: JSON.stringify({ topic: cleanTopic, num_questions: count }),
      });

      if (parseQuiz(data.quiz).length === 0) {
        setError("The questions came back in a format this page could not read. Try again.");
        return;
      }

      setQuiz(data);
      setAnswers({});
      setResult(null);
      setStage("answering");
    } catch (caught) {
      setError(messageFrom(caught));
    } finally {
      setBusy(false);
    }
  }

  async function submit() {
    if (!quiz || !allAnswered) return;

    setBusy(true);
    setError(null);

    try {
      const data = await apiRequest<QuizCheckResponse>("/api/quiz/check", {
        method: "POST",
        body: JSON.stringify({
          quiz_id: quiz.quiz_id,
          answers: questions.map((question) => answers[question.number]),
        }),
      });

      setResult(data);
      setStage("result");
    } catch (caught) {
      setError(messageFrom(caught));
    } finally {
      setBusy(false);
    }
  }

  if (stage === "result" && result) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6">
        <PageHeader title="Results" />

        <div className="mb-6 flex items-baseline gap-3 rounded-2xl border border-line bg-surface px-5 py-4">
          <span className="text-3xl font-semibold tracking-tight">
            {result.score}/{result.total}
          </span>
          <span className="text-sm text-ink-muted">
            {percentage(result.score, result.total)}% correct
          </span>
        </div>

        <ol className="space-y-3">
          {result.results.map((item, index) => {
            const question = questions[index];
            return (
              <li key={item.question_number} className="rounded-2xl border border-line p-4">
                <div className="flex items-start gap-2.5">
                  <span
                    className={cn(
                      "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                      item.is_correct
                        ? "bg-positive/15 text-positive"
                        : "bg-negative/15 text-negative",
                    )}
                  >
                    {item.is_correct ? (
                      <IconCheck className="h-3 w-3" />
                    ) : (
                      <IconClose className="h-3 w-3" />
                    )}
                  </span>
                  <p className="text-[15px] font-medium leading-6">
                    {question ? question.prompt : `Question ${item.question_number}`}
                  </p>
                </div>

                <div className="mt-3 space-y-1.5 pl-[30px]">
                  {question ? (
                    question.options.map((option) => {
                      const isCorrect = option.letter === item.correct_answer;
                      const isChosen = option.letter === item.user_answer;
                      return (
                        <p
                          key={option.letter}
                          className={cn(
                            "rounded-lg px-2.5 py-1.5 text-sm",
                            isCorrect && "bg-positive/10 text-positive",
                            !isCorrect && isChosen && "bg-negative/10 text-negative",
                            !isCorrect && !isChosen && "text-ink-muted",
                          )}
                        >
                          {option.letter}. {option.text}
                        </p>
                      );
                    })
                  ) : (
                    <p className="text-sm text-ink-muted">
                      You answered {item.user_answer}. Correct answer: {item.correct_answer}.
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>

        <Button variant="primary" className="mt-6" onClick={resetToSetup}>
          Start another quiz
        </Button>
      </div>
    );
  }

  if (stage === "answering" && quiz) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-8 pb-20 sm:px-6">
        <PageHeader title={topic.trim()} description={`${questions.length} questions`} />

        {quiz.sources.length > 0 ? (
          <div className="mb-6 flex flex-wrap gap-1.5">
            {quiz.sources.map((source) => (
              <span
                key={source}
                className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-2 py-1 text-[12px] text-ink-muted"
              >
                <IconFile className="h-3.5 w-3.5" />
                {source}
              </span>
            ))}
          </div>
        ) : null}

        {error ? <Alert tone="error" className="mb-5">{error}</Alert> : null}

        <ol className="space-y-4">
          {questions.map((question) => (
            <li key={question.number} className="rounded-2xl border border-line p-4">
              <p className="mb-3 text-[15px] font-medium leading-6">
                {question.number}. {question.prompt}
              </p>

              <div className="space-y-1.5">
                {question.options.map((option) => {
                  const id = `q${question.number}-${option.letter}`;
                  const selected = answers[question.number] === option.letter;
                  return (
                    <label
                      key={option.letter}
                      htmlFor={id}
                      onClick={(e) => {
                        // Prevent default scroll-into-view behavior
                        e.preventDefault();
                        setAnswers((current) => ({
                          ...current,
                          [question.number]: option.letter,
                        }));
                      }}
                      className={cn(
                        "flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-2.5 text-sm transition-colors",
                        selected
                          ? "border-accent bg-accent/10"
                          : "border-line hover:bg-surface",
                      )}
                    >
                      <input
                        id={id}
                        type="radio"
                        name={`question-${question.number}`}
                        value={option.letter}
                        checked={selected}
                        onChange={() => {}}
                        onFocus={(e) => e.preventDefault()}
                        className="sr-only"
                      />
                      <span
                        className={cn(
                          "mt-px flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold",
                          selected
                            ? "border-accent bg-accent text-white"
                            : "border-line text-ink-muted",
                        )}
                      >
                        {option.letter}
                      </span>
                      <span className="leading-6">{option.text}</span>
                    </label>
                  );
                })}
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-6 flex items-center gap-3">
          <Button variant="primary" onClick={submit} disabled={!allAnswered || busy}>
            {busy ? <Spinner /> : null}
            Submit answers
          </Button>
          <Button variant="ghost" onClick={resetToSetup} disabled={busy}>
            Discard
          </Button>
          {!allAnswered ? (
            <span className="text-xs text-ink-faint">Answer every question to submit.</span>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-8 sm:px-6">
      <PageHeader
        title="Quiz"
        description="Pick a topic from your study material and TutorRAG writes the questions."
      />

      {error ? <Alert tone="error" className="mb-5">{error}</Alert> : null}

      <div className="space-y-4">
        <Field label="Topic" htmlFor="quiz-topic">
          <TextInput
            id="quiz-topic"
            value={topic}
            onChange={(event) => setTopic(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") generate();
            }}
            placeholder="Photosynthesis"
            maxLength={200}
          />
        </Field>

        <Field label="Number of questions" htmlFor="quiz-count">
          <Select
            id="quiz-count"
            value={count}
            onChange={(event) => setCount(Number(event.target.value))}
          >
            {COUNTS.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </Select>
        </Field>

        <Button variant="primary" onClick={generate} disabled={busy || topic.trim() === ""}>
          {busy ? <Spinner /> : <IconRefresh className="h-4 w-4" />}
          {busy ? "Writing questions" : "Generate quiz"}
        </Button>
      </div>
    </div>
  );
}
