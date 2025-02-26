import Link from 'next/link';

export default function SignInPage() {
  return (
    <main className="flex h-screen w-full items-center justify-center">
      <a
        href="/api/auth/login"
        className="rounded bg-blue-1 px-6 py-2 text-white"
      >
        <Link href="/api/auth/login">Login with Auth0</Link>
      </a>
    </main>
  );
}