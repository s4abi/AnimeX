import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/common/Navbar";
import { getAllContents } from "../services/contentService";
import { getContinueWatching } from "../services/historyService";
import { useAuth } from "../hooks/useAuth";
import ContentCard from "../components/home/ContentCard";

function formatLastWatched(iso) {
    if (!iso) return "";
    const t = new Date(iso).getTime();
    if (Number.isNaN(t)) return "";
    const diff = Date.now() - t;
    const d = Math.floor(diff / 86400000);
    const h = Math.floor(diff / 3600000);
    if (d >= 1) return `${d}d ago`;
    if (h >= 1) return `${h}h ago`;
    return "Just now";
}

const ShelfRow = ({ title, items, variant = "default" }) => (
    <section>
        <div className="mb-4 flex items-end justify-between gap-4">
            <div className="flex items-center gap-3">
                <span className="hidden h-8 w-1 rounded-full bg-gradient-to-b from-red-500 to-red-800 sm:block" aria-hidden />
                <div>
                    <h2 className="font-display text-3xl tracking-[0.04em] text-white md:text-4xl">{title}</h2>
                    <p className="mt-0.5 text-xs tracking-widest text-zinc-500 uppercase">
                        {variant === "continue" ? "From your watch history" : "Curated for you"}
                    </p>
                </div>
            </div>
            <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-semibold tracking-[0.2em] text-zinc-400 uppercase">
                AnimeX
            </span>
        </div>
        <div className="relative -mx-4 md:-mx-6">
            <div
                className="pointer-events-none absolute top-0 left-0 z-10 h-full w-10 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent md:w-16"
                aria-hidden
            />
            <div
                className="pointer-events-none absolute top-0 right-0 z-10 h-full w-10 bg-gradient-to-l from-zinc-950 via-zinc-950/80 to-transparent md:w-16"
                aria-hidden
            />
            <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 md:gap-5 md:px-6">
                {items.map((item) => {
                    const key = variant === "continue" ? `cw-${item.id}` : `${title}-${item.id}`;
                    const epPart =
                        item.episode_number != null
                            ? `Ep ${item.episode_number}${item.episode_title ? `: ${item.episode_title}` : ""}`
                            : "In progress";
                    const timePart = formatLastWatched(item.watched_at);
                    const footer =
                        variant === "continue"
                            ? [epPart, timePart].filter(Boolean).join(" · ")
                            : undefined;

                    return (
                        <div key={key} className="w-[220px] shrink-0 snap-start sm:w-[240px] md:w-[255px]">
                            <ContentCard
                                item={item}
                                to={variant === "continue" ? `/watch/${item.id}` : undefined}
                                progressPercent={variant === "continue" ? item.progress : undefined}
                                footerSubtitle={footer}
                                hoverLabel={variant === "continue" ? "▶ Resume" : "▶ Watch Details"}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    </section>
);

const Home = () => {
    const { user, token } = useAuth();
    const [contents, setContents] = useState([]);
    const [continueRows, setContinueRows] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContents = async () => {
            try {
                const data = await getAllContents();
                setContents(data || []);
            } catch (error) {
                console.error("Failed to fetch home content:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchContents();
    }, []);

    useEffect(() => {
        if (!user || !token) {
            setContinueRows([]);
            return;
        }

        const loadCw = async () => {
            try {
                const rows = await getContinueWatching();
                setContinueRows(Array.isArray(rows) ? rows : []);
            } catch (e) {
                console.error("Continue watching failed:", e);
                setContinueRows([]);
            }
        };

        loadCw();
    }, [user, token]);

    const continueWatching = useMemo(() => {
        return continueRows.map((r) => ({
            id: r.content_id,
            title: r.content_title,
            thumbnail: r.thumbnail,
            banner_image: r.banner_image,
            type: r.type,
            rating: r.rating,
            progress: Number(r.progress) || 0,
            watched_at: r.watched_at,
            episode_number: r.episode_number,
            episode_title: r.episode_title,
        }));
    }, [continueRows]);

    const featured = useMemo(() => contents[0], [contents]);
    const trending = useMemo(() => contents.slice(0, 8), [contents]);
    const newReleases = useMemo(() => contents.slice(4, 12), [contents]);

    return (
        <div className="min-h-screen text-white">
            <Navbar />

            <section className="relative flex min-h-[90vh] items-center overflow-hidden px-6 md:px-12">
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-30"
                    style={{
                        backgroundImage: `url(${featured?.banner_image || featured?.thumbnail || "https://images.unsplash.com/photo-1489599849927-2ee91cedd3a0?w=1920&q=80"})`,
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/50"></div>
                <div className="cinema-orb absolute -left-32 top-32 h-72 w-72 rounded-full bg-red-500/20 blur-3xl"></div>
                <div className="cinema-orb absolute -right-24 bottom-10 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl"></div>

                <div className="relative z-10 max-w-3xl">
                    <p className="mb-4 inline-block rounded-full border border-red-500/40 bg-red-500/10 px-4 py-2 text-xs font-semibold tracking-[0.2em] text-red-300 uppercase">
                        Stream Anime, Movies, and Series
                    </p>

                    <h1 className="font-display text-5xl leading-[0.95] tracking-wide text-white sm:text-6xl md:text-7xl lg:text-8xl">
                        {featured?.title ? (
                            <>
                                <span className="block text-balance">{featured.title}</span>
                                <span className="mt-2 block h-1 max-w-xs rounded-full bg-gradient-to-r from-red-600 via-red-500 to-transparent md:max-w-sm" aria-hidden />
                            </>
                        ) : (
                            <>
                                <span className="block">Stream without limits</span>
                                <span className="mt-1 block text-red-500">AnimeX</span>
                            </>
                        )}
                    </h1>

                    <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-300">
                        {featured?.description ||
                            "A premium OTT experience built with React, Node.js, Express, and MySQL. Discover trending stories, explore cinematic details, and stream your favorites in a modern interface crafted for speed and style."}
                    </p>

                    <div className="mt-8 flex flex-wrap gap-3 sm:gap-4">
                        <Link
                            to={featured ? `/details/${featured.id}` : "/browse"}
                            className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold tracking-wide text-black shadow-xl transition hover:bg-zinc-200"
                        >
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-white">▶</span>
                            Play
                        </Link>
                        <Link
                            to="/browse"
                            className="rounded-xl border border-white/25 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
                        >
                            More info
                        </Link>
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-7xl space-y-12 px-6 py-12">
                {loading ? (
                    <div className="space-y-10">
                        {[1, 2, 3].map((row) => (
                            <div key={row}>
                                <div className="skeleton mb-4 h-8 w-52 rounded-xl" />
                                <div className="flex gap-5 overflow-hidden">
                                    {[1, 2, 3, 4].map((card) => (
                                        <div key={card} className="skeleton aspect-[2/3] w-[220px] shrink-0 rounded-2xl sm:w-[240px] md:w-[255px]" />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <>
                        <ShelfRow title="Trending Now" items={trending} />
                        {user && continueWatching.length > 0 && (
                            <ShelfRow title="Continue Watching" items={continueWatching} variant="continue" />
                        )}
                        <ShelfRow title="New Releases" items={newReleases} />
                    </>
                )}
            </section>
        </div>
    );
};

export default Home;