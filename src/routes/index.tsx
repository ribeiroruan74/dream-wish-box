import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronDown, LayoutGrid, Heart, Plus } from "lucide-react";

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
  emoji: string;
};

const items: Item[] = [
  { name: "Tecnologia", count: 6, status: "pendente", emoji: "💻" },
  { name: "Viagens", count: 3, status: "pendente", emoji: "✈️" },
  { name: "Casa", count: 12, status: "comprado", emoji: "🛋️" },
  { name: "Livros", count: 8, status: "comprado", emoji: "📚" },
  { name: "Moda", count: 5, status: "pendente", emoji: "👟" },
  { name: "Games", count: 2, status: "comprado", emoji: "🎮" },
];

const filters = ["Todos", "Comprados", "Pendentes"] as const;

function Folder({ item }: { item: Item }) {
  return (
    <button className="group flex flex-col items-center gap-3">
      <div className="relative mx-auto aspect-square w-[86%]">
        {/* back panel */}
        <div className="absolute inset-x-0 bottom-0 top-[14%] rounded-[16%] bg-folder-back shadow-folder" />
        {/* papers */}
        <div className="absolute left-[10%] right-[26%] top-[10%] h-[48%] -rotate-[7deg] rounded-[8px] bg-paper shadow-paper" />
        <div className="absolute left-[13%] right-[13%] top-[6%] h-[50%] rounded-[8px] bg-paper shadow-paper" />
        <div className="absolute left-[26%] right-[8%] top-[9%] h-[48%] rotate-[7deg] rounded-[8px] bg-paper shadow-paper">
          <div className="absolute right-[12%] top-[14%] h-[22%] w-[9%] rounded-[2px] bg-tab-1" />
          <div className="absolute right-[12%] top-[42%] h-[22%] w-[9%] rounded-[2px] bg-tab-2" />
        </div>
        {/* front panel */}
        <div className="absolute inset-x-0 bottom-0 top-[38%] rounded-[15%] bg-folder-front shadow-folder-front transition-transform duration-300 group-hover:-translate-y-1">
          <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-[1.9rem] leading-none drop-shadow-md">
            {item.emoji}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-foreground">{item.name}</span>
        <span className="rounded-md bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground">
          {item.count}
        </span>
      </div>
    </button>
  );
}


function Index() {
  const [active, setActive] = useState<(typeof filters)[number]>("Todos");

  const visible = items.filter((i) =>
    active === "Todos"
      ? true
      : active === "Comprados"
        ? i.status === "comprado"
        : i.status === "pendente",
  );

  return (
    <main className="min-h-screen bg-background px-5 pb-24 pt-10 sm:px-8">
      <div className="mx-auto w-full max-w-2xl">
        <header className="flex items-start justify-between">
          <h1 className="flex items-center gap-2 text-4xl font-bold tracking-tight text-foreground">
            Wishlist
            <ChevronDown className="mt-2 h-6 w-6 text-muted-foreground" strokeWidth={2.5} />
          </h1>
          <button
            aria-label="Mudar visualização"
            className="rounded-xl border border-border p-2 text-foreground transition-colors hover:bg-muted"
          >
            <LayoutGrid className="h-5 w-5" />
          </button>
        </header>

        <div className="mt-6 flex gap-2">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActive(f)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                active === f
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <section className="mt-8 grid grid-cols-2 gap-x-6 gap-y-9 sm:grid-cols-3">
          {visible.map((item) => (
            <Folder key={item.name} item={item} />
          ))}
        </section>

        {visible.length === 0 && (
          <p className="mt-16 text-center text-sm text-muted-foreground">
            Nada por aqui ainda.
          </p>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 flex justify-center pb-7">
        <div className="flex items-center gap-1 rounded-full bg-primary p-1.5 shadow-folder">
          <button className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-primary-foreground">
            <Heart className="h-4 w-4" />
            Minhas listas
          </button>
          <button
            aria-label="Nova lista"
            className="rounded-full bg-background p-2.5 text-foreground"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>
    </main>
  );
}
