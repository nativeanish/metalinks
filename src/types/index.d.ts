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
