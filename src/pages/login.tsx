import React, { useState } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const LoginPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  // Credenciales predeterminadas
  const defaultEmail = "admin@gmail.com";
  const defaultPassword = "123";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Verificar si las credenciales coinciden
    if (email === defaultEmail && password === defaultPassword) {
      // Almacenar el token en localStorage para simular sesión
      localStorage.setItem("token", "dummy_token");

      // Redirigir a la página principal de instancias
      router.push("/");
    } else {
      setError("Credenciales incorrectas.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Iniciar sesión</h2>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <form onSubmit={handleLogin}>
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
          Iniciar sesión
        </Button>
      </form>
      <div className="mt-4 text-center">
        <span>¿No tienes cuenta? </span>
        <a href="/register" className="text-blue-500">Regístrate aquí</a>
      </div>
    </div>
  );
};

export default LoginPage;
