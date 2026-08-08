import api from "./api";

export const saveWatchHistory = async (data) => {
  const res = await api.post("/history", data);
  return res.data;
};

export const getWatchHistory = async () => {
  const res = await api.get("/history");
  return res.data;
};

export const getContinueWatching = async () => {
  const res = await api.get("/history/continue-watching");
  return res.data;
};
