import axios from "axios";
import { Repository } from "../interfaces/Repository";
import { GithubUser } from "../interfaces/GithubUser";
import { RepositoryPayload } from "../interfaces/RepositoryPayload";

const GITHUB_API_URL =
  import.meta.env.VITE_GITHUB_API_URL || "https://api.github.com";

const GITHUB_API_TOKEN =
  import.meta.env.VITE_GITHUB_API_TOKEN;

const githubClient = axios.create({
  baseURL: GITHUB_API_URL,
  headers: {
    Authorization: `Bearer ${GITHUB_API_TOKEN}`,
    Accept: "application/vnd.github.v3+json",
  },
});

const extractErrorMessage = (error: any): string => {
  if (axios.isAxiosError(error) && error.response?.data) {
    const data = error.response.data;
    if (data.errors && Array.isArray(data.errors)) {
      const details = data.errors
        .map((err: any) => {
          if (err.message) {
            if (err.message.includes("already exists")) {
              return "el nombre del repositorio ya existe en esta cuenta";
            }
            return err.message;
          }
          return err.code || "";
        })
        .filter(Boolean)
        .join(", ");
      return details ? `${data.message}: ${details}` : data.message;
    }
    return data.message || error.message;
  }
  return error.message || String(error);
};

export const fetchRepositories = async (): Promise<Repository[]> => {
  try {
    const response = await githubClient.get("/user/repos", {
      params: {
        per_page: 100,
        sort: "created",
        direction: "desc",
        affiliation: "owner,collaborator,organization_member",
        t: Date.now()
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error al leer repositorios", error);
    throw new Error(extractErrorMessage(error));
  }
};


export const createRepository = async (repository : RepositoryPayload): Promise<Repository> => {
    try {
        const response = await githubClient.post("user/repos", repository);
        return response.data as Repository
    } catch (error) {
        console.error("Error al agregar repositorios", error);
        throw new Error(extractErrorMessage(error));
    }
};
    

export const fetchUserInfo = async (): Promise<GithubUser | null> => {
  try {
    const response = await githubClient.get("/user");

    return response.data as GithubUser;
  } catch (error) {
    console.error("Error al leer usuario", error);
    throw new Error(extractErrorMessage(error));
  }
};

export const deleteRepository = async (owner: string, repo: string): Promise<void> => {
  try {
    await githubClient.delete(`/repos/${owner}/${repo}`);
  } catch (error) {
    console.error("Error al eliminar el repositorio", error);
    throw new Error(extractErrorMessage(error));
  }
};

export const updateRepository = async (
  owner: string,
  repo: string,
  payload: { name: string; description?: string }
): Promise<Repository> => {
  try {
    const response = await githubClient.patch(`/repos/${owner}/${repo}`, payload);
    return response.data as Repository;
  } catch (error) {
    console.error("Error al actualizar el repositorio", error);
    throw new Error(extractErrorMessage(error));
  }
};