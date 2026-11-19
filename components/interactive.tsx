"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { content as c } from "@/lib/content";
import { submitWaitlist, WZORZEC_ADRESU } from "@/lib/waitlist";

/**
 * Chapter index: the current chapter is the last one whose top edge has passed a line
 * 35% down the window (the first one before that). Recomputed once per frame on scroll
 * and resize, and once on mount, so a page opened from a link with an anchor marks the
 * right chapter straight away.
 */
export function ChapterIndex({
  items,
  label,
}: {
  items: { id: string; label: string }[];
  label: string;
}) {
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    const chapters = items.map((item) => document.getElementById(item.id));
    let frame = 0;
    function markChapter() {
      frame = 0;
      const probe = window.innerHeight * 0.35;
      let next = 0;
      chapters.forEach((chapter, i) => {
        if (chapter && chapter.getBoundingClientRect().top <= probe) next = i;
      });
      setCurrent(next);
    }
    function onScroll() {
      if (!frame) frame = requestAnimationFrame(markChapter);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    markChapter();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);
  return (
    <nav className="index" aria-label={label}>
      {items.map((item, i) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          className={i === current ? "on" : undefined}
          aria-current={i === current ? "true" : undefined}
        >
          <span>{item.label}</span>
        </a>
      ))}
    </nav>
  );
}

export function FAQ() {
  return (
    <div className="faq-list">
      {c.faq.items.map((item) => (
        <details key={item.question}>
          <summary>{item.question}</summary>
          <p>{item.answer}</p>
        </details>
      ))}
    </div>
  );
}

export function WaitlistForm() {
  const [status, setStatus] = useState<
    "idle" | "invalid" | "sending" | "success" | "failed"
  >("idle");
  const email = useRef<HTMLInputElement>(null);
  const trap = useRef<HTMLInputElement>(null);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "sending") return;
    const address = email.current?.value.trim() ?? "";
    if (!email.current?.validity.valid || !WZORZEC_ADRESU.test(address)) {
      setStatus("invalid");
      email.current?.focus();
      return;
    }
    setStatus("sending");
    const result = await submitWaitlist(address, trap.current?.value ?? "");
    setStatus(result.status);
  }
  return (
    <form className="join" onSubmit={submit} noValidate>
      <label htmlFor="waitlist-email">{c.waitlist.label}</label>
      <div className="field-row">
        <input
          ref={email}
          id="waitlist-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder={c.waitlist.placeholder}
          required
          maxLength={254}
          aria-invalid={status === "invalid"}
          aria-describedby="waitlist-status"
          onChange={() => {
            if (status !== "sending") setStatus("idle");
          }}
        />
        <button className="btn" type="submit" disabled={status === "sending"}>
          {status === "sending" ? c.waitlist.sending : c.waitlist.button}
        </button>
      </div>
      <div className="form-trap" aria-hidden="true">
        <label htmlFor="waitlist-website">Website</label>
        <input
          ref={trap}
          id="waitlist-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>
      <p
        id="waitlist-status"
        className={status === "failed" ? "status failed" : "status"}
        role="status"
        aria-live="polite"
      >
        {status === "invalid"
          ? c.waitlist.error
          : status === "success"
            ? c.waitlist.success
            : status === "failed"
              ? c.waitlist.failure
              : ""}
      </p>
    </form>
  );
}
