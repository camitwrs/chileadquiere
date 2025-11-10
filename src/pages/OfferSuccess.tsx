import React from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRoute, useLocation } from "wouter";

export default function OfferSuccess() {
  const [match, params] = useRoute("/ofertas/exito/:offerId");
  const offerId = params?.offerId ?? 'OFE-UNKNOWN';
  const dataRaw = localStorage.getItem(`oferta_sent_${offerId}`);
  const offer = dataRaw ? JSON.parse(dataRaw) : null;
  const [, setLocation] = useLocation();

  return (
    <DashboardLayout>
      <div className="p-6 flex items-center justify-center min-h-[70vh]">
        <Card className="p-8 max-w-xl text-center">
          <div className="text-6xl">✅</div>
          <h1 className="text-2xl font-bold text-green-700 mt-4">¡Oferta Enviada Exitosamente!</h1>
          <p className="text-sm text-gray-600 mt-2">Tu oferta ha sido registrada correctamente.</p>

          <div className="mt-6 text-left space-y-2">
            <div><strong>ID Oferta:</strong> {offer?.id ?? offerId}</div>
            <div><strong>Licitación:</strong> {offer?.licitacionId ?? 'LIC-2024-001'}</div>
            <div><strong>Fecha envío:</strong> {offer?.fechaEnvio ?? new Date().toISOString()}</div>
            <div><strong>Monto:</strong> {offer?.ofertaEconomica?.montoTotal ? `$ ${offer.ofertaEconomica.montoTotal.toLocaleString()}` : '-'}</div>
            <div><strong>Estado:</strong> Enviada - En Evaluación</div>
          </div>

          <div className="mt-6 flex justify-center gap-3">
            <Button onClick={() => setLocation(`/ofertas/${offer?.id ?? offerId}`)}>Ver mi Oferta</Button>
            <Button variant="outline" onClick={() => { const blob = new Blob([JSON.stringify(offer || {}, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `${offerId}_comprobante.json`; a.click(); }}>Descargar Comprobante PDF</Button>
            <Button variant="ghost" onClick={() => setLocation('/oportunidades')}>Volver a Oportunidades</Button>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
