import { BrandMark } from "@/components/brand-mark";
import { IconCheck, IconClose, IconFile } from "@/components/icons";
import { PhoneFrame, WindowFrame } from "@/components/landing/frames";

/** Miniature of the chat screen. */
export function ChatPreview() {
  return (
    <PhoneFrame className="w-[190px]">
      <div className="space-y-2.5 p-2.5">
        <div className="flex justify-end">
          <p className="max-w-[85%] rounded-lg bg-surface px-2 py-1.5 text-[8px] leading-snug">
            Why is the mitochondria called the powerhouse?
          </p>
        </div>
        <div className="flex gap-1.5">
          <BrandMark className="h-3.5 w-3.5" />
          <div className="flex-1 space-y-1">
            <p className="text-[8px] leading-relaxed text-ink">
              It releases most of the cell&apos;s ATP through aerobic respiration.
            </p>
            <span className="inline-flex items-center gap-1 rounded border border-line bg-surface px-1 py-0.5 text-[6px] text-ink-muted">
              <IconFile className="h-1.5 w-1.5" />
              biology-9.pdf
            </span>
          </div>
        </div>
        <div className="rounded-full border border-line bg-surface px-2 py-1.5 text-[7px] text-ink-faint">
          Ask anything about your material
        </div>
      </div>
    </PhoneFrame>
  );
}

