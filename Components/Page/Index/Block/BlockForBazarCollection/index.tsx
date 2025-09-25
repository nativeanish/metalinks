import { useQuery } from "@tanstack/react-query";
import useAddress from "../../../../../store/useAddress";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getCollectionwithAssets, getFullCollections } from "./utils";
import { CollectionModal } from "./CollectionModal";
import useBlock, { type BlockData } from "../../../../../store/useBlock";

interface BlockForBazarCollectionProps {
  data: BlockData;
}

export default function BlockForBazarCollection({
  data,
}: BlockForBazarCollectionProps) {
  const address = useAddress((state) => state.address);
  const updateBlockData = useBlock((s) => s.updateBlocks);
  const removeBlock = useBlock((s) => s.removeBlock);
  const [_address, setAddress] = useState("");
  const [collectionId, setCollectionId] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    setShowModal(true);
  }, []);

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
      _address == address &&
      showModal,
    retry: 1,
  });

  const getSingleCollectionQuery = useQuery({
    queryKey: ["bazar-collection-single", collectionId],
    queryFn: () =>
      getCollectionwithAssets(
        getMultipleCollectionQuery.data || [],
        collectionId
      ),
    enabled: !!collectionId && collectionId.trim() !== "",
    retry: 1,
  });

  const handleSelectCollection = (selectedCollectionId: string) => {
    console.log("Selected Collection ID:", selectedCollectionId);
    setCollectionId(selectedCollectionId);
    updateBlockData({
      id: data.id,
      url: `https://bazar.arweave.dev/#/collection/${selectedCollectionId}`,
      urls: [selectedCollectionId],
    });
  };

  const handleModalClose = (open: boolean) => {
    setShowModal(open);
    if (!open && !collectionId) {
      removeBlock(data.id);
    }
  };

  return (
    <>
      <CollectionModal
        open={showModal}
        onOpenChange={handleModalClose}
        collections={getMultipleCollectionQuery.data}
        isLoading={getMultipleCollectionQuery.isLoading}
        isError={getMultipleCollectionQuery.isError}
        error={getMultipleCollectionQuery.error}
        onSelectCollection={handleSelectCollection}
      />
      {collectionId && collectionId.trim() !== "" && <></>}
    </>
  );
}
