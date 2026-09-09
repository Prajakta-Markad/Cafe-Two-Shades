import { type FormEvent, useState, } from "react";

import { useLocation, useNavigate, } from "react-router-dom";

import { supabase } from "../../lib/supabase";
import { getCurrentAdmin, } from "../../services/adminService";

export default function AdminLogin() {
  const navigate =
    useNavigate();

  const location =
    useLocation();

  const [
    email,
    setEmail,
  ] = useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (loading) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const {
        error: signInError,
      } =
        await supabase.auth.signInWithPassword({
          email:
            email.trim(),
          password,
        });

      if (signInError) {
        throw new Error(
          "Invalid email or password."
        );
      }

      /*
       * Authentication alone does not grant
       * dashboard access.
       *
       * The user must also exist in
       * admin_profiles and be active.
       */

      const admin =
        await getCurrentAdmin();

      if (!admin) {
        await supabase.auth.signOut();

        throw new Error(
          "You do not have permission to access the admin area."
        );
      }

      const destination =
        (
          location.state as
            | {
                from?: string;
              }
            | null
        )?.from ??
        "/admin";

      navigate(
        destination,
        {
          replace: true,
        }
      );
    } catch (loginError) {
      setError(
        loginError instanceof Error
          ? loginError.message
          : "Unable to sign in."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#faf8f4] px-6 py-12">
      <section className="w-full max-w-md">
        <div className="rounded-2xl border border-[#e1d9cc] bg-white p-7 shadow-sm sm:p-9">
          <div className="text-center">
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-[#8a6a22]">
              Cafe Two Shades
            </p>

            <h1 className="mt-3 font-serif text-3xl text-[#171512]">
              Admin login
            </h1>

            <p className="mt-3 text-sm leading-6 text-[#6b645b]">
              This area is restricted to
              authorised café administrators.
            </p>
          </div>

          <form
            onSubmit={
              handleSubmit
            }
            className="mt-8 space-y-5"
          >
            <div>
              <label
                htmlFor="admin-email"
                className="block text-sm font-medium text-[#29251f]"
              >
                Email address
              </label>

              <input
                id="admin-email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(event) =>
                  setEmail(
                    event.target.value
                  )
                }
                required
                disabled={loading}
                className="mt-2 block w-full rounded-lg border border-[#d7cfc2] bg-[#faf8f4] px-4 py-3 text-sm text-[#171512] outline-none transition focus:border-[#8a6a22] focus:ring-2 focus:ring-[#8a6a22]/20 disabled:opacity-60"
              />
            </div>

            <div>
              <label
                htmlFor="admin-password"
                className="block text-sm font-medium text-[#29251f]"
              >
                Password
              </label>

              <input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) =>
                  setPassword(
                    event.target.value
                  )
                }
                required
                disabled={loading}
                className="mt-2 block w-full rounded-lg border border-[#d7cfc2] bg-[#faf8f4] px-4 py-3 text-sm text-[#171512] outline-none transition focus:border-[#8a6a22] focus:ring-2 focus:ring-[#8a6a22]/20 disabled:opacity-60"
              />
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-lg bg-red-50 px-4 py-3 text-sm leading-5 text-red-800"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#171512] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#302b25] focus:outline-none focus:ring-2 focus:ring-[#8a6a22] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Signing in..."
                : "Sign in"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-[#7a736a]">
          Authorised administrators only.
        </p>
      </section>
    </main>
  );
}