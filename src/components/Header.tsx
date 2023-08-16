import Typography from "@mui/material/Typography";
import { Link } from "react-router-dom";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import {
  useConnect,
  useAccount,
  useDisconnect,
  useNetwork,
  useSwitchNetwork,
} from "wagmi";

function Header() {
  const {
    connect,
    connectors,
    error: connectError,
    isLoading: isConnectLoading,
    pendingConnector,
  } = useConnect();
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const { chain } = useNetwork();
  const {
    chains,
    error: switchNetworkError,
    isLoading: isSwitchNetworkLoading,
    pendingChainId,
    switchNetwork,
  } = useSwitchNetwork();

  const error = connectError || switchNetworkError;
  const isLoading = isConnectLoading || isSwitchNetworkLoading;
  return (
    <Grid container sx={{ marginBottom: 3 }}>
      <Grid item container justifyContent="flex-end">
        {error && <Typography variant="subtitle2">{error.message}</Typography>}
        {connectors.map((connector) =>
          !address ? (
            <Button
              disabled={!connector.ready || !!address}
              key={connector.id}
              onClick={() => connect({ connector })}
              size="small"
            >
              {`Connect ${connector.name}`}
              {!connector.ready && " (unsupported)"}
              {isLoading &&
                connector.id === pendingConnector?.id &&
                " (connecting)"}
            </Button>
          ) : null
        )}
        {address && (
          <Grid
            container
            item
            alignItems="center"
            justifyContent="flex-end"
            xs={6}
          >
            <Typography variant="subtitle2">{address}</Typography>
            <Button
              size="small"
              onClick={() => {
                disconnect();
              }}
              color="error"
            >
              Disconnect Metamask
            </Button>
          </Grid>
        )}
        {address &&
          chain?.id !== 5 &&
          chains.map((x) => (
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
          ))}
      </Grid>
      <Grid item xs={12}>
        <Typography variant="h1" textAlign="center">
          RPSLS
        </Typography>
        <Typography textAlign="center">
          Rock Paper Scissors Lizard Spock
        </Typography>
      </Grid>
      <Grid item container xs={12} justifyContent="center">
        <Button component={Link} to="/">
          Home
        </Button>
        <Button
          component={Link}
          to="/newGame"
          sx={{ marginLeft: 3, marginRight: 3 }}
        >
          New Game
        </Button>
        <Button component={Link} to="/gameList">
          Game List
        </Button>
      </Grid>
      <Grid item xs={12}>
        <Divider />
      </Grid>
    </Grid>
  );
}

export default Header;
