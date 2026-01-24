'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
          <h2 className="text-3xl font-bold tracking-tight mb-4">Something went wrong!</h2>
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
