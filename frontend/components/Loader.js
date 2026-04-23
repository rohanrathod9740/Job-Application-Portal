export default function Loader({ label = "Loading your workspace..." }) {
  return (
    <div className="app-shell flex items-center justify-center px-4">
      <div className="panel w-full max-w-sm rounded-[2rem] p-8 text-center">
        <div className="mx-auto h-14 w-14 animate-spin rounded-full border-[3px] border-[rgba(18,33,63,0.12)] border-t-[var(--accent)]" />
        <p className="mt-5 text-lg font-semibold text-[var(--foreground)]">
          {label}
        </p>
        <p className="subtle-text mt-2 text-sm">
          We&apos;re lining things up for you.
        </p>
      </div>
    </div>
  );
}
