import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Trash, Search } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { QRCodeSVG } from "qrcode.react";
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
  onCheckState: (name: string) => Promise<{ state: string; details: string }>;
}

const InstanceTable: React.FC<InstanceTableProps> = ({
  instances,
  onDelete,
  onConnect,
  onLogout,
  onCheckState,
}) => {
  const [loadingInstance, setLoadingInstance] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [popoverState, setPopoverState] = useState<{ [key: string]: string }>({});

  const handleAction = async (
    action: (name: string) => Promise<void | { qrCode?: string }>,
    name: string
  ) => {
    setLoadingInstance(name);
    try {
      const result = await action(name);
      if (result && "qrCode" in result && result.qrCode) {
        setQrCode(result.qrCode);
      }
    } finally {
      setLoadingInstance(null);
    }
  };

  const handleCheckState = async (name: string) => {
    setLoadingInstance(name);
    try {
      const { state, details } = await onCheckState(name);
      setPopoverState((prev) => ({ ...prev, [name]: `${state}: ${details}` }));
    } catch {
      setPopoverState((prev) => ({ ...prev, [name]: "Error al obtener estado" }));
    } finally {
      setLoadingInstance(null);
    }
  };

  return (
    <div className="h-full w-full overflow-auto">
      <Table>
        <TableCaption>Lista de instancias gestionadas</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Avatar</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-center">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {instances.map((instance) => (
            <TableRow key={instance.name}>
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
              <TableCell className="flex items-center justify-center space-x-2">
                <Button
                  onClick={() => handleAction(onConnect, instance.name)}
                  disabled={instance.status === "open" || loadingInstance === instance.name}
                >
                  {loadingInstance === instance.name && instance.status !== "open"
                    ? "Conectando..."
                    : "Conectar"}
                </Button>
                {qrCode && (
                  <Popover>
                    <PopoverTrigger>
                      <Button variant="outline">Ver QR</Button>
                    </PopoverTrigger>
                    <PopoverContent>
                      <QRCodeSVG value={qrCode} size={150} />
                    </PopoverContent>
                  </Popover>
                )}
                <Button
                  onClick={() => handleAction(onLogout, instance.name)}
                  disabled={instance.status === "close" || loadingInstance === instance.name}
                >
                  {loadingInstance === instance.name && instance.status !== "close"
                    ? "Cerrando..."
                    : "Cerrar Sesión"}
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleAction(onDelete, instance.name)}
                  disabled={loadingInstance === instance.name}
                >
                  {loadingInstance === instance.name ? "Eliminando..." : <Trash className="w-4 h-4" />}
                </Button>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      className="p-2"
                      onClick={() => handleCheckState(instance.name)}
                      disabled={loadingInstance === instance.name}
                    >
                      <Search className="w-4 h-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent>
                    <p>{popoverState[instance.name] || "Cargando estado..."}</p>
                  </PopoverContent>
                </Popover>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default InstanceTable;
