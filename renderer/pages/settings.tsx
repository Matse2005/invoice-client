// settings.tsx
import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

interface AppSettings {
  apiUrl: string;
  apiKey: string;
}

const SettingsPage = () => {
  const router = useRouter();
  const [settings, setSettings] = useState<AppSettings>({
    apiUrl: '',
    apiKey: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [isInitialSetup, setIsInitialSetup] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedSettings = await window.ipc.invoke('get-settings');
        if (savedSettings) {
          setSettings(savedSettings);
        } else {
          setIsInitialSetup(true);
        }
      } catch (err) {
        setError('Failed to load settings');
        console.error('Error loading settings:', err);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      await window.ipc.invoke('save-settings', settings);
      router.push('/');
    } catch (err) {
      setError('Failed to save settings');
      console.error('Error saving settings:', err);
    } finally {
      setSaving(false);
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
        <title>{isInitialSetup ? 'Eerste Installatie' : 'App Instellingen'}</title>
      </Head>

      <div className="container max-w-4xl px-4 py-8 mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">
            {isInitialSetup ? 'Welkom! Laten we je app instellen' : 'Instellingen'}
          </h1>
          {!isInitialSetup && (
            <button
              onClick={() => router.back()}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Terug
            </button>
          )}
        </div>

        {isInitialSetup && (
          <div className="p-4 mb-6 text-blue-700 bg-blue-100 rounded-lg">
            <h3 className="font-bold">Welkom bij de Factuur App</h3>
            <p>Configureer je instellingen om te beginnen. Je hebt nodig:</p>
            <ul className="ml-4 list-disc">
              <li>Je API URL en API-sleutel</li>
            </ul>
          </div>
        )}

        {error && (
          <div className="p-4 mb-6 text-white bg-red-500 rounded-lg">
            <h3 className="font-bold">Fout</h3>
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="p-6 bg-white rounded-lg shadow">
            <h2 className="mb-4 text-xl font-semibold">API Instellingen</h2>
            <div className="space-y-4">
              <div>
                <label className="block mb-1 font-medium">API URL</label>
                <input
                  type="url"
                  value={settings.apiUrl}
                  onChange={(e) => setSettings(prev => ({ ...prev, apiUrl: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">API-sleutel</label>
                <input
                  type="password"
                  value={settings.apiKey}
                  onChange={(e) => setSettings(prev => ({ ...prev, apiKey: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {saving ? 'Opslaan...' : (isInitialSetup ? 'Installatie Voltooien' : 'Instellingen Opslaan')}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default SettingsPage;