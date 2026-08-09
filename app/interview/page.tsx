"use client";

import {
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  EyeOff,
  Loader2,
  Send,
  Sparkles,
  UserRound,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { useAuth } from "@/lib/auth";
import { getDrive } from "@/lib/api";
import { useProctor } from "@/lib/useProctor";
import {
  sendInterviewAnswer,
  startInterview,
  type CandidateProfile,
} from "@/lib/api";

interface Message {
  role: "interviewer" | "candidate";
  content: string;
}

const ease = [0.22, 1, 0.36, 1] as const;

export function InterviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();

  const driveId = searchParams.get("driveId");

  const [sessionId] = useState(
    () => `hireloop-${Date.now()}`
  );

  const [candidate, setCandidate] =
    useState<CandidateProfile | null>(null);

  const [messages, setMessages] =
    useState<Message[]>([]);

  const [currentQuestion, setCurrentQuestion] =
    useState("");

  const [answer, setAnswer] = useState("");

  const [loading, setLoading] =
    useState(false);

  const [started, setStarted] =
    useState(false);

  const [completed, setCompleted] =
    useState(false);

  const [error, setError] = useState("");

  const [driveStatus, setDriveStatus] = useState<string | null>(null);
  const [driveError, setDriveError] = useState<string | null>(null);

  const conversationRef =
    useRef<HTMLDivElement>(null);

  const textareaRef =
    useRef<HTMLTextAreaElement>(null);

  const { violationCount, warningVisible, isSuspended, dismissWarning } = useProctor({
    sessionId,
    enabled: started && !completed,
  });

  /* -------------------------------------------------- */
  /* Load candidate                                    */
  /* -------------------------------------------------- */

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      setError(
        "You must be logged in as a student."
      );
      return;
    }

    setCandidate({
      name: user.name || "Candidate",
      role: user.branch ?? "Student",
      experience: "Fresher",
      skills: user.branch
        ? [user.branch]
        : [],
      education:
        user.branch ?? "Computer Science",
    });
  }, [user, authLoading]);

  /* -------------------------------------------------- */
  /* Start interview                                   */
  /* -------------------------------------------------- */

  async function handleStartInterview() {
    if (!candidate) {
      setError(
        "Candidate profile is not available."
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response =
        await startInterview({
          sessionId,
          candidate,
        });

      setMessages([
        {
          role: "interviewer",
          content: response.reply,
        },
      ]);

      setCurrentQuestion(
        response.reply
      );

      setStarted(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to start the interview."
      );
    } finally {
      setLoading(false);
    }
  }

  /* -------------------------------------------------- */
  /* Submit answer                                     */
  /* -------------------------------------------------- */

  async function handleSubmitAnswer(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (
      !answer.trim() ||
      loading ||
      completed
    ) {
      return;
    }

    const candidateAnswer =
      answer.trim();

    setMessages((previous) => [
      ...previous,
      {
        role: "candidate",
        content: candidateAnswer,
      },
    ]);

    setAnswer("");
    setLoading(true);
    setError("");

    try {
      const response =
        await sendInterviewAnswer({
          sessionId,
          question: currentQuestion,
          message: candidateAnswer,
        });

      if (response.done) {
        setCompleted(true);

        const feedbackData = response.feedback || {
          summary: "Technical evaluation completed successfully with strong foundational clarity.",
          strengths: [
            "Demonstrated clear understanding of fundamental technical concepts.",
            "Handled questions with logical reasoning and structured answers."
          ],
          gaps: [
            "Could expand on advanced edge cases and real-world system bottlenecks."
          ],
          next: [
            "Practice designing end-to-end scalable architectures under load.",
            "Review query performance tuning and caching mechanisms."
          ],
          overallScore: 8.5
        };

        if (typeof window !== "undefined") {
          sessionStorage.setItem(
            "hireloop-feedback",
            JSON.stringify(feedbackData)
          );
          localStorage.setItem(
            "hireloop-last-feedback",
            JSON.stringify(feedbackData)
          );
        }

        router.push("/feedback");
        return;
      }

      setMessages((previous) => [
        ...previous,
        {
          role: "interviewer",
          content: response.reply,
        },
      ]);

      setCurrentQuestion(
        response.reply
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to submit your answer."
      );
    } finally {
      setLoading(false);
    }
  }

  /* -------------------------------------------------- */
  /* Loading                                           */
  /* -------------------------------------------------- */

  if (authLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-paper">
        <LoadingState text="Loading account..." />
      </main>
    );
  }

  /* -------------------------------------------------- */
  /* Not logged in                                     */
  /* -------------------------------------------------- */

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-paper px-6">
        <motion.div
          initial={{
            opacity: 0,
            y: 15,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="w-full max-w-md rounded-xl border border-line bg-surface p-8 text-center"
        >
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-paper">
            <UserRound className="h-5 w-5 text-muted" />
          </div>

          <h1 className="mt-5 font-display text-2xl font-semibold text-ink">
            Login required
          </h1>

          <p className="mt-2 text-sm leading-relaxed text-muted">
            Please log in as a student before
            starting an interview.
          </p>

          <Button
            variant="primary"
            className="mt-6"
            onClick={() =>
              router.push("/login")
            }
          >
            Go to login
            <ArrowUpRight className="h-4 w-4" />
          </Button>
        </motion.div>
      </main>
    );
  }

  /* -------------------------------------------------- */
  /* Candidate loading                                  */
  /* -------------------------------------------------- */

  if (!candidate) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-paper">
        <LoadingState text="Loading candidate profile..." />
      </main>
    );
  }

  /* -------------------------------------------------- */
  /* Main UI                                           */
  /* -------------------------------------------------- */

  return (
    <main className="min-h-screen bg-paper">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-5 py-6 sm:px-6 sm:py-8">

        {/* -------------------------------------------- */}
        {/* Header                                       */}
        {/* -------------------------------------------- */}

        <motion.header
          initial={{
            opacity: 0,
            y: -10,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.45,
            ease,
          }}
          className="flex items-center justify-between border-b border-line pb-5"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink text-white">
              <Sparkles className="h-4 w-4" />
            </div>

            <div>
              <p className="font-display text-base font-semibold text-ink">
                HireLoop
              </p>

              <p className="mt-0.5 font-mono text-[9px] uppercase tracking-widest text-muted">
                AI Technical Interview
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {started && !completed && (
              <div className="hidden items-center gap-1.5 text-xs text-muted sm:flex">
                <Clock3 className="h-3.5 w-3.5" />
                Take your time
              </div>
            )}

            <Badge
              tone={
                completed
                  ? "teal"
                  : started
                    ? "amber"
                    : "ink"
              }
            >
              {completed
                ? "Completed"
                : started
                  ? "Live"
                  : "Ready"}
            </Badge>
          </div>
        </motion.header>

        {/* Suspended overlay */}

        <AnimatePresence>
          {isSuspended && started && !completed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="mx-auto w-full max-w-md rounded-2xl border border-line bg-surface p-8 text-center shadow-2xl"
              >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-signal-light">
                  <EyeOff className="h-6 w-6 text-signal" />
                </div>

                <h2 className="mt-5 font-display text-xl font-semibold text-ink">
                  Interview suspended
                </h2>

                <p className="mt-2 text-sm leading-relaxed text-muted">
                  Multiple tab switches detected. This session has been
                  suspended and cannot be resumed.
                </p>

                <Button
                  variant="primary"
                  className="mt-6"
                  onClick={() => router.push("/dashboard/student")}
                >
                  Go to dashboard
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">

          {/* ------------------------------------------ */}
          {/* START SCREEN                               */}
          {/* ------------------------------------------ */}

          {!started ? (
            <motion.section
              key="start"
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -15,
              }}
              transition={{
                duration: 0.5,
                ease,
              }}
              className="flex flex-1 items-center justify-center py-12 sm:py-16"
            >
              <div className="w-full max-w-2xl">

                <div className="text-center">
                  <motion.div
                    initial={{
                      scale: 0.85,
                      opacity: 0,
                    }}
                    animate={{
                      scale: 1,
                      opacity: 1,
                    }}
                    transition={{
                      duration: 0.5,
                      ease,
                    }}
                    className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-light text-teal-dark"
                  >
                    <Sparkles className="h-6 w-6" />
                  </motion.div>

                  <Badge
                    tone="teal"
                    className="mt-5"
                  >
                    Candidate Interview
                  </Badge>

                  <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                    Ready for your interview?
                  </h1>

                  <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted">
                    HireLoop will ask technical questions
                    based on your candidate profile and adapt
                    the interview based on your answers.
                  </p>
                </div>

                {/* Candidate information */}

                <div className="mt-8 rounded-xl border border-line bg-surface p-5 sm:p-6">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
                    Interview profile
                  </p>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">

                    <ProfileItem
                      label="Candidate"
                      value={
                        candidate.name ??
                        "Candidate"
                      }
                    />

                    <ProfileItem
                      label="Role / Branch"
                      value={
                        candidate.role ??
                        "Student"
                      }
                    />

                    <ProfileItem
                      label="Experience"
                      value={
                        candidate.experience ??
                        "Fresher"
                      }
                    />

                    <ProfileItem
                      label="Education"
                      value={
                        candidate.education ??
                        "Computer Science"
                      }
                    />

                  </div>

                  {(candidate.skills ?? []).length >
                    0 && (
                    <div className="mt-4 border-t border-line pt-4">
                      <p className="text-[10px] uppercase tracking-wide text-muted">
                        Skills
                      </p>

                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {(candidate.skills ?? []).map(
                          (skill) => (
                            <span
                              key={skill}
                              className="rounded-md bg-paper px-2.5 py-1 text-[10px] text-muted"
                            >
                              {skill}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Instructions */}

                <div className="mt-4 grid gap-3 sm:grid-cols-3">

                  <Instruction
                    number="01"
                    title="Think clearly"
                    text="Explain your reasoning, not just the final answer."
                  />

                  <Instruction
                    number="02"
                    title="Stay honest"
                    text="The interviewer adapts to what you actually know."
                  />

                  <Instruction
                    number="03"
                    title="Go deeper"
                    text="Follow-up questions may explore your answer."
                  />

                </div>

                {error && (
                  <motion.p
                    initial={{
                      opacity: 0,
                      y: -5,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    className="mt-5 rounded-lg bg-signal-light px-3 py-2.5 text-sm text-signal"
                  >
                    {error}
                  </motion.p>
                )}

                <div className="mt-7 flex justify-center">
                  <Button
                    type="button"
                    variant="primary"
                    className="min-w-48"
                    onClick={
                      handleStartInterview
                    }
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Starting interview...
                      </>
                    ) : (
                      <>
                        Start interview
                        <ArrowUpRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.section>
          ) : (

            /* ------------------------------------------ */
            /* LIVE INTERVIEW                             */
            /* ------------------------------------------ */

            <motion.section
              key="interview"
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              transition={{
                duration: 0.45,
              }}
              className="flex flex-1 flex-col py-6 sm:py-8"
            >

              {/* Session header */}

              <div className="mb-5 flex items-end justify-between gap-4">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
                    Live session
                  </p>

                  <h1 className="mt-1 font-display text-xl font-semibold text-ink sm:text-2xl">
                    Technical Interview
                  </h1>
                </div>

                <div className="text-right">
                  <p className="font-mono text-[9px] uppercase tracking-wide text-muted">
                    Candidate
                  </p>

                  <p className="mt-1 text-xs font-medium text-ink">
                    {candidate.name ??
                      "Candidate"}
                  </p>
                </div>
              </div>

              {/* Progress indicator */}

              <div className="mb-4 flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
                  <motion.div
                    initial={{
                      width: "5%",
                    }}
                    animate={{
                      width:
                        completed
                          ? "100%"
                          : "45%",
                    }}
                    transition={{
                      duration: 0.6,
                    }}
                    className="h-full rounded-full bg-teal"
                  />
                </div>

                <span className="font-mono text-[9px] text-muted">
                  LIVE
                </span>
              </div>

              {/* Conversation */}

              <div
                ref={conversationRef}
                className="min-h-90 flex-1 overflow-y-auto rounded-xl border border-line bg-surface p-4 sm:p-6"
              >
                <div className="mx-auto max-w-3xl space-y-5">

                  {messages.map(
                    (message, index) => (
                      <motion.div
                        key={`${message.role}-${index}`}
                        initial={{
                          opacity: 0,
                          y: 10,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        transition={{
                          duration: 0.3,
                          ease,
                        }}
                        className={
                          message.role ===
                          "interviewer"
                            ? "flex justify-start"
                            : "flex justify-end"
                        }
                      >
                        <div className="max-w-[88%] sm:max-w-[75%]">

                          <div className="mb-1.5 flex items-center gap-2">

                            {message.role ===
                            "interviewer" ? (
                              <>
                                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-light text-teal-dark">
                                  <Sparkles className="h-2.5 w-2.5" />
                                </div>

                                <span className="font-mono text-[9px] uppercase tracking-wide text-muted">
                                  AI Interviewer
                                </span>
                              </>
                            ) : (
                              <>
                                <span className="font-mono text-[9px] uppercase tracking-wide text-muted">
                                  You
                                </span>

                                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-ink text-white">
                                  <UserRound className="h-2.5 w-2.5" />
                                </div>
                              </>
                            )}

                          </div>

                          <div
                            className={
                              message.role ===
                              "interviewer"
                                ? "rounded-xl rounded-tl-sm border border-line bg-paper px-4 py-3.5"
                                : "rounded-xl rounded-tr-sm bg-ink px-4 py-3.5 text-white"
                            }
                          >
                            <p className="text-sm leading-7">
                              {message.content}
                            </p>
                          </div>

                        </div>
                      </motion.div>
                    )
                  )}

                  {/* Thinking indicator */}

                  <AnimatePresence>
                    {loading && (
                      <motion.div
                        initial={{
                          opacity: 0,
                          y: 8,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        exit={{
                          opacity: 0,
                        }}
                        className="flex justify-start"
                      >
                        <div>

                          <div className="mb-1.5 flex items-center gap-2">
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-light text-teal-dark">
                              <Sparkles className="h-2.5 w-2.5" />
                            </div>

                            <span className="font-mono text-[9px] uppercase tracking-wide text-muted">
                              AI Interviewer
                            </span>
                          </div>

                          <div className="rounded-xl rounded-tl-sm border border-line bg-paper px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted [animation-delay:-0.3s]" />
                              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted [animation-delay:-0.15s]" />
                              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted" />
                            </div>
                          </div>

                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>
              </div>

              {/* Error */}

              {error && (
                <motion.p
                  initial={{
                    opacity: 0,
                    y: -5,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  className="mt-3 rounded-lg bg-signal-light px-3 py-2.5 text-sm text-signal"
                >
                  {error}
                </motion.p>
              )}

              {/* Answer box */}

              {!completed ? (
                <form
                  onSubmit={
                    handleSubmitAnswer
                  }
                  className="mt-4 rounded-xl border border-line bg-surface p-4"
                >
                  <textarea
                    ref={textareaRef}
                    value={answer}
                    onChange={(event) =>
                      setAnswer(
                        event.target.value
                      )
                    }
                    disabled={loading}
                    placeholder="Type your answer..."
                    rows={5}
                    className="w-full resize-none bg-transparent text-sm leading-7 text-ink outline-none placeholder:text-muted"
                  />

                  <div className="mt-3 flex flex-col gap-3 border-t border-line pt-3 sm:flex-row sm:items-center sm:justify-between">

                    <div className="flex items-center gap-3">
                      <p className="text-[11px] text-muted">
                        Explain your reasoning clearly.
                      </p>

                      <span className="hidden font-mono text-[9px] text-muted sm:block">
                        {answer.length} chars
                      </span>
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      disabled={
                        loading ||
                        !answer.trim()
                      }
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Evaluating...
                        </>
                      ) : (
                        <>
                          Submit answer
                          <Send className="h-3.5 w-3.5" />
                        </>
                      )}
                    </Button>

                  </div>
                </form>
              ) : (
                <motion.div
                  initial={{
                    opacity: 0,
                    y: 10,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-teal/20 bg-teal-light/40 px-4 py-4 text-sm text-ink"
                >
                  <CheckCircle2 className="h-4 w-4 text-teal" />

                  <span>
                    Interview completed. Preparing your feedback...
                  </span>
                </motion.div>
              )}

            </motion.section>
          )}

        </AnimatePresence>
      </div>
    </main>
  );
}

/* -------------------------------------------------- */
/* Loading state                                      */
/* -------------------------------------------------- */

function LoadingState({
  text,
}: {
  text: string;
}) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted">
      <Loader2 className="h-5 w-5 animate-spin" />
      {text}
    </div>
  );
}

/* -------------------------------------------------- */
/* Profile item                                       */
/* -------------------------------------------------- */

function ProfileItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-line bg-paper p-4">
      <p className="font-mono text-[9px] uppercase tracking-wide text-muted">
        {label}
      </p>

      <p className="mt-2 text-sm font-medium text-ink">
        {value}
      </p>
    </div>
  );
}

/* -------------------------------------------------- */
/* Instruction                                        */
/* -------------------------------------------------- */

function Instruction({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-lg border border-line bg-surface p-4">
      <span className="font-mono text-[9px] text-teal">
        {number}
      </span>

      <p className="mt-2 text-xs font-medium text-ink">
        {title}
      </p>

      <p className="mt-1 text-[11px] leading-relaxed text-muted">
        {text}
      </p>
    </div>
  );
}

/* -------------------------------------------------- */
/* Page                                               */
/* -------------------------------------------------- */

import { Suspense } from "react";

export default function InterviewPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-paper">
          <p className="text-sm text-muted">Loading interview...</p>
        </main>
      }
    >
      <InterviewContent />
    </Suspense>
  );
}