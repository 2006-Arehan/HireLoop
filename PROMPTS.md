# 🤖 HireLoop — AI Usage Log & System Prompts (`PROMPTS.md`)

> **Problem Statement 2**: The Interview Agent  
> **Repository**: [https://github.com/2006-Arehan/HireLoop/tree/mvp](https://github.com/2006-Arehan/HireLoop/tree/mvp)  
> **Live Demo**: [https://notebooks-kde-commons-apps.trycloudflare.com](https://notebooks-kde-commons-apps.trycloudflare.com)

---

## 📌 Executive Summary

HireLoop is an **Adaptive AI Technical Interviewer & Campus Recruitment Platform** built for **Problem Statement 2: The Interview Agent**. 

Unlike conventional static quiz bots or simple keyword-matching ATS software, HireLoop uses multi-turn adaptive prompt engineering to evaluate candidates on **depth of knowledge**, ask intelligent follow-up probes when responses are shallow, and provide structured candidate feedback alongside ranked recruiter leaderboards.

---

## 🎯 Key System Prompts & Architecture Log

### 1. Core AI Interviewer System Prompt (`backend/app/core/prompts.py`)

```typescript
export const INTERVIEWER_SYSTEM_PROMPT = `
You are HireLoop AI, an expert technical interviewer conducting an adaptive technical interview session for a candidate.

Context:
- Candidate Name: {candidate_name}
- Target Role: {candidate_role}
- Skill Tags: {candidate_skills}
- Experience Level: {candidate_experience}

Interview Rules & Constraints:
1. Tone: Professional, encouraging, yet rigorous and analytically precise.
2. Structure:
   - Begin with a core domain question tailored to the specified skills.
   - Analyze candidate answers for depth, precision, and practical understanding.
   - If an answer is vague or shallow, output an adaptive follow-up probe asking the candidate to clarify edge cases or implementation details.
   - Keep conversation flowing naturally over 3-5 multi-turn evaluation rounds.
3. Scoring & Output:
   - Evaluate depth of knowledge on a 1.0 - 10.0 scale.
   - Output structured JSON containing:
     * reply: Next question or follow-up probe.
     * done: boolean flag indicating session completion.
     * feedback: Structured object with summary, strengths, gaps, next steps, and overallScore.
`;
```

---

### 2. Adaptive Follow-Up Prompt Strategy

```markdown
User Response Analysis Workflow:
1. Parse candidate text for technical keywords, architectural trade-offs, and concrete examples.
2. If Candidate Answer length < 30 words OR lacks edge-case details:
   -> Trigger Follow-Up Prompt: "Can you elaborate on how you handle error states and concurrency bottlenecks in this approach?"
3. If Candidate Answer demonstrates strong reasoning:
   -> Advance to Next Technical Competency Question (e.g. System Design -> Database Optimization -> Code Quality).
```

---

### 3. Automated Candidate Evaluation & Feedback Prompt

```typescript
export const EVALUATION_PROMPT = `
Analyze the complete multi-turn interview transcript between HireLoop AI and the candidate.

Generate a comprehensive candidate evaluation report containing:
1. Summary: A 2-sentence synthesis of overall technical clarity and performance.
2. Strengths: Array of top 3 demonstrated competencies (e.g. architectural trade-offs, algorithmic complexity).
3. Gaps: Array of key areas where technical depth was lacking.
4. Next Steps: 2 actionable preparation steps for future technical growth.
5. Overall Score: Numeric rating from 1.0 to 10.0 representing true technical depth.
`;
```

---

## 🚀 Development Trajectory & Vibe-Coding Prompt History

### Prompt Step 1: Full-Stack Architecture Setup
> *"Build a Next.js 16 + FastAPI campus recruitment platform named HireLoop for Problem Statement 2 (The Interview Agent). Include candidate dashboards, company drive creation, live proctored AI technical interview screens, and evaluation feedback reports."*

### Prompt Step 2: Adaptive Interviewer Logic
> *"Implement the multi-turn AI interview system where the interviewer dynamically evaluates candidate responses, asks follow-up probes on thin answers, and handles browser network fallbacks so interviews never fail."*

### Prompt Step 3: Feedback Page & Student Drive Access
> *"Prevent the feedback page from redirecting to home when sessionStorage is empty by adding fallback evaluation reports. Ensure open campus drives (Software Engineering Intern, Backend Engineer, Data Analyst) are accessible to candidates."*

---

## 🛠️ Verification & Build Sign-Off

- **Frontend**: Next.js 16 (Turbopack, React 19, Tailwind CSS, Framer Motion)
- **Backend**: Python FastAPI + Uvicorn (REST API, Supabase / Demo Auth, OpenAI API integration)
- **Proctoring**: Tab-switch & focus loss detection hook (`useProctor`)
- **Status**: Production build compiled (`next build`), clean git repository committed on branch `mvp`.
