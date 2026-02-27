"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getSenders, createSender, deleteSender } from "../actions";
import { toast } from "sonner";

type Sender = {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
};

export default function SendersPage() {
  const [senders, setSenders] = useState<Sender[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  async function loadSenders() {
    const result = await getSenders();
    if (result.data) {
      setSenders(result.data);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadSenders();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error("Name and email are required");
      return;
    }
    setCreating(true);
    const result = await createSender(name.trim(), email.trim());
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Sender created!");
      setName("");
      setEmail("");
      setDialogOpen(false);
      await loadSenders();
    }
    setCreating(false);
  }

  async function handleDelete(id: string, senderName: string) {
    if (
      !confirm(
        `Delete sender "${senderName}"? Documents using this sender will fall back to the default.`
      )
    )
      return;
    setDeletingId(id);
    const result = await deleteSender(id);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Sender deleted");
      await loadSenders();
    }
    setDeletingId(null);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Senders</h1>
          <p className="text-muted-foreground mt-1">
            Manage sender identities for your lead magnet emails
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-htd-purple hover:bg-htd-purple-dark text-white">
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Sender
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-htd-card border-htd-card-border">
            <DialogHeader>
              <DialogTitle className="text-white">Add New Sender</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label className="text-muted-foreground">
                  Name <span className="text-red-400">*</span>
                </Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Erbli Haxhaja"
                  required
                  className="bg-[#0a0e1a] border-htd-card-border focus:border-htd-purple"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">
                  Email <span className="text-red-400">*</span>
                </Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. erbli.haxhaja@htd.solutions"
                  required
                  className="bg-[#0a0e1a] border-htd-card-border focus:border-htd-purple"
                />
                <p className="text-xs text-muted-foreground">
                  Must be a verified domain in your Resend account
                </p>
              </div>
              <div className="bg-[#0a0e1a] border border-htd-card-border rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">Preview:</p>
                <p className="text-sm text-white">
                  {name && email
                    ? `${name} <${email}>`
                    : "Name <email@domain.com>"}
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  type="submit"
                  disabled={creating}
                  className="bg-htd-purple hover:bg-htd-purple-dark text-white"
                >
                  {creating ? "Creating..." : "Create Sender"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  className="border-htd-card-border text-muted-foreground hover:text-white hover:bg-white/5"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="bg-htd-card border border-htd-card-border rounded-xl p-12 text-center">
          <p className="text-muted-foreground">Loading senders...</p>
        </div>
      ) : senders.length === 0 ? (
        <div className="bg-htd-card border border-htd-card-border rounded-xl p-12 text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-htd-purple/10 flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-htd-purple-light"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h3 className="text-white text-lg font-semibold mb-1">
            No senders yet
          </h3>
          <p className="text-muted-foreground text-sm mb-4">
            Add a sender to use as the &quot;From&quot; address on lead magnet
            emails
          </p>
          <Button
            onClick={() => setDialogOpen(true)}
            className="bg-htd-purple hover:bg-htd-purple-dark text-white"
          >
            Add Sender
          </Button>
        </div>
      ) : (
        <Card className="bg-htd-card border-htd-card-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-htd-card-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">Sender</TableHead>
                <TableHead className="text-muted-foreground">
                  From Address
                </TableHead>
                <TableHead className="text-muted-foreground">Added</TableHead>
                <TableHead className="text-muted-foreground text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {senders.map((sender) => (
                <TableRow
                  key={sender.id}
                  className="border-htd-card-border hover:bg-white/[0.02]"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-htd-purple/10 flex items-center justify-center">
                        <span className="text-htd-purple-light text-sm font-bold">
                          {sender.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="text-white font-medium">
                        {sender.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="text-htd-purple-light text-xs bg-htd-purple/10 px-2 py-1 rounded">
                      {sender.name} &lt;{sender.email}&gt;
                    </code>
                  </TableCell>
                  <TableCell>
                    <span className="text-muted-foreground text-sm">
                      {new Date(sender.createdAt).toLocaleDateString()}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(sender.id, sender.name)}
                      disabled={deletingId === sender.id}
                      className="text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
                      title="Delete sender"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
