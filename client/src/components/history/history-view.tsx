"use client";

import { useCallback, useEffect, useState } from "react";

import { IconChevronDown, IconRefresh } from "@/components/icons";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { Spinner } from "@/components/ui/spinner";
import { apiRequest, messageFrom } from "@/lib/api-client";
import { parseQuiz } from "@/lib/quiz";
import type { QuizAttempt, QuizHistoryResponse } from "@/lib/types";
import { cn, formatDate, percentage } from "@/lib/utils";

export function HistoryView() {
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiRequest<QuizHistoryResponse>("/api/quiz/history");
      setAttempts(data.history);
    } catch (caught) {
      setError(messageFrom(caught));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6">
      <div className="flex items-start justify-between gap-4">
        <PageHeader title="History" description="Every quiz you have taken, newest first." />
        <Button size="sm" onClick={() => void load()} disabled={loading}>
          {loading ? <Spinner /> : <IconRefresh className="h-4 w-4" />}
          Refresh
        </Button>
      </div>

      {error ? <Alert tone="error">{error}</Alert> : null}

      {loading && attempts.length === 0 ? (
        <div className="space-y-2">
          {[0, 1, 2].map((index) => (
            <div key={index} className="h-16 animate-pulse rounded-2xl bg-surface" />
          ))}
        </div>
      ) : null}

      {!loading && !error && attempts.length === 0 ? (
        <p className="rounded-2xl border border-line px-4 py-8 text-center text-sm text-ink-muted">
          No attempts yet. Take a quiz and it will appear here.
        </p>
      ) : null}

      <div className="space-y-2">
        {attempts.map((attempt) => {
          const open = openId === attempt.id;
          const questions = parseQuiz(attempt.quiz_content);

          return (
            <div key={attempt.id} className="overflow-hidden rounded-2xl border border-line">
              <button
                type="button"
                onClick={() => setOpenId(open ? null : attempt.id)}
                aria-expanded={open}
                className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-surface"
              >
                <IconChevronDown
                  className={cn(
                    "h-4 w-4 shrink-0 text-ink-faint transition-transform",
                    open ? "" : "-rotate-90",
                  )}
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{attempt.topic}</span>
                  <span className="block text-xs text-ink-faint">
                    {formatDate(attempt.timestamp)}
                  </span>
                </span>
                <span className="shrink-0 text-sm text-ink-muted">
                  {attempt.score}/{attempt.total} · {percentage(attempt.score, attempt.total)}%
                </span>
              </button>

              {open ? (
                <div className="animate-fade-in space-y-4 border-t border-line px-4 py-4">
                  {attempt.results.map((item, index) => {
                    const question = questions[index];
                    return (
                      <div key={item.question_number}>
                        <p className="mb-2 text-sm font-medium leading-6">
                          {item.question_number}.{" "}
                          {question ? question.prompt : `Question ${item.question_number}`}
                        </p>

                        <div className="space-y-1">
                          {question && question.options.length > 0 ? (
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
                              You answered {item.user_answer}. Correct answer:{" "}
                              {item.correct_answer}.
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
