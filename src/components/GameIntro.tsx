import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";

function GameIntro() {
  return (
    <Grid container flexDirection="column" justifyContent="center">
      <Typography>
        This is a Rock Paper Scissors game with extra weapons: Lizard and Spock.
        The game is played over the decentralized test Ethereum network GoEarli.
        It requires two players and some GoearliETH. To start, please connect
        your Metamask Wallet
      </Typography>
      <Button>Conenct Metamask</Button>
    </Grid>
  );
}

export default GameIntro;
