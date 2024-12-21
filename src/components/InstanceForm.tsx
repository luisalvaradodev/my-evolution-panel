import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QRCodeSVG } from "qrcode.react";
import { useToast } from "@/hooks/use-toast";

const InstanceForm = ({ refreshInstances }: { refreshInstances: () => void }) => {
  const [activeTab, setActiveTab] = useState<"create" | "connect" | "finish">("create");
  const [instanceName, setInstanceName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);

  const { toast } = useToast();

  const handleCreateInstance = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:8080/instance/create", {
        method: "POST",
        headers: { apikey: "mude-me", "Content-Type": "application/json" },
        body: JSON.stringify({ instanceName, phoneNumber }),
      });

      if (!response.ok) throw new Error("Error al crear instancia");
      toast({ title: "Éxito", description: "Instancia creada con éxito" });
      setActiveTab("connect");
    } catch (error) {
      toast({ title: "Error", description: "Error al crear instancia", variant: "destructive" });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectInstance = async () => {
    setIsGeneratingQR(true);
    try {
      const response = await fetch(
        `http://localhost:8080/instance/connect/${instanceName}?number=${phoneNumber}`,
        { method: "GET", headers: { apikey: "mude-me" } }
      );

      const data = await response.json();
      if (data.code) setQrCode(data.code);

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
          setActiveTab("finish");
        }
      }, 5000);
    } catch (error) {
      toast({ title: "Error", description: "Error al conectar instancia", variant: "destructive" });
      console.error(error);
    } finally {
      setIsGeneratingQR(false);
    }
  };

  const handleFinish = () => {
    setInstanceName("");
    setPhoneNumber("");
    setQrCode(null);
    setActiveTab("create");
    refreshInstances();
  };

  return (
    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
      <TabsList>
        <TabsTrigger value="create">Crear Instancia</TabsTrigger>
        <TabsTrigger value="connect" disabled={!instanceName}>
          Conectar Instancia
        </TabsTrigger>
        <TabsTrigger value="finish" disabled={activeTab !== "finish"}>
          Finalizar
        </TabsTrigger>
      </TabsList>
      <TabsContent value="create">
        <div className="space-y-4">
          <Input
            placeholder="Nombre de la instancia"
            value={instanceName}
            onChange={(e) => setInstanceName(e.target.value)}
          />
          <Input
            placeholder="Número de teléfono"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
          <Button onClick={handleCreateInstance} disabled={isLoading || !instanceName || !phoneNumber}>
            {isLoading ? "Creando..." : "Crear Instancia"}
          </Button>
        </div>
      </TabsContent>
      <TabsContent value="connect">
        {qrCode ? (
          <div className="flex flex-col items-center space-y-4">
            <p className="text-lg font-medium">Escanea este código QR para conectar la instancia:</p>
            <QRCodeSVG value={qrCode} size={200} />
          </div>
        ) : (
          <Button onClick={handleConnectInstance} disabled={isGeneratingQR}>
            {isGeneratingQR ? "Generando QR..." : "Generar QR"}
          </Button>
        )}
      </TabsContent>
      <TabsContent value="finish">
        <div className="text-center space-y-4">
          <p className="text-lg font-medium">¡Instancia configurada con éxito!</p>
          <Button onClick={handleFinish}>Finalizar</Button>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default InstanceForm;
