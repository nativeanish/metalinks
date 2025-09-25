import { useEffect, useState } from "react";
import { type BlockData } from "../../../store/useBlock";
import node from "../../../utils/node";
import BlockForSU from "./Block/BlockForSU";
import BlockForMU from "./Block/BlockForMU";
import BlockForText from "./Block/BlockForText";
import BlockForFile from "./Block/BlockForFile";
import BlockForImage from "./Block/BlockForImage";
import BlockForMap from "./Block/BlockForMap";
import BlockForCalendar from "./Block/BlockForCalendar";
import BlockForNewsLetter from "./Block/BlockForNewsLetter";
import BlockForBazarProfile from "./Block/BlockForBazarProfile";
import BlockForBazarCollection from "./Block/BlockForBazarCollection";
function Block({ data }: { data: BlockData }) {
  const [type, setType] = useState<
    (typeof node.nav)[0]["name"] | null | undefined
  >(null);
  useEffect(() => {
    const alt = data?.alt?.trim().toLowerCase();
    if (!alt) {
      setType(undefined);
      return;
    }
    const match = node.nav.find(
      (n) =>
        Array.isArray(n.node) &&
        n.node.some((item) => item?.alt?.trim().toLowerCase() === alt)
    );
    setType(match?.name);
  }, [data.alt]);
  if (type === "Social" || type === "Community") {
    return <BlockForSU data={data} />;
  }
  if (type === "Post" || type === "Video" || type === "Publishing") {
    return <BlockForMU data={data} />;
  }
  if (type === "Text") {
    return <BlockForText data={data} />;
  }
  if (type === "File") {
    return <BlockForFile data={data} />;
  }
  if (type === "General") {
    if (data.alt === "Image-Card") {
      return <BlockForImage data={data} />;
    } else if (data.alt === "Maps-Card") {
      return <BlockForMap data={data} />;
    } else if (data.alt === "Calendar-Card") {
      return <BlockForCalendar data={data} />;
    } else if (data.alt === "NewsLetter-Card") {
      return <BlockForNewsLetter data={data} />;
    } else {
      return <BlockForSU data={data} />;
    }
  }
  if (type === "NFT") {
    if (data.alt === "Bazar-Profile") {
      return <BlockForBazarProfile data={data} />;
    }
    if (data.alt === "Bazar-Collection") {
      return <BlockForBazarCollection data={data} />;
    }
  }
}

export default Block;
