import { useEffect, useState } from "react";
import Navbar from "../components/common/Navbar";
import ContentCard from "../components/home/ContentCard";
import { getAllContents } from "../services/contentService";
import { getAllCategories } from "../services/categoryService";

const Browse = () => {
    const [contents, setContents] = useState([]);
    const [categories, setCategories] = useState([]);
    const [categoriesReady, setCategoriesReady] = useState(false);
    const [categoryLoadError, setCategoryLoadError] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [filters, setFilters] = useState({
        search: "",
        type: "",
        category: "",
    });

    const fetchContents = async (activeFilters = filters) => {
        try {
            setLoading(true);
            const data = await getAllContents(activeFilters);
            setContents(data);
            setError("");
        } catch (err) {
            console.error(err);
            setError("Failed to load content");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchInitial = async () => {
            try {
                const categoryData = await getAllCategories();
                setCategories(Array.isArray(categoryData) ? categoryData : []);
                setCategoryLoadError("");
            } catch (err) {
                console.error(err);
                setCategories([]);
                setCategoryLoadError(
                    "Could not load categories. Check that the API is running (e.g. http://localhost:5000).",
                );
            } finally {
                setCategoriesReady(true);
            }
        };

        fetchInitial();
        fetchContents();
    }, []);

    const handleChange = (e) => {
        const updatedFilters = {
            ...filters,
            [e.target.name]: e.target.value,
        };

        setFilters(updatedFilters);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchContents(filters);
    };

    const handleReset = () => {
        const resetFilters = {
            search: "",
            type: "",
            category: "",
        };

        setFilters(resetFilters);
        fetchContents(resetFilters);
    };

    const featured = contents[0];

    return (
        <div className="min-h-screen text-white">
            <Navbar />

            {featured && (
                <section className="relative h-[78vh] overflow-hidden">
                    <img
                        src={featured.banner_image || featured.thumbnail}
                        alt={featured.title}
                        className="absolute inset-0 h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black"></div>
                    <div className="cinema-orb absolute -left-24 top-24 h-72 w-72 rounded-full bg-red-500/25 blur-3xl"></div>

                    <div className="relative mx-auto flex h-full max-w-7xl items-end px-6 pb-16">
                        <div className="max-w-2xl">
                            <p className="mb-4 inline-block rounded-full border border-red-500/40 bg-red-600/20 px-4 py-2 text-xs font-semibold tracking-[0.16em] text-red-300 uppercase">
                                Featured Spotlight
                            </p>
                            <h1 className="font-display text-5xl tracking-wide text-white md:text-6xl lg:text-7xl">{featured.title}</h1>
                            <p className="mt-4 leading-7 text-zinc-300">{featured.description}</p>
                        </div>
                    </div>
                </section>
            )}

            <section className="mx-auto max-w-7xl px-6 py-10">
                <div className="mb-8">
                    <h2 className="font-display text-4xl tracking-wide text-white md:text-5xl">Discover your next favorite</h2>
                    <p className="mt-2 text-zinc-400">
                        Explore anime, movies, and series with rich filtering.
                    </p>
                </div>

                <form onSubmit={handleSearch} className="mb-10 grid gap-4 rounded-3xl border border-white/10 bg-zinc-900/70 p-5 shadow-2xl backdrop-blur-xl md:grid-cols-4">
                    <input
                        type="text"
                        name="search"
                        placeholder="Search by title..."
                        value={filters.search}
                        onChange={handleChange}
                        className="rounded-2xl border border-white/10 bg-black/40 p-4 text-white outline-none placeholder:text-zinc-500"
                    />

                    <select
                        name="type"
                        value={filters.type}
                        onChange={handleChange}
                        className="rounded-2xl border border-white/10 bg-black/40 p-4 text-white outline-none"
                    >
                        <option value="">All Types</option>
                        <option value="anime">Anime</option>
                        <option value="movie">Movie</option>
                        <option value="series">Series</option>
                    </select>

                    <select
                        name="category"
                        value={filters.category}
                        onChange={handleChange}
                        className="rounded-2xl border border-white/10 bg-black/40 p-4 text-white outline-none"
                    >
                        <option value="">All Categories</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.name}>
                                {cat.name}
                            </option>
                        ))}
                    </select>

                    <div className="flex gap-3">
                        <button className="flex-1 rounded-2xl bg-red-600 px-4 py-3 font-semibold transition hover:bg-red-700">
                            Search
                        </button>
                        <button
                            type="button"
                            onClick={handleReset}
                            className="flex-1 rounded-2xl border border-white/20 bg-white/5 px-4 py-3 font-semibold transition hover:bg-white hover:text-black"
                        >
                            Reset
                        </button>
                    </div>
                </form>

                {categoryLoadError && (
                    <p className="mb-6 text-sm text-red-400">{categoryLoadError}</p>
                )}
                {categoriesReady && !categoryLoadError && categories.length === 0 && (
                    <p className="mb-6 text-sm text-amber-200/90">
                        The category list is still empty. Restart the backend once: it automatically inserts default genres when the{" "}
                        <span className="font-mono text-zinc-300">categories</span> table has no rows. Alternatively, run{" "}
                        <span className="font-mono text-zinc-300">backend/database/seed_categories.sql</span> in MySQL.
                    </p>
                )}

                {loading && (
                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {Array.from({ length: 8 }).map((_, idx) => (
                            <div key={idx} className="skeleton h-[360px] rounded-3xl" />
                        ))}
                    </div>
                )}
                {error && <p className="text-red-400">{error}</p>}

                {!loading && !error && contents.length === 0 && (
                    <p className="text-zinc-400">No content found for selected filters.</p>
                )}

                {!loading && !error && contents.length > 0 && (
                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {contents.map((item) => (
                            <ContentCard key={item.id} item={item} />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default Browse;