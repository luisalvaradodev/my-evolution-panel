import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
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
  onConnect: (name: string) => Promise<{ qrCode?: string } | void>;
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
  const [qrCodes, setQrCodes] = useState<{ [key: string]: string | undefined }>({});
  const [intervals, setIntervals] = useState<{ [key: string]: NodeJS.Timeout }>({});
  const [filteredInstances, setFilteredInstances] = useState<Instance[]>(instances);
  const { toast } = useToast();

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
            <QRCodeSVG value={qrCodes[instance.name] as string} size={100} />
          ) : (
            <p>{instance.status === "open" ? "Conectada" : "Sin QR"}</p>
          )}
        </TableCell>
        <TableCell className="flex items-center justify-center space-x-2">
          <Button
            onClick={() => onConnect(instance.name)}
            disabled={instance.status === "open" || loadingInstance === instance.name}
          >
            {loadingInstance === instance.name && instance.status !== "open"
              ? "Conectando..."
              : "Conectar"}
          </Button>
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
            <TableHead>Código QR</TableHead>
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
