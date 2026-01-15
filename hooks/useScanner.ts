import { useState } from 'react';
import { useStore } from '../services/store';

export const useScanner = () => {
    const { state, confirmTicketUsage, updateMerchSaleStatus } = useStore();
    const [scanResult, setScanResult] = useState<{
        status: 'success' | 'error' | 'warning';
        message: string;
        detail?: string;
    } | null>(null);

    const handleScan = (data: string) => {
        let id = data;
        let type = 'unknown';

        if (data.includes('TICKET_ID:')) {
            id = data.split('TICKET_ID:')[1].trim();
            type = 'ticket';
        } else if (data.includes('MERCH_SALE_ID:')) {
            const lines = data.split('\n');
            const idLine = lines.find(l => l.startsWith('MERCH_SALE_ID:'));
            if (idLine) id = idLine.split(':')[1].trim();
            type = 'merch';
        }

        if (type === 'ticket') {
            const ticket = state.tickets.find(t => t.ticketId === id);
            if (!ticket) {
                setScanResult({ status: 'error', message: 'TICKET NO VALIDO', detail: `ID: ${id} no encontrado.` });
            } else {
                const usedCount = state.scannedTickets[id] || 0;
                if (usedCount >= ticket.quantity) {
                    setScanResult({ status: 'warning', message: 'YA UTILIZADO', detail: `Este ticket ya ha entrado (${usedCount}/${ticket.quantity}).` });
                } else {
                    confirmTicketUsage(id, 1);
                    setScanResult({ status: 'success', message: 'ACCESO PERMITIDO', detail: `Bienvenido ${ticket.nombre}. (${usedCount + 1}/${ticket.quantity})` });
                }
            }
        } else if (type === 'merch') {
            const sale = state.merchSales.find(s => s.saleId === id);
            if (!sale) {
                setScanResult({ status: 'error', message: 'PEDIDO NO ENCONTRADO', detail: `ID: ${id}` });
            } else {
                if (sale.status === 'Delivered') {
                    setScanResult({ status: 'warning', message: 'YA ENTREGADO', detail: `Este pedido ya se entregó.` });
                } else {
                    updateMerchSaleStatus(id, 'Delivered');
                    setScanResult({ status: 'success', message: 'ENTREGAR PEDIDO', detail: `${sale.itemName} x${sale.quantity} para ${sale.nombre}` });
                }
            }
        } else {
            setScanResult({ status: 'error', message: 'QR DESCONOCIDO', detail: data });
        }

        return scanResult;
    };

    const clearResult = () => setScanResult(null);

    return {
        scanResult,
        handleScan,
        clearResult
    };
};
