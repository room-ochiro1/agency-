import { BeamReveal } from "@/components/beam-reveal";
import { PackageBuilder } from "@/components/builder/package-builder";
import { SelectUnitLink, UnitProvider } from "@/components/builder/unit-context";
import { PrismStage } from "@/components/hero/prism-stage";
import { SiteHeader } from "@/components/site-header";
import { units } from "@/lib/catalog";

const principles = [
  {
    title: "Зорилгоос эхэлнэ",
    body: "Эхлээд юунд хүрэхээ тохиролцоод, дараа нь үйлчилгээгээ сонгоно.",
  },
  {
    title: "Үнэ ил тод",
    body: "Модуль бүрийн үнэ урьдчилан харагдана. Нэмэлт зардлыг тусад нь бичнэ.",
  },
  {
    title: "Үр дүн хэмжинэ",
    body: "Ажил бүр тохиролцсон KPI, тогтмол тайлантай.",
  },
];

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main id="top">
        <section className="hero" aria-labelledby="hero-title">
          <div className="wrap hero-inner">
            <div className="hero-copy">
              <h1 id="hero-title" className="hero-title">
                <span className="line">
                  <span>Санааг</span>
                </span>{" "}
                <span className="line">
                  <span>нөлөө</span>
                </span>{" "}
                <span className="line">
                  <span>болгоно.</span>
                </span>
              </h1>
              <p className="hero-lede">
                Зорилгоо сонго. Хэрэгтэй үйлчилгээгээ бүрдүүл. Дараагийн өсөлтөө өнөөдөр эхлүүл.
              </p>
              <div className="hero-actions">
                <a className="btn btn-primary" href="#builder">
                  Багцаа бүрдүүлэх
                </a>
                <a className="link" href="#services">
                  Бид юу хийдэг вэ?
                </a>
              </div>
            </div>
          </div>
          <PrismStage />
        </section>

        <section id="approach" className="section approach" aria-labelledby="approach-title">
          <div className="wrap">
            <div className="section-head">
              <h2 id="approach-title">
                Илүү тод санаа.
                <br />
                Илүү бодит өсөлт.
              </h2>
              <p>
                Бид стратеги, бүтээл, туршлагыг нэг системд холбож, бизнесийн зорилгыг хэмжигдэхүйц үр дүн
                болгодог.
              </p>
            </div>
            <ul className="principles">
              {principles.map((p) => (
                <li key={p.title}>
                  <h3>{p.title}</h3>
                  <p>{p.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <UnitProvider>
          <section id="services" className="section services" aria-labelledby="services-title">
            <div className="wrap">
              <div className="section-head">
                <h2 id="services-title">
                  Нэг зорилго.
                  <br />
                  Гурван хүч.
                </h2>
                <p>Танд яг хэрэгтэй модулиудаа сонгож, зөвхөн хэрэгтэй зүйлдээ хөрөнгө оруул.</p>
              </div>
              <BeamReveal className="unit-grid">
                {units.map((unit) => (
                  <article key={unit.id} className="unit" data-unit={unit.id}>
                    <span className="unit-beam" data-beam-line aria-hidden="true" />
                    <h3>{unit.name}</h3>
                    <p className="unit-promise">{unit.promise}</p>
                    <ul className="unit-offerings">
                      {unit.offerings.map((offering) => (
                        <li key={offering}>{offering}</li>
                      ))}
                    </ul>
                    <SelectUnitLink unit={unit.id} className="link unit-link">
                      {unit.name} модулиуд харах
                    </SelectUnitLink>
                  </article>
                ))}
              </BeamReveal>
            </div>
          </section>

          <section id="builder" className="section builder" aria-labelledby="builder-title">
            <div className="wrap">
              <div className="section-head">
                <h2 id="builder-title">
                  Таны зорилго.
                  <br />
                  Таны багц.
                </h2>
                <p>Гурван алхмаар хэрэгтэй үйлчилгээгээ сонгоод урьдчилсан үнийн хүрээг хараарай.</p>
              </div>
              <PackageBuilder />
            </div>
          </section>
        </UnitProvider>

        <section className="section manifesto" aria-label="Бидний итгэл">
          <div className="wrap">
            <blockquote>
              <p>Сайн санаа ганцаараа хангалтгүй. Түүнийг хөдөлгөх систем хэрэгтэй.</p>
            </blockquote>
          </div>
        </section>
      </main>

      <footer id="contact" className="site-footer">
        <div className="wrap footer-grid">
          <div>
            <a className="wordmark" href="#top">
              AGENCY
            </a>
            <p>Санааг нөлөө болгоно.</p>
          </div>
          <div className="footer-contact">
            {/* TODO(production): replace with AGENCY's real address (README, step 2). */}
            <a className="link" href="mailto:hello@yourdomain.mn">
              hello@yourdomain.mn
            </a>
            <a className="link" href="#builder">
              Багцаа бүрдүүлэх
            </a>
          </div>
          <p className="footer-meta">
            Улаанбаатар, Монгол
            <br />© 2026 AGENCY
          </p>
        </div>
      </footer>
    </>
  );
}
