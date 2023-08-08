import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import { useConnect, useAccount } from "wagmi";
import SelectGameInstance from "components/SelectGameInstance";

function GameIntro() {
  const { connect, connectors, isLoading, pendingConnector } = useConnect();
  const { address } = useAccount();

  return (
    <Grid container flexDirection="column" justifyContent="center">
      <Typography>
        This is a Rock Paper Scissors game with extra weapons: Lizard and Spock.
        The game is played over the decentralized test Ethereum network GoEarli.
        It requires two players and some GoearliETH. To start, please connect
        your Metamask Wallet
      </Typography>
      {!address ? (
        connectors.map((connector) => (
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
        ))
      ) : (
        <SelectGameInstance />
      )}
    </Grid>
  );
}

export default GameIntro;
