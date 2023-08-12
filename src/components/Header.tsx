import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import { useConnect, useAccount, useDisconnect } from "wagmi";

function Header() {
  const { connect, connectors, error, isLoading, pendingConnector } =
    useConnect();
  const { address } = useAccount();
  const { disconnect } = useDisconnect();

  return (
    <Grid container>
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
            <>
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
            </>
          )}
        </>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="h1" textAlign="center">
          RPSLS
        </Typography>
      </Grid>
    </Grid>
  );
}

export default Header;
