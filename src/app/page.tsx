import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-3xl font-semibold">NISIT Platform</h1>
      <p className="max-w-md text-center text-slate-600">
        Certification platform. Sign in and open the administration console below.
      </p>
      <Link href="/admin" className="btn btn-primary">
        Open Admin Console
      </Link>
    </main>
  );
}
