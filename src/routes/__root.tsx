import { createRootRoute, Outlet } from "@tanstack/react-router";

// import MobileView from "../../Components/MobileView";
import { ThemeProvider } from "../theme-provider";
// Sidebar removed; layout simplified (AppSidebar + providers removed)
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { NavBar } from "../../Components/UI/NavBar";
import { WalletConnectionModal } from "./../../Components/UI/WalletConnectModal";
import { checkConnection } from "../../utils/wallet";
import useAddress from "../../store/useAddress";
import { useEffect, useState } from "react";
import { Toaster } from "../components/ui/sonner";

export const Route = createRootRoute({
  component: () => {
    return <App />;
  },
});

function App() {
  const [showWalletModal, setShowWalletModal] = useState(false);
  const address = useAddress((state) => state.address);
  const setAddress = useAddress((state) => state.setAddress);

  useEffect(() => {
    const initializeWalletConnection = async () => {
      try {
        // Check if there's an existing connection
        const isConnected = await checkConnection();

        if (!isConnected) {
          // Small delay to ensure the page has loaded
          setTimeout(() => {
            setShowWalletModal(true);
          }, 500);
        } else {
          // Update the address state if connected
          await setAddress();
        }
      } catch (error) {
        console.error("Failed to check wallet connection:", error);
        // Show modal on error as well
        setTimeout(() => {
          setShowWalletModal(true);
        }, 1000);
      }
    };

    initializeWalletConnection();
  }, [setAddress]);

  // Close modal if wallet gets connected
  useEffect(() => {
    if (address) {
      setShowWalletModal(false);
    }
  }, [address]);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="flex flex-col min-h-screen">
        <Toaster position="top-center" richColors />
        <div className="relative w-full">
          <NavBar />
        </div>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0 mt-16">
          <div className="w-full min-h-screen flex flex-col lg:flex-row relative">
            <Outlet />
            {/* <MobileView /> */}
          </div>
        </div>
      </div>

      <WalletConnectionModal
        open={showWalletModal}
        onOpenChange={setShowWalletModal}
      />

      <TanStackRouterDevtools />
    </ThemeProvider>
  );
}
