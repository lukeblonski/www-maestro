"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  CheckCheck,
  ChevronDown,
  Circle,
  CircleCheck,
  CornerDownLeft,
  Moon,
  Play,
  RotateCcw,
  Sun,
} from "lucide-react";
import { content as c } from "@/lib/content";
import { Brand, BrandMark } from "./brand";
import { submitWaitlist } from "@/lib/waitlist";

export function Header() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    setDark(document.documentElement.dataset.theme === "dark");
  }, []);
  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.dataset.theme = next ? "dark" : "light";
    try {
      localStorage.setItem("maestro-theme", next ? "dark" : "light");
    } catch {}
  }
  return (
    <header className="site-header">
      <div className="container header-inner">
        <a href="#top" className="brand-link" aria-label={c.ui.backToTop}>
          <Brand />
        </a>
        <div className="header-actions">
          <button
            className="icon-button theme-button"
            aria-label={dark ? c.ui.themeLight : c.ui.themeDark}
            onClick={toggleTheme}
          >
            {dark ? <Sun size={19} /> : <Moon size={19} />}
          </button>
          <a href="#waitlist" className="button button-small button-ink">
            {c.hero.primary}
            <ArrowUpRight size={16} />
          </a>
        </div>
      </div>
    </header>
  );
}

export function HeroDemo() {
  const [approved, setApproved] = useState(false);
  const d = c.heroDemo;
  return (
    <figure className="hero-demo">
      <div className="demo-window">
        <div className="demo-top">
          <span className="observer-avatar">
            <BrandMark />
          </span>
          <div>
            <strong>{d.observerLabel}</strong>
            <span>{d.title}</span>
          </div>
          <span className="live-dot" aria-hidden="true" />
        </div>
        <div className="demo-conversation">
          <div className="bubble-user">
            <span className="speaker">{d.userLabel}</span>
            <p>{d.user}</p>
          </div>
          <div className="bubble-observer">
            <span className="speaker">
              <BrandMark />
              {d.observerLabel}
            </span>
            <p>{d.observer}</p>
            <div className="recommendation">
              <span>{d.recommendationLabel}</span>
              <p>{d.recommendation}</p>
            </div>
          </div>
          <div className="demo-action" aria-live="polite">
            {approved ? (
              <div className="approved-reply">
                <CheckCheck size={17} />
                <span>{d.approved}</span>
                <button
                  className="icon-button"
                  onClick={() => setApproved(false)}
                  aria-label={d.resetLabel}
                >
                  <RotateCcw size={15} />
                </button>
              </div>
            ) : (
              <button
                className="reply-button"
                onClick={() => setApproved(true)}
              >
                {d.reply}
                <CornerDownLeft size={16} />
              </button>
            )}
          </div>
        </div>
        <div className="demo-status">
          <div className="status-header">
            <span>{d.projectLabel}</span>
            <strong>{approved ? d.buildMessage : d.phase}</strong>
          </div>
          <ol className="status-track">
            {d.statuses.map((status, i) => (
              <li
                key={status}
                className={
                  i === 0 || (approved && i === 1)
                    ? "done"
                    : i === (approved ? 2 : 1)
                      ? "active"
                      : ""
                }
              >
                {i === 0 || (approved && i === 1) ? (
                  <Check size={12} />
                ) : (
                  <Circle size={12} />
                )}
                <span>{status}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
      <figcaption>{d.caption}</figcaption>
      <span className="demo-side-note" aria-hidden="true">
        {d.yourDecision}
        <ArrowDown size={17} />
      </span>
    </figure>
  );
}

export function ProjectWalkthrough() {
  const [step, setStep] = useState(0);
  const [checked, setChecked] = useState(false);
  const e = c.example;
  const current = e.steps[step];
  function move(next: number) {
    setStep(next);
    setChecked(false);
  }
  return (
    <div className="walkthrough">
      <div className="step-list" role="group" aria-label={e.stepLabel}>
        {e.steps.map((item, index) => (
          <button
            key={item.title}
            className={`step-item ${step === index ? "selected" : ""}`}
            aria-pressed={step === index}
            aria-controls="example-panel"
            onClick={() => move(index)}
          >
            <span className="step-number">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span>{item.title}</span>
            <ArrowUpRight size={17} />
          </button>
        ))}
      </div>
      <div className="example-panel" id="example-panel">
        <div className="example-copy" aria-live="polite" aria-atomic="true">
          <span className="step-count">
            {e.stepLabel} {step + 1} {c.ui.stepOf} {e.steps.length}
          </span>
          <h3>{current.title}</h3>
          <p>{current.description}</p>
        </div>
        {step === 2 ? (
          <div className="checker-preview">
            <div className="checker-top">
              <Play size={17} />
              <span>{e.preview.title}</span>
              <span className="preview-tag">{e.preview.caption}</span>
            </div>
            <div className="video-placeholder" aria-hidden="true">
              <div className="video-play">
                <Play size={28} />
              </div>
              <span className="video-line" />
              <span className="video-line short" />
            </div>
            <button
              className="button button-primary"
              onClick={() => setChecked(!checked)}
            >
              {checked ? e.preview.reset : e.preview.button}
              <ArrowRight size={16} />
            </button>
            {checked && (
              <div className="checker-result" role="status">
                <strong>{e.preview.resultTitle}</strong>
                <p>{e.preview.resultDescription}</p>
                <span>{e.preview.sourceLabel}</span>
              </div>
            )}
          </div>
        ) : (
          <div
            className={`example-message ${step === 7 ? "message-ready" : ""}`}
          >
            <span className="speaker">
              {step === 7 ? <CircleCheck size={22} /> : <BrandMark />}
              {current.role}
            </span>
            <p>{current.message}</p>
            {step === 7 && (
              <span className="ready-line">
                <Check size={16} />
                {c.heroDemo.readyLabel}
              </span>
            )}
          </div>
        )}
        <div className="step-pagination">
          <span>{e.caption}</span>
          <div>
            <button
              className="icon-button"
              disabled={step === 0}
              aria-label={e.previous}
              onClick={() => move(step - 1)}
            >
              <ArrowLeft size={19} />
            </button>
            <button
              className="icon-button"
              disabled={step === e.steps.length - 1}
              aria-label={e.next}
              onClick={() => move(step + 1)}
            >
              <ArrowRight size={19} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FAQ() {
  return (
    <div className="faq-list">
      {c.faq.items.map((item) => (
        <details key={item.question}>
          <summary>
            {item.question}
            <ChevronDown size={21} />
          </summary>
          <p>{item.answer}</p>
        </details>
      ))}
    </div>
  );
}

export function WaitlistForm() {
  const [status, setStatus] = useState<"idle" | "invalid" | "preview">("idle");
  const email = useRef<HTMLInputElement>(null);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email.current?.validity.valid) {
      setStatus("invalid");
      email.current?.focus();
      return;
    }
    const result = await submitWaitlist(email.current.value.trim());
    setStatus(result.status);
  }
  return (
    <form className="waitlist-form" onSubmit={submit} noValidate>
      <label htmlFor="waitlist-email">{c.waitlist.label}</label>
      <div className="form-row">
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
          aria-describedby="waitlist-note waitlist-status"
          onChange={() => setStatus("idle")}
        />
        <button className="button button-primary" type="submit">
          {c.waitlist.button}
          <ArrowUpRight size={18} />
        </button>
      </div>
      <p className="form-note" id="waitlist-note">
        {c.waitlist.demoNote}
      </p>
      <p
        id="waitlist-status"
        className={`form-status ${status}`}
        role="status"
        aria-live="polite"
      >
        {status === "invalid"
          ? c.waitlist.error
          : status === "preview"
            ? c.waitlist.success
            : ""}
      </p>
      <div className="todo-notes">
        {c.waitlist.todos.map((todo) => (
          <p key={todo}>{todo}</p>
        ))}
      </div>
    </form>
  );
}

export function ScrollMotion() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.12 },
    );
    document
      .querySelectorAll("[data-reveal]")
      .forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
  return null;
}
