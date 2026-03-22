import axios from "axios";
const api = axios.create({ baseURL: "/api" });

export const getAllModules = ()      => api.get("/modules");
export const getModule     = (id)   => api.get(`/modules/${id}`);
export const createModule  = (data) => api.post("/modules", data);
export const deleteModule  = (id)   => api.delete(`/modules/${id}`);
export const postMarks     = (data) => api.post("/marks", data);