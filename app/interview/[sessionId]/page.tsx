"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";

import { AuthGuard } from "@/components/AuthGuard";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { useProctor } from "@/lib/useProctor";
import type { SessionStatus } from "@/lib/types";

const ease = [0.22, 1, 0.36, 1] as const;

const SEED_QUESTIONS = [
  {
    id: "q1",
    text: "Explain the difference between a stack and a queue. When would you use each?",
    skill: "DSA",
  },
  {
    id: "q2",
    text: "What is database normalization and why is it important?",
    skill: "DBMS",
  },
  {
    id: "q3",
    text: "Describe how you would design a URL shortening service.",
    skill: "System Design",
  },
];

function InterviewSessionContent() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [status, setStatus] = useState<SessionStatus>("in_progress");

  const handleSecondViolation = () => {
    setStatus("suspended");
  };

  const { violationCount, warningVisible, isSuspended, dismissWarning } = useProctor({
    sessionId,
    enabled: status === "in_progress",
    onSecondViolation: handleSecondViolation,
  });

  const currentQuestion = SEED_QUESTIONS[currentQuestionIndex];

  function handleSubmitAnswer() {
    if (!answer.trim() || submitted) return;
    setSubmitted(true);

    setTimeout(() => {
      if (currentQuestionIndex + 1 < SEED_QUESTIONS.length) {
        setCurrentQuestionIndex((prev) => prev + 1);
        setAnswer("");
        setSubmitted(false);
      } else {
        setStatus("completed");
        const feedbackData = {
          summary: "Completed all core technical evaluation questions with clear reasoning.",
          strengths: [
            "Demonstrated clear understanding of fundamental data structures (Stack vs Queue).",
            "Articulated relational database normalization benefits accurately.",
            "Formulated structured approach for system design architecture."
          ],
          gaps: [
            "Could expand further on distributed caching and concurrency patterns."
          ],
          next: [
            "Practice system design scenarios under high scale and traffic loads."
          ],
          overallScore: 8.5
        };
        if (typeof window !== "undefined") {
          sessionStorage.setItem("hireloop-feedback", JSON.stringify(feedbackData));
          localStorage.setItem("hireloop-last-feedback", JSON.stringify(feedbackData));
        }
        setTimeout(() => {
          router.push("/feedback");
        }, 800);
      }
    }, 600);
  }

  return (
    <main className="mx-auto max-w-3xl px-6 pb-16 pt-8 sm:pt-10">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
            Interview session
          </p>
          <h1 className="font-display text-xl font-semibold tracking-tight text-ink sm:text-2xl">
            {sessionId}
          </h1>
        </div>
        <Badge tone={status === "suspended" ? "signal" : status === "completed" ? "teal" : "amber"}>
          {status.replace("_", " ")}
        </Badge>
      </div>

      {isSuspended && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 rounded-xl border border-signal/30 bg-signal-light/40 px-6 py-10 text-center"
        >
          <p className="text-sm font-semibold text-ink">
            Session suspended
          </p>
          <p className="mt-1 text-xs text-muted">
            Multiple tab switches detected. This session has been paused.
          </p>
          <Button
            variant="primary"
            className="mt-4"
            onClick={() => router.push("/dashboard/student")}
          >
            Go to dashboard
          </Button>
        </motion.div>
      )}

      {!isSuspended && currentQuestion && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease }}
          className="mt-8 overflow-hidden rounded-xl border border-line bg-surface"
        >
          <div className="border-b border-line px-6 py-5 sm:px-7">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
                Question {currentQuestionIndex + 1} / {SEED_QUESTIONS.length}
              </span>
              <span className="text-[10px] text-muted">�</span>
              <span className="font-mono text-[10px] uppercase tracking-widest text-teal">
                {currentQuestion.skill}
              </span>
            </div>
          </div>

          <div className="p-6 sm:p-7">
            <p className="text-sm leading-relaxed text-ink">
              {currentQuestion.text}
            </p>

            <div className="mt-6">
              <label className="block text-xs font-medium text-ink">
                Your answer
              </label>
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                disabled={submitted || status === "completed" || isSuspended}
                rows={5}
                className="mt-2 w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink outline-none transition-all placeholder:text-muted focus:border-teal focus:ring-2 focus:ring-teal/10 disabled:opacity-60"
                placeholder="Type your answer here..."
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-line bg-paper/50 px-6 py-4 sm:px-7">
            <Button
              type="button"
              variant="primary"
              disabled={!answer.trim() || submitted || status === "completed" || isSuspended}
              onClick={handleSubmitAnswer}
            >
              {submitted ? "Saved..." : status === "completed" ? "Completed" : "Submit answer"}
            </Button>
          </div>
        </motion.div>
      )}
    </main>
  );
}

export default function InterviewSessionPage() {
  return (
    <AuthGuard role="student">
      <InterviewSessionContent />
    </AuthGuard>
  );
}
