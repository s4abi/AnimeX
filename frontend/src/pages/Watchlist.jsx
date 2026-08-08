import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import {
    getUserWatchlist,
    removeFromWatchlist,
} from "../services/watchlistService";

const Watchlist = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    const fetchWatchlist = async () => {
        try {
            setLoading(true);
            const data = await getUserWatchlist();
            setItems(data);
            setMessage("");
        } catch (error) {
            setMessage(
                error.response?.data?.message || "Failed to load your watchlist.",
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWatchlist();
    }, []);

    const handleRemove = async (contentId) => {
        try {
            await removeFromWatchlist(contentId);
            setItems((prev) => prev.filter((item) => item.id !== contentId));
        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                "Unable to remove this item right now.",
            );
        }
    };

    return (
        <div className="min-h-screen text-white">
            <Navbar />
            <section className="mx-auto max-w-7xl px-6 py-10">
                <h1 className="text-4xl font-extrabold">My Watchlist</h1>
                <p className="mt-2 text-zinc-400">
                    Save titles you want to continue or start later.
                </p>

                {loading && <p className="mt-8 text-zinc-400">Loading watchlist...</p>}
                {message && <p className="mt-8 text-red-400">{message}</p>}

                {!loading && !message && items.length === 0 && (
                    <div className="mt-8 rounded-3xl border border-white/10 bg-black/30 p-10 text-center">
                        <p className="text-lg text-zinc-300">Your watchlist is currently empty.</p>
                        <Link
                            to="/browse"
                            className="mt-5 inline-block rounded-xl bg-red-600 px-5 py-3 font-semibold transition hover:bg-red-700"
                        >
                            Browse Content
                        </Link>
                    </div>
                )}

                {!loading && items.length > 0 && (
                    <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {items.map((item) => (
                            <article
                                key={item.id}
                                className="overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/60 shadow-xl"
                            >
                                <Link to={`/details/${item.id}`}>
                                    <img
                                        src={item.thumbnail}
                                        alt={item.title}
                                        className="h-56 w-full object-cover"
                                    />
                                </Link>
                                <div className="space-y-3 p-5">
                                    <h2 className="text-xl font-bold">{item.title}</h2>
                                    <p className="text-sm text-zinc-400">
                                        {item.description}
                                    </p>
                                    <div className="flex items-center justify-between text-sm text-zinc-300">
                                        <span>{item.type}</span>
                                        <span>⭐ {item.rating}</span>
                                    </div>
                                    <button
                                        onClick={() => handleRemove(item.id)}
                                        className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-2 font-semibold transition hover:bg-white hover:text-black"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default Watchlist;