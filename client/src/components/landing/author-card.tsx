import Image from "next/image";

import { NeonFrame } from "@/components/neon-frame";

export function AuthorCard() {
  return (
    <div className="flex justify-center">
      <NeonFrame className="w-full max-w-[330px]" innerClassName="p-3">
        <figure className="overflow-hidden rounded-[18px] bg-surface">
          <div className="relative aspect-square w-full">
            <Image
              src="/author.jpg"
              alt="Dipta Karmakar, who built TutorRAG"
              fill
              sizes="330px"
              priority={false}
              className="object-cover grayscale"
            />
          </div>

          <figcaption className="px-4 py-4">
            <p className="text-[13px] leading-relaxed text-ink">
              I built TutorRAG because searching a 300-page PDF the night before an exam is a
              terrible way to learn. Ask the book a question instead, get the answer with the page
              it came from, and practise until it sticks.
            </p>
          </figcaption>
        </figure>

        <div className="flex items-center justify-between px-4 pb-3 pt-1 text-[11px] text-ink-faint">
          <span>Built by Dipta Karmakar</span>
          <span>TutorRAG</span>
        </div>
      </NeonFrame>
    </div>
  );
}
