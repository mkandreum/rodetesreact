import { useState } from 'react';
import { useStore } from '../services/store';
import { MerchItem, Drag } from '../types';

export const useMerchPurchase = () => {
    const { addMerchSale } = useStore();
    const [merchForm, setMerchForm] = useState({ name: '', surname: '', email: '', quantity: 1 });
    const [generatedSaleId, setGeneratedSaleId] = useState<string | null>(null);

    const purchaseMerch = (item: MerchItem, drag: Drag | null) => {
        const saleId = crypto.randomUUID().slice(0, 8).toUpperCase();
        addMerchSale({
            saleId,
            dragId: drag ? drag.id : null,
            dragName: drag ? drag.name : 'Web Merch',
            merchItemId: item.id,
            itemName: item.name,
            itemPrice: item.price,
            quantity: merchForm.quantity,
            nombre: merchForm.name,
            apellidos: merchForm.surname,
            email: merchForm.email,
            saleDate: new Date().toISOString(),
            status: 'Pending'
        });
        setGeneratedSaleId(saleId);
    };

    const resetForm = () => {
        setMerchForm({ name: '', surname: '', email: '', quantity: 1 });
        setGeneratedSaleId(null);
    };

    return {
        merchForm,
        setMerchForm,
        generatedSaleId,
        purchaseMerch,
        resetForm
    };
};
