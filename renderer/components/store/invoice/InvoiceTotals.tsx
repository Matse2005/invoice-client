import React from 'react';

interface InvoiceTotalsProps {
  subtotal: number;
  btw: number;
  shipping: number;
  total: number;
}

export const InvoiceTotals = ({
  subtotal,
  btw,
  shipping,
  total
}: InvoiceTotalsProps) => (
  <div className="space-y-2 text-right">
    <div className="text-gray-600">Subtotaal: €{subtotal.toFixed(2)}</div>
    {btw > 0 && <div className="text-gray-600">BTW: €{btw.toFixed(2)}</div>}
    {shipping > 0 && (
      <div className="text-gray-600">Verzendkosten: €{shipping.toFixed(2)}</div>
    )}
    <div className="text-2xl font-bold text-gray-800">
      Totaal: €{total.toFixed(2)}
    </div>
  </div>
);