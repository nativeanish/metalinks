import useBlock from "../../../store/useBlock";

import { Button } from "../../../src/components/ui/button";
import { Edit3, Save } from "lucide-react";
import Block from "./Block";
function BlockHis() {
  const blocks = useBlock((state) => state.blocks);

  if (blocks.length === 0) {
    return (
      <div className="mt-8 text-center max-w-2xl py-12">
        <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
          <Edit3 className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          No blocks added yet
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          Start building your profile by adding blocks above. Each block
          represents a different way to showcase your content.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Your Blocks</h2>
        <div className="text-sm text-muted-foreground">
          {blocks.length} block{blocks.length !== 1 ? "s" : ""} added
        </div>
      </div>

      <div className="space-y-4">
        {blocks.map((block) => (
          <Block key={block.id} data={block} />
        ))}
      </div>

      {/* Summary footer */}
      <div className="mt-8 p-4 bg-muted/30 rounded-lg">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground">
              Total blocks:{" "}
              <span className="font-medium text-foreground">
                {blocks.length}
              </span>
            </span>
            <span className="text-muted-foreground">
              Active:{" "}
              <span className="font-medium text-green-600">
                {Object.values(blocks).filter((b) => b.isEnabled).length}
              </span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" className="bg-primary hover:bg-primary/90">
              <Save className="h-4 w-4 mr-2" />
              Publish
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BlockHis;
