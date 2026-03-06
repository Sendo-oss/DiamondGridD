import { Link } from "react-router-dom";

const categories = [
  { id: "CPU", name: "CPU" },
  { id: "GPU", name: "GPU" },
  { id: "RAM", name: "RAM" },
  { id: "SSD", name: "SSD" },
  { id: "PSU", name: "PSU" },
  { id: "MOBO", name: "MOBO" },
  { id: "CASE", name: "CASE" },
];

type CategoriesMenuProps = {
  open: boolean;
  onClose?: () => void;
};

export function CategoriesMenu({ open, onClose }: CategoriesMenuProps) {
  if (!open) return null;

  return (
    <div className="absolute left-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-2xl border border-white/10 bg-ink-950/95 shadow-2xl backdrop-blur-xl">
      <div className="border-b border-white/10 px-4 py-3">
        <p className="text-sm font-semibold text-white">Categorías</p>
        <p className="text-xs text-white/50">Explora por tipo de componente</p>
      </div>

      <div className="grid gap-1 p-2">
        {categories.map((c) => (
          <Link
            key={c.id}
            to={`/category/${c.id}`}
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-sm text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            {c.name}
          </Link>
        ))}
      </div>
    </div>
  );
}