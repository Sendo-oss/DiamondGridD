type SidebarItem = {
  key: string;
  label: string;
  icon: string;
  active?: boolean;
  onClick: () => void;
};

type SidebarStat = {
  label: string;
  value: string | number;
};

type DashboardSidebarProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  accent: "cyan" | "violet";
  items: SidebarItem[];
  stats?: SidebarStat[];
};

const ACCENTS = {
  cyan: {
    text: "rgba(34,211,238,0.9)",
    soft: "rgba(34,211,238,0.62)",
    bg: "rgba(34,211,238,0.1)",
    border: "rgba(34,211,238,0.22)",
    shadow: "rgba(34,211,238,0.08)",
  },
  violet: {
    text: "rgba(196,181,253,0.95)",
    soft: "rgba(196,181,253,0.68)",
    bg: "rgba(139,92,246,0.12)",
    border: "rgba(139,92,246,0.25)",
    shadow: "rgba(139,92,246,0.08)",
  },
} as const;

export function DashboardSidebar({
  eyebrow,
  title,
  subtitle,
  accent,
  items,
  stats,
}: DashboardSidebarProps) {
  const palette = ACCENTS[accent];

  return (
    <aside
      style={{
        position: "sticky",
        top: 16,
        borderRadius: 24,
        border: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(255,255,255,0.035)",
        backdropFilter: "blur(18px)",
        padding: 18,
      }}
    >
      <div style={{ paddingBottom: 14, borderBottom: "1px solid rgba(255,255,255,0.07)", marginBottom: 14 }}>
        <div style={{ fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: palette.soft, fontWeight: 700 }}>
          {eyebrow}
        </div>
        <div style={{ fontFamily: "Syne, sans-serif", fontSize: 20, fontWeight: 800, marginTop: 6 }}>{title}</div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.38)", marginTop: 6, lineHeight: 1.6 }}>{subtitle}</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 14 }}>
        {items.map((item) => (
          <button
            key={item.key}
            onClick={item.onClick}
            style={{
              width: "100%",
              borderRadius: 14,
              border: `1px solid ${item.active ? palette.border : "rgba(255,255,255,0.08)"}`,
              background: item.active ? palette.bg : "rgba(255,255,255,0.03)",
              color: item.active ? palette.text : "rgba(255,255,255,0.7)",
              padding: "12px 14px",
              textAlign: "left",
              fontSize: 13,
              fontWeight: 600,
              fontFamily: "Inter, sans-serif",
              cursor: "pointer",
              transition: "all 0.18s",
              boxShadow: item.active ? `0 8px 24px ${palette.shadow}` : "none",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <span style={{ fontSize: 15, lineHeight: 1 }}>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {stats && stats.length > 0 && (
        <div
          style={{
            borderRadius: 18,
            border: "1px solid rgba(255,255,255,0.07)",
            background: "rgba(0,0,0,0.14)",
            padding: 14,
            marginTop: 16,
          }}
        >
          <div
            style={{
              fontSize: 11,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.34)",
              marginBottom: 10,
              fontWeight: 700,
            }}
          >
            Resumen rapido
          </div>
          {stats.map((stat) => (
            <div
              key={stat.label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: 12,
                color: "rgba(255,255,255,0.68)",
                padding: "6px 0",
              }}
            >
              <span>{stat.label}</span>
              <strong style={{ color: "rgba(255,255,255,0.92)", fontFamily: "Syne, sans-serif" }}>{stat.value}</strong>
            </div>
          ))}
        </div>
      )}
    </aside>
  );
}
