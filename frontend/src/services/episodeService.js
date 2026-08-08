import api from "./api";

export const getEpisodesByContent = async (contentId) => {
  const res = await api.get(`/episodes/${contentId}`);
  return res.data;
};

export const getAllEpisodes = async () => {
  const res = await api.get("/episodes/admin/all");
  return res.data;
};

export const addEpisode = async (data) => {
  const res = await api.post("/episodes", data);
  return res.data;
};

export const updateEpisode = async (id, data) => {
  const res = await api.put(`/episodes/${id}`, data);
  return res.data;
};

export const deleteEpisode = async (id) => {
  const res = await api.delete(`/episodes/${id}`);
  return res.data;
};
