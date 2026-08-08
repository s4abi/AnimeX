import { Link } from "react-router-dom";

const ContentCard = ({
  item,
  to,
  progressPercent,
  footerSubtitle,
  hoverLabel = "▶ Watch Details",
}) => {
  const href = to || `/details/${item.id}`;
  const pct =
    typeof progressPercent === "number" && !Number.isNaN(progressPercent)
      ? Math.min(100, Math.max(0, progressPercent))
      : null;

  return (
    <Link
      to={href}
      className="group block overflow-hidden rounded-2xl border border-white/[0.12] bg-zinc-900/80 shadow-lg shadow-black/40 ring-0 transition duration-300 hover:z-10 hover:-translate-y-1 hover:scale-[1.03] hover:border-red-500/45 hover:shadow-2xl hover:shadow-red-950/25"
    >
      <div className="relative aspect-[2/3] max-h-[380px] overflow-hidden">
        <img
          src={item.thumbnail || item.banner_image}
          alt={item.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent"></div>

        <div className="absolute left-4 top-4 flex gap-2">
          <span className="rounded-full bg-red-600 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
            {item.type}
          </span>
        </div>

        <div className="absolute right-4 top-4 rounded-full bg-yellow-400 px-3 py-1 text-xs font-bold text-black">
          ⭐ {item.rating ?? "—"}
        </div>

        <div className="absolute inset-x-0 bottom-0 top-0 flex items-center justify-center opacity-0 transition group-hover:opacity-100">
          <span className="rounded-full border border-white/30 bg-black/65 px-5 py-2 text-sm font-semibold backdrop-blur">
            {hoverLabel}
          </span>
        </div>

        <div className="absolute bottom-0 w-full p-5">
          <h2 className="text-xl font-bold text-white">{item.title}</h2>
          <p className="mt-1 text-sm text-zinc-300">
            {footerSubtitle ?? (
              <>
                {item.category_name || "Featured"} • {item.release_year || "New"}
              </>
            )}
          </p>
          {pct !== null && (
            <div
              className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/15"
              title={`${Math.round(pct)}% watched`}
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-red-600 to-red-400"
                style={{ width: `${pct}%` }}
              />
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ContentCard;