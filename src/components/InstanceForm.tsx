import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { QRCodeSVG } from "qrcode.react";
import { useToast } from "@/hooks/use-toast";
import { Phone, User } from "react-feather"; // Usando iconos de react-feather
import Flag from "react-world-flags"; // Importamos react-world-flags para mostrar las banderas

const InstanceForm = ({ refreshInstances }: { refreshInstances: () => void }) => {
  const [activeTab, setActiveTab] = useState<"create" | "connect" | "finish">("create");
  const [instanceName, setInstanceName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const [countryCode, setCountryCode] = useState<string>("+1");

  const { toast } = useToast();

  const handleCreateInstance = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:8080/instance/create", {
        method: "POST",
        headers: { apikey: "mude-me", "Content-Type": "application/json" },
        body: JSON.stringify({ instanceName, phoneNumber: `${countryCode}${phoneNumber}` }),
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
        `http://localhost:8080/instance/connect/${instanceName}?number=${countryCode}${phoneNumber}`,
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
          <div className="flex items-center space-x-2">
            <User size={20} />
            <Input
              placeholder="Nombre de la instancia"
              value={instanceName}
              onChange={(e) => setInstanceName(e.target.value)}
              className="border p-2 rounded-md"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Select onValueChange={setCountryCode} value={countryCode}>
              <SelectTrigger className="border p-2 rounded-md w-1/4 bg-white">
                <SelectValue placeholder="+1" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="+1">
                  <Flag code="US" style={{ width: 20, height: 15 }} />
                  +1 USA
                </SelectItem>
                <SelectItem value="+44">
                  <Flag code="GB" style={{ width: 20, height: 15 }} />
                  +44 UK
                </SelectItem>
                <SelectItem value="+34">
                  <Flag code="ES" style={{ width: 20, height: 15 }} />
                  +34 Spain
                </SelectItem>
                <SelectItem value="+49">
                  <Flag code="DE" style={{ width: 20, height: 15 }} />
                  +49 Germany
                </SelectItem>
                <SelectItem value="+33">
                  <Flag code="FR" style={{ width: 20, height: 15 }} />
                  +33 France
                </SelectItem>
                <SelectItem value="+55">
                  <Flag code="BR" style={{ width: 20, height: 15 }} />
                  +55 Brazil
                </SelectItem>
                <SelectItem value="+91">
                  <Flag code="IN" style={{ width: 20, height: 15 }} />
                  +91 India
                </SelectItem>
                <SelectItem value="+61">
                  <Flag code="AU" style={{ width: 20, height: 15 }} />
                  +61 Australia
                </SelectItem>
                <SelectItem value="+81">
                  <Flag code="JP" style={{ width: 20, height: 15 }} />
                  +81 Japan
                </SelectItem>
                <SelectItem value="+86">
                  <Flag code="CN" style={{ width: 20, height: 15 }} />
                  +86 China
                </SelectItem>
                <SelectItem value="+52">
                  <Flag code="MX" style={{ width: 20, height: 15 }} />
                  +52 Mexico
                </SelectItem>
                <SelectItem value="+58">
                  <Flag code="VE" style={{ width: 20, height: 15 }} />
                  +58 Venezuela
                </SelectItem>
              </SelectContent>
            </Select>
            <Phone size={20} />
            <Input
              placeholder="Número de teléfono"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="border p-2 rounded-md"
            />
          </div>

          <Button onClick={handleCreateInstance} disabled={isLoading || !instanceName || !phoneNumber}>
            {isLoading ? "Creando..." : "Crear Instancia"}
          </Button>
        </div>
      </TabsContent>

      <TabsContent value="connect">
        {qrCode ? (
          <div className="flex flex-col items-center space-y-4">
            <p className="text-lg font-medium bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-md p-4 animate-pulse">
              Escanea este código QR para conectar la instancia:
            </p>
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
