import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import { getSingleContent } from "../services/contentService";
import { getEpisodesByContent } from "../services/episodeService";
import { saveWatchHistory } from "../services/historyService";

const Watch = () => {
    const { id } = useParams();
    const [content, setContent] = useState(null);
    const [episodes, setEpisodes] = useState([]);
    const [selectedEpisode, setSelectedEpisode] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const fetchWatchData = async () => {
            try {
                const [contentData, episodeData] = await Promise.all([
                    getSingleContent(id),
                    getEpisodesByContent(id),
                ]);

                setContent(contentData);
                setEpisodes(episodeData);

                if (episodeData.length > 0) {
                    setSelectedEpisode(episodeData[0]);
                }
            } catch (error) {
                console.error(error);
                setMessage("Failed to load watch page");
            } finally {
                setLoading(false);
            }
        };

        fetchWatchData();
    }, [id]);

    /** Register / refresh “continue watching” without lowering saved progress. */
    useEffect(() => {
        if (!content?.id || loading) return;
        (async () => {
            try {
                await saveWatchHistory({
                    content_id: content.id,
                    episode_id: selectedEpisode?.id ?? null,
                    touch_only: true,
                });
            } catch {
                /* ignore — e.g. expired token */
            }
        })();
    }, [content?.id, selectedEpisode?.id, loading]);

    const currentEpisodeIndex = useMemo(() => {
        return episodes.findIndex((ep) => ep.id === selectedEpisode?.id);
    }, [episodes, selectedEpisode]);

    const nextEpisode = useMemo(() => {
        if (currentEpisodeIndex === -1) return null;
        return episodes[currentEpisodeIndex + 1] || null;
    }, [episodes, currentEpisodeIndex]);

    const handleSaveProgress = async (progressValue) => {
        try {
            const res = await saveWatchHistory({
                content_id: content.id,
                episode_id: selectedEpisode?.id || null,
                progress: progressValue,
            });

            setMessage(res.message || "Progress saved");
        } catch (error) {
            setMessage(error.response?.data?.message || "Failed to save progress");
        }
    };

    const handleNextEpisode = async () => {
        if (!nextEpisode) {
            setMessage("No next episode available");
            return;
        }

        try {
            if (selectedEpisode) {
                await saveWatchHistory({
                    content_id: content.id,
                    episode_id: selectedEpisode.id,
                    progress: 100,
                });
            }
        } catch (error) {
            console.error("Failed to save completed progress:", error);
        }

        setSelectedEpisode(nextEpisode);
        setMessage(`Now playing Episode ${nextEpisode.episode_number}`);
    };

    const handleVideoEnded = async () => {
        if (!selectedEpisode) return;

        try {
            await saveWatchHistory({
                content_id: content.id,
                episode_id: selectedEpisode.id,
                progress: 100,
            });
        } catch (error) {
            console.error("Failed to save completion progress:", error);
        }

        if (nextEpisode) {
            setSelectedEpisode(nextEpisode);
            setMessage(`Auto-playing Episode ${nextEpisode.episode_number}`);
        } else {
            setMessage("You finished the last episode");
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

    return (
        <div className="min-h-screen text-white">
            <Navbar />

            <div className="mx-auto max-w-7xl px-6 py-8">
                <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <p className="text-xs font-semibold tracking-[0.18em] text-red-300 uppercase">
                            Now Streaming
                        </p>
                        <h1 className="text-4xl font-extrabold md:text-5xl">{content?.title}</h1>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300">
                        {episodes.length} episode{episodes.length === 1 ? "" : "s"}
                    </div>
                </div>

                {message && (
                    <p className="mb-4 rounded-2xl border border-white/10 bg-black/40 p-4 text-sm text-green-400">
                        {message}
                    </p>
                )}

                <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
                    <div className="overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/70 p-4 shadow-2xl">
                        {selectedEpisode ? (
                            <>
                                <video
                                    key={selectedEpisode.id}
                                    controls
                                    onEnded={handleVideoEnded}
                                    className="h-[500px] w-full rounded-2xl border border-white/10 bg-black object-cover"
                                    src={selectedEpisode.video_url}
                                />

                                <div className="mt-4">
                                    <h2 className="text-2xl font-bold">
                                        Episode {selectedEpisode.episode_number}: {selectedEpisode.title}
                                    </h2>

                                    <p className="mt-2 text-zinc-400">
                                        Duration: {selectedEpisode.duration || "N/A"}
                                    </p>

                                    <div className="mt-5 flex flex-wrap gap-3">
                                        <button
                                            onClick={() => handleSaveProgress(25)}
                                            className="rounded-xl bg-red-600 px-4 py-2 font-semibold transition hover:bg-red-700"
                                        >
                                            Save 25%
                                        </button>

                                        <button
                                            onClick={() => handleSaveProgress(50)}
                                            className="rounded-xl bg-red-600 px-4 py-2 font-semibold transition hover:bg-red-700"
                                        >
                                            Save 50%
                                        </button>

                                        <button
                                            onClick={() => handleSaveProgress(100)}
                                            className="rounded-xl bg-red-600 px-4 py-2 font-semibold transition hover:bg-red-700"
                                        >
                                            Mark Completed
                                        </button>

                                        <button
                                            onClick={handleNextEpisode}
                                            className="rounded-xl border border-white/20 bg-white/5 px-4 py-2 font-semibold transition hover:bg-white hover:text-black"
                                        >
                                            Next Episode
                                        </button>
                                    </div>

                                    {nextEpisode && (
                                        <p className="mt-4 text-sm text-zinc-400">
                                            Up next: Episode {nextEpisode.episode_number} - {nextEpisode.title}
                                        </p>
                                    )}
                                </div>
                            </>
                        ) : (
                            <p className="text-zinc-400">No episodes available for this content.</p>
                        )}
                    </div>

                    <div className="rounded-3xl border border-white/10 bg-zinc-900/70 p-4 shadow-2xl lg:sticky lg:top-24 lg:h-fit">
                        <h2 className="mb-4 text-2xl font-bold">Episodes</h2>

                        {selectedEpisode && (
                            <div className="mb-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-3">
                                <p className="text-xs tracking-[0.14em] text-red-300 uppercase">Now Playing</p>
                                <p className="mt-1 text-sm font-semibold">
                                    Ep {selectedEpisode.episode_number}: {selectedEpisode.title}
                                </p>
                            </div>
                        )}

                        <div className="max-h-[650px] space-y-3 overflow-y-auto pr-1">
                            {episodes.length === 0 ? (
                                <p className="text-zinc-400">No episodes found.</p>
                            ) : (
                                episodes.map((ep) => (
                                    <button
                                        key={ep.id}
                                        onClick={() => {
                                            setSelectedEpisode(ep);
                                            setMessage(`Now playing Episode ${ep.episode_number}`);
                                        }}
                                        className={`w-full rounded-2xl border p-4 text-left transition ${selectedEpisode?.id === ep.id
                                                ? "border-red-500 bg-red-500/10"
                                                : "border-white/10 bg-black/30 hover:border-white/20"
                                            }`}
                                    >
                                        <p className="font-semibold">
                                            Ep {ep.episode_number}: {ep.title}
                                        </p>
                                        <p className="mt-1 text-sm text-zinc-400">
                                            {ep.duration || "N/A"}
                                        </p>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Watch;