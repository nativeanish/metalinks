import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import BlockDialog from "./BlockDialog";

export default function AddBlock() {
  return (
    <div className="mt-8 flex max-w-2xl ">
      <Dialog>
        <DialogTrigger asChild className="w-full mx-auto px-1">
          <Button size="lg" className="w-full mx-auto">
            <Plus className="mr-2 h-5 w-5" />
            Add Block
          </Button>
        </DialogTrigger>
        <BlockDialog />
      </Dialog>
    </div>
  );
}
