"use client";

import { Suspense, useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  ArrowUpRight,
  BriefcaseBusiness,
  CheckCircle2,
  GraduationCap,
  Loader2,
  UserPlus,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { Logo } from "@/components/Logo";
import { Button } from "@/components/Button";
import { Field, Input } from "@/components/Input";
import { useAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/client";
import { createProfile, createCandidate, createCompany } from "@/lib/api";
import type { UserRole } from "@/lib/types";

const ease = [0.22, 1, 0.36, 1] as const;

function SignupForm() {
  const { signUp } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const requestedRole = searchParams.get("role");

  const initialRole: UserRole =
    requestedRole === "company" || requestedRole === "student"
      ? requestedRole
      : "student";

  const [role, setRole] = useState<UserRole>(initialRole);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [companyName, setCompanyName] = useState("");
  const [branch, setBranch] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    setError(null);
    setSubmitting(true);

    const { error } = await signUp({
      name,
      email,
      password,
      role,
      companyName:
        role === "company"
          ? companyName
          : undefined,
      branch:
        role === "student"
          ? branch
          : undefined,
    });

    if (error) {
      setSubmitting(false);
      setError(error);
      return;
    }

    try {
      const supabaseClient = createClient();
      let userId = "user-" + Date.now();
      try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (session?.user?.id) {
          userId = session.user.id;
        }
      } catch (e) {}

      if (role === "company") {
        createProfile({
          id: userId,
          role: "company",
          full_name: name,
          email,
        }).catch(() => {});
        createCompany({
          owner_id: userId,
          name: companyName,
          email,
        }).catch(() => {});
      } else {
        createProfile({
          id: userId,
          role: "student",
          full_name: name,
          email,
        }).catch(() => {});
        createCandidate({
          user_id: userId,
          name,
          email,
          branch,
        }).catch(() => {});
      }
    } catch {
      // Continue to dashboard
    }

    router.push(
      role === "company"
        ? "/dashboard/company"
        : "/dashboard/student"
    );
  }

  function changeRole(newRole: UserRole) {
    if (newRole === role) return;

    setRole(newRole);
    setError(null);
  }

  return (
    <div className="relative min-h-[calc(100vh-72px)] overflow-hidden">
      {/* ------------------------------------------------ */}
      {/* Background atmosphere                            */}
      {/* ------------------------------------------------ */}

      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[-180px] h-[380px] w-[380px] -translate-x-1/2 rounded-full bg-teal-light/25 blur-3xl"
        animate={{
          scale: [1, 1.08, 1],
          opacity: [0.35, 0.55, 0.35],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* ------------------------------------------------ */}
      {/* Page container                                   */}
      {/* ------------------------------------------------ */}

      <div className="relative mx-auto flex max-w-md flex-col px-6 pb-16 pt-14 sm:pt-20">
        {/* Logo */}

        <motion.div
          initial={{
            opacity: 0,
            y: -10,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.6,
            ease,
          }}
          className="mb-8 flex justify-center"
        >
          <Link
            href="/"
            className="transition-opacity hover:opacity-75"
          >
            <Logo />
          </Link>
        </motion.div>

        {/* ------------------------------------------------ */}
        {/* Signup card                                     */}
        {/* ------------------------------------------------ */}

        <motion.div
          initial={{
            opacity: 0,
            y: 22,
            scale: 0.98,
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          transition={{
            duration: 0.65,
            ease,
          }}
          className="rounded-xl border border-line bg-surface p-7 shadow-[0_4px_28px_-12px_rgba(22,33,62,0.14)] sm:p-8"
        >
          {/* Heading */}

          <motion.div
            initial={{
              opacity: 0,
              y: 8,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.15,
              duration: 0.5,
              ease,
            }}
          >
            <div className="mb-4 flex items-center gap-2 text-xs font-medium text-teal-dark">
              <UserPlus className="h-3.5 w-3.5" />
              Get started with HireLoop
            </div>

            <h1 className="font-display text-xl font-semibold text-ink">
              Create an account
            </h1>

            <p className="mt-1 text-sm text-muted">
              Tell us which side of the interview you&apos;re on.
            </p>
          </motion.div>

          {/* ------------------------------------------------ */}
          {/* Role selector                                   */}
          {/* ------------------------------------------------ */}

          <motion.div
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.25,
              duration: 0.5,
              ease,
            }}
            className="mt-5"
          >
            <div className="relative grid grid-cols-2 gap-1 rounded-lg border border-line bg-paper p-1">
              {/* Animated selection background */}

              <motion.div
                layout
                transition={{
                  type: "spring",
                  stiffness: 420,
                  damping: 32,
                }}
                className={`absolute bottom-1 top-1 w-[calc(50%-4px)] rounded-md bg-ink ${
                  role === "company"
                    ? "left-[calc(50%+1px)]"
                    : "left-1"
                }`}
              />

              <button
                type="button"
                onClick={() => changeRole("student")}
                className={`relative z-10 flex items-center justify-center gap-2 rounded-md py-2.5 text-sm font-medium transition-colors ${
                  role === "student"
                    ? "text-white"
                    : "text-muted hover:text-ink"
                }`}
              >
                <GraduationCap className="h-4 w-4" />
                I&apos;m a candidate
              </button>

              <button
                type="button"
                onClick={() => changeRole("company")}
                className={`relative z-10 flex items-center justify-center gap-2 rounded-md py-2.5 text-sm font-medium transition-colors ${
                  role === "company"
                    ? "text-white"
                    : "text-muted hover:text-ink"
                }`}
              >
                <BriefcaseBusiness className="h-4 w-4" />
                I&apos;m hiring
              </button>
            </div>

            <AnimatePresence mode="wait">
              <motion.p
                key={role}
                initial={{
                  opacity: 0,
                  y: -4,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: 4,
                }}
                transition={{
                  duration: 0.25,
                }}
                className="mt-2 text-center text-xs text-muted"
              >
                {role === "student"
                  ? "Create your candidate profile and find opportunities."
                  : "Set up your company profile and start hiring."}
              </motion.p>
            </AnimatePresence>
          </motion.div>

          {/* ------------------------------------------------ */}
          {/* Form                                             */}
          {/* ------------------------------------------------ */}

          <form
            onSubmit={handleSubmit}
            className="mt-5 flex flex-col gap-4"
          >
            {/* Full name */}

            <motion.div
              initial={{
                opacity: 0,
                y: 10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.35,
                duration: 0.5,
                ease,
              }}
            >
              <Field
                label="Full name"
                htmlFor="name"
              >
                <Input
                  id="name"
                  required
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);

                    if (error) {
                      setError(null);
                    }
                  }}
                />
              </Field>
            </motion.div>

            {/* Role-specific field */}

            <AnimatePresence
              mode="wait"
              initial={false}
            >
              {role === "company" ? (
                <motion.div
                  key="company"
                  initial={{
                    opacity: 0,
                    height: 0,
                    y: -8,
                  }}
                  animate={{
                    opacity: 1,
                    height: "auto",
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    height: 0,
                    y: -8,
                  }}
                  transition={{
                    duration: 0.3,
                    ease,
                  }}
                  className="overflow-hidden"
                >
                  <Field
                    label="Company name"
                    htmlFor="companyName"
                  >
                    <Input
                      id="companyName"
                      required
                      placeholder="Northwind Systems"
                      value={companyName}
                      onChange={(e) => {
                        setCompanyName(e.target.value);

                        if (error) {
                          setError(null);
                        }
                      }}
                    />
                  </Field>
                </motion.div>
              ) : (
                <motion.div
                  key="student"
                  initial={{
                    opacity: 0,
                    height: 0,
                    y: -8,
                  }}
                  animate={{
                    opacity: 1,
                    height: "auto",
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    height: 0,
                    y: -8,
                  }}
                  transition={{
                    duration: 0.3,
                    ease,
                  }}
                  className="overflow-hidden"
                >
                  <Field
                    label="Branch"
                    htmlFor="branch"
                    hint="e.g. CSE, ECE, IT"
                  >
                    <Input
                      id="branch"
                      required
                      placeholder="Computer Science"
                      value={branch}
                      onChange={(e) => {
                        setBranch(e.target.value);

                        if (error) {
                          setError(null);
                        }
                      }}
                    />
                  </Field>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email */}

            <motion.div
              initial={{
                opacity: 0,
                y: 10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.45,
                duration: 0.5,
                ease,
              }}
            >
              <Field
                label="Email"
                htmlFor="email"
              >
                <Input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);

                    if (error) {
                      setError(null);
                    }
                  }}
                />
              </Field>
            </motion.div>

            {/* Password */}

            <motion.div
              initial={{
                opacity: 0,
                y: 10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.52,
                duration: 0.5,
                ease,
              }}
            >
              <Field
                label="Password"
                htmlFor="password"
                hint="At least 6 characters"
              >
                <Input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);

                    if (error) {
                      setError(null);
                    }
                  }}
                />
              </Field>
            </motion.div>

            {/* Error */}

            <AnimatePresence mode="wait">
              {error && (
                <motion.p
                  key="error"
                  initial={{
                    opacity: 0,
                    height: 0,
                    y: -5,
                  }}
                  animate={{
                    opacity: 1,
                    height: "auto",
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    height: 0,
                    y: -5,
                  }}
                  transition={{
                    duration: 0.25,
                  }}
                  className="overflow-hidden rounded-md bg-signal-light px-3 py-2 text-sm text-signal"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Submit */}

            <motion.div
              initial={{
                opacity: 0,
                y: 10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.58,
                duration: 0.5,
                ease,
              }}
              className="mt-2"
            >
              <Button
                type="submit"
                variant="primary"
                className="w-full"
                disabled={submitting}
              >
                <AnimatePresence
                  mode="wait"
                  initial={false}
                >
                  {submitting ? (
                    <motion.span
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center justify-center gap-2"
                    >
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating account…
                    </motion.span>
                  ) : (
                    <motion.span
                      key="create"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center justify-center gap-2"
                    >
                      Create account
                      <ArrowUpRight className="h-4 w-4" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
            </motion.div>
          </form>
        </motion.div>

        {/* ------------------------------------------------ */}
        {/* Login link                                      */}
        {/* ------------------------------------------------ */}

        <motion.p
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            delay: 0.75,
            duration: 0.5,
          }}
          className="mt-6 text-center text-sm text-muted"
        >
          Already have an account?{" "}
          <Link
            href="/login"
            className="group inline-flex items-center gap-1 font-medium text-teal-dark"
          >
            Log in
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
        </motion.p>

        {/* Trust/UX hint */}

        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            delay: 0.85,
            duration: 0.5,
          }}
          className="mt-5 flex items-center justify-center gap-2 text-xs text-muted"
        >
          <CheckCircle2 className="h-3.5 w-3.5 text-teal" />
          Takes less than a minute to get started
        </motion.div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[calc(100vh-72px)] items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-teal" />
        </div>
      }
    >
      <SignupForm />
    </Suspense>
  );
}