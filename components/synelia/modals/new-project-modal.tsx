"use client";

import { Check } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useWorkspace } from "@/lib/workspace-context";

/* Modale « Nouveau projet » — nom, description, membres invités */

export function NewProjectModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { workspace, members, currentUserId } = useWorkspace();
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pending, setPending] = useState(false);

  const toggle = (userId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  };

  const submit = async () => {
    if (!name.trim() || pending) {
      return;
    }
    setPending(true);
    try {
      const res = await fetch(`/api/workspaces/${workspace.id}/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
          memberIds: Array.from(selected),
        }),
      });
      if (!res.ok) {
        throw new Error(await res.text());
      }
      const project = await res.json();
      toast({ type: "success", description: "Projet créé." });
      onOpenChange(false);
      setName("");
      setDescription("");
      setSelected(new Set());
      router.push(`/w/${workspace.slug}/projects/${project.id}`);
      router.refresh();
    } catch {
      toast({
        type: "error",
        description: "La création du projet a échoué.",
      });
    } finally {
      setPending(false);
    }
  };

  const invitees = members.filter((m) => m.userId !== currentUserId);

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle
            className="text-primary"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Nouveau projet
          </DialogTitle>
          <DialogDescription>
            Un espace partagé pour les conversations, fichiers et routines de
            votre équipe.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="project-name">Nom du projet</Label>
            <Input
              autoFocus
              id="project-name"
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex. : Audit SI — Coris Bank"
              value={name}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="project-desc">Description</Label>
            <Textarea
              id="project-desc"
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Objet du projet, périmètre, livrables attendus…"
              rows={2}
              value={description}
            />
          </div>
          {invitees.length > 0 && (
            <div className="flex flex-col gap-2">
              <Label>Inviter des membres</Label>
              <div className="flex flex-col gap-1">
                {invitees.map((m) => {
                  const isOn = selected.has(m.userId);
                  return (
                    <button
                      className={cn(
                        "flex items-center gap-2.5 rounded-md border border-transparent px-2 py-1.5 text-left transition-colors hover:bg-accent",
                        isOn && "border-primary-mid bg-accent"
                      )}
                      key={m.userId}
                      onClick={() => toggle(m.userId)}
                      type="button"
                    >
                      <SynAvatar
                        size={26}
                        user={{ id: m.userId, name: m.name ?? m.email }}
                      />
                      <span className="min-w-0 flex-1 truncate text-[13px]">
                        {m.name ?? m.email}
                      </span>
                      {isOn && (
                        <Check
                          className="flex-none text-primary"
                          size={15}
                          strokeWidth={2}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button onClick={() => onOpenChange(false)} variant="ghost">
            Annuler
          </Button>
          <Button disabled={!name.trim() || pending} onClick={submit}>
            {pending ? "Création…" : "Créer le projet"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
