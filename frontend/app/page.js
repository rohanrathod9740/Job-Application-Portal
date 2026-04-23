import Link from "next/link";

const HIGHLIGHTS = [
  "Structured hiring workflow",
  "Live application visibility",
  "Secure role-based control",
];

export default function Home() {
  return (
    <div className="app-shell py-10">
      <div className="page-wrap space-y-6">
        <section className="hero-panel overflow-hidden rounded-[2rem] px-6 py-10 sm:px-10 sm:py-14">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div className="relative z-[1]">
              <span className="eyebrow">JobPortal</span>
              <h1 className="mt-5 max-w-2xl text-5xl font-black text-[var(--foreground)] sm:text-6xl">
                Hiring made simple.
              </h1>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/register" className="primary-btn">
                  Create account
                </Link>
                <Link href="/login" className="secondary-btn">
                  Sign in
                </Link>
              </div>
            </div>

            <div className="grid gap-4">
              {HIGHLIGHTS.map((item, index) => (
                <div key={item} className="feature-card">
                  <span className="feature-index">0{index + 1}</span>
                  <p className="mt-6 text-lg font-bold">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
