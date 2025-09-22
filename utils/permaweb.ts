import Arweave from "arweave";
import { connect, createDataItemSigner } from "@permaweb/aoconnect";
import Permaweb from "@permaweb/libs";
const permaweb = Permaweb.init({
  ao: connect({ MODE: "legacy" }),
  arweave: Arweave.init({
    host: "arweave.net",
    port: 443,
    protocol: "https",
  }),
  signer: createDataItemSigner(window.arweaveWallet),
});
export default permaweb;
