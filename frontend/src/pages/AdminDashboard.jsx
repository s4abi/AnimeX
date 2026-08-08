import { useEffect, useState } from "react";
import Navbar from "../components/common/Navbar";
import { getAllCategories } from "../services/categoryService";
import {
    createContent,
    getAllContents,
    updateContent,
    deleteContent,
} from "../services/contentService";
import {
    addEpisode,
    getAllEpisodes,
    updateEpisode,
    deleteEpisode,
} from "../services/episodeService";

const initialContentForm = {
    title: "",
    description: "",
    thumbnail: "",
    banner_image: "",
    type: "anime",
    release_year: "",
    rating: "",
    language: "",
    category_id: "",
};

const initialEpisodeForm = {
    content_id: "",
    episode_number: "",
    title: "",
    video_url: "",
    duration: "",
};

const formatContentDuplicates = (matches = []) =>
    matches.map((m) => `  #${m.id} "${m.title}" (${m.type})`).join("\n");

const formatEpisodeDuplicates = (matches = []) =>
    matches.map((m) => `  Ep ${m.episode_number}: ${m.title} (id ${m.id})`).join("\n");

const AdminDashboard = () => {
    const [categories, setCategories] = useState([]);
    const [contents, setContents] = useState([]);
    const [episodes, setEpisodes] = useState([]);
    const [contentForm, setContentForm] = useState(initialContentForm);
    const [episodeForm, setEpisodeForm] = useState(initialEpisodeForm);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("success"); // ✅ FIXED: Added messageType state
    const [editingId, setEditingId] = useState(null);
    const [editingEpisodeId, setEditingEpisodeId] = useState(null);

    const fetchInitialData = async () => {
        const results = await Promise.allSettled([
            getAllCategories(),
            getAllContents(),
            getAllEpisodes(),
        ]);

        const [catR, contentR, epR] = results;

        if (catR.status === "fulfilled") {
            setCategories(Array.isArray(catR.value) ? catR.value : []);
        } else {
            console.error("Categories load failed:", catR.reason);
        }

        if (contentR.status === "fulfilled") {
            setContents(Array.isArray(contentR.value) ? contentR.value : []);
        } else {
            console.error("Contents load failed:", contentR.reason);
        }

        if (epR.status === "fulfilled") {
            setEpisodes(Array.isArray(epR.value) ? epR.value : []);
        } else {
            console.error("Episodes load failed:", epR.reason);
            const status = epR.reason?.response?.status;
            if (status === 401) {
                setMessage(
                    "Episodes could not load: session missing or expired. Sign out and sign in again with an admin account.",
                );
            } else if (status === 403) {
                setMessage("Episodes list is admin-only. This account is not an admin.");
            } else {
                setMessage("Episodes could not load. Check the console and API logs.");
            }
            setMessageType("error");
            setEpisodes([]);
        }
    };

    useEffect(() => {
        fetchInitialData();
    }, []);

    const resetMessage = () => {
        setMessage("");
        setMessageType("success");
    };

    const handleContentChange = (e) => {
        setContentForm((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
        resetMessage(); // ✅ IMPROVED: Clear message on input
    };

    const handleEpisodeChange = (e) => {
        setEpisodeForm((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
        resetMessage(); // ✅ IMPROVED: Clear message on input
    };

    const validateContentForm = () => {
        if (!contentForm.title?.trim()) return "Title is required";
        if (!contentForm.description?.trim()) return "Description is required";
        if (!contentForm.type) return "Type is required";
        if (!contentForm.language?.trim()) return "Language is required";
        if (!contentForm.category_id) return "Category is required";

        if (contentForm.release_year) {
            const year = Number(contentForm.release_year);
            if (Number.isNaN(year) || year < 1900 || year > 2100) {
                return "Enter a valid release year (1900-2100)";
            }
        }

        if (contentForm.rating) {
            const rating = Number(contentForm.rating);
            if (Number.isNaN(rating) || rating < 0 || rating > 10) {
                return "Rating must be between 0 and 10";
            }
        }

        return "";
    };

    const validateEpisodeForm = () => {
        if (!episodeForm.content_id) return "Please select content";
        if (!episodeForm.episode_number?.trim()) return "Episode number is required";
        if (!episodeForm.title?.trim()) return "Episode title is required";
        if (!episodeForm.video_url?.trim()) return "Video URL is required";

        const episodeNo = Number(episodeForm.episode_number);
        if (Number.isNaN(episodeNo) || episodeNo <= 0) {
            return "Episode number must be greater than 0";
        }

        return "";
    };

    const handleContentSubmit = async (e) => {
        e.preventDefault();
        resetMessage(); // ✅ IMPROVED: Reset message before validation

        const validationError = validateContentForm();
        if (validationError) {
            setMessage(validationError);
            setMessageType("error");
            return;
        }

        const payload = {
            ...contentForm,
            release_year: contentForm.release_year ? Number(contentForm.release_year) : null,
            rating: contentForm.rating ? Number(contentForm.rating) : 0,
            category_id: contentForm.category_id ? Number(contentForm.category_id) : null,
        };

        const saveContentOnce = async (body) => {
            if (editingId) {
                return updateContent(editingId, body);
            }
            return createContent(body);
        };

        try {
            await saveContentOnce(payload);
            setMessage(editingId ? "Content updated successfully" : "Content added successfully");
            setMessageType("success");
            setContentForm(initialContentForm);
            setEditingId(null);
            fetchInitialData();
        } catch (err) {
            const res = err.response;
            if (res?.status === 409 && res.data?.code === "DUPLICATE_CONTENT") {
                const lead =
                    res.data.message ||
                    "Another row already uses this title with the same type.";
                const detail = formatContentDuplicates(res.data.matches);
                const ok = window.confirm(
                    `${lead}\n\nExisting:\n${detail || "  (see API response)"}\n\nStill save and create a duplicate?`,
                );
                if (ok) {
                    try {
                        await saveContentOnce({ ...payload, confirm_duplicate: true });
                        setMessage(
                            editingId ? "Content updated (duplicate allowed)" : "Content added (duplicate allowed)",
                        );
                        setMessageType("success");
                        setContentForm(initialContentForm);
                        setEditingId(null);
                        fetchInitialData();
                    } catch (e2) {
                        console.error("Content save error (confirmed):", e2);
                        setMessage(e2.response?.data?.message || "Error saving content");
                        setMessageType("error");
                    }
                }
                return;
            }
            console.error("Content save error:", err);
            setMessage(res?.data?.message || "Error saving content");
            setMessageType("error");
        }
    };

    const handleEpisodeSubmit = async (e) => {
        e.preventDefault();
        resetMessage(); // ✅ IMPROVED: Reset message before validation

        const validationError = validateEpisodeForm();
        if (validationError) {
            setMessage(validationError);
            setMessageType("error");
            return;
        }

        const payload = {
            ...episodeForm,
            content_id: Number(episodeForm.content_id),
            episode_number: Number(episodeForm.episode_number),
        };

        const saveEpisodeOnce = async (body) => {
            if (editingEpisodeId) {
                return updateEpisode(editingEpisodeId, body);
            }
            return addEpisode(body);
        };

        try {
            await saveEpisodeOnce(payload);
            setMessage(editingEpisodeId ? "Episode updated successfully" : "Episode added successfully");
            setMessageType("success");
            setEpisodeForm(initialEpisodeForm);
            setEditingEpisodeId(null);
            fetchInitialData();
        } catch (err) {
            const res = err.response;
            if (res?.status === 409 && res.data?.code === "DUPLICATE_EPISODE") {
                const lead =
                    res.data.message ||
                    "This show already has an episode with the same number and/or title.";
                const detail = formatEpisodeDuplicates(res.data.matches);
                const ok = window.confirm(
                    `${lead}\n\nExisting:\n${detail || "  (see API response)"}\n\nStill add this duplicate episode?`,
                );
                if (ok) {
                    try {
                        await saveEpisodeOnce({ ...payload, confirm_duplicate: true });
                        setMessage(
                            editingEpisodeId
                                ? "Episode updated (duplicate allowed)"
                                : "Episode added (duplicate allowed)",
                        );
                        setMessageType("success");
                        setEpisodeForm(initialEpisodeForm);
                        setEditingEpisodeId(null);
                        fetchInitialData();
                    } catch (e2) {
                        console.error("Episode save error (confirmed):", e2);
                        setMessage(e2.response?.data?.message || "Error saving episode");
                        setMessageType("error");
                    }
                }
                return;
            }
            console.error("Episode save error:", err);
            setMessage(res?.data?.message || "Error saving episode");
            setMessageType("error");
        }
    };

    const handleEdit = (item) => {
        resetMessage(); // ✅ FIXED: Reset message before edit
        setEditingId(item.id);
        setContentForm({
            title: item.title || "",
            description: item.description || "",
            thumbnail: item.thumbnail || "",
            banner_image: item.banner_image || "",
            type: item.type || "anime",
            release_year: item.release_year?.toString() || "",
            rating: item.rating?.toString() || "",
            language: item.language || "",
            category_id: item.category_id?.toString() || "",
        });

        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this content?")) return;

        try {
            await deleteContent(id);
            setMessage("Content deleted successfully");
            setMessageType("success");

            if (editingId === id) {
                setEditingId(null);
                setContentForm(initialContentForm);
            }

            fetchInitialData();
        } catch (err) {
            console.error("Delete error:", err);
            setMessage(err.response?.data?.message || "Error deleting content");
            setMessageType("error");
        }
    };

    const cancelEdit = () => {
        setEditingId(null);
        setContentForm(initialContentForm);
        resetMessage(); // ✅ IMPROVED: Reset message on cancel
    };

    const handleEpisodeEdit = (episode) => {
        resetMessage(); // ✅ FIXED: Reset message before edit
        setEditingEpisodeId(episode.id);
        setEpisodeForm({
            content_id: episode.content_id?.toString() || "",
            episode_number: episode.episode_number?.toString() || "",
            title: episode.title || "",
            video_url: episode.video_url || "",
            duration: episode.duration || "",
        });

        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleEpisodeDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this episode?")) return;

        try {
            await deleteEpisode(id);
            setMessage("Episode deleted successfully");
            setMessageType("success");

            if (editingEpisodeId === id) {
                setEditingEpisodeId(null);
                setEpisodeForm(initialEpisodeForm);
            }

            fetchInitialData();
        } catch (err) {
            console.error("Episode delete error:", err);
            setMessage(err.response?.data?.message || "Error deleting episode");
            setMessageType("error");
        }
    };

    const cancelEpisodeEdit = () => {
        setEditingEpisodeId(null);
        setEpisodeForm(initialEpisodeForm);
        resetMessage(); // ✅ IMPROVED: Reset message on cancel
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black text-white">
            <Navbar />

            <div className="mx-auto max-w-6xl px-6 py-10 space-y-10">
                {/* Header */}
                <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-md">
                    <p className="text-sm font-semibold uppercase tracking-wider text-red-400">
                        Admin Panel
                    </p>
                    <h1 className="mt-2 text-4xl font-extrabold">Manage AnimeX</h1>
                    <p className="mt-2 text-zinc-400">
                        Add, edit, delete content and manage episodes.
                    </p>
                </div>

                {/* ✅ FIXED: Improved message display with color coding */}
                {message && (
                    <div
                        className={`rounded-2xl p-4 text-sm shadow-lg backdrop-blur-md transition-all ${messageType === "error"
                                ? "border border-red-500/50 bg-red-500/10 text-red-400"
                                : "border border-green-500/50 bg-green-500/10 text-green-400"
                            }`}
                    >
                        {message}
                        <button
                            onClick={resetMessage}
                            className="ml-4 text-sm opacity-70 hover:opacity-100"
                        >
                            ×
                        </button>
                    </div>
                )}

                {/* Content Form */}
                <form
                    onSubmit={handleContentSubmit}
                    className="grid gap-6 rounded-3xl border border-white/10 bg-zinc-900/70 p-8 shadow-2xl backdrop-blur-md"
                >
                    <h2 className="text-3xl font-bold">
                        {editingId ? "Edit Content" : "Add New Content"}
                    </h2>

                    <div className="grid gap-6 md:grid-cols-2">
                        <input
                            name="title"
                            placeholder="Content Title *"
                            value={contentForm.title}
                            onChange={handleContentChange}
                            className="rounded-2xl border border-white/10 bg-black/40 p-4 text-white placeholder-zinc-500 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                            required
                        />

                        <select
                            name="type"
                            value={contentForm.type}
                            onChange={handleContentChange}
                            className="rounded-2xl border border-white/10 bg-black/40 p-4 text-white outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                            required
                        >
                            <option value="anime">Anime</option>
                            <option value="movie">Movie</option>
                            <option value="series">Series</option>
                        </select>
                    </div>

                    <textarea
                        name="description"
                        placeholder="Description *"
                        value={contentForm.description}
                        onChange={handleContentChange}
                        rows="4"
                        className="rounded-2xl border border-white/10 bg-black/40 p-4 text-white placeholder-zinc-500 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 resize-vertical"
                        required
                    />

                    <div className="grid gap-6 md:grid-cols-2">
                        <input
                            name="thumbnail"
                            placeholder="Thumbnail URL"
                            value={contentForm.thumbnail}
                            onChange={handleContentChange}
                            className="rounded-2xl border border-white/10 bg-black/40 p-4 text-white placeholder-zinc-500 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                        />

                        <input
                            name="banner_image"
                            placeholder="Banner Image URL"
                            value={contentForm.banner_image}
                            onChange={handleContentChange}
                            className="rounded-2xl border border-white/10 bg-black/40 p-4 text-white placeholder-zinc-500 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                        />
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        <input
                            name="release_year"
                            placeholder="Release Year (1900-2100)"
                            value={contentForm.release_year}
                            onChange={handleContentChange}
                            className="rounded-2xl border border-white/10 bg-black/40 p-4 text-white placeholder-zinc-500 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                        />

                        <input
                            name="rating"
                            placeholder="Rating (0-10)"
                            value={contentForm.rating}
                            onChange={handleContentChange}
                            className="rounded-2xl border border-white/10 bg-black/40 p-4 text-white placeholder-zinc-500 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                            type="number"
                            min="0"
                            max="10"
                            step="0.1"
                        />
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        <input
                            name="language"
                            placeholder="Language *"
                            value={contentForm.language}
                            onChange={handleContentChange}
                            className="rounded-2xl border border-white/10 bg-black/40 p-4 text-white placeholder-zinc-500 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                            required
                        />

                        <select
                            name="category_id"
                            value={contentForm.category_id}
                            onChange={handleContentChange}
                            className="rounded-2xl border border-white/10 bg-black/40 p-4 text-white outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                            required
                        >
                            <option value="">Select Category</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <button
                            type="submit"
                            className="rounded-2xl bg-gradient-to-r from-red-600 to-red-700 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:from-red-700 hover:to-red-800 hover:shadow-xl hover:-translate-y-0.5"
                        >
                            {editingId ? "Update Content" : "Add Content"}
                        </button>

                        {editingId && (
                            <button
                                type="button"
                                onClick={cancelEdit}
                                className="rounded-2xl border border-white/20 bg-white/5 px-8 py-4 font-semibold text-white transition-all hover:border-white/40 hover:bg-white/10 hover:shadow-lg"
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </form>

                {/* Episode Form */}
                <form
                    onSubmit={handleEpisodeSubmit}
                    className="grid gap-6 rounded-3xl border border-white/10 bg-zinc-900/70 p-8 shadow-2xl backdrop-blur-md"
                >
                    <h2 className="text-3xl font-bold">
                        {editingEpisodeId ? "Edit Episode" : "Add Episode"}
                    </h2>

                    <select
                        name="content_id"
                        value={episodeForm.content_id}
                        onChange={handleEpisodeChange}
                        className="rounded-2xl border border-white/10 bg-black/40 p-4 text-white outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                        required
                    >
                        <option value="">Select Content</option>
                        {contents.map((item) => (
                            <option key={item.id} value={item.id}>
                                {item.title}
                            </option>
                        ))}
                    </select>

                    <div className="grid gap-6 md:grid-cols-2">
                        <input
                            name="episode_number"
                            placeholder="Episode Number *"
                            value={episodeForm.episode_number}
                            onChange={handleEpisodeChange}
                            className="rounded-2xl border border-white/10 bg-black/40 p-4 text-white placeholder-zinc-500 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                            type="number"
                            min="1"
                            required
                        />

                        <input
                            name="duration"
                            placeholder="Duration (e.g., 24:30)"
                            value={episodeForm.duration}
                            onChange={handleEpisodeChange}
                            className="rounded-2xl border border-white/10 bg-black/40 p-4 text-white placeholder-zinc-500 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                        />
                    </div>

                    <input
                        name="title"
                        placeholder="Episode Title *"
                        value={episodeForm.title}
                        onChange={handleEpisodeChange}
                        className="rounded-2xl border border-white/10 bg-black/40 p-4 text-white placeholder-zinc-500 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                        required
                    />

                    <input
                        name="video_url"
                        placeholder="Video URL *"
                        value={episodeForm.video_url}
                        onChange={handleEpisodeChange}
                        className="rounded-2xl border border-white/10 bg-black/40 p-4 text-white placeholder-zinc-500 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                        required
                    />

                    <div className="flex flex-wrap gap-3">
                        <button
                            type="submit" className="rounded-2xl bg-gradient-to-r from-red-600 to-red-700 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:from-red-700 hover:to-red-800 hover:shadow-xl hover:-translate-y-0.5"
                        >
                            {editingEpisodeId ? "Update Episode" : "Add Episode"}
                        </button>

                        {editingEpisodeId && (
                            <button
                                type="button"
                                onClick={cancelEpisodeEdit}
                                className="rounded-2xl border border-white/20 bg-white/5 px-8 py-4 font-semibold text-white transition-all hover:border-white/40 hover:bg-white/10 hover:shadow-lg"
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </form>

                {/* Content List */}
                <div className="rounded-3xl border border-white/10 bg-zinc-900/70 p-8 shadow-2xl backdrop-blur-md">
                    <h2 className="mb-6 text-3xl font-bold">All Content ({contents.length})</h2>

                    {contents.length === 0 ? (
                        <div className="text-center py-12 text-zinc-400">
                            <p className="text-2xl">No content yet</p>
                            <p>Add your first content above!</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {contents.map((item) => (
                                <div
                                    key={item.id}
                                    className="group flex flex-col gap-4 rounded-2xl border border-white/10 bg-black/30 p-6 transition-all hover:border-white/20 hover:bg-black/40 hover:shadow-xl md:flex-row md:items-center md:justify-between"
                                >
                                    <div className="flex items-start gap-4">
                                        {/* ✅ FIXED: Safe image with fallback */}
                                        <div className="relative h-20 w-32 flex-shrink-0 overflow-hidden rounded-xl bg-black/50">
                                            <img
                                                src={item.thumbnail || "/api/placeholder/128/80"}
                                                alt={item.title}
                                                className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                                onError={(e) => {
                                                    e.target.src = "/api/placeholder/128/80";
                                                }}
                                            />
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <h3 className="truncate text-xl font-bold text-white group-hover:text-blue-400">
                                                {item.title}
                                            </h3>
                                            <p className="mt-1 text-sm text-zinc-400">
                                                {item.type?.toUpperCase()} • {item.release_year || "N/A"} •{" "}
                                                {item.category_name || item.category?.name || "Uncategorized"} •{" "}
                                                {item.language || "N/A"}
                                            </p>
                                            {item.rating && (
                                                <div className="mt-1 flex items-center gap-1 text-sm text-yellow-400">
                                                    ★ {item.rating}/10
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => handleEdit(item)}
                                            className="rounded-xl bg-blue-600 px-6 py-2.5 font-semibold text-white shadow-lg transition-all hover:bg-blue-700 hover:shadow-xl hover:-translate-y-0.5"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="rounded-xl bg-red-600 px-6 py-2.5 font-semibold text-white shadow-lg transition-all hover:bg-red-700 hover:shadow-xl hover:-translate-y-0.5"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Episodes List */}
                <div className="rounded-3xl border border-white/10 bg-zinc-900/70 p-8 shadow-2xl backdrop-blur-md">
                    <h2 className="mb-6 text-3xl font-bold">All Episodes ({episodes.length})</h2>

                    {episodes.length === 0 ? (
                        <div className="text-center py-12 text-zinc-400">
                            <p className="text-2xl">No episodes yet</p>
                            <p>Add content first, then episodes!</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {episodes.map((episode) => (
                                <div
                                    key={episode.id}
                                    className="group flex flex-col gap-4 rounded-2xl border border-white/10 bg-black/30 p-6 transition-all hover:border-white/20 hover:bg-black/40 hover:shadow-xl md:flex-row md:items-center md:justify-between"
                                >
                                    <div className="min-w-0 flex-1">
                                        <h3 className="truncate text-xl font-bold text-white group-hover:text-blue-400">
                                            {episode.content_title} - Ep {episode.episode_number}
                                        </h3>
                                        <p className="mt-1 text-sm text-zinc-300 truncate max-w-md">
                                            {episode.title || `Episode ${episode.episode_number}`}
                                        </p>
                                        <p className="mt-1 text-sm text-zinc-500">
                                            Duration: {episode.duration || "N/A"}
                                        </p>
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => handleEpisodeEdit(episode)}
                                            className="rounded-xl bg-blue-600 px-6 py-2.5 font-semibold text-white shadow-lg transition-all hover:bg-blue-700 hover:shadow-xl hover:-translate-y-0.5"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleEpisodeDelete(episode.id)}
                                            className="rounded-xl bg-red-600 px-6 py-2.5 font-semibold text-white shadow-lg transition-all hover:bg-red-700 hover:shadow-xl hover:-translate-y-0.5"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;