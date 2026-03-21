"use client";

import { useState } from "react";
import { subscribeNewsletter } from "@/app/actions/engagement";

export function NewsletterForm() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setStatus("loading");

        const result = await subscribeNewsletter(email);
        if (result.error) {
            setStatus("error");
            setMessage(result.error);
        } else {
            setStatus("success");
            setMessage("🎉 สมัครสำเร็จ! ขอบคุณครับ");
            setEmail("");
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            {status === "success" ? (
                <p className="text-sm text-green-600 font-medium">{message}</p>
            ) : (
                <>
                    <div className="flex gap-2">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="ใส่อีเมลของคุณ"
                            required
                            className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                        <button
                            type="submit"
                            disabled={status === "loading"}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                            {status === "loading" ? "..." : "สมัคร"}
                        </button>
                    </div>
                    {status === "error" && (
                        <p className="text-xs text-red-500 mt-1">{message}</p>
                    )}
                </>
            )}
        </form>
    );
}
