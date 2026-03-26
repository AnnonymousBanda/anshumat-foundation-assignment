"use client";

import { useState } from "react";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [useEmail, setUseEmail] = useState(false);
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-card rounded-xl border border-border shadow-sm p-8 animate-fade-in">
        <h2 className="mb-1">Welcome Back</h2>
        <p className="text-sm text-muted-foreground mb-8">Sign in to continue your passport application</p>

        <label className="block mb-2">{useEmail ? "Email Address" : "Mobile Number"}</label>
        <Input
          type={useEmail ? "email" : "tel"}
          placeholder={useEmail ? "you@example.com" : "+91 98765 43210"}
          className="mb-4 h-12 text-base focus:ring-2 focus:ring-primary focus:border-primary"
        />

        <Button className="w-full h-12 text-base" onClick={() => router.push("/onboarding")}>
          Send OTP
        </Button>

        <button
          onClick={() => setUseEmail(!useEmail)}
          className="mt-4 block mx-auto text-sm text-primary hover:underline"
        >
          {useEmail ? "Use Mobile instead" : "Use Email instead"}
        </button>
      </div>
    </div>
  );
}
