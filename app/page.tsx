import { HeroRoles } from "./HeroRoles";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Canvas mesh texture overlay - subtle needlepoint feel */}
      <div
        className="canvas-mesh-dots fixed inset-0 -z-20 opacity-60"
        aria-hidden
      />
      {/* Coastal gradient wash */}
      <div
        className="fixed inset-0 -z-10 opacity-70"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 100% 80% at 30% 20%, var(--teal) 0%, transparent 50%), radial-gradient(ellipse 80% 60% at 70% 80%, var(--sea-glass) 0%, transparent 45%)",
        }}
      />

      <main className="mx-auto max-w-4xl px-5 py-8 sm:px-8 sm:py-12 md:py-16">
        <header className="mb-12 sm:mb-16">
          <p
            className="font-serif text-xl font-semibold tracking-[0.25em] uppercase text-navy sm:text-2xl"
            style={{ fontFamily: "var(--font-cormorant), serif" }}
          >
            Needlepointer
          </p>
        </header>

        {/* Hero - stacked identities, then the one that's hers */}
        <section className="hero-navy canvas-mesh relative overflow-hidden rounded-3xl shadow-xl sm:px-10 sm:py-16 md:px-14 md:py-20">
          <div className="relative z-10">
            <HeroRoles />
          </div>
          {/* Decorative corner mesh accent */}
          <div
            className="canvas-mesh absolute bottom-0 right-0 h-32 w-48 opacity-20 sm:h-40 sm:w-64"
            aria-hidden
          />
        </section>

        <section className="mt-12 space-y-8 sm:mt-16 sm:space-y-10">
          <p className="max-w-2xl text-lg leading-relaxed text-foreground sm:text-xl">
            This is the corner of the internet where your canvas stash gets a
            proper catalog, your WIPs get the spotlight they deserve, and your
            thread collection finally has a home. Share progress, swap ideas,
            and meet other needlepointers who get it — because loving this craft
            isn&apos;t a hobby, it&apos;s a lifestyle.
          </p>

          <div className="pt-2">
            <a
              href="/stash"
              className="btn-primary group relative inline-flex items-center justify-center rounded-2xl px-10 py-4 text-lg font-bold uppercase tracking-wider shadow-lg transition-all duration-200 hover:scale-[1.02] hover:opacity-90 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-[#2B5F8E] focus:ring-offset-2 focus:ring-offset-background active:scale-[0.98] sm:px-12 sm:py-5 sm:text-xl"
            >
              <span className="relative z-10">Get Started</span>
              <span
                className="absolute inset-0 rounded-2xl bg-white opacity-0 transition-opacity duration-200 group-hover:opacity-10"
                aria-hidden
              />
            </a>
          </div>
        </section>

        {/* Feature badges - punchy and proud */}
        <ul
          className="mt-20 grid gap-6 border-t border-ocean-mist pt-12 sm:mt-24 sm:grid-cols-2 sm:gap-8 sm:pt-16"
          aria-hidden
        >
          {[
            { label: "Canvas stash", tag: "finally organized", color: "text-teal" },
            { label: "WIPs", tag: "no judgment", color: "text-navy" },
            { label: "Threads", tag: "all of them", color: "text-teal" },
            { label: "Community", tag: "your people", color: "text-sand" },
          ].map((item) => (
            <li key={item.label} className={`text-sm font-semibold uppercase tracking-widest ${item.color}`}>
              <span className="block text-foreground">{item.label}</span>
              <span className="mt-0.5 block text-xs font-normal normal-case tracking-normal opacity-80">
                {item.tag}
              </span>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
