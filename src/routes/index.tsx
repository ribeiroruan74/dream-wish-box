import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  BookOpen,
  ChevronDown,
  Gamepad2,
  House,
  Laptop,
  Plane,
  RotateCcw,
  Settings2,
  Shirt,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import folderImg from "@/assets/folder-opaque.png";
import referenceImg from "@/assets/wishlist-reference.png";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Wishlist — Suas listas de desejos" },
      {
        name: "description",
        content:
          "Organize seus desejos em listas: presentes, viagens, tecnologia e mais. Marque o que já comprou e acompanhe o que falta.",
      },
      { property: "og:title", content: "Wishlist — Suas listas de desejos" },
      {
        property: "og:description",
        content: "Organize seus desejos em listas e acompanhe o que já foi comprado.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Item = {
  name: string;
  count: number;
  status: "comprado" | "pendente";
  icon: LucideIcon;
};

const items: Item[] = [
  { name: "Tecnologia", count: 6, status: "pendente", icon: Laptop },
  { name: "Viagens", count: 3, status: "pendente", icon: Plane },
  { name: "Casa", count: 12, status: "comprado", icon: House },
  { name: "Livros", count: 8, status: "comprado", icon: BookOpen },
  { name: "Moda", count: 5, status: "pendente", icon: Shirt },
  { name: "Games", count: 2, status: "comprado", icon: Gamepad2 },
];

const filters = ["Todos", "Comprados", "Pendentes"] as const;

type Calibration = { opacity: number; material: number; shadow: number };

function Folder({ item, calibration, preview = false }: { item: Item; calibration: Calibration; preview?: boolean }) {
  const Icon = item.icon;
  const materialDelta = calibration.material - 50;
  return (
    <div className={`flex flex-col items-center ${preview ? "w-full max-w-64 gap-1" : "gap-1.5"}`}>
      <div className="folder-stage relative mx-auto aspect-square w-full">
        <img
          src={folderImg}
          alt={`Pasta ${item.name}`}
          loading="lazy"
          width={1024}
          height={1024}
          className="folder-render h-full w-full select-none object-contain"
          style={{
            opacity: calibration.opacity / 100,
            filter: `brightness(${1 + materialDelta / 250}) contrast(${1 + Math.abs(materialDelta) / 500}) drop-shadow(0 ${Math.round(calibration.shadow / 9)}px ${Math.round(calibration.shadow / 4)}px color-mix(in oklab, var(--calibration-shadow) ${Math.round(calibration.shadow * 0.7)}%, transparent))`,
          }}
        />
        <span className="pointer-events-none absolute inset-x-0 top-[62%] flex -translate-y-1/2 justify-center text-calibration-icon">
          <Icon className={preview ? "h-5 w-5" : "h-[18%] w-[18%]"} strokeWidth={2.8} />
        </span>
      </div>
      {!preview && <div className="flex items-center gap-1.5">
        <span className="text-xs font-semibold text-foreground sm:text-sm">{item.name}</span>
        <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
          {item.count}
        </span>
      </div>}
    </div>
  );
}


function Index() {
  const [active, setActive] = useState<(typeof filters)[number]>("Todos");
  const defaults: Calibration = { opacity: 100, material: 50, shadow: 38 };
  const [calibration, setCalibration] = useState<Calibration>(defaults);
  const previewItem = items[0];

  if (!previewItem) return null;

  const visible = items.filter((i) =>
    active === "Todos"
      ? true
      : active === "Comprados"
        ? i.status === "comprado"
        : i.status === "pendente",
  );

  return (
    <main className="min-h-screen bg-background px-3 py-4 sm:px-6 sm:py-8">
      <div className="mx-auto w-full max-w-5xl overflow-hidden rounded-lg border border-border bg-card shadow-calibration">
        <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border px-4 py-4 sm:px-6">
          <div className="min-w-0">
            <p className="calibration-label mb-1">Calibration lab</p>
            <h1 className="flex min-w-0 items-center gap-1.5 truncate text-xl font-semibold text-card-foreground sm:text-2xl">
              Wishlist <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
            </h1>
          </div>
          <span className="calibration-label rounded border border-border bg-muted px-2 py-1">v3.0.4</span>
        </header>

        <section aria-label="Comparação visual" className="grid grid-cols-2 gap-px bg-border">
          <figure className="min-w-0 bg-card p-2 sm:p-5">
            <figcaption className="calibration-label mb-3">00. Referência</figcaption>
            <div className="comparison-viewport">
              <img src={referenceImg} alt="Referência original das pastas" className="h-full w-full object-cover object-center" />
            </div>
          </figure>
          <figure className="min-w-0 bg-card p-2 sm:p-5">
            <figcaption className="calibration-label mb-3 text-foreground">01. Resultado atual</figcaption>
            <div className="comparison-viewport bg-calibration-surface p-2 sm:p-8">
              <Folder item={previewItem} calibration={calibration} preview />
            </div>
          </figure>
        </section>

        <section aria-label="Configurações das pastas" className="border-t border-border bg-calibration-panel p-4 sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <Settings2 className="h-4 w-4 shrink-0 text-muted-foreground" />
              <h2 className="truncate text-sm font-semibold text-card-foreground">Material da pasta</h2>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setCalibration(defaults)} aria-label="Restaurar ajustes">
              <RotateCcw /> Restaurar
            </Button>
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            {([
              ["opacity", "Opacidade", "%"],
              ["material", "Cor do material", ""],
              ["shadow", "Intensidade da sombra", "%"],
            ] as const).map(([key, label, suffix]) => (
              <label key={key} className="block">
                <span className="calibration-label mb-2 flex justify-between gap-2">
                  {label}<output>{calibration[key]}{suffix}</output>
                </span>
                <Slider min={key === "opacity" ? 40 : 0} max={100} step={1} value={[calibration[key]]} onValueChange={([value]) => value !== undefined && setCalibration((current) => ({ ...current, [key]: value }))} />
              </label>
            ))}
          </div>
        </section>

        <div className="flex gap-2 overflow-x-auto border-t border-border px-4 py-3 sm:px-6">
          {filters.map((filter) => (
            <Button key={filter} variant={active === filter ? "default" : "secondary"} size="sm" onClick={() => setActive(filter)}>{filter}</Button>
          ))}
        </div>

        <section className="grid grid-cols-2 gap-x-3 gap-y-5 p-4 min-[460px]:grid-cols-3 sm:gap-x-5 sm:gap-y-7 sm:p-6">
          {visible.map((item) => (
            <Folder key={item.name} item={item} calibration={calibration} />
          ))}
        </section>

        {visible.length === 0 && (
          <p className="p-10 text-center text-sm text-muted-foreground">
            Nada por aqui ainda.
          </p>
        )}
      </div>
    </main>
  );
}
