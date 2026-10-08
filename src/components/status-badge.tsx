import { cn } from "@/lib/utils";

const MAP: Record<string, { label: string; cls: string }> = {
  VALIDE: { label: "Validé", cls: "bg-success-soft text-success" },
  VALIDE_CFA: { label: "Validé CFA", cls: "bg-success-soft text-success" },
  EN_REVISION: { label: "En révision", cls: "bg-info-soft text-primary" },
  EN_ATTENTE_VALIDATION: { label: "En attente", cls: "bg-warning-soft text-warning" },
  A_CORRIGER: { label: "À corriger", cls: "bg-warning-soft text-warning" },
  INCOMPLET: { label: "Incomplet", cls: "bg-danger-soft text-destructive" },
  MANQUANT: { label: "Manquant", cls: "bg-danger-soft text-destructive" },
  BROUILLON: { label: "Brouillon", cls: "bg-muted text-muted-foreground" },
};

export function StatusBadge({ status }: { status: string }) {
  const s = MAP[status] ?? { label: status, cls: "bg-muted text-muted-foreground" };
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold", s.cls)}>{s.label}</span>;
}
