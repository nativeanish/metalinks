import React, { useEffect } from "react";
import { toast } from "sonner";
import useAddress from "../../../../store/useAddress";
import permaweb from "../../../../utils/permaweb";
import { useQuery } from "@tanstack/react-query";
function BlockForBazarProfile() {
  const address = useAddress((state) => state.address);
  const [_address, setAddress] = React.useState("");
  const { data } = useQuery({
    queryKey: ["bazar-profile", address],
    queryFn: () => permaweb.getProfileByWalletAddress(address as string),
    enabled: !!address && address.trim() !== "",
  });
  useEffect(() => {
    console.log("data", data);
  }, [data]);
  useEffect(() => {
    if (!address) {
      toast.error("No address found for Bazar profile.", {
        description: React.createElement(
          "div",
          null,
          "Please Connect your wallet to load the Bazar profile."
        ),
      });
    } else {
      async function fetchAndSetAddress() {
        try {
          if (
            window.arweaveWallet &&
            typeof window.arweaveWallet.getActiveAddress === "function"
          ) {
            const activeAddress = await window.arweaveWallet.getActiveAddress();
            setAddress(activeAddress);
          } else {
            toast.error("Arweave wallet extension is not available.");
          }
        } catch (err) {
          toast.error("Failed to get Arweave address.", {
            description: err instanceof Error ? err.message : String(err),
          });
        }
      }
      fetchAndSetAddress();
    }
  }, [address]);
  return <div className="text-white">BlockForBazarProfile{_address}</div>;
}

export default BlockForBazarProfile;
