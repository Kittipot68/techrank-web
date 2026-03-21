"use client";

import { useState } from "react";
import { Send, MessageSquare } from "lucide-react";

export function FeedbackForm() {
    const [feedback, setFeedback] = useState("");
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!feedback.trim()) return;

        setStatus("loading");

        // For now, just simulate success — can integrate with Supabase later
        await new Promise(resolve => setTimeout(resolve, 500));
        setStatus("success");
        setFeedback("");
        setEmail("");

        // Reset after 4 seconds
        setTimeout(() => setStatus("idle"), 4000);
    }

    if (status === "success") {
        return (
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm font-medium py-2">
                <MessageSquare className="h-4 w-4" />
                ขอบคุณสำหรับ Feedback! 🎉
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-2.5">
            <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="แนะนำ, ติชม หรือแจ้งปัญหา..."
                required
                rows={3}
                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <div className="flex gap-2">
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="อีเมล (ไม่บังคับ)"
                    className="flex-1 px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    type="submit"
                    disabled={status === "loading" || !feedback.trim()}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400 rounded-lg disabled:opacity-50 transition-colors"
                >
                    <Send className="h-3.5 w-3.5" />
                    {status === "loading" ? "..." : "ส่ง"}
                </button>
            </div>
        </form>
    );
}
