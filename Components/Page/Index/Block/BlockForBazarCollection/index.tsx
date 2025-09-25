import { useQuery } from "@tanstack/react-query";
import useAddress from "../../../../../store/useAddress";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getCollectionwithAssets, getFullCollections } from "./utils";

export default function BlockForBazarCollection() {
  const address = useAddress((state) => state.address);
  const [_address, setAddress] = useState("");
  const [collectionId, setCollectionId] = useState("");
  useEffect(() => {
    if (address) {
      run();
    }
    async function run() {
      try {
        const __address = await window.arweaveWallet.getActiveAddress();
        if (__address) {
          setAddress(__address);
          return;
        } else {
          toast.error("Failed to get an Active Address");
        }
        toast.error("Failed to get Active Address");
      } catch {
        toast.error("Failed to get Active Address");
      }
    }
  }, [address, _address]);
  const getMultipleCollectionQuery = useQuery({
    queryKey: ["bazar-collection", address],
    queryFn: () => getFullCollections(),
    enabled:
      !!address &&
      address.trim() !== "" &&
      !!_address &&
      _address.trim() !== "" &&
      _address == address,
    retry: 1,
  });

  const getSingleCollectionQuery = useQuery({
    queryKey: ["bazar-collection-single", collectionId],
    queryFn: () => getCollectionwithAssets(collectionId),
    enabled: !!collectionId && collectionId.trim() !== "",
    retry: 1,
  });

  return (
    <div>
      {collectionId && collectionId.trim() !== "" && collectionId.length > 0 ? (
        <></>
      ) : (
        <></>
      )}
    </div>
  );
}
