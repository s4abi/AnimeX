import api from "./api";

export const getAllContents = async (filters = {}) => {
  const params = new URLSearchParams();

  if (filters.search) params.append("search", filters.search);
  if (filters.type) params.append("type", filters.type);
  if (filters.category) params.append("category", filters.category);

  const response = await api.get(`/content?${params.toString()}`);
  return response.data;
};

export const getSingleContent = async (id) => {
  const response = await api.get(`/content/${id}`);
  return response.data;
};

export const createContent = async (data) => {
  const res = await api.post("/content", data);
  return res.data;
};

export const updateContent = async (id, data) => {
  const res = await api.put(`/content/${id}`, data);
  return res.data;
};

export const deleteContent = async (id) => {
  const res = await api.delete(`/content/${id}`);
  return res.data;
};
