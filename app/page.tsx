import { PRODUCT_NAME, content as c } from "@/lib/content";
import { Brand, BrandMark } from "@/components/brand";
import { ChapterIndex, FAQ, WaitlistForm } from "@/components/interactive";

// Page layout from the accepted mockup (context/changes/przebudowa-strony/makieta/makieta.html).
export default function Home() {
  const cmp = c.comparison;
  return (
    <>
      <a className="skip-link" href="#main">
        {c.ui.skipLink}
      </a>
      <header className="top">
        <div className="top-in pad">
          <a className="brand-link" href="#top" aria-label={c.ui.brandHome}>
            <Brand />
          </a>
          <a className="btn" href="#waitlist">
            {c.hero.primary}
          </a>
        </div>
      </header>

      <main id="main">
        <section className="hero pad" id="top">
          <p className="mono">{c.hero.mission}</p>
          <h1>
            <span>{c.hero.heading[0]}</span> <span>{c.hero.heading[1]}</span>
          </h1>
          <p className="lead">{c.hero.lead}</p>
          <div className="hero-actions">
            <a className="btn" href="#waitlist">
              {c.hero.primary}
            </a>
            <a className="btn btn-line" href="#why">
              {c.hero.secondary}
            </a>
          </div>
        </section>

        <div className="frame">
          <div className="chapters" id="how-it-works">
            <ChapterIndex
              items={c.chapters.map((chapter) => ({
                id: chapter.id,
                label: chapter.indexLabel,
              }))}
              label={c.ui.chapters}
            />
            <div>
              {c.chapters.map((chapter) => (
                <section className="chapter" id={chapter.id} key={chapter.id}>
                  <div>
                    <p className="chapter-label">
                      <span className="mono">{chapter.label}</span>
                      {chapter.soon && (
                        <span className="soon">{c.ui.comingSoon}</span>
                      )}
                    </p>
                    <h2>
                      <span className="q">{chapter.quiet}</span>{" "}
                      {chapter.heading}
                    </h2>
                    {chapter.lead && <p className="lead">{chapter.lead}</p>}
                    <ul className="points">
                      {chapter.points.map((point) => (
                        <li key={point.title}>
                          <h3>{point.title}</h3>
                          <p>{point.text}</p>
                          {point.next && <p className="next">{point.next}</p>}
                        </li>
                      ))}
                    </ul>
                  </div>
                </section>
              ))}
            </div>
          </div>

          <section className="sec" id="why">
            <div className="sec-in pad">
              <div className="sec-head">
                <p className="mono">{cmp.label}</p>
                <h2>{cmp.title}</h2>
                <p className="lead">{cmp.lead}</p>
              </div>
              <div className="cmp" role="table" aria-label={cmp.ariaLabel}>
                <div className="cmp-row cmp-head" role="row">
                  <span role="columnheader"></span>
                  <span role="columnheader">{cmp.columns.builders}</span>
                  <span role="columnheader">
                    <BrandMark />
                    {cmp.columns.maestro}
                  </span>
                </div>
                {cmp.rows.map((row) => (
                  <div className="cmp-row" role="row" key={row.label}>
                    <span role="rowheader">{row.label}</span>
                    <span role="cell">
                      <span className="who">{cmp.columns.builders}</span>
                      {row.builders}
                    </span>
                    <span role="cell">
                      <span className="who">{cmp.columns.maestro}</span>
                      {row.maestro}
                      {row.soon && (
                        <span className="soon">{c.ui.comingSoon}</span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="sec faq" id="faq">
            <div className="faq-head">
              <p className="mono">{c.faq.label}</p>
              <h2>
                <span>{c.faq.title[0]}</span>{" "}
                <span className="q">{c.faq.title[1]}</span>
              </h2>
            </div>
            <FAQ />
          </section>
        </div>
      </main>

      <footer className="close" id="waitlist">
        <span id="first-release"></span>
        <div className="close-in pad">
          <h2>{c.waitlist.title}</h2>
          <p className="lead">{c.waitlist.description}</p>
          <WaitlistForm />
          <p className="word" aria-hidden="true">
            {PRODUCT_NAME.toLowerCase()}
          </p>
          <div className="foot">
            <a href="#top" aria-label={c.ui.brandHome}>
              <BrandMark />
            </a>
            <span>{c.footer.tagline}</span>
            <a href="#top">{c.footer.backToTop}</a>
          </div>
        </div>
      </footer>
    </>
  );
}
