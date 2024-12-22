// _app.tsx
import "../styles/globals.css";
import type { AppProps } from "next/app";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Toaster } from "@/components/ui/toaster";
import { DndProvider } from "react-dnd"; // Importar DndProvider
import { HTML5Backend } from "react-dnd-html5-backend"; // Importar HTML5Backend para drag and drop

export default function App({ Component, pageProps }: AppProps) {
  return (
    <DndProvider backend={HTML5Backend}> {/* Añadir DndProvider */}
      <SidebarProvider>
        {/* Sidebar en capa superior */}
        <AppSidebar />

        {/* Contenido principal sin ser afectado por el sidebar */}
        <div className="relative flex h-screen w-screen overflow-hidden">
          <main className="flex-1 p-6 bg-gray-50">
            <SidebarTrigger /> {/* Botón para mostrar/ocultar el sidebar */}
            <Component {...pageProps} />
          </main>
        </div>

        {/* Toaster para notificaciones */}
        <Toaster />
      </SidebarProvider>
    </DndProvider>
  );
}
