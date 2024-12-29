// services/ClientService.ts
class ClientService {
  private static instance: ClientService;
  private settings: { apiUrl: string; apiKey: string } | null = null;

  private constructor() { }

  public static getInstance(): ClientService {
    if (!ClientService.instance) {
      ClientService.instance = new ClientService();
    }
    return ClientService.instance;
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
    const url = `${settings.apiUrl}/api/${endpoint.replace(/^\//, '')}`;

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
    return this.fetchWithAuth('clients');
  }
}

// Export a singleton instance
export default ClientService.getInstance();