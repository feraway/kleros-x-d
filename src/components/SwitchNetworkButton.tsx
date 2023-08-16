import { useSwitchNetwork, useNetwork } from "wagmi";
import Button from "@mui/material/Button";
function SwitchNetworkButton() {
  const { chain } = useNetwork();
  const { chains, isLoading, pendingChainId, switchNetwork } =
    useSwitchNetwork();

  return chains.map((x) => (
    <Button
      size="small"
      color="primary"
      variant="contained"
      disabled={!switchNetwork || x.id === chain?.id}
      key={x.id}
      onClick={() => switchNetwork?.(x.id)}
    >
      {"Switch to "}
      {x.name}
      {isLoading && pendingChainId === x.id && " (switching)"}
    </Button>
  ));
}

export default SwitchNetworkButton;
