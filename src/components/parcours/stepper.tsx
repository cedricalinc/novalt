import { Check } from "lucide-react";
import { ETAPES } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function ParcoursStepper({ current }: { current: string }) {
  const idx = ETAPES.findIndex((e) => e.code === current);
  return (
    <div className="card-soft p-4 md:p-6">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-semibold">Mon avancement</p>
        <p className="text-xs font-medium text-primary">Étape {idx + 1}/5</p>
      </div>
      <ol className="grid grid-cols-5">
        {ETAPES.map((e, i) => {
          const done = i < idx;
          const active = i === idx;
          return (
            <li key={e.code} className="relative flex flex-col items-center text-center">
              {i > 0 && (
                <span className={cn("absolute right-1/2 top-4 h-0.5 w-full -translate-y-1/2", i <= idx ? "bg-primary" : "bg-border")} />
              )}
              <span
                className={cn(
                  "relative z-10 grid size-8 place-items-center rounded-full border-2 text-xs font-bold transition-all",
                  done && "border-primary bg-primary text-primary-foreground",
                  active && "border-primary bg-card text-primary ring-4 ring-primary/15",
                  !done && !active && "border-border bg-card text-muted-foreground",
                )}
              >
                {done ? <Check className="size-4" /> : e.num}
              </span>
              <span className={cn("mt-2 text-[10px] font-medium leading-tight sm:text-xs", active ? "text-foreground" : "text-muted-foreground")}>
                {e.label}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
