import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8f5ef] px-5">
      <div className="max-w-md text-center">
        <p className="text-xs font-medium uppercase tracking-[0.25em] text-[#8a6a22]">
          Cafe Two Shades
        </p>

        <h1 className="mt-4 font-serif text-5xl text-[#171512]">
          404
        </h1>

        <p className="mt-4 text-sm leading-6 text-[#6b645b]">
          Sorry, we couldn't find the page you're
          looking for.
        </p>

        <Link
          to="/"
          className="mt-6 inline-block rounded-lg bg-[#171512] px-5 py-3 text-sm text-white"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}