"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowRight, Sparkles } from "lucide-react";

import { Button } from "@/components/Button";
import { Badge, ScoreReadout } from "@/components/Badge";

const ease = [0.22, 1, 0.36, 1] as const;

const heroContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const heroItem = {
  hidden: {
    opacity: 1,
    y: 0,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease,
    },
  },
};

const featureContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const featureItem = {
  hidden: {
    opacity: 1,
    y: 0,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease,
    },
  },
};

export default function Home() {
  return (
    <div className="relative overflow-hidden">
      {/* ------------------------------------------------ */}
      {/* Subtle background atmosphere                     */}
      {/* ------------------------------------------------ */}

      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[-180px] h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-teal-light/30 blur-3xl"
        animate={{
          scale: [1, 1.08, 1],
          opacity: [0.45, 0.65, 0.45],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <main className="relative mx-auto max-w-6xl px-6">
        {/* ------------------------------------------------ */}
        {/* HERO                                             */}
        {/* ------------------------------------------------ */}

        <motion.section
          variants={heroContainer}
          initial={false}
          animate="visible"
          className="grid gap-12 pb-16 pt-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:pt-28"
        >
          {/* Hero copy */}

          <div>
            <motion.div variants={heroItem}>
              <Badge tone="teal">
                <span className="inline-flex items-center gap-1.5">
                  <motion.span
                    animate={{
                      scale: [1, 1.25, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <Sparkles className="h-3 w-3" />
                  </motion.span>

                  For campus recruiting
                </span>
              </Badge>
            </motion.div>

            <motion.h1
              variants={heroItem}
              className="mt-5 max-w-3xl font-display text-4xl font-semibold leading-[1.08] tracking-tight text-ink sm:text-5xl lg:text-[3.65rem]"
            >
              Interviews that check if you{" "}
              <span className="relative whitespace-nowrap">
                actually know it.
                <motion.span
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{
                    delay: 0.8,
                    duration: 0.8,
                    ease,
                  }}
                  className="absolute -bottom-1 left-0 h-[3px] w-full origin-left rounded-full bg-teal"
                />
              </span>
            </motion.h1>

            <motion.p
              variants={heroItem}
              className="mt-5 max-w-lg text-base leading-relaxed text-muted"
            >
              A company sets the skills that matter. HireLoop&apos;s AI
              interviewer asks, listens, and probes deeper when an answer is
              thin — then ranks every candidate on substance, not keyword
              overlap.
            </motion.p>

            <motion.div
              variants={heroItem}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <Link href="/signup?role=company">
                <motion.div
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Button variant="primary">
                    I&apos;m hiring
                    <motion.span
                      className="inline-flex"
                      whileHover={{ x: 3, y: -3 }}
                    >
                      <ArrowUpRight className="h-4 w-4" />
                    </motion.span>
                  </Button>
                </motion.div>
              </Link>

              <Link href="/signup?role=student">
                <motion.div
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Button variant="ghost">
                    I&apos;m a candidate
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </motion.div>
              </Link>
            </motion.div>

            <motion.div
              variants={heroItem}
              className="mt-7 flex items-center gap-3 text-xs text-muted"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-teal" />
              Structured interviews
              <span className="text-line">•</span>
              Skill-based evaluation
              <span className="text-line">•</span>
              AI-powered follow-ups
            </motion.div>
          </div>

          {/* ------------------------------------------------ */}
          {/* INTERVIEW PREVIEW                                */}
          {/* ------------------------------------------------ */}

          <motion.div
            variants={heroItem}
            whileHover={{
              y: -5,
              rotateX: 1,
              rotateY: -1,
            }}
            transition={{
              duration: 0.35,
              ease,
            }}
            className="relative"
          >
            {/* Floating glow */}

            <motion.div
              aria-hidden
              className="absolute -inset-4 rounded-2xl bg-teal-light/20 blur-2xl"
              animate={{
                opacity: [0.25, 0.5, 0.25],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            <div className="relative rounded-xl border border-line bg-surface p-5 shadow-[0_4px_28px_-8px_rgba(22,33,62,0.12)]">
              <div className="flex items-center justify-between border-b border-line pb-3">
                <span className="font-mono text-[11px] uppercase tracking-wide text-muted">
                  Session · Backend Intern
                </span>

                <Badge tone="amber">
                  <span className="flex items-center gap-1.5">
                    <motion.span
                      animate={{
                        opacity: [1, 0.3, 1],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                      }}
                      className="h-1.5 w-1.5 rounded-full bg-current"
                    />
                    Live
                  </span>
                </Badge>
              </div>

              <div className="mt-4 space-y-3 font-mono text-[13px] leading-relaxed">
                <motion.p
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: 0.8,
                    duration: 0.5,
                  }}
                >
                  <span className="text-muted">Q ·</span>{" "}
                  <span className="text-ink">
                    Explain how indexing affects a slow query.
                  </span>
                </motion.p>

                <motion.p
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: 1.15,
                    duration: 0.5,
                  }}
                >
                  <span className="text-muted">A ·</span>{" "}
                  <span className="text-ink-soft">
                    &ldquo;It makes lookups faster by avoiding a full
                    scan.&rdquo;
                  </span>
                </motion.p>

                <motion.p
                  initial={{
                    opacity: 0,
                    y: 8,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay: 1.55,
                    duration: 0.6,
                    ease,
                  }}
                  className="rounded-md bg-teal-light px-3 py-2 text-teal-dark"
                >
                  ↳ Follow-up · Which column would you index here, and why
                  that one?
                </motion.p>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
                <span className="text-sm text-muted">
                  Depth-of-knowledge score
                </span>

                <motion.div
                  initial={{
                    opacity: 0,
                    scale: 0.85,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                  transition={{
                    delay: 2,
                    duration: 0.5,
                    ease,
                  }}
                >
                  <ScoreReadout value={6.4} size="sm" />
                </motion.div>
              </div>

              {/* Tiny activity indicator */}

              <motion.div
                className="mt-4 h-1 overflow-hidden rounded-full bg-paper"
              >
                <motion.div
                  className="h-full rounded-full bg-teal"
                  initial={{ width: "0%" }}
                  animate={{ width: "64%" }}
                  transition={{
                    delay: 2.1,
                    duration: 1,
                    ease,
                  }}
                />
              </motion.div>
            </div>
          </motion.div>
        </motion.section>

        {/* ------------------------------------------------ */}
        {/* HOW IT WORKS                                     */}
        {/* ------------------------------------------------ */}

        <motion.section
          variants={featureContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{
            once: true,
            amount: 0.25,
          }}
          className="grid gap-6 border-t border-line py-16 sm:grid-cols-3"
        >
          <motion.div
            variants={featureItem}
            whileHover={{ y: -4 }}
            className="group rounded-lg p-3 transition-colors hover:bg-surface"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-teal">
                01 · Company
              </span>

              <ArrowUpRight className="h-4 w-4 text-muted opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
            </div>

            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              Define the role and required skills — or paste in your own
              question set.
            </p>
          </motion.div>

          <motion.div
            variants={featureItem}
            whileHover={{ y: -4 }}
            className="group rounded-lg p-3 transition-colors hover:bg-surface"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-teal">
                02 · AI Interviewer
              </span>

              <ArrowUpRight className="h-4 w-4 text-muted opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
            </div>

            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              Asks each candidate the same core questions, then follows up
              live wherever an answer is vague.
            </p>
          </motion.div>

          <motion.div
            variants={featureItem}
            whileHover={{ y: -4 }}
            className="group rounded-lg p-3 transition-colors hover:bg-surface"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-teal">
                03 · Ranking
              </span>

              <ArrowUpRight className="h-4 w-4 text-muted opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
            </div>

            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              Every candidate gets a skill-by-skill breakdown — the company
              gets a ranked shortlist.
            </p>
          </motion.div>
        </motion.section>

        {/* ------------------------------------------------ */}
        {/* FINAL CTA                                       */}
        {/* ------------------------------------------------ */}

        <motion.section
          initial={false}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            amount: 0.35,
          }}
          transition={{
            duration: 0.7,
            ease,
          }}
          className="border-t border-line py-16"
        >
          <div className="flex flex-col gap-6 rounded-xl border border-line bg-surface p-7 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div>
              <p className="font-mono text-xs uppercase tracking-wide text-teal">
                Ready to test real knowledge?
              </p>

              <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-ink">
                Build a better interview process.
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
                Create a hiring drive or start preparing for your next
                technical interview.
              </p>
            </div>

            <Link href="/signup">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                <Button variant="primary">
                  Get started
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
              </motion.div>
            </Link>
          </div>
        </motion.section>
      </main>

      {/* ------------------------------------------------ */}
      {/* FOOTER                                           */}
      {/* ------------------------------------------------ */}

      <footer className="border-t border-line py-8">
        <p className="mx-auto max-w-6xl px-6 font-mono text-xs text-muted">
          HireLoop — built as a college mini-project.
        </p>
      </footer>
    </div>
  );
}