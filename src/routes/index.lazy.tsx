import { createLazyFileRoute } from "@tanstack/react-router";
import BasicCard from "../../Components/Page/Index/BasicCard";
import AddBlock from "../../Components/Page/Index/AddBlock";
import BlockHis from "../../Components/Page/Index/BlockHis";

export const Route = createLazyFileRoute("/")({
  component: IndexRouteContent,
});

function IndexRouteContent() {
  return (
    <div className="w-full lg:w-[70%] lg:mr-[30%] overflow-y-auto min-h-screen p-4">
      <BasicCard />
      <AddBlock />
      <BlockHis />
    </div>
  );
}
