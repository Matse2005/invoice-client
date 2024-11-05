// services/InvoicesService.ts
import { Invoice } from "../types";

class InvoicesService {
  private static instance: InvoicesService;
  private settings: { apiUrl: string; apiKey: string } | null = null;

  private constructor() { }

  public static getInstance(): InvoicesService {
    if (!InvoicesService.instance) {
      InvoicesService.instance = new InvoicesService();
    }
    return InvoicesService.instance;
  }

  private async getSettings() {
    if (!this.settings) {
      this.settings = await window.ipc.invoke('get-settings');
      if (!this.settings?.apiUrl || !this.settings?.apiKey) {
        throw new Error('API settings not configured. Please check your settings.');
      }
    }
    return this.settings;
  }

  private async fetchWithAuth(endpoint: string, options: RequestInit = {}) {
    const settings = await this.getSettings();
    const url = `${settings.apiUrl}/${endpoint.replace(/^\//, '')}`;

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': settings.apiKey,
      ...(options.headers || {})
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response;
    } catch (error) {
      console.error(`API request failed (${endpoint}):`, error);
      throw error;
    }
  }

  async getAll() {
    return this.fetchWithAuth('invoices');
  }

  async getById({ id }: { id: number }) {
    return this.fetchWithAuth(`invoices/${id}`);
  }

  async store(invoiceData: any) {
    return this.fetchWithAuth('invoices', {
      method: 'POST',
      body: JSON.stringify(invoiceData)
    });
  }

  async update(id: number, invoice: Invoice) {
    return this.fetchWithAuth(`invoices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(invoice)
    });
  }

  async deleteInvoice(id: number) {
    return this.fetchWithAuth(`invoices/${id}`, {
      method: 'DELETE'
    });
  }

  async fetchPdf(id: number) {
    return this.fetchWithAuth(`invoices/request-link/${id}`, {
      method: 'POST'
    });
  }
}

// Export a singleton instance
export default InvoicesService.getInstance();