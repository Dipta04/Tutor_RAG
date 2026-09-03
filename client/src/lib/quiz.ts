export interface QuizOption {
  letter: string;
  text: string;
}

export interface ParsedQuestion {
  number: number;
  prompt: string;
  options: QuizOption[];
}

interface DraftQuestion extends ParsedQuestion {
  /** The server grades by counting these lines, so only graded questions are shown. */
  hasAnswerKey: boolean;
}

const QUESTION_START = /^\s*[*_\s]*question\s*(\d+)\s*[:.)-]\s*/i;
const OPTION_LINE = /^\s*[*_\s]*([A-Ha-h])\s*[).]\s*(.+?)\s*[*_]*$/;
const ANSWER_LINE = /^\s*[*_\s]*correct\s*answer/i;

function stripMarkdown(value: string): string {
  return value.replace(/\*\*/g, "").replace(/^\s*[*_]+|[*_]+\s*$/g, "").trim();
}

/**
 * Turns the model's plain-text quiz into structured questions.
 * Tolerates the stray bold markers models sometimes add around labels.
 */
export function parseQuiz(raw: string): ParsedQuestion[] {
  if (typeof raw !== "string" || raw.trim() === "") return [];

  const questions: DraftQuestion[] = [];
  let current: DraftQuestion | null = null;

  for (const line of raw.split("\n")) {
    const start = line.match(QUESTION_START);

    if (start) {
      if (current) questions.push(current);
      current = {
        number: Number(start[1]),
        prompt: stripMarkdown(line.slice(start[0].length)),
        options: [],
        hasAnswerKey: false,
      };
      continue;
    }

    if (!current) continue;

    if (ANSWER_LINE.test(line)) {
      current.hasAnswerKey = true;
      continue;
    }

    const option = line.match(OPTION_LINE);
    if (option) {
      current.options.push({
        letter: option[1].toUpperCase(),
        text: stripMarkdown(option[2]),
      });
      continue;
    }

    // Continuation of a wrapped question prompt.
    const extra = stripMarkdown(line);
    if (extra && current.options.length === 0) {
      current.prompt = current.prompt ? `${current.prompt} ${extra}` : extra;
    }
  }

  if (current) questions.push(current);

  return questions
    .filter((question) => question.hasAnswerKey && question.options.length >= 2)
    .map((question, index) => ({
      number: index + 1,
      prompt: question.prompt,
      options: question.options,
    }));
}
