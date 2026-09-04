import {
    FormEvent,
    useState,
  } from "react";
  
  import { signInAdmin } from "../../services/authService";
  
  interface AdminLoginProps {
    onSuccess: () => void;
  }
  
  export default function AdminLogin({
    onSuccess,
  }: AdminLoginProps) {
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
  
      setError("");
      setLoading(true);
  
      try {
        await signInAdmin(
          email,
          password
        );
  
        onSuccess();
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to sign in."
        );
      } finally {
        setLoading(false);
      }
    }
  
    return (
      <main className="min-h-screen bg-brand-beige px-6 py-16">
        <div className="mx-auto flex min-h-[70vh] max-w-md items-center">
          <div className="w-full rounded-2xl border border-brand-border bg-brand-ivory p-8 shadow-sm sm:p-10">
  
            <div className="text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-ochre">
                Cafe Two Shades
              </p>
  
              <h1 className="mt-3 font-serif text-3xl font-semibold">
                Admin Login
              </h1>
  
              <p className="mt-3 text-sm leading-6 text-stone-500">
                This area is for authorised Cafe Two
                Shades administrators.
              </p>
            </div>
  
            {error && (
              <div
                role="alert"
                className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              >
                {error}
              </div>
            )}
  
            <form
              onSubmit={handleSubmit}
              className="mt-8 space-y-5"
            >
              <div>
                <label
                  htmlFor="admin-email"
                  className="text-sm font-medium"
                >
                  Email
                </label>
  
                <input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(
                      event.target.value
                    )
                  }
                  autoComplete="username"
                  required
                  className={inputClass}
                />
              </div>
  
              <div>
                <label
                  htmlFor="admin-password"
                  className="text-sm font-medium"
                >
                  Password
                </label>
  
                <input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(event) =>
                    setPassword(
                      event.target.value
                    )
                  }
                  autoComplete="current-password"
                  required
                  className={inputClass}
                />
              </div>
  
              <button
                type="submit"
                disabled={loading}
                className="
                  w-full
                  rounded-xl
                  bg-brand-ochre
                  px-5
                  py-3.5
                  text-sm
                  font-semibold
                  text-brand-black
                  transition
                  hover:bg-brand-ochre-dark
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                {loading
                  ? "Signing in..."
                  : "Sign In"}
              </button>
            </form>
          </div>
        </div>
      </main>
    );
  }
  
  
  const inputClass = `
    mt-2
    w-full
    rounded-xl
    border
    border-brand-border
    bg-white
    px-4
    py-3
    text-sm
    outline-none
    transition
    focus:border-brand-ochre
    focus:ring-2
    focus:ring-brand-ochre/20
  `;