import axiosInstance from "../lib/axiosInstance";

const API_BASE_URL = "/instance"; // Ya que axiosInstance tiene `baseURL`, no es necesario repetir localhost

// Crear una instancia
export const createInstance = async (instanceName: string, phoneNumber: string) => {
  const payload = {
    instanceName,
    token: "",
    number: phoneNumber,
    qrcode: true,
    integration: "WHATSAPP-BAILEYS",
    reject_call: false,
    alwaysOnline: true,
  };

  try {
    const response = await axiosInstance.post(`${API_BASE_URL}/create`, payload);
    return response.data;
  } catch (error: any) {
    console.error("Error al crear la instancia:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Error al crear la instancia");
  }
};

// Obtener todas las instancias
export const fetchInstances = async () => {
  try {
    const response = await axiosInstance.get(`${API_BASE_URL}/fetchInstances`);
    return response.data;
  } catch (error: any) {
    console.error("Error al obtener las instancias:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Error al obtener las instancias");
  }
};

// Conectar una instancia
export const connectInstance = async (instanceName: string) => {
  try {
    const response = await axiosInstance.post(`${API_BASE_URL}/connect/${instanceName}`);
    return response.data;
  } catch (error: any) {
    console.error("Error al conectar la instancia:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Error al conectar la instancia");
  }
};

// Obtener el estado de conexión de una instancia
export const connectionState = async (instanceName: string) => {
  try {
    const response = await axiosInstance.get(`${API_BASE_URL}/connectionState/${instanceName}`);
    return response.data;
  } catch (error: any) {
    console.error("Error al obtener el estado de conexión:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Error al obtener el estado de conexión");
  }
};

// Cerrar sesión de una instancia
export const logoutInstance = async (instanceName: string) => {
  try {
    const response = await axiosInstance.delete(`${API_BASE_URL}/logout/${instanceName}`);
    return response.data;
  } catch (error: any) {
    console.error("Error al cerrar sesión de la instancia:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Error al cerrar sesión de la instancia");
  }
};

// Eliminar una instancia
export const deleteInstance = async (instanceName: string) => {
  try {
    const response = await axiosInstance.delete(`${API_BASE_URL}/delete/${instanceName}`);
    return response.data;
  } catch (error: any) {
    console.error("Error al eliminar la instancia:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Error al eliminar la instancia");
  }
};

export default {
  createInstance,
  fetchInstances,
  connectInstance,
  connectionState,
  logoutInstance,
  deleteInstance,
};
