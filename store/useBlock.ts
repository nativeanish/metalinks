import { create } from "zustand";
import node from "../utils/node";
type initName = (typeof node.nav)[0]["node"][0]["alt"];
import { uuidv7 } from "uuidv7";
export interface BlockData {
  initName: initName;
  id: string;
  name: string;
  alt: string;
  icon: React.FC<React.SVGProps<SVGElement>>;
  description: string;
  url?: string;
  urls?: string[];
  title?: string;
  customDescription?: string;
  isEnabled: boolean;
  // Rich text block specific (optional)
  textContent?: string; // raw text or HTML (currently plain text)
  textSize?: "sm" | "base" | "lg" | "xl" | "2xl";
  textFont?: "sans" | "serif" | "mono";
  textAlign?: "left" | "center" | "right";
  textColor?: string; // hex color
}
interface State {
  blocks: Array<BlockData>;
  setBlocks: (block: initName) => void;
  removeBlock: (id: string) => void;
  updateBlocks: (data: Partial<BlockData> & { id: string }) => void;
  clearBlocks: () => void;
}

const useBlock = create<State>((set) => ({
  blocks: [],
  setBlocks: (block) => {
    const _node = node.nav.find((e) => e.node.some((n) => n.alt === block));
    const foundNode = _node?.node.find((n) => n.alt === block);
    set((state) => ({
      ...state,
      blocks: [
        ...state.blocks,
        {
          initName: block,
          id: uuidv7(),
          name: foundNode?.name ? foundNode.name : String(block),
          alt: foundNode?.alt ? foundNode.alt : String(block),
          icon:
            (foundNode?.icon as React.FC<React.SVGProps<SVGElement>>) ||
            (() => null),
          title: foundNode?.name ? foundNode.name : String(block),
          description: "",
          urls: [],
          isEnabled: true,
        },
      ],
    }));
  },
  removeBlock: (id) =>
    set((state) => ({
      ...state,
      blocks: state.blocks.filter((block) => block.id !== id),
    })),
  updateBlocks: (data) =>
    set((state) => ({
      ...state,
      blocks: state.blocks.map((block) =>
        block.id === data.id ? { ...block, ...data } : block
      ),
    })),
  clearBlocks: () => set({ blocks: [] }),
}));

export default useBlock;
