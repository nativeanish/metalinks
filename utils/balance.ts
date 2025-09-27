import { dryrun } from "@permaweb/aoconnect";
import { toast } from "sonner";

export async function get_ario_balance(address: string) {
  try {
    const res = await fetch(
      "https://cu.ardrive.io/dry-run?process-id=qNvAoz0TgcH7DMg8BCVn8jF32QH5L6T29VjHxhHqqGE",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Id: "1234",
          Target: "qNvAoz0TgcH7DMg8BCVn8jF32QH5L6T29VjHxhHqqGE",
          Owner: "1234",
          Anchor: "0",
          Data: "1234",
          Tags: [
            {
              name: "Action",
              value: "Balance",
            },
            {
              name: "Address",
              value: address,
            },
          ],
        }),
      }
    );
    const data = await res.json();
    if (data.Messages && data.Messages.length > 0 && data.Messages[0].Data) {
      return data.Messages[0].Data as string;
    } else {
      toast.error("Failed to fetch ARIO balance");
      throw new Error("Invalid response structure");
    }
  } catch {
    toast.error("Failed to fetch ARIO balance");
    throw new Error("Failed to fetch ARIO balance");
  }
}
export async function get_ar_balance(address: string) {
  try {
    const res = await fetch(`https://arweave.net/wallet/${address}/balance`);
    const data = await res.text();
    if (data) {
      return JSON.stringify(parseInt(data) / 1e12);
    } else {
      toast.error("Failed to fetch AR balance");
      throw new Error("Invalid response structure");
    }
  } catch {
    toast.error("Failed to fetch AR balance");
    throw new Error("Failed to fetch AR balance");
  }
}
export async function get_ao_balance(address: string) {
  try {
    const res = await dryrun({
      process: "0syT13r0s0tgPmIed95bJnuSqaD29HQNN8D3ElLSrsc",
      tags: [
        {
          name: "Action",
          value: "Balance",
        },
        { name: "Recipient", value: address },
        { name: "Target", value: address },
      ],
    });
    if (
      res &&
      res.Messages &&
      res.Messages.length > 0 &&
      res.Messages[0].Data
    ) {
      return JSON.stringify(parseInt(res.Messages[0].Data) / 1e12) as string;
    } else {
      toast.error("Failed to fetch AO balance");
      throw new Error("Invalid response structure");
    }
  } catch {
    toast.error("Failed to fetch AO balance");
    throw new Error("Failed to fetch AO balance");
  }
}
export async function get_war_balance(address: string) {
  try {
    const res = await dryrun({
      process: "xU9zFkq3X2ZQ6olwNVvr1vUWIjc3kXTWr7xKQD6dh10",
      tags: [
        {
          name: "Action",
          value: "Balance",
        },
        { name: "Recipient", value: address },
        { name: "Target", value: address },
      ],
    });
    if (
      res &&
      res.Messages &&
      res.Messages.length > 0 &&
      res.Messages[0].Data
    ) {
      return JSON.stringify(parseInt(res.Messages[0].Data) / 1e12) as string;
    } else {
      toast.error("Failed to fetch wAR balance");
      throw new Error("Invalid response structure");
    }
  } catch {
    toast.error("Failed to fetch wAR balance");
    throw new Error("Failed to fetch wAR balance");
  }
}
