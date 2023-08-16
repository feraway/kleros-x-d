import { Link } from "react-router-dom";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Button from "@mui/material/Button";
import { useConnect, useAccount, useNetwork, useSwitchNetwork } from "wagmi";

function GameIntro() {
  const {
    connect,
    connectors,
    isLoading: isLoadingConnect,
    pendingConnector,
  } = useConnect();
  const { chain } = useNetwork();
  const { address } = useAccount();
  const {
    chains,
    isLoading: isSwitchNetworkLoading,
    pendingChainId,
    switchNetwork,
  } = useSwitchNetwork();

  const isLoading = isLoadingConnect || isSwitchNetworkLoading;

  return (
    <Grid container item xs={10} spacing={1}>
      <Grid container alignItems="center" flexDirection="column" item xs={12}>
        <Typography variant="h6">
          This is a Rock Paper Scissors game with extra weapons: Lizard and
          Spock.
        </Typography>
        <Typography variant="h6" sx={{ textDecoration: "underline" }}>
          Rules:
        </Typography>
        <List>
          <ListItem>
            <Typography>- Rock beats Paper and Lizard</Typography>
          </ListItem>
          <ListItem>
            <Typography>- Paper beats Rock and Spock</Typography>
          </ListItem>
          <ListItem>
            <Typography>- Scissors beat Paper and Lizard</Typography>
          </ListItem>
          <ListItem>
            <Typography>- Lizard beats Paper and Spock</Typography>
          </ListItem>
          <ListItem>
            <Typography>- Spock beats Scissors and Rock</Typography>
          </ListItem>
        </List>
        <Typography variant="h6" textAlign="center" sx={{marginTop: 1, marginBottom: 1}}>
          The game is played over the decentralized test Ethereum network
          GoEarli. It requires two players with Metamask wallets and some
          GoearliETH.
        </Typography>
        <Typography variant="h6" sx={{ textDecoration: "underline" }}>
          How to Play:
        </Typography>
        <List>
          <ListItem>
            <Typography>
              - Player one creates the game by choosing their move, setting a
              bet and specifying their oponent's address. They will receive a
              numeric code called "salt" which is needed to then solve the game
              (don't worry, you can store it in the localStorage of your
              browser)
            </Typography>
          </ListItem>
          <ListItem>
            <Typography>
              - Player 1 sends the link to the game to Player 2
            </Typography>
          </ListItem>
          <ListItem>
            <Typography>
              - Player 2 selects their move and commits it
            </Typography>
          </ListItem>
          <ListItem>
            <Typography>
              - Player 1 solves the game from the Game List page
            </Typography>
          </ListItem>
          <ListItem>
            <Typography>
              - The funds go to the wallet of the winner or are divided in case
              of a tie
            </Typography>
          </ListItem>
        </List>
        <Typography variant="h6" sx={{ textDecoration: "underline" }}>
          Take into account:
        </Typography>
        <List>
          <ListItem>
            <Typography>
              - If Player 2 takes more than 5 minutes to make their move, Player
              1 can call Timeout from the Game List page and receive their bet
              back.
            </Typography>
          </ListItem>
          <ListItem>
            <Typography>
              - If Player 1 takes more than 5 minutes to solve the Game after
              Player 2 commits their move, Player 2 can call Timeout from the
              Game List Page and receive the whole bet.
            </Typography>
          </ListItem>
          <ListItem>
            <Typography>
              - If the information for a game is lost in the browser (for
              example, by clearing the browser history and cache), players can
              add their game in the Game List page by providing the game
              information.
            </Typography>
          </ListItem>
        </List>
        <Typography variant="h6">Have Fun!</Typography>
      </Grid>
      <Grid container justifyContent="center" item xs={12}>
        {!address && (
          <Typography>To start, please connect your Metamask Wallet</Typography>
        )}
      </Grid>
      <Grid container justifyContent="center" item xs={12}>
        {!address &&
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
          ))}
      </Grid>
      <Grid container justifyContent="center" item xs={12}>
        {address && chain?.id !== 5 && (
          <Typography>Please Switch Network to Goerli</Typography>
        )}
      </Grid>
      <Grid container justifyContent="center" item xs={12}>
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
      <Grid container justifyContent="center" item xs={12}>
        {address && chain?.id === 5 && (
          <Button component={Link} to="newGame" variant="contained">
            Create a new game
          </Button>
        )}
      </Grid>
    </Grid>
  );
}

export default GameIntro;
