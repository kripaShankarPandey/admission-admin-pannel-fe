"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  KeyRound,
  Loader2,
  Save,
  Send,
  ShieldCheck,
  ShieldOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  authProviderService,
  type AuthProvider,
} from "@/services/auth-provider-service";
import { apiErrorMessage } from "@/lib/api-error";

const INPUT =
  "w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-muted-foreground/60";

type Draft = {
  isEnabled: boolean;
  priority: number;
  values: Record<string, string>;
};

function toDraft(provider: AuthProvider): Draft {
  return {
    isEnabled: provider.isEnabled,
    priority: provider.priority,
    // Secrets arrive masked; leaving the mask in place means "unchanged".
    values: { ...provider.config, ...provider.secrets },
  };
}

export default function AuthProvidersPage() {
  const [providers, setProviders] = useState<AuthProvider[]>([]);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [savingKind, setSavingKind] = useState<string | null>(null);
  const [testingKind, setTestingKind] = useState<string | null>(null);
  const [testPhone, setTestPhone] = useState("");

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const rows = await authProviderService.getAll();
      setProviders(rows);
      setDrafts(Object.fromEntries(rows.map((p) => [p.kind, toDraft(p)])));
    } catch (error) {
      console.error(error);
      toast.error("Failed to load auth providers.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function setField(kind: string, key: string, value: string) {
    setDrafts((prev) => ({
      ...prev,
      [kind]: { ...prev[kind], values: { ...prev[kind].values, [key]: value } },
    }));
  }

  async function handleSave(provider: AuthProvider) {
    const draft = drafts[provider.kind];
    if (!draft) return;

    const config: Record<string, string> = {};
    const secrets: Record<string, string> = {};
    provider.fields.forEach((field) => {
      const value = draft.values[field.key] ?? "";
      if (field.secret) secrets[field.key] = value;
      else config[field.key] = value;
    });

    setSavingKind(provider.kind);
    try {
      const rows = await authProviderService.update(provider.kind, {
        isEnabled: draft.isEnabled,
        priority: draft.priority,
        config,
        secrets,
      });
      setProviders(rows);
      setDrafts(Object.fromEntries(rows.map((p) => [p.kind, toDraft(p)])));
      toast.success(`${provider.label} saved.`);
    } catch (error) {
      console.error(error);
      toast.error(apiErrorMessage(error, "Failed to save provider."));
    } finally {
      setSavingKind(null);
    }
  }

  async function handleTest(provider: AuthProvider) {
    if (!testPhone.trim()) {
      toast.error("Enter a mobile number to send the test to.");
      return;
    }
    setTestingKind(provider.kind);
    try {
      const result = await authProviderService.sendTest(
        provider.kind,
        testPhone.trim(),
      );
      toast.success(result.message);
    } catch (error) {
      console.error(error);
      // The API deliberately passes the provider's own error text through, so
      // a bad template or key can be diagnosed without server log access.
      toast.error(apiErrorMessage(error, "Test send failed."));
    } finally {
      setTestingKind(null);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  const smsProviders = providers.filter((p) => p.sms);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold text-foreground">
          Login & OTP Providers
        </h1>
        <p className="text-xs text-muted-foreground">
          Credentials for Google sign-in and SMS OTP. Keys are encrypted before
          they are stored and are never shown again after saving.
        </p>
      </div>

      {smsProviders.length > 1 && (
        <div className="rounded-xl border border-border bg-muted/20 p-4">
          <p className="text-xs text-muted-foreground">
            <strong className="text-foreground">SMS fallback order:</strong>{" "}
            {smsProviders
              .slice()
              .sort((a, b) => a.priority - b.priority)
              .map((p) => `${p.label}${p.isEnabled ? "" : " (off)"}`)
              .join(" → ")}
            . If the first enabled provider errors, the next one is tried
            automatically.
          </p>
        </div>
      )}

      <div className="rounded-xl border border-border bg-card p-4">
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
          Test mobile number
        </label>
        <Input
          value={testPhone}
          onChange={(e) => setTestPhone(e.target.value)}
          placeholder="9918476407"
          className="h-9 max-w-xs"
        />
        <p className="text-[11px] text-muted-foreground mt-1.5">
          Used by the “Send test OTP” button on each SMS provider below. A real
          message is sent and billed.
        </p>
      </div>

      {providers.map((provider) => {
        const draft = drafts[provider.kind];
        if (!draft) return null;

        return (
          <div
            key={provider.kind}
            className="rounded-xl border border-border bg-card overflow-hidden"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 bg-muted/20 px-5 py-4">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-lg border border-border/60 bg-card ${
                    provider.isEnabled ? "text-emerald-600" : "text-muted-foreground"
                  }`}
                >
                  {provider.isEnabled ? (
                    <ShieldCheck className="h-4 w-4" />
                  ) : (
                    <ShieldOff className="h-4 w-4" />
                  )}
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-foreground">
                    {provider.label}
                  </h2>
                  <p className="text-[11px] text-muted-foreground">
                    {provider.sms
                      ? "Sends the OTP from our server."
                      : provider.kind === "firebase"
                        ? "The browser runs the OTP flow; we verify the token."
                        : "Verified in the browser, checked on our server."}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {provider.sms && (
                  <label className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
                    Priority
                    <input
                      type="number"
                      value={draft.priority}
                      onChange={(e) =>
                        setDrafts((prev) => ({
                          ...prev,
                          [provider.kind]: {
                            ...prev[provider.kind],
                            priority: Number(e.target.value),
                          },
                        }))
                      }
                      className="h-8 w-16 rounded-lg border border-border bg-background px-2 text-center text-sm"
                    />
                  </label>
                )}
                <label className="flex items-center gap-2 text-sm font-medium">
                  <input
                    type="checkbox"
                    checked={draft.isEnabled}
                    onChange={(e) =>
                      setDrafts((prev) => ({
                        ...prev,
                        [provider.kind]: {
                          ...prev[provider.kind],
                          isEnabled: e.target.checked,
                        },
                      }))
                    }
                    className="h-4 w-4 rounded border-border"
                  />
                  Enabled
                </label>
              </div>
            </div>

            <div className="space-y-4 p-5">
              {provider.fields.map((field) => (
                <div key={field.key}>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1.5">
                    {field.label}
                    {field.required && <span className="text-destructive">*</span>}
                    {field.secret && (
                      <span className="inline-flex items-center gap-1 rounded bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-bold text-amber-700">
                        <KeyRound className="h-2.5 w-2.5" />
                        encrypted
                      </span>
                    )}
                  </label>
                  <input
                    value={draft.values[field.key] ?? ""}
                    onChange={(e) =>
                      setField(provider.kind, field.key, e.target.value)
                    }
                    placeholder={
                      field.secret ? "Enter to replace the stored value" : ""
                    }
                    className={INPUT}
                    autoComplete="off"
                  />
                  {field.hint && (
                    <p className="text-[11px] text-muted-foreground mt-1.5">
                      {field.hint}
                    </p>
                  )}
                </div>
              ))}

              <div className="flex flex-wrap gap-2 border-t border-border pt-4">
                <Button
                  onClick={() => handleSave(provider)}
                  disabled={savingKind === provider.kind}
                  className="gap-1.5"
                >
                  <Save className="h-4 w-4" />
                  {savingKind === provider.kind ? "Saving..." : "Save"}
                </Button>
                {provider.sms && (
                  <Button
                    variant="outline"
                    onClick={() => handleTest(provider)}
                    disabled={testingKind === provider.kind}
                    className="gap-1.5"
                  >
                    <Send className="h-4 w-4" />
                    {testingKind === provider.kind
                      ? "Sending..."
                      : "Send test OTP"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
