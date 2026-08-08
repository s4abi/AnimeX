import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import { getSingleContent } from "../services/contentService";
import { addToWatchlist } from "../services/watchlistService";
import { useAuth } from "../hooks/useAuth";

const Details = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [content, setContent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [watchlistMessage, setWatchlistMessage] = useState("");

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const data = await getSingleContent(id);
                setContent(data);
            } catch (err) {
                console.error(err);
                setError("Failed to load content details");
            } finally {
                setLoading(false);
            }
        };

        fetchContent();
    }, [id]);

    const handleAddToWatchlist = async () => {
        if (!user) {
            navigate("/login");
            return;
        }

        try {
            const res = await addToWatchlist(content.id);
            setWatchlistMessage(res.message || "Added to watchlist successfully.");
        } catch (err) {
            setWatchlistMessage(err.response?.data?.message || "Unable to add to watchlist.");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen text-white">
                <Navbar />
                <div className="p-6 text-zinc-300">Loading...</div>
            </div>
        );
    }

    if (error || !content) {
        return (
            <div className="min-h-screen text-white">
                <Navbar />
                <div className="p-6 text-red-400">{error || "Content not found"}</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen text-white">
            <Navbar />

            <section className="relative h-[70vh] overflow-hidden">
                <img
                    src={content.banner_image || content.thumbnail}
                    alt={content.title}
                    className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/20"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black"></div>

                <div className="relative mx-auto flex h-full max-w-7xl items-end px-6 pb-16">
                    <div className="max-w-3xl">
                        <span className="rounded-full border border-red-400/40 bg-red-600/90 px-4 py-2 text-sm font-semibold uppercase">
                            {content.type}
                        </span>
                        <h1 className="mt-4 font-display text-5xl tracking-wide text-white md:text-6xl lg:text-7xl">{content.title}</h1>
                        <div className="mt-4 flex flex-wrap gap-3 text-zinc-300">
                            <span>{content.release_year}</span>
                            <span>•</span>
                            <span>{content.language}</span>
                            <span>•</span>
                            <span>{content.category_name}</span>
                            <span>•</span>
                            <span>⭐ {content.rating}</span>
                        </div>

                        <p className="mt-6 max-w-2xl leading-8 text-zinc-300">
                            {content.description}
                        </p>

                        <div className="mt-8 flex gap-4">
                            <Link
                                to={`/watch/${content.id}`}
                                className="rounded-xl bg-red-600 px-6 py-3 font-semibold transition hover:bg-red-700"
                            >
                                Watch Now
                            </Link>
                            <button
                                onClick={handleAddToWatchlist}
                                className="rounded-xl border border-white/20 bg-white/5 px-6 py-3 font-semibold transition hover:bg-white hover:text-black"
                            >
                                + Add to Watchlist
                            </button>
                        </div>
                        {watchlistMessage && (
                            <p className={`mt-4 text-sm ${watchlistMessage.toLowerCase().includes("added") ? "text-green-400" : "text-red-400"}`}>
                                {watchlistMessage}
                            </p>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Details;