interface BazarAsset {
  type: "image" | "video" | "unknown" | "token";
  id: string;
  logoImage: string;
  quantity: string;
}

interface BazarProfile {
  id: string;
  owner: string;
  assets: BazarAsset[];
  version: string;
  description?: string;
  banner?: string;
  username?: string;
  displayName?: string;
  collections: string[];
  thumbnail?: string;
}

export type CollectionType = {
  id: string;
  title: string;
  description: string | null;
  creator: string;
  dateCreated: string;
  banner: string | null;
  thumbnail: string | null;
};
export type CollectionDetailType = CollectionType & {
  assets: BazarAsset[];
};
