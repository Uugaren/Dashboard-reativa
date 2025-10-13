/// <reference types="vite/client" />

declare global {
  interface Window {
    supabase: any;
    initDashboardLogic: () => void;
    loadClientProfile: (clientId: string) => Promise<{
      client: any;
      purchases: any[];
      messages: any[];
    }>;
    goToPage: (page: number) => void;
  }
}

export {};
