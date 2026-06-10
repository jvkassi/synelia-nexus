"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useActionState, useEffect, useState } from "react";
import { AuthForm } from "@/components/chat/auth-form";
import { SubmitButton } from "@/components/chat/submit-button";
import { toast } from "@/components/chat/toast";
import { type RegisterActionState, register } from "../actions";

export default function Page() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isSuccessful, setIsSuccessful] = useState(false);

  const [state, formAction] = useActionState<RegisterActionState, FormData>(
    register,
    { status: "idle" }
  );

  const { update: updateSession } = useSession();

  // biome-ignore lint/correctness/useExhaustiveDependencies: router and updateSession are stable refs
  useEffect(() => {
    if (state.status === "user_exists") {
      toast({ type: "error", description: "Ce compte existe déjà." });
    } else if (state.status === "failed") {
      toast({
        type: "error",
        description: "La création du compte a échoué.",
      });
    } else if (state.status === "invalid_data") {
      toast({
        type: "error",
        description: "Veuillez vérifier les champs saisis.",
      });
    } else if (state.status === "success") {
      toast({ type: "success", description: "Compte créé." });
      setIsSuccessful(true);
      updateSession();
      router.refresh();
    }
  }, [state.status]);

  const handleSubmit = (formData: FormData) => {
    setEmail(formData.get("email") as string);
    formAction(formData);
  };

  return (
    <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-[var(--shadow-float)]">
      <div className="mb-6 flex flex-col gap-1.5">
        <h1
          className="font-semibold text-2xl text-primary"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Créer un compte
        </h1>
        <p className="text-muted-foreground text-sm">
          Rejoignez votre espace de travail.
        </p>
      </div>
      <AuthForm action={handleSubmit} defaultEmail={email}>
        <SubmitButton isSuccessful={isSuccessful}>S&apos;inscrire</SubmitButton>
        <p className="text-center text-[13px] text-muted-foreground">
          {"Déjà un compte ? "}
          <Link
            className="font-medium text-primary-mid transition-colors hover:text-magenta"
            href="/login"
          >
            Se connecter
          </Link>
        </p>
      </AuthForm>
    </div>
  );
}
