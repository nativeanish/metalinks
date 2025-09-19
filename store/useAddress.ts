import { create } from "zustand";

interface State {
  address: string | null;
  setAddress: () => void;
  type: "metamask" | "arconnect" | null;
  setType: (e: "metamask" | "arconnect" | null) => void;
}

const useAddress = create<State>((set) => ({
  address: null,
  setAddress: async () => {
    try {
      if (
        window.arweaveWallet &&
        typeof window.arweaveWallet.getActiveAddress === "function"
      ) {
        const _address = await window.arweaveWallet.getActiveAddress();
        if (_address && _address.length) {
          set({ address: _address });
        } else {
          set({ address: null });
        }
      } else {
        set({ address: null });
      }
    } catch {
      set({ address: null });
      // Optionally log error
      // console.error('Failed to get active address:', error);
    }
  },
  type: null,
  setType: (e) => set({ type: e }),
}));
export default useAddress;
