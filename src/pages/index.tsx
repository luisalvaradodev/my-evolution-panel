import React, { useEffect, useState } from "react";
import InstanceForm from "@/components/InstanceForm";
import InstanceTable from "@/components/InstanceTable";
import axiosInstance from "@/lib/axiosInstance";

interface Instance {
  name: string;
  status: "open" | "close";
  profilePictureUrl?: string;
}

const IndexPage = () => {
  const [instances, setInstances] = useState<Instance[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadInstances = async () => {
    setIsLoading(true);
    try {
      const { data } = await axiosInstance.get("/instance/fetchInstances");
      const formattedData = data.map((item: any) => ({
        name: item.instance.instanceName,
        status: item.instance.status,
        profilePictureUrl: item.instance.profilePictureUrl,
      }));

      setInstances(formattedData);
    } catch (error) {
      console.error("Error al cargar las instancias:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInstances();
  }, []);

  const handleDelete = async (name: string) => {
    try {
      await axiosInstance.delete(`/instance/delete/${name}`);
      loadInstances();
    } catch (error) {
      console.error(`Error al eliminar la instancia ${name}:`, error);
    }
  };
  
  const handleConnect = async (name: string) => {
    try {
      const { data } = await axiosInstance.post(`/instance/connect/${name}`);
      return { qrCode: data.qrcode_url };
    } catch (error) {
      console.error(`Error al conectar la instancia ${name}:`, error);
    }
  };
  

  const handleLogout = async (name: string) => {
    try {
      await axiosInstance.delete(`/instance/logout/${name}`);
      console.log(`Sesión cerrada correctamente para la instancia: ${name}.`);
      loadInstances();
    } catch (error) {
      console.error(`Error al cerrar sesión de la instancia ${name}:`, error);
    }
  };

  const handleCheckState = async (name: string): Promise<{ state: string; details: string }> => {
    try {
      const { data } = await axiosInstance.get(`/instance/connectionState/${name}`);
      return {
        state: data.state,
        details: data.details,
      };
    } catch (error) {
      console.error(`Error al verificar el estado de la instancia ${name}:`, error);
      return {
        state: "Error",
        details: "No se pudo obtener el estado de la instancia.",
      };
    }
  };

  return (
    <div className="w-full h-screen flex flex-col justify-start items-center p-4 bg-gradient-to-b from-gray-50 to-gray-100">
      <h1 className="text-4xl font-bold text-gray-800 mb-6">Gestión de Instancias</h1>
      <div className="w-full max-w-4xl space-y-8 bg-white shadow-lg rounded-lg p-6">
        <InstanceForm refreshInstances={loadInstances} />
        {isLoading ? (
          <div className="text-center py-4">Cargando instancias...</div>
        ) : (
          <InstanceTable
            instances={instances}
            onDelete={handleDelete}
            onConnect={handleConnect}
            onLogout={handleLogout}
            onCheckState={handleCheckState}
          />
        )}
      </div>
    </div>
  );
};

export default IndexPage;