/** Miniature of the quiz screen. */
export function QuizPreview() {
  const options = [
    { letter: "A", text: "Chloroplast", state: "idle" as const },
    { letter: "B", text: "Ribosome", state: "picked" as const },
    { letter: "C", text: "Nucleus", state: "idle" as const },
  ];

  return (
    <PhoneFrame className="w-[190px]">
      <div className="space-y-2 p-2.5">
        <p className="text-[9px] font-semibold">Photosynthesis</p>
        <p className="text-[7px] text-ink-faint">3 questions</p>
        <div className="rounded-lg border border-line p-2">
          <p className="mb-1.5 text-[8px] font-medium leading-snug">
            1. Where does the light reaction happen?
          </p>
          <div className="space-y-1">
            {options.map((option) => (
              <div
                key={option.letter}
                className={
                  option.state === "picked"
                    ? "flex items-center gap-1.5 rounded border border-accent bg-accent/10 px-1.5 py-1"
                    : "flex items-center gap-1.5 rounded border border-line px-1.5 py-1"
                }
              >
                <span
                  className={
                    option.state === "picked"
                      ? "flex h-2.5 w-2.5 items-center justify-center rounded-full bg-accent text-[5px] font-bold text-white"
                      : "flex h-2.5 w-2.5 items-center justify-center rounded-full border border-line text-[5px] text-ink-muted"
                  }
                >
                  {option.letter}
                </span>
                <span className="text-[7px]">{option.text}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-md bg-ink py-1 text-center text-[7px] font-semibold text-canvas">
          Submit answers
        </div>
      </div>
    </PhoneFrame>
  );
}

/** Miniature of the teacher upload screen. */
export function UploadPreview() {
  return (
    <PhoneFrame className="w-[190px]">
      <div className="space-y-2 p-2.5">
        <p className="text-[9px] font-semibold">Documents</p>
        <div className="rounded-lg border border-dashed border-line px-2 py-5 text-center">
          <p className="text-[7px] text-ink">Drop a PDF here</p>
          <p className="mt-0.5 text-[6px] text-ink-faint">PDF only, up to 25 MB</p>
        </div>
        <div className="space-y-1">
          {["chemistry-10.pdf", "history-notes.pdf"].map((name) => (
            <div key={name} className="flex items-center gap-1.5 rounded border border-line px-1.5 py-1">
              <IconFile className="h-2 w-2 text-ink-muted" />
              <span className="flex-1 truncate text-[7px]">{name}</span>
              <span className="text-[6px] text-ink-faint">Grade 10</span>
            </div>
          ))}
        </div>
      </div>
    </PhoneFrame>
  );
}

/** Wide preview of a full chat thread. */
export function ThreadPreview() {
  return (
    <WindowFrame className="w-full">
      <div className="flex">
        <div className="hidden w-[110px] shrink-0 space-y-1.5 border-r border-line bg-rail p-2.5 sm:block">
          <div className="flex items-center gap-1.5">
            <BrandMark className="h-4 w-4" />
            <span className="text-[8px] font-semibold">TutorRAG</span>
          </div>
          <div className="h-4 rounded bg-surface" />
          <div className="space-y-1 pt-1.5">
            {["Chat", "Quiz", "History"].map((item, index) => (
              <div
                key={item}
                className={
                  index === 0
                    ? "rounded bg-surface px-1.5 py-1 text-[7px] text-ink"
                    : "px-1.5 py-1 text-[7px] text-ink-faint"
                }
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 space-y-3 p-4">
          <div className="flex justify-end">
            <p className="max-w-[70%] rounded-lg bg-surface px-2.5 py-1.5 text-[9px]">
              Summarise chapter 4 on the water cycle
            </p>
          </div>
          <div className="flex gap-2">
            <BrandMark className="h-4 w-4" />
            <div className="flex-1 space-y-1.5">
              <p className="text-[9px] leading-relaxed text-ink">
                Chapter 4 covers four stages: evaporation, condensation, precipitation and
                collection. Solar energy drives the first stage.
              </p>
              <div className="space-y-1">
                {["Evaporation lifts water as vapour", "Condensation forms cloud droplets"].map(
                  (line) => (
                    <p key={line} className="text-[8px] text-ink-muted">
                      • {line}
                    </p>
                  ),
                )}
              </div>
              <span className="inline-flex items-center gap-1 rounded border border-line bg-surface px-1.5 py-0.5 text-[7px] text-ink-muted">
                <IconFile className="h-2 w-2" />
                geography-grade7.pdf
              </span>
            </div>
          </div>
          <div className="rounded-full border border-line bg-surface px-3 py-2 text-[8px] text-ink-faint">
            Ask anything about your study material
          </div>
        </div>
      </div>
    </WindowFrame>
  );
}

const HISTORY_ROWS = [
  { topic: "Photosynthesis", date: "12 Aug", score: "3/3", pct: "100%", pass: true },
  { topic: "Cell division", date: "10 Aug", score: "2/3", pct: "67%", pass: true },
  { topic: "The water cycle", date: "07 Aug", score: "1/3", pct: "33%", pass: false },
  { topic: "Periodic table", date: "03 Aug", score: "4/5", pct: "80%", pass: true },
];

/** Wide preview of the quiz history table. */
export function HistoryPreview() {
  return (
    <WindowFrame className="w-full">
      <div className="p-4">
        <p className="text-[11px] font-semibold">Quiz history</p>
        <p className="mb-3 text-[9px] text-ink-faint">Showing 4 of 27 attempts</p>

        <div className="overflow-hidden rounded-lg border border-line">
          <div className="grid grid-cols-[1.6fr_0.8fr_0.6fr_0.6fr_0.5fr] gap-2 border-b border-line bg-surface px-3 py-2 text-[8px] font-medium text-ink-muted">
            <span>Topic</span>
            <span>Taken</span>
            <span>Score</span>
            <span>Percent</span>
            <span>Result</span>
          </div>

          {HISTORY_ROWS.map((row) => (
            <div
              key={row.topic}
              className="grid grid-cols-[1.6fr_0.8fr_0.6fr_0.6fr_0.5fr] items-center gap-2 border-b border-line px-3 py-2 text-[9px] last:border-b-0"
            >
              <span className="truncate">{row.topic}</span>
              <span className="text-ink-muted">{row.date}</span>
              <span className="text-ink-muted">{row.score}</span>
              <span className="text-ink-muted">{row.pct}</span>
              <span>
                {row.pass ? (
                  <IconCheck className="h-2.5 w-2.5 text-positive" />
                ) : (
                  <IconClose className="h-2.5 w-2.5 text-negative" />
                )}
              </span>
            </div>
          ))}
        </div>
      </div>
    </WindowFrame>
  );
}
