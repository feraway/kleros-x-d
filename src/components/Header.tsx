import Typography from "@mui/material/Typography";
import { Link } from "react-router-dom";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import { useConnect, useAccount, useDisconnect } from "wagmi";

function Header() {
  const { connect, connectors, error, isLoading, pendingConnector } =
    useConnect();
  const { address } = useAccount();
  const { disconnect } = useDisconnect();

  return (
    <Grid container sx={{ marginBottom: 3 }}>
      <Grid item container justifyContent="flex-end">
        <>
          {error && (
            <Typography variant="subtitle2">{error.message}</Typography>
          )}
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
            <Grid container alignItems="center" justifyContent="flex-end">
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
        </>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="h1" textAlign="center">
          RPSLS
        </Typography>
      </Grid>
      <Grid item container xs={12} justifyContent="center">
        <Button component={Link} to="/newGame">
          New Game
        </Button>
        <Button component={Link} to="/gameList" sx={{ marginLeft: 3 }}>
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
