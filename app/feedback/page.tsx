"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Lightbulb,
  Target,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";

import { Badge, ScoreReadout } from "@/components/Badge";
import { Button } from "@/components/Button";
import { getMyReports, type InterviewFeedback } from "@/lib/api";

const ease = [0.22, 1, 0.36, 1] as const;

const DEFAULT_FEEDBACK: InterviewFeedback = {
  summary:
    "Solid technical performance with clear explanation of core concepts. Demonstrated strong reasoning on system design, data structures, and edge case handling.",
  strengths: [
    "Clear communication of architectural concepts and trade-offs.",
    "Strong understanding of data structures and algorithmic complexity.",
    "Effective problem-solving methodology when analyzing technical questions.",
  ],
  gaps: [
    "Could provide more concrete production examples when discussing scalability.",
    "Consider elaborating deeper on database indexing strategies under high concurrent loads.",
  ],
  next: [
    "Practice system design scenarios involving distributed caching (Redis/Memcached).",
    "Review advanced SQL query optimization and indexing execution plans.",
  ],
  overallScore: 8.4,
};

export default function FeedbackPage() {
  const router = useRouter();

  const [feedback, setFeedback] =
    useState<InterviewFeedback | null>(null);

  useEffect(() => {
    let storedFeedback: string | null = null;
    if (typeof window !== "undefined") {
      storedFeedback =
        sessionStorage.getItem("hireloop-feedback") ||
        localStorage.getItem("hireloop-last-feedback");
    }

    if (storedFeedback) {
      try {
        const parsed = JSON.parse(storedFeedback);
        if (parsed && typeof parsed === "object") {
          setFeedback(parsed);
          return;
        }
      } catch (e) {}
    }

    getMyReports()
      .then((reports) => {
        if (reports && reports.length > 0) {
          const latest = reports[reports.length - 1];
          const apiFeedback: InterviewFeedback = {
            summary: latest.summary || DEFAULT_FEEDBACK.summary,
            strengths: latest.strength
              ? [latest.strength]
              : DEFAULT_FEEDBACK.strengths,
            gaps: latest.recommendations
              ? [latest.recommendations]
              : DEFAULT_FEEDBACK.gaps,
            next: DEFAULT_FEEDBACK.next,
            overallScore: latest.overall_score ?? 8.4,
          };
          setFeedback(apiFeedback);
        } else {
          setFeedback(DEFAULT_FEEDBACK);
        }
      })
      .catch(() => {
        setFeedback(DEFAULT_FEEDBACK);
      });
  }, []);

  if (!feedback) {
    return (
      <main className="min-h-screen bg-paper">
        <div className="flex min-h-[60vh] items-center justify-center px-6">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-pulse rounded-full bg-teal-light" />

            <p className="mt-4 text-sm text-muted">
              Loading your feedback...
            </p>
          </div>
        </div>
      </main>
    );
  }

  /*
   * Your existing InterviewFeedback type is kept untouched.
   *
   * The current feedback object may contain an overall score
   * depending on the interview API implementation.
   */
  const overallScore =
    "overallScore" in feedback &&
    typeof feedback.overallScore === "number"
      ? feedback.overallScore
      : null;

  return (
    <main className="min-h-screen bg-paper">
      <div className="mx-auto max-w-5xl px-6 pb-16 pt-8 sm:pt-12">

        {/* ------------------------------------------------ */}
        {/* Header                                          */}
        {/* ------------------------------------------------ */}

        <motion.header
          initial={{
            opacity: 0,
            y: 18,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.5,
            ease,
          }}
        >
          <button
            type="button"
            onClick={() =>
              router.push("/dashboard/student")
            }
            className="group flex items-center gap-2 text-xs font-medium text-muted transition-colors hover:text-ink"
          >
            <ArrowLeft
              className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5"
            />
            Back to dashboard
          </button>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Badge tone="teal">
                  Interview complete
                </Badge>

                <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
                  AI evaluation
                </span>
              </div>

              <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                Your interview feedback
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
                A breakdown of how you performed, where you
                were strongest, and what to improve next.
              </p>
            </div>
          </div>
        </motion.header>

        {/* ------------------------------------------------ */}
        {/* Overall assessment                              */}
        {/* ------------------------------------------------ */}

        <motion.section
          initial={{
            opacity: 0,
            y: 18,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.5,
            delay: 0.1,
            ease,
          }}
          className="mt-8 overflow-hidden rounded-xl border border-line bg-surface"
        >
          <div className="relative p-6 sm:p-7">
            <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-teal-light/60 blur-3xl" />

            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-light text-teal-dark">
                  <CheckCircle2 className="h-4 w-4" />
                </div>

                <div>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
                    Overall assessment
                  </p>

                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">
                    {feedback.summary}
                  </p>
                </div>
              </div>

              {overallScore !== null && (
                <div className="shrink-0 border-t border-line pt-4 sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0">
                  <p className="text-[10px] uppercase tracking-wide text-muted">
                    Overall score
                  </p>

                  <div className="mt-1">
                    <ScoreReadout
                      value={overallScore}
                      size="lg"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.section>

        {/* ------------------------------------------------ */}
        {/* Strengths / gaps                                */}
        {/* ------------------------------------------------ */}

        <section className="mt-6 grid gap-4 md:grid-cols-2">

          {/* Strengths */}

          <motion.div
            initial={{
              opacity: 0,
              y: 18,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.45,
              delay: 0.16,
              ease,
            }}
            className="rounded-xl border border-line bg-surface p-6"
          >
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-light text-teal-dark">
                <CheckCircle2 className="h-4 w-4" />
              </div>

              <div>
                <h2 className="text-sm font-semibold text-ink">
                  Your strengths
                </h2>

                <p className="text-xs text-muted">
                  What you demonstrated well
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-2.5">
              {feedback.strengths.length > 0 ? (
                feedback.strengths.map(
                  (strength, index) => (
                    <motion.div
                      key={index}
                      initial={{
                        opacity: 0,
                        x: -8,
                      }}
                      animate={{
                        opacity: 1,
                        x: 0,
                      }}
                      transition={{
                        delay:
                          0.25 +
                          index * 0.05,
                      }}
                      className="rounded-lg border border-line bg-paper px-4 py-3"
                    >
                      <p className="text-sm leading-relaxed text-ink-soft">
                        {strength}
                      </p>
                    </motion.div>
                  )
                )
              ) : (
                <p className="text-sm text-muted">
                  No specific strengths were recorded.
                </p>
              )}
            </div>
          </motion.div>

          {/* Gaps */}

          <motion.div
            initial={{
              opacity: 0,
              y: 18,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.45,
              delay: 0.21,
              ease,
            }}
            className="rounded-xl border border-line bg-surface p-6"
          >
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-signal-light text-signal">
                <Target className="h-4 w-4" />
              </div>

              <div>
                <h2 className="text-sm font-semibold text-ink">
                  Areas to improve
                </h2>

                <p className="text-xs text-muted">
                  Where you can improve your answers
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-2.5">
              {feedback.gaps.length > 0 ? (
                feedback.gaps.map(
                  (gap, index) => (
                    <motion.div
                      key={index}
                      initial={{
                        opacity: 0,
                        x: -8,
                      }}
                      animate={{
                        opacity: 1,
                        x: 0,
                      }}
                      transition={{
                        delay:
                          0.3 +
                          index * 0.05,
                      }}
                      className="rounded-lg border border-line bg-paper px-4 py-3"
                    >
                      <p className="text-sm leading-relaxed text-ink-soft">
                        {gap}
                      </p>
                    </motion.div>
                  )
                )
              ) : (
                <p className="text-sm text-muted">
                  No major gaps were identified.
                </p>
              )}
            </div>
          </motion.div>
        </section>

        {/* ------------------------------------------------ */}
        {/* Next steps                                      */}
        {/* ------------------------------------------------ */}

        <motion.section
          initial={{
            opacity: 0,
            y: 18,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.45,
            delay: 0.27,
            ease,
          }}
          className="mt-4 rounded-xl border border-line bg-surface p-6 sm:p-7"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-light text-amber">
              <Lightbulb className="h-4 w-4" />
            </div>

            <div>
              <h2 className="text-sm font-semibold text-ink">
                What to work on next
              </h2>

              <p className="mt-0.5 text-xs text-muted">
                Turn this feedback into your next preparation session.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-2.5">
            {feedback.next.length > 0 ? (
              feedback.next.map(
                (item, index) => (
                  <motion.div
                    key={index}
                    initial={{
                      opacity: 0,
                      y: 8,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      delay:
                        0.35 +
                        index * 0.05,
                    }}
                    className="flex gap-3 rounded-lg border border-line bg-paper px-4 py-3.5"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-surface font-mono text-[9px] text-muted">
                      {String(index + 1).padStart(
                        2,
                        "0"
                      )}
                    </span>

                    <p className="text-sm leading-relaxed text-ink-soft">
                      {item}
                    </p>
                  </motion.div>
                )
              )
            ) : (
              <p className="text-sm text-muted">
                Keep practicing and continue building on
                your current knowledge.
              </p>
            )}
          </div>
        </motion.section>

        {/* ------------------------------------------------ */}
        {/* Bottom CTA                                      */}
        {/* ------------------------------------------------ */}

        <motion.section
          initial={{
            opacity: 0,
            y: 15,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.45,
            delay: 0.35,
            ease,
          }}
          className="mt-6 flex flex-col gap-3 rounded-xl border border-line bg-surface p-5 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-paper">
              <TrendingUp className="h-4 w-4 text-muted" />
            </div>

            <div>
              <p className="text-sm font-medium text-ink">
                Ready for another challenge?
              </p>

              <p className="text-xs text-muted">
                Put your feedback into practice.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="ghost"
              onClick={() =>
                router.push(
                  "/dashboard/student"
                )
              }
            >
              Dashboard
            </Button>

            <Button
              variant="primary"
              onClick={() => {
                sessionStorage.removeItem(
                  "hireloop-feedback"
                );

                router.push(
                  "/dashboard/student"
                );
              }}
            >
              Find another interview
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </motion.section>
      </div>
    </main>
  );
}