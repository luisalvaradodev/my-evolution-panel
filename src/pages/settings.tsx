import React, { useState, useEffect } from "react";
import axiosInstance from "@/lib/axiosInstance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const SettingsPage = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const fetchUserData = async () => {
    try {
      const { data } = await axiosInstance.get("/auth/user");
      setEmail(data.email);
    } catch (err) {
      setError("Error al obtener los datos de usuario.");
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleUpdate = async () => {
    try {
      await axiosInstance.put("/auth/update", { email, password });
      alert("Cuenta actualizada con éxito.");
    } catch (err) {
      setError("Error al actualizar la cuenta.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Configuración de Cuenta</h2>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <div className="mb-4">
        <Input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <Input
          type="password"
          placeholder="Nueva contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <Button onClick={handleUpdate} className="w-full">
        Actualizar
      </Button>
    </div>
  );
};

export default SettingsPage;
