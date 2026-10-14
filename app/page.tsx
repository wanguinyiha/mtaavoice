import Link from "next/link";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Card } from "@/components/ui/Card";
import { CATEGORY_SEED } from "@/lib/categories";

const PRIMARY_LG =
  "inline-flex items-center justify-center rounded-[10px] bg-brand px-6 py-4 text-base font-semibold text-white transition-colors hover:bg-brand-strong";

const SECONDARY_LG =
  "inline-flex items-center justify-center rounded-[10px] border border-brand bg-white px-6 py-4 text-base font-semibold text-brand transition-colors hover:bg-brand-soft";

const STEPS = [
  {
    number: "1",
    title: "Report the problem",
    body: "Describe the issue, add photos, choose a category and share the location — from your phone or computer.",
  },
  {
    number: "2",
    title: "We review & assign",
    body: "Administrators verify the report, accept it and assign the right department and field worker.",
  },
  {
    number: "3",
    title: "Track it to resolution",
    body: "Follow live status updates, progress notes and photo evidence until the issue is fixed.",
  },
];

const ROLES = [
  {
    title: "Citizens",
    body: "Report community problems and follow every step of the fix through a clear status timeline.",
  },
  {
    title: "Administrators",
    body: "Review incoming reports, reject or merge duplicates, assign teams and monitor progress community-wide.",
  },
  {
    title: "Field workers",
    body: "See your assigned jobs, record progress notes, upload evidence and mark issues resolved.",
  },
];

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="border-b border-line bg-surface">
          <div className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-6 sm:py-24">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-wide text-brand">
                Community issue reporting
              </p>
              <h1 className="mt-3 text-4xl font-bold leading-tight text-neutral-900 sm:text-5xl">
                Report it. Track it. Get it fixed.
              </h1>
              <p className="mt-4 text-lg leading-8 text-neutral-600">
                MtaaVoice connects citizens, administrators and field workers in
                one platform — so community problems like potholes, broken
                streetlights and overflowing garbage get seen, assigned and
                resolved.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/register" className={PRIMARY_LG}>
                  Report an Issue
                </Link>
                <Link href="/login" className={SECONDARY_LG}>
                  Track a Report
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section
          id="how-it-works"
          className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-6"
        >
          <h2 className="text-2xl font-bold text-neutral-900">
            How it works
          </h2>
          <p className="mt-2 text-neutral-600">
            Three simple steps from problem to resolution.
          </p>
          <ol className="mt-8 grid gap-4 sm:grid-cols-3">
            {STEPS.map((step) => (
              <li key={step.number}>
                <Card className="h-full">
                  <span
                    aria-hidden="true"
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-sm font-bold text-white"
                  >
                    {step.number}
                  </span>
                  <h3 className="mt-3 text-base font-semibold text-neutral-900">
                    {step.title}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-neutral-500">
                    {step.body}
                  </p>
                </Card>
              </li>
            ))}
          </ol>
        </section>

        <section id="categories" className="border-y border-line bg-surface">
          <div className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-6">
            <h2 className="text-2xl font-bold text-neutral-900">
              What you can report
            </h2>
            <p className="mt-2 text-neutral-600">
              From damaged roads to blocked drains — if it affects your
              community, report it here.
            </p>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {CATEGORY_SEED.map((category) => (
                <li
                  key={category.name}
                  className="rounded-[10px] border border-line bg-white p-4"
                >
                  <h3 className="text-sm font-semibold text-neutral-900">
                    {category.name}
                  </h3>
                  <p className="mt-1 text-sm text-neutral-500">
                    {category.description}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-6">
          <h2 className="text-2xl font-bold text-neutral-900">
            Built for the whole community
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {ROLES.map((role) => (
              <Card key={role.title}>
                <h3 className="text-base font-semibold text-neutral-900">
                  {role.title}
                </h3>
                <p className="mt-1 text-sm leading-6 text-neutral-500">
                  {role.body}
                </p>
              </Card>
            ))}
          </div>
        </section>

        <section className="bg-brand">
          <div className="mx-auto w-full max-w-5xl px-4 py-14 text-center sm:px-6">
            <h2 className="text-2xl font-bold text-white">
              Ready to give your mtaa a voice?
            </h2>
            <p className="mt-2 text-blue-100">
              Create a free account and report your first issue in minutes.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-[10px] bg-white px-6 py-4 text-base font-semibold text-brand transition-colors hover:bg-brand-soft"
              >
                Create an account
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-[10px] border border-white/70 px-6 py-4 text-base font-semibold text-white transition-colors hover:bg-white/10"
              >
                Log in
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
