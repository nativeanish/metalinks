import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../src/components/ui/dialog";
import { Button } from "../../src/components/ui/button";
import { Card, CardContent } from "../../src/components/ui/card";
import { Wallet } from "lucide-react";
import { connect, connectMetaMask } from "../../utils/wallet";
import useAddress from "../../store/useAddress";
import MetaMask from "../../Image/MetaMask";
import Wander from "../../Image/Wander";

interface WalletConnectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  showCloseButton?: boolean;
}

export function WalletConnectionModal({
  open,
  onOpenChange,
  showCloseButton = false,
}: WalletConnectionModalProps) {
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const address = useAddress((state) => state.address);
  const walletType = useAddress((state) => state.type);

  // Close modal if connection is successful
  useEffect(() => {
    if (address && walletType) {
      onOpenChange(false);
    }
  }, [address, walletType, onOpenChange]);

  const handleArConnectConnection = async () => {
    setIsConnecting("arconnect");
    try {
      await connect();
    } catch (error) {
      console.error("ArConnect connection failed:", error);
    } finally {
      setIsConnecting(null);
    }
  };

  const handleMetaMaskConnection = async () => {
    setIsConnecting("metamask");
    try {
      await connectMetaMask();
    } catch (error) {
      console.error("MetaMask connection failed:", error);
    } finally {
      setIsConnecting(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" showCloseButton={showCloseButton}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Connect Your Wallet
          </DialogTitle>
          <DialogDescription>
            Choose a wallet to connect and start using MetaLinks
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* ArConnect Option */}
          <Card className="cursor-pointer" onClick={handleArConnectConnection}>
            <CardContent className="">
              <Button
                variant="ghost"
                className="w-full h-auto p-0 justify-start"
                disabled={isConnecting === "arconnect"}
              >
                <div className="flex items-center gap-4 w-full">
                  <div className="p-2 rounded-lg ">
                    <Wander width={258} height={120} />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-semibold">ArConnect</h3>
                    <p className="text-sm text-muted-foreground">
                      Connect with ArConnect wallet for Arweave
                    </p>
                  </div>
                  {isConnecting === "arconnect" && (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
                  )}
                </div>
              </Button>
            </CardContent>
          </Card>

          {/* MetaMask Option */}
          <Card
            className="cursor-pointer hover:bg-accent/50 transition-colors"
            onClick={handleMetaMaskConnection}
          >
            <CardContent className="">
              <Button
                variant="ghost"
                className="w-full h-auto p-0 justify-start"
                disabled={isConnecting === "metamask"}
              >
                <div className="flex items-center gap-4 w-full">
                  <div className="p-2 rounded-lg ">
                    <MetaMask />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-semibold">MetaMask</h3>
                    <p className="text-sm text-muted-foreground">
                      Connect with MetaMask for Ethereum
                    </p>
                  </div>
                  {isConnecting === "metamask" && (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
                  )}
                </div>
              </Button>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
