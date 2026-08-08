import api from "./api";

export const getUserWatchlist = async () => {
  const res = await api.get("/watchlist");
  return res.data;
};

export const addToWatchlist = async (contentId) => {
  const res = await api.post("/watchlist", { content_id: contentId });
  return res.data;
};

export const removeFromWatchlist = async (contentId) => {
  const res = await api.delete(`/watchlist/${contentId}`);
  return res.data;
};
