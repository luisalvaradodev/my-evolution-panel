import React, { useState } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axiosInstance from "@/lib/axiosInstance";

const RegisterPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await axiosInstance.post("/auth/register", { email, password });
      localStorage.setItem("token", data.token); // Guardar el token en localStorage
      router.push("/"); // Redirigir a la página principal
    } catch (err) {
      setError("Error al registrar la cuenta.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Crear cuenta</h2>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <form onSubmit={handleRegister}>
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
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <Button type="submit" className="w-full">
          Registrar
        </Button>
      </form>
      <div className="mt-4 text-center">
        <span>¿Ya tienes cuenta? </span>
        <a href="/login" className="text-blue-500">Inicia sesión aquí</a>
      </div>
    </div>
  );
};

export default RegisterPage;
