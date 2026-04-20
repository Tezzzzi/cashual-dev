import { trpc } from "@/lib/trpc";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import { getStoredToken } from "@/lib/auth-storage";
import App from "./App";
import "./index.css";

// Telegram WebApp type declarations
declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        ready: () => void;
        expand: () => void;
        setHeaderColor: (color: string) => void;
        setBackgroundColor: (color: string) => void;
        initData: string;
        initDataUnsafe: Record<string, any>;
        close: () => void;
        colorScheme: "light" | "dark";
        themeParams: Record<string, string>;
        isExpanded: boolean;
        viewportHeight: number;
        viewportStableHeight: number;
      };
    };
  }
}

// Initialize Telegram WebApp immediately
if (window.Telegram?.WebApp) {
  try {
    window.Telegram.WebApp.ready();
    window.Telegram.WebApp.expand();
    window.Telegram.WebApp.setHeaderColor("#0f0f0f");
    window.Telegram.WebApp.setBackgroundColor("#0f0f0f");
  } catch (e) {
    console.warn("[Telegram] WebApp init error:", e);
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// tRPC client that reads Bearer token from localStorage on every request
const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
      headers() {
        const token = getStoredToken();
        if (token) {
          return { Authorization: `Bearer ${token}` };
        }
        return {};
      },
    }),
  ],
});

createRoot(document.getElementById("root")!).render(
  <trpc.Provider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </trpc.Provider>
);
