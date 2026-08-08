import api from "./api";

export const getAllCategories = async () => {
  const res = await api.get("/categories");
  return res.data;
};
