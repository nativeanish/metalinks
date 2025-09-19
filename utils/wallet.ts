import { createWalletClient, custom } from "viem";
import { mainnet } from "viem/chains";
import useAddress from "../store/useAddress";
import { toast } from "sonner";
import React from "react";
// import wallet from "./arweave";
import MetaMask from "../Image/MetaMask";
import Wander from "../Image/Wander";
declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request: (...args: unknown[]) => Promise<unknown>;
      // Add other properties as needed
    };
  }
}

export const async_connect = async () => {
  try {
    if (!window.arweaveWallet) {
      toast.warning("Wander is not installed", {
        icon: React.createElement(Wander),
        description: React.createElement("div", null, [
          "Please install Wander from ",
          React.createElement(
            "a",
            {
              key: "link",
              href: "https://www.wander.app",
              target: "_blank",
              rel: "noopener noreferrer",
              className: "underline",
            },
            "here"
          ),
          ".",
        ]),
      });
      return false;
    }
    await window.arweaveWallet.connect(
      [
        "ACCESS_ADDRESS",
        "ACCESS_ALL_ADDRESSES",
        "ACCESS_ARWEAVE_CONFIG",
        "ACCESS_PUBLIC_KEY",
        "DECRYPT",
        "ENCRYPT",
        "DISPATCH",
        "SIGNATURE",
        "SIGN_TRANSACTION",
      ],
      {
        name: "MetaLink",
      }
    );
    checkConnection();
  } catch (err) {
    toast.error("ArConnect connection failed", {
      description: err instanceof Error ? err.message : String(err),
    });
  }
};

export const connect = () => {
  async_connect().then().catch(console.log);
};

export const checkConnection = async () => {
  try {
    if (!window.arweaveWallet) {
      return false;
    }
    const data = await window.arweaveWallet.getActiveAddress();
    if (data && data.length) {
      useAddress.getState().setType("arconnect");
      useAddress.setState({ address: data });
      return true;
    }
    return false;
  } catch (err) {
    console.log(err);
    return false;
  }
};

export const disconnect = async () => {
  try {
    if (window.arweaveWallet) {
      await window.arweaveWallet.disconnect();
    }
    useAddress.setState({ address: null });
    useAddress.getState().setType(null);
  } catch (err) {
    console.log(err);
  }
};

export async function connectMetaMask() {
  if (!window.ethereum) {
    toast.warning("MetaMask is not installed", {
      icon: React.createElement(MetaMask),
      description: React.createElement("div", null, [
        "Please install MetaMask from ",
        React.createElement(
          "a",
          {
            key: "link",
            href: "https://metamask.io/download.html",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "underline",
          },
          "here"
        ),
        ".",
      ]),
    });
    return;
  }

  try {
    const eth = window.ethereum;
    if (eth?.request && eth.isMetaMask) {
      // Ask user to connect accounts
      await eth.request({ method: "eth_requestAccounts" });

      // Create viem client using MetaMask as transport
      const client = createWalletClient({
        chain: mainnet,
        transport: custom(
          eth as unknown as {
            request: (...args: unknown[]) => Promise<unknown>;
          }
        ),
      });

      // Get connected account
      const [account] = await client.getAddresses();

      if (account) {
        useAddress.getState().setType("metamask");
        useAddress.setState({ address: account });
      }

      return { client, address: account };
    }
  } catch (error) {
    console.error("MetaMask connection failed:", error);
    toast.error("MetaMask connection failed");
  }
}
