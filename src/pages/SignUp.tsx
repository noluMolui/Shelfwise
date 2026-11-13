
import { useState } from "react";
import { Package, Eye, EyeOff } from "lucide-react";

function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [message, setMessage] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }

    if (!ageConfirmed || !privacyAccepted) {
      setMessage("Please accept both required confirmations.");
      return;
    }

    setMessage(
      "Your registration form is ready. Account creation will be connected to Supabase."
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">

        <div className="mb-7 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-white">
            <Package size={30} />
          </div>

          <h1 className="text-2xl font-bold text-primary">
            ShelfWise<span className="text-accent">.</span>
          </h1>

          <h2 className="mt-5 text-xl font-semibold text-foreground">
            Create your account
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Start managing your business inventory today.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          <div>
            <label htmlFor="fullName" className="mb-2 block text-sm font-medium">
              Full name
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
          </div>

          <div>
            <label htmlFor="businessName" className="mb-2 block text-sm font-medium">
              Business name
            </label>
            <input
              id="businessName"
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Enter your business name"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium">
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium">
              Password
            </label>

            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                minLength={6}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-12 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3.5 text-gray-500"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <label className="flex items-start gap-3 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={ageConfirmed}
                onChange={(e) => setAgeConfirmed(e.target.checked)}
                className="mt-1 accent-[#17324D]"
                required
              />
              I am 18 or older.
            </label>

            <label className="flex items-start gap-3 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={privacyAccepted}
                onChange={(e) => setPrivacyAccepted(e.target.checked)}
                className="mt-1 accent-[#17324D]"
                required
              />
              I have read the{" "}
              <a
                href="/privacy.html"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-primary underline"
              >
                Privacy Notice
              </a>.
            </label>
          </div>

          {message && (
            <p
              role="status"
              className="rounded-lg bg-gray-100 p-3 text-sm text-primary"
            >
              {message}
            </p>
          )}

          <button
            type="submit"
            className="w-full rounded-lg bg-primary py-3 font-semibold text-white transition hover:bg-[#244767]"
          >
            Create Account
          </button>

        </form>

        <p className="mt-6 text-center text-xs text-gray-400">
          By creating an account, you agree to use ShelfWise responsibly.
        </p>

      </div>
    </div>
  );
}

export default SignUp;
