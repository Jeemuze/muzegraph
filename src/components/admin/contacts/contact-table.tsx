"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Eye, Trash2, Mail, MailOpen } from "lucide-react";
import { toast } from "sonner";

type Message = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
};

type Props = { messages: Message[] };

export default function ContactTable({ messages: initial }: Props) {
  const [messages, setMessages] = useState(initial);
  const [selected, setSelected] = useState<Message | null>(null);
  const [filter, setFilter] = useState<string>("ALL");

  const filtered = filter === "ALL" ? messages : messages.filter((m) => m.status === filter);

  const markAs = async (id: string, status: string) => {
    const res = await fetch(`/api/admin/contacts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, status } : m)));
      if (selected?.id === id) setSelected({ ...selected, status });
      toast.success(`Marked as ${status.toLowerCase()}`);
    }
  };

  const deleteMessage = async (id: string) => {
    const res = await fetch(`/api/admin/contacts/${id}`, { method: "DELETE" });
    if (res.ok) {
      setMessages((prev) => prev.filter((m) => m.id !== id));
      if (selected?.id === id) setSelected(null);
      toast.success("Message deleted");
    }
  };

  const openMessage = (msg: Message) => {
    setSelected(msg);
    if (msg.status === "UNREAD") markAs(msg.id, "READ");
  };

  const counts = {
    ALL: messages.length,
    UNREAD: messages.filter((m) => m.status === "UNREAD").length,
    READ: messages.filter((m) => m.status === "READ").length,
  };

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/50 p-1 w-fit">
        {(["ALL", "UNREAD", "READ"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
              filter === s ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {s} ({counts[s]})
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        {/* List */}
        <div className="space-y-2 max-h-[600px] overflow-y-auto">
          {filtered.map((msg) => (
            <button
              key={msg.id}
              onClick={() => openMessage(msg)}
              className={cn(
                "w-full text-left rounded-lg border border-border p-4 transition-colors",
                selected?.id === msg.id ? "bg-muted" : "bg-background hover:bg-muted/50",
                msg.status === "UNREAD" && "border-primary/30"
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={cn("text-sm", msg.status === "UNREAD" ? "font-semibold text-foreground" : "font-medium text-foreground")}>
                  {msg.name}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {new Date(msg.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                </span>
              </div>
              <p className={cn("text-sm truncate", msg.status === "UNREAD" ? "text-foreground font-medium" : "text-muted-foreground")}>
                {msg.subject}
              </p>
              <p className="text-xs text-muted-foreground truncate mt-0.5">{msg.message}</p>
            </button>
          ))}
        </div>

        {/* Detail */}
        {selected ? (
          <div className="rounded-lg border border-border bg-background p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-foreground">{selected.subject}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {selected.name} &lt;{selected.email}&gt;
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {new Date(selected.createdAt).toLocaleString("id-ID")}
                </p>
              </div>
              <Badge variant={selected.status === "UNREAD" ? "default" : "secondary"} className="text-[10px]">
                {selected.status}
              </Badge>
            </div>
            <div className="rounded-lg bg-muted/50 p-4 mb-4">
              <p className="text-sm text-foreground whitespace-pre-line leading-relaxed">{selected.message}</p>
            </div>
            <div className="flex items-center gap-2">
              {selected.status === "READ" && (
                <Button variant="outline" size="sm" onClick={() => markAs(selected.id, "UNREAD")} className="gap-1.5">
                  <Mail className="size-3.5" /> Mark Unread
                </Button>
              )}
              {selected.status === "UNREAD" && (
                <Button variant="outline" size="sm" onClick={() => markAs(selected.id, "READ")} className="gap-1.5">
                  <MailOpen className="size-3.5" /> Mark Read
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={() => deleteMessage(selected.id)} className="gap-1.5 text-red-600 hover:text-red-700">
                <Trash2 className="size-3.5" /> Delete
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center rounded-lg border border-border bg-background p-12">
            <p className="text-sm text-muted-foreground">Select a message to view</p>
          </div>
        )}
      </div>
    </div>
  );
}
