import { useConnect, useAccount } from "wagmi";
import Button from "@mui/material/Button";

function ConnectWalletButton() {
  const { connect, connectors, pendingConnector, isLoading } = useConnect();
  const { address } = useAccount();
  return connectors.map((connector) => (
    <Button
      disabled={!connector.ready || !!address}
      key={connector.id}
      onClick={() => connect({ connector })}
      size="small"
    >
      {`Connect ${connector.name}`}
      {!connector.ready && " (unsupported)"}
      {isLoading && connector.id === pendingConnector?.id && " (connecting)"}
    </Button>
  ));
}

export default ConnectWalletButton;
