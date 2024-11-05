// components/SettingsCheck.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

const SettingsCheck = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSettings = async () => {
      try {
        const settings = await window.ipc.invoke('get-settings');

        // Check if we're already on the settings page to prevent redirect loop
        const isSettingsPage = router.pathname === '/settings';

        // Check if settings exist and are valid
        const hasValidSettings = settings &&
          settings.apiUrl &&
          settings.apiKey
        if (!hasValidSettings && !isSettingsPage) {
          router.push('/settings');
        }
      } catch (error) {
        console.error('Error checking settings:', error);
        if (router.pathname !== '/settings') {
          router.push('/settings');
        }
      } finally {
        setLoading(false);
      }
    };

    checkSettings();
  }, [router.pathname]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-blue-500 rounded-full border-t-transparent animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
};

export default SettingsCheck;