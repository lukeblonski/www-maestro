import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Bell,
  Check,
  CheckCheck,
  FileText,
  KeyRound,
  LockKeyhole,
  MessageCircle,
  Server,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { content as c } from "@/lib/content";
import { Brand, BrandMark } from "@/components/brand";
import {
  FAQ,
  Header,
  HeroDemo,
  ProjectWalkthrough,
  ScrollMotion,
  WaitlistForm,
} from "@/components/interactive";

export default function Home() {
  const ownershipIcons = [Server, FileText, KeyRound, MessageCircle];
  return (
    <>
      <a className="skip-link" href="#main">
        {c.ui.skipLink}
      </a>
      <Header />
      <main id="main">
        <section className="hero container" id="top">
          <div className="hero-copy">
            <h1>
              {c.hero.heading.map((line, i) => (
                <span key={line} className={i === 2 ? "accent-text" : ""}>
                  {line}
                  {i < 2 ? " " : ""}
                </span>
              ))}
            </h1>
            <p className="hero-description">{c.hero.description}</p>
            <div className="hero-actions">
              <a className="button button-primary" href="#waitlist">
                {c.hero.primary}
                <ArrowUpRight size={19} />
              </a>
              <a className="text-link" href="#how-it-works">
                {c.hero.secondary}
                <ArrowDown size={17} />
              </a>
            </div>
            <p className="release-note">
              <span className="tiny-dot" />
              {c.hero.releaseNote}
            </p>
          </div>
          <HeroDemo />
        </section>
        <div className="container hero-foundation">
          <p>{c.hero.mission}</p>
          <div>
            {c.hero.proofs.map((proof) => (
              <span key={proof}>
                <Check size={15} />
                {proof}
              </span>
            ))}
          </div>
        </div>
        <section className="section container problem-section" id="why">
          <div className="section-heading" data-reveal>
            <h2>{c.problem.title}</h2>
            <p>{c.hero.vision}</p>
          </div>
          <div className="problem-grid">
            {c.problem.items.map((item, i) => (
              <article key={item.title} data-reveal>
                <span className="problem-symbol" aria-hidden="true">
                  {i === 0 ? (
                    <MessageCircle />
                  ) : i === 1 ? (
                    <CheckCheck />
                  ) : (
                    <LockKeyhole />
                  )}
                </span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="how-section section" id="how-it-works">
          <div className="container">
            <div className="section-heading" data-reveal>
              <h2>{c.example.title}</h2>
              <p>{c.example.description}</p>
            </div>
            <ProjectWalkthrough />
          </div>
        </section>
        <section className="section container observer-section" id="observer">
          <div className="section-heading" data-reveal>
            <h2>{c.observer.title}</h2>
            <p>{c.observer.description}</p>
          </div>
          <div className="observer-bento">
            <article className="bento-conversation" data-reveal>
              <div className="memory-thread">
                <span className="memory-node">
                  <BrandMark />
                </span>
                <div>
                  <span>{c.heroDemo.observerLabel}</span>
                  <p>{c.observer.memoryExample}</p>
                </div>
                <span className="memory-recalled">
                  <Check size={15} />
                  {c.observer.memoryLabel}
                </span>
              </div>
              <div>
                <h3>{c.observer.features[2].title}</h3>
                <p>{c.observer.features[2].description}</p>
              </div>
            </article>
            <article className="bento-notification" data-reveal>
              <div className="notification-preview">
                <Bell size={21} />
                <div>
                  <strong>{c.observer.notificationTitle}</strong>
                  <p>{c.observer.notificationMessage}</p>
                </div>
                <span className="tiny-dot" />
              </div>
              <h3>{c.observer.features[3].title}</h3>
              <p>{c.observer.features[3].description}</p>
            </article>
            <article className="bento-plain" data-reveal>
              <span className="bento-quote">{c.observer.plainExample}</span>
              <div>
                <h3>{c.observer.features[0].title}</h3>
                <p>{c.observer.features[0].description}</p>
              </div>
              <ArrowUpRight size={30} />
            </article>
          </div>
        </section>
        <section className="principles-section section">
          <div className="container principles-layout">
            <div data-reveal>
              <h2>{c.principles.title}</h2>
              <p className="principles-intro">{c.principles.description}</p>
              <ShieldCheck
                className="principles-emblem"
                size={72}
                strokeWidth={1}
              />
            </div>
            <div className="principles-list">
              {c.principles.items.map((item) => (
                <article key={item.title} data-reveal>
                  <div className="principle-heading">
                    <h3>{item.title}</h3>
                    {"planned" in item && item.planned && (
                      <span className="tag">{c.ui.planned}</span>
                    )}
                  </div>
                  <p>{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section className="section container ownership-section" id="ownership">
          <div className="ownership-lead" data-reveal>
            <div className="ownership-stamp" aria-hidden="true">
              <KeyRound size={34} />
            </div>
            <h2>{c.ownership.title}</h2>
            <p>{c.ownership.description}</p>
          </div>
          <div className="ownership-grid">
            {c.ownership.items.map((item, i) => {
              const Icon = ownershipIcons[i % 4];
              return (
                <article key={item.title} data-reveal>
                  <Icon size={23} />
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </article>
              );
            })}
          </div>
          <p className="claude-note">
            <ShieldCheck size={17} />
            {c.ownership.claudeNote}
          </p>
        </section>
        <section className="section container comparison-section">
          <div className="section-heading" data-reveal>
            <h2>{c.comparison.title}</h2>
            <p>{c.comparison.description}</p>
          </div>
          <div
            className="comparison-scroll"
            role="region"
            aria-label={c.comparison.title}
            tabIndex={0}
          >
            <table>
              <caption className="sr-only">{c.comparison.title}</caption>
              <thead>
                <tr>
                  <td />
                  <>
                    {c.comparison.columns.map((column, i) => (
                      <th
                        scope="col"
                        key={column}
                        className={i === 2 ? "maestro-column" : ""}
                      >
                        {i === 2 && <BrandMark />}
                        {column}
                      </th>
                    ))}
                  </>
                </tr>
              </thead>
              <tbody>
                {c.comparison.rows.map((row) => (
                  <tr key={row.label}>
                    <th scope="row">{row.label}</th>
                    {row.values.map((value, i) => (
                      <td key={i} className={i === 2 ? "maestro-column" : ""}>
                        {value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="comparison-note">{c.comparison.note}</p>
        </section>
        <section className="release-section section" id="first-release">
          <div className="container">
            <div className="release-card" data-reveal>
              <div className="release-intro">
                <div className="release-icon">
                  <BrandMark />
                </div>
                <h2>{c.release.title}</h2>
                <p className="release-date">{c.release.date}</p>
                <span className="tag">{c.release.label}</span>
                <p>{c.release.description}</p>
                <a href="#waitlist" className="button button-primary">
                  {c.hero.primary}
                  <ArrowUpRight size={17} />
                </a>
              </div>
              <ul className="release-list">
                {c.release.items.map((item) => (
                  <li key={item}>
                    <Check size={19} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="roadmap">
              <h2>{c.roadmap.title}</h2>
              <div className="roadmap-grid">
                <article data-reveal>
                  <div className="roadmap-title">
                    <h3>{c.roadmap.nextTitle}</h3>
                    <ArrowRight size={22} />
                  </div>
                  <p>{c.roadmap.nextDescription}</p>
                  <ul>
                    {c.roadmap.next.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </article>
                <article data-reveal>
                  <div className="roadmap-title">
                    <h3>{c.roadmap.laterTitle}</h3>
                    <Sparkles size={22} />
                  </div>
                  <p>{c.roadmap.laterDescription}</p>
                  <ul>
                    {c.roadmap.later.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </article>
              </div>
            </div>
          </div>
        </section>
        <section className="section container audience-section">
          <h2 data-reveal>{c.audience.title}</h2>
          <div className="audience-grid">
            <article data-reveal>
              <h3>{c.audience.forTitle}</h3>
              <ul>
                {c.audience.for.map((item) => (
                  <li key={item}>
                    <Check size={18} />
                    {item}
                  </li>
                ))}
              </ul>
            </article>
            <article data-reveal>
              <h3>{c.audience.notTitle}</h3>
              <ul>
                {c.audience.not.map((item) => (
                  <li key={item}>
                    <span className="list-dash" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </section>
        <section className="section container faq-section" id="faq">
          <h2 data-reveal>{c.faq.title}</h2>
          <FAQ />
        </section>
        <section className="waitlist-section" id="waitlist">
          <div className="container waitlist-layout">
            <div data-reveal>
              <h2>{c.waitlist.title}</h2>
              <p>{c.waitlist.description}</p>
              <span className="waitlist-mission">{c.hero.mission}</span>
            </div>
            <WaitlistForm />
          </div>
        </section>
      </main>
      <footer className="container footer">
        <div>
          <a href="#top" aria-label={c.ui.backToTop}>
            <Brand />
          </a>
          <p>{c.footer.tagline}</p>
        </div>
        <a className="text-link" href="#top">
          {c.footer.backToTop}
          <ArrowUpRight size={16} />
        </a>
      </footer>
      <ScrollMotion />
    </>
  );
}
