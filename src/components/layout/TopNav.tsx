import Image from "next/image";
import Link from "next/link";

export function TopNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex h-20 w-full max-w-6xl items-center justify-between px-4 md:px-6 lg:px-0">
        <Link href="/" className="flex items-center gap-2 text-slate-900">
          <Image src="/logo.svg" alt="Product Lookup logo" width={36} height={36} priority />
          <span className="whitespace-nowrap text-[20px] font-semibold leading-none tracking-tight sm:text-[22px] md:text-[24px] lg:text-[28px]">
            Product Lookup
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Register
          </Link>
        </div>
      </nav>
    </header>
  );
}
