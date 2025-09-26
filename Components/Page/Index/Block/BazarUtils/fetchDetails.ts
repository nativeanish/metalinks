import { Token } from "../../../../../utils/token";
import permaweb from "../../../../../utils/permaweb";
import { toast } from "sonner";

interface TransactionNode {
  id: string;
  tags: {
    name: string;
    value: string;
  }[];
}

async function getContentTypes(
  ids: string[]
): Promise<{ id: string; contentType: string | null }[]> {
  const chunkSize = 100;
  const results: { id: string; contentType: string | null }[] = [];

  for (let i = 0; i < ids.length; i += chunkSize) {
    const chunk = ids.slice(i, i + chunkSize);

    const query = `
    query($ids: [ID!]!) {
      transactions(ids: $ids, first: 100) {
        edges {
          node {
            id
            tags {
              name
              value
            }
          }
        }
      }
    }`;

    const response = await fetch("https://arweave.net/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables: { ids: chunk } }),
    });

    const data = await response.json();

    results.push(
      ...data.data.transactions.edges.map(
        ({ node }: { node: TransactionNode }) => ({
          id: node.id,
          contentType:
            node.tags.find((t) => t.name === "Content-Type")?.value || null,
        })
      )
    );
  }

  return results;
}

export async function fetchProfilewithAssets(profileId: string) {
  try {
    const data = await permaweb.getProfileByWalletAddress(profileId);
    const finalArray: Array<{
      type: "image" | "video" | "unknown" | "token";
      id: string;
      logoImage: string;
      quantity: string;
    }> = [];
    if (data.assets.length > 0) {
      const filteredAssets = data.assets.filter(
        (asset: { id: string; quantity: string }) => {
          return Token.some((token) => token.address === asset.id);
        }
      );
      filteredAssets.forEach((asset: { id: string; quantity: string }) => {
        finalArray.push({
          type: "token",
          id: asset.id,
          logoImage: Token.find((t) => t.address === asset.id)?.logo || "",
          quantity: asset.quantity,
        });
      });
      const remainingAssets = data.assets.filter(
        (asset: { id: string; quantity: string }) =>
          !Token.some((token) => token.address === asset.id)
      );
      if (remainingAssets.length > 0) {
        const contentTypes = await getContentTypes(
          remainingAssets.map((a: { id: string }) => a.id)
        );
        remainingAssets.forEach((asset: { id: string; quantity: string }) => {
          const contentTypeEntry = contentTypes.find(
            (ct) => ct.id === asset.id
          );
          const contentType = contentTypeEntry
            ? contentTypeEntry.contentType
            : null;
          finalArray.push({
            type:
              contentType && contentType.startsWith("video/")
                ? "video"
                : contentType && contentType.startsWith("image/")
                  ? "image"
                  : "unknown",
            id: asset.id,
            logoImage: "",
            quantity: asset.quantity,
          });
        });
      }
    }
    data.assets = finalArray;
    return data;
  } catch {
    toast.error("Failed to fetch profile");
    throw new Error("Failed to fetch profile");
  }
}
