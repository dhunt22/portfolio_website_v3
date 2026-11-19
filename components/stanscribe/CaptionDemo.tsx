'use client';

// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// components/stanscribe/CaptionDemo.tsx
// A drawing of the app's live screen that plays a short scripted conversation once, when the reader scrolls
// to it. The server renders every word. The script only changes each word's opacity, so the layout never
// shifts and a screen reader reads the whole conversation at any moment. With reduced motion, or with no
// script, nothing moves. One timer, about twenty updates: no video, no GIF, no canvas.

import { useEffect, useRef, useState } from 'react';
import { TYPE } from '@/components/stanscribe/type';
import { DEMO_GROUND, DEMO_TURNS } from '@/lib/stanscribe-demo';
import { cn } from '@/lib/utils';

const TURNS = DEMO_TURNS.map((turn) => ({ ...turn, list: turn.words.split(' ') }));
/** The index, across the whole conversation, of each turn's first word. */
const STARTS = TURNS.map((_, i) => TURNS.slice(0, i).reduce((count, turn) => count + turn.list.length, 0));
const TOTAL = TURNS.reduce((count, turn) => count + turn.list.length, 0);

/** Speaking pace, and the pause before a new speaker. */
const WORD_MS = 280;
const TURN_MS = 700;

const BAR = ['Smaller', 'Larger', 'Save', 'Stop'];

export function CaptionDemo() {
  const panel = useRef<HTMLDivElement>(null);
  // The observer waits for the first start. Pressing Play counts as that start, so it lets go of the observer.
  const observer = useRef<IntersectionObserver | null>(null);
  // Every word shows until the script decides it can animate, so the server render is the whole conversation.
  // The count lives in a ref as well, so the timer chain reads it without waiting on a render.
  const count = useRef(TOTAL);
  const [shown, setShown] = useState(TOTAL);
  const [playing, setPlaying] = useState(false);
  const [animated, setAnimated] = useState(false);
  const show = (words: number) => {
    count.current = words;
    setShown(words);
  };

  useEffect(() => {
    const reduced = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || typeof IntersectionObserver === 'undefined' || !panel.current) return;
    setAnimated(true);
    show(0);
    const watcher = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        watcher.disconnect();
        observer.current = null;
        setPlaying(true);
      },
      { threshold: 0.5 },
    );
    observer.current = watcher;
    watcher.observe(panel.current);
    return () => watcher.disconnect();
  }, []);

  useEffect(() => {
    if (!playing) return;
    let timer: ReturnType<typeof setTimeout>;
    // Each step schedules the next itself, so the pace does not depend on when React renders.
    const step = () => {
      const next = Math.min(count.current + 1, TOTAL);
      show(next);
      if (next >= TOTAL) {
        setPlaying(false);
        return;
      }
      timer = setTimeout(step, STARTS.includes(next) ? TURN_MS : WORD_MS);
    };
    timer = setTimeout(step, WORD_MS);
    return () => clearTimeout(timer);
  }, [playing]);

  const finished = shown >= TOTAL;
  const press = () => {
    observer.current?.disconnect();
    observer.current = null;
    if (playing) {
      setPlaying(false);
      return;
    }
    if (count.current >= TOTAL) show(0);
    setPlaying(true);
  };
  // The newest line is the brightest, as in the app: the turn that holds the last word shown.
  const current = STARTS.reduce((latest, start, i) => (start < Math.max(shown, 1) ? i : latest), 0);

  return (
    <figure className="mx-auto w-full max-w-72">
      <div ref={panel} className="rounded-[2rem] border-4 border-[#2b3035] p-5 text-left" style={{ backgroundColor: DEMO_GROUND }}>
        <p aria-hidden="true" className="flex items-center gap-2 text-base font-semibold text-white">
          <span className="h-2.5 w-2.5 rounded-full bg-[#3ddc97]" />
          Listening
        </p>
        <p className="sr-only">An example of live captions:</p>
        <div className="mt-4 space-y-4">
          {TURNS.map((turn, i) => {
            // The name comes first: it shows once the word before its turn has, so it is there through the pause
            // before its own first word. The first name waits for the start, as no word comes before it.
            const named = shown >= STARTS[i] && (shown > 0 || playing);
            return (
              <p key={turn.speaker} className={cn('text-2xl font-semibold leading-snug', i === current ? 'text-white' : 'text-[#b4bbc0]')}>
                <span
                  data-speaker
                  data-shown={named}
                  className="block text-lg transition-opacity duration-200"
                  style={{ color: turn.color, opacity: named ? 1 : 0 }}
                >
                  {turn.speaker}
                </span>
                {turn.list.map((word, j) => {
                  const visible = STARTS[i] + j < shown;
                  return (
                    <span key={j} data-word data-shown={visible} className="transition-opacity duration-200" style={{ opacity: visible ? 1 : 0 }}>
                      {word}{' '}
                    </span>
                  );
                })}
              </p>
            );
          })}
        </div>
        <div data-demo-bar aria-hidden="true" className="mt-6 grid grid-cols-4 gap-2 text-center text-sm font-semibold text-white">
          {BAR.map((label) => (
            <span key={label} className={cn('rounded-xl border border-[#3a4046] py-2', label === 'Stop' && 'border-transparent bg-[#c0352b]')}>
              {label}
            </span>
          ))}
        </div>
      </div>
      {animated && (
        <button type="button" onClick={press} className={cn(TYPE.body, TYPE.link, 'mx-auto mt-3 block min-h-11 cursor-pointer px-3')}>
          {playing ? 'Pause' : finished ? 'Play again' : 'Play'}
        </button>
      )}
    </figure>
  );
}
