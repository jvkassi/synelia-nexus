"use client";

import { EyeIcon, EyeOffIcon, LockIcon, MailIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { type LoginActionState, login } from "../actions";

export function LoginForm() {
  const [state, formAction, isPending] = useActionState<LoginActionState, FormData>(
    login,
    { status: "idle" }
  );
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (state.status === "success") {
      router.push("/");
    }
  }, [state.status, router]);

  return (
    <form action={formAction} className="mt-8 flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label className="synelia-label" htmlFor="email">
          Adresse e-mail professionnelle
        </label>
        <div className="synelia-input-wrapper">
          <MailIcon className="synelia-input-icon size-[18px]" />
          <input
            autoComplete="email"
            autoFocus
            className="synelia-input"
            id="email"
            name="email"
            placeholder="prenom.nom@synelia.tech"
            required
            type="email"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label className="synelia-label" htmlFor="password">
            Mot de passe
          </label>
          <a
            className="font-body text-[12px] font-semibold text-[var(--primary)] hover:underline"
            href="/forgot-password"
          >
            Mot de passe oubli&eacute; ?
          </a>
        </div>
        <div className="synelia-input-wrapper">
          <LockIcon className="synelia-input-icon size-[18px]" />
          <input
            className="synelia-input"
            id="password"
            name="password"
            placeholder="••••••••"
            required
            type={showPassword ? "text" : "password"}
            minLength={6}
          />
          <button
            aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            className="synelia-input-icon synelia-input-icon--right flex size-[18px] items-center justify-center text-[var(--text-muted)] hover:text-[var(--primary)]"
            onClick={() => setShowPassword((s) => !s)}
            tabIndex={-1}
            type="button"
          >
            {showPassword ? (
              <EyeOffIcon className="size-[18px]" />
            ) : (
              <EyeIcon className="size-[18px]" />
            )}
          </button>
        </div>
      </div>

      <label className="mt-1 flex cursor-pointer items-center gap-2.5 font-body text-[13px] text-[var(--text-sub)]">
        <input
          className="size-4 cursor-pointer rounded border-[var(--border)] accent-[var(--primary)]"
          defaultChecked
          name="remember"
          type="checkbox"
        />
        Rester connect&eacute; sur cet appareil
      </label>

      {state.status === "failed" && (
        <p
          className="rounded-md px-3 py-2 font-body text-[12px]"
          style={{
            background: "rgba(230, 57, 70, 0.08)",
            color: "var(--error)",
          }}
        >
          Adresse e-mail ou mot de passe incorrect.
        </p>
      )}

      <button
        className={cn(
          "synelia-btn synelia-btn-primary h-11 w-full text-[15px] tracking-[0.02em]",
          isPending && "opacity-60"
        )}
        disabled={isPending}
        type="submit"
      >
        Se connecter
        <span aria-hidden>&rarr;</span>
      </button>
    </form>
  );
}
