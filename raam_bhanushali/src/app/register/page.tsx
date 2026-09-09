"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function register(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data: { error?: string } = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Registration failed. Please try again.");
        return;
      }
      router.push("/login");
    } catch {
      setError("We could not create your account. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-zinc-950 text-white"><div className="pointer-events-none absolute left-[-12rem] top-[-8rem] h-[32rem] w-[32rem] rounded-full bg-cyan-500/10 blur-[120px]" /><div className="pointer-events-none absolute bottom-[-12rem] right-[-8rem] h-[30rem] w-[30rem] rounded-full bg-purple-500/10 blur-[120px]" /><div className="relative mx-auto grid min-h-screen max-w-6xl items-center gap-12 px-5 py-10 sm:px-8 lg:grid-cols-[1fr_440px] lg:gap-20"><section className="hidden lg:block"><Link href="/" className="text-xl font-semibold tracking-tight">Resume<span className="text-cyan-400">Forge</span></Link><p className="mt-1 text-[10px] uppercase tracking-[0.22em] text-zinc-500">AI Portfolio Builder</p><div className="mt-20 max-w-lg"><p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-400">RESUMEFORGE AI</p><h1 className="mt-5 text-5xl font-semibold leading-[1.05] tracking-tight">Create your professional<br /><span className="text-cyan-300">identity</span> in minutes.</h1><p className="mt-6 max-w-md text-lg leading-8 text-zinc-400">Turn the experience you already have into a portfolio people remember.</p><div className="mt-8 space-y-4 text-sm text-zinc-400"><p><span className="mr-3 text-cyan-300">✓</span>Make your experience easy to share</p><p><span className="mr-3 text-cyan-300">✓</span>Choose a style that feels like you</p><p><span className="mr-3 text-cyan-300">✓</span>Publish when you are ready</p></div></div><SignupVisual /></section><section className="mx-auto w-full max-w-md"><Link href="/" className="lg:hidden text-xl font-semibold tracking-tight">Resume<span className="text-cyan-400">Forge</span></Link><div className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-950/80 p-6 shadow-2xl backdrop-blur-xl sm:p-8"><p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-400">Start building</p><h2 className="mt-3 text-3xl font-semibold tracking-tight">Create your account</h2><p className="mt-3 text-sm text-zinc-500">Start building your AI-powered portfolio.</p><form onSubmit={register} className="mt-8 space-y-5"><div><label htmlFor="register-name" className="mb-2 block text-sm font-medium text-zinc-300">Full name</label><input id="register-name" name="name" type="text" autoComplete="name" required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="h-12 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/15" placeholder="John Smith" /></div><div><label htmlFor="register-email" className="mb-2 block text-sm font-medium text-zinc-300">Email</label><input id="register-email" name="email" type="email" autoComplete="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="h-12 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/15" placeholder="you@example.com" /></div><div><label htmlFor="register-password" className="mb-2 block text-sm font-medium text-zinc-300">Password</label><div className="relative"><input id="register-password" name="password" type={showPassword ? "text" : "password"} autoComplete="new-password" minLength={6} required value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className="h-12 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 pr-20 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/15" placeholder="At least 6 characters" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs text-zinc-500 hover:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-cyan-400/50">{showPassword ? "Hide" : "Show"}</button></div></div>{error && <p role="alert" className="rounded-lg border border-rose-400/20 bg-rose-400/10 px-3 py-2.5 text-sm text-rose-300">{error}</p>}<button type="submit" disabled={loading} className="h-12 w-full rounded-xl bg-cyan-400 text-sm font-semibold text-zinc-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60">{loading ? "Creating account..." : "Create Account"}</button></form><p className="mt-7 text-center text-sm text-zinc-500">Already have an account? <Link href="/login" className="font-medium text-cyan-300 hover:text-cyan-200">Sign in</Link></p></div></section></div></main>
  );
}

function SignupVisual() {
  return <div className="mt-20 max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5"><div className="flex items-center justify-between"><span className="text-[10px] font-semibold tracking-[0.2em] text-cyan-300">AI ANALYSIS</span><span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(103,232,249,0.9)]" /></div><div className="mt-5 grid gap-3 text-xs text-zinc-400 sm:grid-cols-2"><span><b className="mr-2 text-emerald-300">✓</b>Experience</span><span><b className="mr-2 text-emerald-300">✓</b>Skills</span><span><b className="mr-2 text-emerald-300">✓</b>Projects</span><span><b className="mr-2 text-emerald-300">✓</b>Education</span></div><div className="mt-5 border-t border-zinc-800 pt-4 text-sm font-medium text-cyan-300">Portfolio ready <span className="ml-2 text-zinc-600">→</span></div></div>;
}
