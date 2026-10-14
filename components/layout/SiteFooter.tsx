export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-2 px-4 py-8 text-center sm:px-6">
        <p className="text-sm font-semibold text-neutral-900">MtaaVoice</p>
        <p className="text-xs text-neutral-500">
          Report it. Track it. Get it fixed.
        </p>
        <p className="text-xs text-neutral-400">
          A community issue reporting and management platform.
        </p>
      </div>
    </footer>
  );
}
