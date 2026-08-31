"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const result = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (result?.error) {
      setError("Invalid email or password. Please try again.");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-zinc-950 text-white">
      <div className="pointer-events-none absolute left-[-12rem] top-[-8rem] h-[32rem] w-[32rem] rounded-full bg-cyan-500/10 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-[-12rem] right-[-8rem] h-[30rem] w-[30rem] rounded-full bg-purple-500/10 blur-[120px]" />
      <div className="relative mx-auto grid min-h-screen max-w-6xl items-center gap-12 px-5 py-10 sm:px-8 lg:grid-cols-[1fr_440px] lg:gap-20">
        <section className="hidden lg:block">
          <Link href="/" className="text-xl font-semibold tracking-tight">Resume<span className="text-cyan-400">Forge</span></Link>
          <p className="mt-1 text-[10px] uppercase tracking-[0.22em] text-zinc-500">AI Portfolio Builder</p>
          <div className="mt-20 max-w-lg"><p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-400">RESUMEFORGE AI</p><h1 className="mt-5 text-5xl font-semibold leading-[1.05] tracking-tight">Your resume deserves<br />more than a <span className="text-cyan-300">PDF.</span></h1><p className="mt-6 max-w-md text-lg leading-8 text-zinc-400">Create a portfolio that represents your work and helps the right people find it.</p><div className="mt-8 space-y-4 text-sm text-zinc-400"><p><span className="mr-3 text-cyan-300">✓</span>AI-powered resume analysis</p><p><span className="mr-3 text-cyan-300">✓</span>Professional portfolio themes</p><p><span className="mr-3 text-cyan-300">✓</span>Built-in analytics</p></div></div><AuthVisual />
        </section>
        <section className="mx-auto w-full max-w-md"><Link href="/" className="lg:hidden text-xl font-semibold tracking-tight">Resume<span className="text-cyan-400">Forge</span></Link><div className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-950/80 p-6 shadow-2xl backdrop-blur-xl sm:p-8"><p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-400">Welcome back</p><h2 className="mt-3 text-3xl font-semibold tracking-tight">Sign in to continue</h2><p className="mt-3 text-sm text-zinc-500">Access your portfolio workspace.</p><form onSubmit={login} className="mt-8 space-y-5"><div><label htmlFor="login-email" className="mb-2 block text-sm font-medium text-zinc-300">Email</label><input id="login-email" name="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="h-12 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/15" placeholder="you@example.com" /></div><div><div className="mb-2 flex items-center justify-between"><label htmlFor="login-password" className="block text-sm font-medium text-zinc-300">Password</label><span className="text-xs text-zinc-600">Keep it secure</span></div><div className="relative"><input id="login-password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} className="h-12 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 pr-20 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/15" placeholder="Enter your password" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs text-zinc-500 hover:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-cyan-400/50">{showPassword ? "Hide" : "Show"}</button></div></div>{error && <p role="alert" className="rounded-lg border border-rose-400/20 bg-rose-400/10 px-3 py-2.5 text-sm text-rose-300">{error}</p>}<button type="submit" disabled={loading} className="h-12 w-full rounded-xl bg-cyan-400 text-sm font-semibold text-zinc-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60">{loading ? "Signing in..." : "Sign In"}</button></form><div className="my-7 flex items-center gap-3"><div className="h-px flex-1 bg-zinc-800" /><span className="text-xs text-zinc-600">ResumeForge</span><div className="h-px flex-1 bg-zinc-800" /></div><p className="text-center text-sm text-zinc-500">Don&apos;t have an account? <Link href="/signup" className="font-medium text-cyan-300 hover:text-cyan-200">Create account</Link></p></div></section>
      </div>
    </main>
  );
}

function AuthVisual() {
  return <div className="mt-20 flex max-w-md items-center gap-3"><div className="rounded-xl border border-zinc-800 bg-zinc-900/70 px-4 py-3 text-xs text-zinc-300"><span className="block text-[10px] tracking-widest text-zinc-600">RESUME</span><span className="mt-2 block">Your experience</span></div><div className="h-px flex-1 bg-gradient-to-r from-cyan-400/60 to-purple-400/60" /><div className="rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-xs text-cyan-300"><span className="block text-[10px] tracking-widest">AI</span><span className="mt-2 block">Understands you</span></div><div className="h-px flex-1 bg-gradient-to-r from-cyan-400/60 to-purple-400/60" /><div className="rounded-xl border border-purple-400/30 bg-purple-400/10 px-4 py-3 text-xs text-purple-200"><span className="block text-[10px] tracking-widest">READY</span><span className="mt-2 block">Your portfolio</span></div></div>;
}
