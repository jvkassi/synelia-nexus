"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "@/components/chat/toast";
import { SynAvatar } from "@/components/synelia/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useWorkspace } from "@/lib/workspace-context";

/* Modale « Inviter » — ajout d'un membre à l'espace par e-mail */

export function InviteModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { workspace, members, role } = useWorkspace();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"member" | "owner">("member");
  const [pending, setPending] = useState(false);

  const isOwner = role === "owner";

  const submit = async () => {
    if (!email.trim() || pending) {
      return;
    }
    setPending(true);
    try {
      const res = await fetch(`/api/workspaces/${workspace.id}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), role: inviteRole }),
      });
      if (res.status === 404) {
        toast({
          type: "error",
          description: "Aucun compte trouvé pour cette adresse.",
        });
        return;
      }
      if (!res.ok) {
        throw new Error(await res.text());
      }
      toast({ type: "success", description: "Membre ajouté à l'espace." });
      setEmail("");
      onOpenChange(false);
      router.refresh();
    } catch {
      toast({ type: "error", description: "L'invitation a échoué." });
    } finally {
      setPending(false);
    }
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle
            className="text-primary"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Inviter dans l&apos;espace
          </DialogTitle>
          <DialogDescription>
            {isOwner
              ? "Ajoutez un membre par son adresse e-mail."
              : "Seul un propriétaire peut inviter de nouveaux membres."}
          </DialogDescription>
        </DialogHeader>

        {isOwner && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="invite-email">Adresse e-mail</Label>
              <Input
                autoFocus
                id="invite-email"
                onChange={(e) => setEmail(e.target.value)}
                placeholder="prenom.nom@synelia.tech"
                type="email"
                value={email}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Rôle</Label>
              <Select
                onValueChange={(v) => setInviteRole(v as "member" | "owner")}
                value={inviteRole}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Membre</SelectItem>
                  <SelectItem value="owner">Propriétaire</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        <div>
          <Label className="mb-2 block">Membres actuels</Label>
          <div className="flex max-h-44 flex-col gap-1 overflow-y-auto">
            {members.map((m) => (
              <div
                className="flex items-center gap-2.5 rounded-md px-2 py-1.5"
                key={m.userId}
              >
                <SynAvatar
                  size={26}
                  user={{ id: m.userId, name: m.name ?? m.email }}
                />
                <span className="min-w-0 flex-1 truncate text-[13px]">
                  {m.name ?? m.email}
                </span>
                <span className="flex-none text-[11.5px] text-muted-foreground">
                  {m.role === "owner" ? "Propriétaire" : "Membre"}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button onClick={() => onOpenChange(false)} variant="ghost">
            Fermer
          </Button>
          {isOwner && (
            <Button disabled={!email.trim() || pending} onClick={submit}>
              {pending ? "Envoi…" : "Inviter"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
