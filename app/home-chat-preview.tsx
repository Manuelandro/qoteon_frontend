"use client";

import { useEffect, useState } from "react";

const MESSAGE_STEPS = [
  { at: 400, phase: 1 },
  { at: 1800, phase: 2 },
  { at: 3600, phase: 3 },
] as const;

const LOOP_DURATION = 7600;

function getBubbleClass(isVisible: boolean) {
  return isVisible
    ? "translate-y-0 opacity-100"
    : "pointer-events-none translate-y-4 opacity-0";
}

export function HomeChatPreview() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    let timeoutIds: number[] = [];

    const runSequence = () => {
      setPhase(0);

      timeoutIds = MESSAGE_STEPS.map(({ at, phase: nextPhase }) =>
        window.setTimeout(() => {
          setPhase(nextPhase);
        }, at),
      );
    };

    runSequence();

    const intervalId = window.setInterval(() => {
      timeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId));
      runSequence();
    }, LOOP_DURATION);

    return () => {
      window.clearInterval(intervalId);
      timeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId));
    };
  }, []);

  const showUserMessage = phase >= 1;
  const showTyping = phase === 2;
  const showAssistantMessage = phase >= 3;

  return (
    <div className="mt-8 overflow-hidden rounded-[1.75rem] border border-black/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(247,244,238,0.92))] p-4 shadow-[0_18px_50px_rgba(17,17,17,0.06)]">
      <div className="flex items-center justify-between gap-3 border-b border-black/8 pb-3">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-xs font-semibold uppercase tracking-[0.18em] text-white">
            AI
          </span>
          <div>
            <p className="text-sm font-medium text-black">ChatGPT</p>
            <p className="text-xs text-black/42">Shopping prompt simulation</p>
          </div>
        </div>
        <span className="rounded-full border border-black/8 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-black/42">
          Live flow
        </span>
      </div>

      <div className="mt-4 grid min-h-[17rem] content-start gap-3">
        <div
          className={`ml-auto max-w-[84%] rounded-[1.35rem] rounded-br-md bg-black px-4 py-3 text-sm leading-6 text-white transition-all duration-500 ${getBubbleClass(showUserMessage)}`}
        >
          Hey chat, what are the best running shoes under 100$?
        </div>

        <div
          className={`max-w-[72%] rounded-[1.35rem] rounded-bl-md border border-black/8 bg-white px-4 py-3 transition-all duration-500 ${getBubbleClass(showTyping)}`}
        >
          <p className="text-xs uppercase tracking-[0.16em] text-black/36">
            ChatGPT is typing
          </p>
          <div className="mt-3 flex items-center gap-1.5">
            <span className="chat-dot h-2 w-2 rounded-full bg-black/30" />
            <span className="chat-dot h-2 w-2 rounded-full bg-black/30" />
            <span className="chat-dot h-2 w-2 rounded-full bg-black/30" />
          </div>
        </div>

        <div
          className={`max-w-[88%] rounded-[1.35rem] rounded-bl-md border border-black/8 bg-white px-4 py-3 text-sm leading-6 text-black/72 shadow-[0_10px_30px_rgba(17,17,17,0.04)] transition-all duration-500 ${getBubbleClass(showAssistantMessage)}`}
        >
          <p>
            A strong pick is the <span className="font-medium text-black">Nike
            Revolution 7</span>.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <span className="rounded-full bg-[#f3efe7] px-3 py-1 text-xs font-medium text-black">
              nike.com
            </span>
            <span className="text-xs text-black/45">Buy direct from the brand site</span>
          </div>
        </div>
      </div>
    </div>
  );
}
