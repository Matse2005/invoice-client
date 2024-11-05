import React, { useState } from "react";
import ClientSearchInput from "../store/ClientSearchInput";
import { Client, Invoice } from "../../types";

interface InvoiceFormProps {
  initialInvoiceData: Invoice;
  clients: Client[];
  onSubmit: (invoiceData: Invoice) => Promise<void>;
  loading: boolean,
  buttonText: string
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({
  initialInvoiceData,
  clients,
  onSubmit,
  loading,
  buttonText = "Opslaan"
}) => {
  const [invoiceData, setInvoiceData] = useState<Invoice>(initialInvoiceData);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);

  const handleClientSearch = (searchValue: string) => {
    handleClientChange("name", searchValue);

    if (searchValue.length > 0) {
      const filtered = clients.filter((client) =>
        client.name.toLowerCase().includes(searchValue.toLowerCase())
      );
      setFilteredClients(filtered);
    } else {
      setFilteredClients([]);
    }
  };

  const handleClientSelect = (selectedClient: Client) => {
    setInvoiceData((prev) => ({
      ...prev,
      client: {
        name: selectedClient.name,
        address: selectedClient.address,
        btw: selectedClient.btw,
      },
    }));
    setFilteredClients([]);
  };

  const handleClientChange = (field: string, value: string) => {
    if (field.startsWith("address")) {
      const index = parseInt(field.slice(-1));
      setInvoiceData((prev) => {
        const newAddress = [...prev.client.address] as [string, string, string];
        newAddress[index] = value;

        return {
          ...prev,
          client: {
            ...prev.client,
            address: newAddress,
          },
        };
      });
    } else {
      setInvoiceData((prev) => ({
        ...prev,
        client: {
          ...prev.client,
          [field]: value,
        },
      }));
    }
  };

  const calculateSubtotal = () => {
    return invoiceData.items.reduce((sum, item) => sum + (Number(item.price) * Number(item.amount)), 0);
  };

  const calculateBTW = () => {
    return invoiceData.items.reduce((sum, item) => {
      return sum + (Number(item.price) * Number(item.amount)) * (item.btw / 100);
    }, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const btw = invoiceData.btw ? calculateBTW() : 0;
    const shipping = Number(invoiceData.port) || 0;
    return subtotal + btw + shipping;
  };

  const handleItemChange = (
    index: number,
    field: string,
    value: string | number
  ) => {
    setInvoiceData((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addItem = () => {
    setInvoiceData((prev) => ({
      ...prev,
      items: [...prev.items, { description: "", price: 0, amount: 0, btw: 21 }],
    }));
  };

  const removeItem = (index: number) => {
    if (invoiceData.items.length > 1) {
      setInvoiceData((prev) => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index),
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(invoiceData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Date and BTW Settings */}

      <div className="p-6 bg-white rounded-lg shadow">
        <h2 className="mb-4 text-xl font-semibold">Factuur Details</h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Datum
            </label>

            <input
              type="date"
              value={invoiceData.date}
              onChange={(e) =>
                setInvoiceData((prev) => ({
                  ...prev,
                  date: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Reguliere BTW
            </label>

            <select
              value={invoiceData.btw.toString()}
              onChange={(e) =>
                setInvoiceData((prev) => ({
                  ...prev,
                  btw: e.target.value === "true",
                }))
              }
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="true">Ja</option>

              <option value="false">Nee</option>
            </select>

            <small>
              Dit wil zeggen dat de levering{" "}
              <span className="font-bold">niet</span> onderworpen wordt aan
              de bijzondere regeling van de heffing over de marge.
            </small>
          </div>
        </div>
      </div>

      {/* Client Information */}

      <div className="p-6 bg-white rounded-lg shadow">
        <h2 className="mb-4 text-xl font-semibold">Klant Informatie</h2>

        <div className="grid gap-4">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Naam
            </label>

            <ClientSearchInput
              value={invoiceData.client.name}
              suggestions={filteredClients}
              onSelect={handleClientSelect}
              onChange={handleClientSearch}
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              BTW Nummer
            </label>

            <input
              type="text"
              value={invoiceData.client.btw}
              onChange={(e) => handleClientChange("btw", e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Adres
            </label>

            {[0, 1, 2].map((i) => (
              <input
                key={i}
                type="text"
                value={invoiceData.client.address[i]}
                onChange={(e) =>
                  handleClientChange(`address${i}`, e.target.value)
                }
                placeholder={
                  i === 0
                    ? "Straat en huisnummer"
                    : i === 1
                      ? "Postcode en plaats"
                      : "LAND"
                }
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required={i === 0 || i === 2}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Invoice Items */}

      <div className="p-6 bg-white rounded-lg shadow">
        <h2 className="mb-4 text-xl font-semibold">Factuur Items</h2>

        <div className="space-y-4">
          {invoiceData.items.map((item, index) => (
            <div key={index} className="p-4 border rounded-lg">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Omschrijving
                  </label>

                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) =>
                      handleItemChange(index, "description", e.target.value)
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Prijs
                  </label>

                  <input
                    type="number"
                    step="0.01"
                    value={item.price}
                    onChange={(e) =>
                      handleItemChange(
                        index,
                        "price",
                        parseFloat(e.target.value)
                      )
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Aantal
                  </label>

                  <input
                    type="number"
                    step="1"
                    value={item.amount}
                    onChange={(e) =>
                      handleItemChange(
                        index,
                        "amount",
                        parseInt(e.target.value)
                      )
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    BTW Percentage
                  </label>

                  <select
                    value={item.btw}
                    onChange={(e) =>
                      handleItemChange(
                        index,
                        "btw",
                        parseInt(e.target.value)
                      )
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={0}>0%</option>

                    <option value={6}>6%</option>

                    <option value={12}>12%</option>

                    <option value={21}>21%</option>
                  </select>
                </div>
              </div>

              {invoiceData.items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="mt-2 text-sm text-red-600 hover:text-red-800"
                >
                  Verwijder item
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={addItem}
            className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            + Item toevoegen
          </button>
        </div>
      </div>

      {/* Shipping and Totals */}

      <div className="p-6 bg-white rounded-lg shadow">
        <div className="grid gap-4 mb-6 sm:grid-cols-2">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Verzendkosten
            </label>

            <input
              type="number"
              step="0.01"
              value={invoiceData.port}
              onChange={(e) =>
                setInvoiceData((prev) => ({
                  ...prev,
                  port: parseFloat(e.target.value),
                }))
              }
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="pt-4 mt-4 space-y-2 text-right border-t">
          <p className="text-gray-600">
            Subtotaal: €{calculateSubtotal().toFixed(2)}
          </p>

          {invoiceData.btw && (
            <p className="text-gray-600">
              BTW: €{calculateBTW().toFixed(2)}
            </p>
          )}

          {invoiceData.port > 0 && (
            <p className="text-gray-600">
              Verzendkosten: €{Number(invoiceData.port).toFixed(2)}
            </p>
          )}

          <p className="text-xl font-bold">
            Totaal: €{calculateTotal().toFixed(2)}
          </p>
        </div>
      </div>

      {/* Submit Button */}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Bezig met opslaan..." : "Factuur " + buttonText.toLocaleLowerCase()}
        </button>
      </div>
    </form>
  );
};

export default InvoiceForm;