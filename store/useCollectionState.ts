import { create } from "zustand";
interface State {
  state: null | [];
  setCollectionState: (e: []) => void;
  clearState: () => void;
}
const useCollectionState = create<State>((set) => ({
  state: null,
  setCollectionState(e) {
    set({ state: e });
  },
  clearState() {
    set({ state: null });
  },
}));

export default useCollectionState;
