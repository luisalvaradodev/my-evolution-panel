import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { QRCodeSVG } from "qrcode.react"; // Usamos qrcode.react
import { useToast } from "@/hooks/use-toast";
import { useDrag, useDrop } from "react-dnd"; // Importamos de react-dnd
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Instance {
  name: string;
  status: "open" | "close";
  profilePictureUrl?: string;
}

interface InstanceTableProps {
  instances: Instance[];
  onDelete: (name: string) => Promise<void>;
  onConnect: (name: string, phoneNumber: string) => Promise<{ code?: string } | void>;
  onLogout: (name: string) => Promise<void>;
  refreshInstances: () => void;
}

const InstanceTable: React.FC<InstanceTableProps> = ({
  instances,
  onDelete,
  onConnect,
  onLogout,
  refreshInstances,
}) => {
  const [loadingInstance, setLoadingInstance] = useState<string | null>(null);
  const [qrCodes, setQrCodes] = useState<{ [key: string]: string | undefined }>({}); // Para almacenar los QR
  const [isGeneratingQR, setIsGeneratingQR] = useState<boolean>(false); // Estado para controlar la generación del QR
  const [filteredInstances, setFilteredInstances] = useState<Instance[]>(instances);
  const { toast } = useToast();

  // Función para conectar la instancia y generar el QR
  const handleConnectInstance = async (instanceName: string, phoneNumber: string) => {
    setIsGeneratingQR(true);
    try {
      const response = await fetch(
        `http://localhost:8080/instance/connect/${instanceName}?number=${phoneNumber}`,
        { method: "GET", headers: { apikey: "mude-me" } }
      );

      const data = await response.json();
      if (data.code) setQrCodes((prev) => ({ ...prev, [instanceName]: data.code }));

      // Verificamos la conexión
      const checkConnection = setInterval(async () => {
        const stateResponse = await fetch(
          `http://localhost:8080/instance/connectionState/${instanceName}`,
          { method: "GET", headers: { apikey: "mude-me" } }
        );
        const stateData = await stateResponse.json();
        if (stateData?.instance?.state === "open") {
          clearInterval(checkConnection);
          toast({ title: "Conexión exitosa", description: "Instancia conectada con éxito" });
          refreshInstances();
        }
      }, 5000);
    } catch (error) {
      toast({ title: "Error", description: "Error al conectar instancia", variant: "destructive" });
      console.error(error);
    } finally {
      setIsGeneratingQR(false);
    }
  };

  // Función de drag and drop
  const moveRow = (draggedIndex: number, targetIndex: number) => {
    const updatedInstances = [...filteredInstances];
    const [draggedInstance] = updatedInstances.splice(draggedIndex, 1);
    updatedInstances.splice(targetIndex, 0, draggedInstance);
    setFilteredInstances(updatedInstances); // Actualizamos las instancias en el orden modificado
  };

  const handleDelete = async (name: string) => {
    setLoadingInstance(name);
    try {
      await onDelete(name);
      toast({
        title: "Instancia eliminada",
        description: `La instancia "${name}" fue eliminada correctamente.`,
      });
      refreshInstances();
    } catch (error) {
      toast({
        title: "Error",
        description: `Error al eliminar la instancia "${name}".`,
        variant: "destructive",
      });
    } finally {
      setLoadingInstance(null);
    }
  };

  // Drag and Drop en cada fila
  const Row = ({ instance, index }: { instance: Instance; index: number }) => {
    const [{ isDragging }, drag] = useDrag(() => ({
      type: "row",
      item: { index },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }));

    const [, drop] = useDrop(() => ({
      accept: "row",
      hover: (item: { index: number }) => {
        if (item.index !== index) {
          moveRow(item.index, index);
          item.index = index;
        }
      },
    }));

    return (
      <TableRow
        ref={(node) => drag(drop(node))}
        key={instance.name}
        style={{ opacity: isDragging ? 0.5 : 1 }}
      >
        <TableCell>
          <Avatar>
            <AvatarImage src={instance.profilePictureUrl || ""} />
            <AvatarFallback>
              {instance.name[0]?.toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>
        </TableCell>
        <TableCell>{instance.name}</TableCell>
        <TableCell>
          <div
            className={`w-4 h-4 rounded-full ${
              instance.status === "open" ? "bg-green-500" : "bg-red-500"
            }`}
            title={instance.status === "open" ? "Abierta" : "Cerrada"}
          ></div>
        </TableCell>
        <TableCell>
          {qrCodes[instance.name] ? (
            <QRCodeSVG value={qrCodes[instance.name] as string} size={150} />
          ) : (
            <Button
              onClick={() => handleConnectInstance(instance.name, "123456789")} // Aquí se pasa un número de teléfono ficticio
              disabled={isGeneratingQR || loadingInstance === instance.name}
              className="w-full"
            >
              {isGeneratingQR && loadingInstance === instance.name ? "Generando QR..." : "Generar QR"}
            </Button>
          )}
        </TableCell>
        <TableCell className="flex items-center justify-center space-x-2">
          <Button
            onClick={() => onLogout(instance.name)}
            disabled={instance.status === "close" || loadingInstance === instance.name}
          >
            {loadingInstance === instance.name && instance.status !== "close"
              ? "Cerrando..."
              : "Cerrar Sesión"}
          </Button>
          <Button
            variant="destructive"
            onClick={() => handleDelete(instance.name)}
            disabled={loadingInstance === instance.name || instance.status === "open"}
          >
            {loadingInstance === instance.name ? "Eliminando..." : <Trash className="w-4 h-4" />}
          </Button>
        </TableCell>
      </TableRow>
    );
  };

  // Función de búsqueda
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value.toLowerCase();
    const filtered = instances.filter((instance) =>
      instance.name.toLowerCase().includes(query)
    );
    setFilteredInstances(filtered);
  };

  return (
    <div className="h-full w-full overflow-auto">
      <input
        type="text"
        placeholder="Buscar instancias..."
        onChange={handleSearch}
        className="mb-4 p-2 border rounded"
      />
      <Table>
        <TableCaption>Lista de instancias gestionadas</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Avatar</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>QR</TableHead> {/* Nueva columna para el QR */}
            <TableHead className="text-center">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredInstances.map((instance, index) => (
            <Row instance={instance} index={index} key={instance.name} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default InstanceTable;
