import { Invoice } from "../types";

const getAll = async () => {
  return await fetch(`${process.env.NEXT_PUBLIC_API_URL}/invoices`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": process.env.NEXT_PUBLIC_API_KEY
    },
  });
}

const getById = async ({ id }: { id: number }) => {
  return await fetch(`${process.env.NEXT_PUBLIC_API_URL}/invoices/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": process.env.NEXT_PUBLIC_API_KEY
    },
  });
}

const store = async (invoiceData) => {
  try {
    return await fetch(`${process.env.NEXT_PUBLIC_API_URL}/invoices`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": process.env.NEXT_PUBLIC_API_KEY,
      },
      body: JSON.stringify(invoiceData),
    });
  } catch (error) {
    console.error("Failed to store the invoice:", error);
    throw error;
  }
};

const update = async (id: number, invoice: Invoice) => {
  try {
    return await fetch(`${process.env.NEXT_PUBLIC_API_URL}/invoices/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": process.env.NEXT_PUBLIC_API_KEY,
      },
      body: JSON.stringify(invoice),
    });
  } catch (error) {
    console.error("Failed to store the invoice:", error);
    throw error;
  }
};

const deleteInvoice = async (id: number) => {
  try {
    return await fetch(`${process.env.NEXT_PUBLIC_API_URL}/invoices/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": process.env.NEXT_PUBLIC_API_KEY,
      },
    });
  } catch (error) {
    console.error("Failed to store the invoice:", error);
    throw error;
  }
};

const fetchPdf = async (id: number) => {
  try {
    return await fetch(`${process.env.NEXT_PUBLIC_API_URL}/invoices/request-link/${id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": process.env.NEXT_PUBLIC_API_KEY,
      },
    });
  } catch (error) {
    console.error("Failed to fetch the invoice pdf:", error);
    throw error;
  }
}

export default {
  getAll,
  getById,
  store,
  deleteInvoice,
  update,
  fetchPdf
}