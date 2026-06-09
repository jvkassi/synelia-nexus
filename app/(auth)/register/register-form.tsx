"use client";

import { EyeIcon, EyeOffIcon, LockIcon, MailIcon, UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { type RegisterActionState, register } from "../actions";

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState<RegisterActionState, FormData>(
    register,
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
        <label className="synelia-label" htmlFor="name">
          Nom complet
        </label>
        <div className="synelia-input-wrapper">
          <UserIcon className="synelia-input-icon size-[18px]" />
          <input
            autoComplete="name"
            autoFocus
            className="synelia-input"
            id="name"
            name="name"
            placeholder="Awa Diomand&eacute;"
            required
            type="text"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="synelia-label" htmlFor="email">
          Adresse e-mail professionnelle
        </label>
        <div className="synelia-input-wrapper">
          <MailIcon className="synelia-input-icon size-[18px]" />
          <input
            autoComplete="email"
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
        <label className="synelia-label" htmlFor="password">
          Mot de passe
        </label>
        <div className="synelia-input-wrapper">
          <LockIcon className="synelia-input-icon size-[18px]" />
          <input
            className="synelia-input"
            id="password"
            name="password"
            placeholder="6 caract&egrave;res minimum"
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

      {state.status === "user_exists" && (
        <p
          className="rounded-md px-3 py-2 font-body text-[12px]"
          style={{
            background: "rgba(255, 107, 53, 0.08)",
            color: "var(--warning)",
          }}
        >
          Un compte existe d&eacute;j&agrave; avec cette adresse e-mail.
        </p>
      )}
      {state.status === "failed" && (
        <p
          className="rounded-md px-3 py-2 font-body text-[12px]"
          style={{
            background: "rgba(230, 57, 70, 0.08)",
            color: "var(--error)",
          }}
        >
          Une erreur est survenue. Merci de r&eacute;essayer.
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
        Cr&eacute;er mon compte
        <span aria-hidden>&rarr;</span>
      </button>
    </form>
  );
}
