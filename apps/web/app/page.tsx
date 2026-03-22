export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <div className="flex flex-col items-center gap-3 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">
          CollaborativeWhiteBoard
        </h1>
        <p className="max-w-md text-lg text-gray-500">
          Realtime collaborative whiteboard with CRDT-based sync, live cursor
          presence, and a hand-drawn aesthetic.
        </p>
      </div>

      <div className="flex gap-4">
        <a
          href="/board/demo"
          className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
        >
          Open Demo Board
        </a>
        <a
          href="/auth/signin"
          className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
        >
          Sign In
        </a>
      </div>

      <p className="text-xs text-gray-400">
        Scaffold only — full implementation coming soon.
      </p>
    </main>
  );
}
