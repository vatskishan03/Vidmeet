import Link from 'next/link'

export default function SignUpPage() {
  return (
    <main className="flex h-screen w-full items-center justify-center">
      <a
        href="/api/auth/login"
        className="rounded bg-blue-1 px-6 py-2 text-white"
      >
        Sign Up (Auth0)
      </a>
    </main>
  );
}