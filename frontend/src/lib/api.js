import { GraphQLClient } from "graphql-request";
import { logout } from "./auth";

export const API_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

async function authFetch(url, options = {}) {
  const token = localStorage.getItem("token");
  const subdomain = localStorage.getItem("school_subdomain");

  options.headers = {
    "Content-Type": "application/json",
    ...options.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(subdomain ? { "x-school-subdomain": subdomain } : {})
  };

  const response = await fetch(url, options);

  if (response.status === 401) {
    console.warn("Token inválido o expirado ➜ Logout forzado");
    logout();
    throw new Error("Sesión expirada");
  }

  return response;
}

export const graphQLClient = new GraphQLClient(`${API_URL}/apiquery`, {
  credentials: "include",
  mode: "cors",
  fetch: authFetch
});