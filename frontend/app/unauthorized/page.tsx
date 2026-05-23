import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Access restricted</h1>
      <p>You need to sign in or your session has expired.</p>
      <Link href="/login">Sign in</Link>
    </main>
  );
}
