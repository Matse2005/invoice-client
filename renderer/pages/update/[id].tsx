import React, { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import InvoicesService from "../../services/InvoicesService";
import ClientService from "../../services/ClientService";
import { Client, Invoice } from "../../types";
import InvoiceForm from "../../components/invoice/Form";

const EditInvoicePage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [clients, setClients] = useState<Client[]>([]);
  const [invoiceData, setInvoiceData] = useState<Invoice>({
    date: new Date().toISOString().split("T")[0],
    client: {
      name: "",
      address: ["", "", ""],
      btw: "",
    },
    items: [
      {
        description: "",
        price: 0,
        amount: 0,
        btw: 21,
      },
    ],
    port: 0,
    btw: true,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await ClientService.getAll();
        const clientsData = await response.json();
        setClients(clientsData);
      } catch (err) {
        console.error("Error fetching clients:", err);
      }
    };

    const fetchInvoice = async () => {
      try {
        const response = await InvoicesService.getById({ id: Number(id) });
        const invoice = await response.json();
        setInvoiceData(invoice);
      } catch (err) {
        setError("Error fetching invoice");
        console.error("Error fetching invoice:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
    fetchInvoice();
  }, [id]);

  const handleSubmit = async (invoiceData: Invoice) => {
    setSubmitting(true);
    setError("");

    const submitData: any = JSON.parse(JSON.stringify(invoiceData));
    submitData.client.address_one = submitData.client.address[0];
    submitData.client.address_two = submitData.client.address[1];
    submitData.client.address_three = submitData.client.address[2];

    try {
      const response = await InvoicesService.update(Number(id), submitData);
      if (response.ok) {
        router.push("/");
      } else {
        throw new Error("Failed to update invoice");
      }
    } catch (err) {
      setError("Er is iets misgegaan bij het updaten van de factuur.");
      console.error("Error updating invoice:", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-blue-500 rounded-full border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Factuur Bewerken</title>
      </Head>

      <div className="container max-w-4xl px-4 py-8 mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Factuur Bewerken</h1>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Terug
          </button>
        </div>

        {error && (
          <div className="p-4 mb-6 text-white bg-red-500 rounded-lg">
            <h3 className="font-bold">Error</h3>
            <p>{error}</p>
          </div>
        )}

        <InvoiceForm
          initialInvoiceData={invoiceData}
          clients={clients}
          onSubmit={handleSubmit}
          loading={submitting}
          buttonText="Bewerken"
        />
      </div>
    </>
  );
};

export default EditInvoicePage;