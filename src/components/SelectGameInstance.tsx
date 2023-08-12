import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import StateContext from "state/StateContext";
import { isAddress } from "viem";

function SelectGameInstance() {
  const { setGameAddress } = useContext(StateContext);
  const [joinGameAddress, setJoinGameAddress] = useState<string>("");

  return (
    <Grid container spacing={3} sx={{ marginTop: 1 }} xs={12}>
      <Grid item container flexDirection="column">
        <Typography textAlign="center">Want to play with someone?</Typography>
        <Button component={Link} to="newGame">
          Create a new game
        </Button>
      </Grid>
      <Grid item xs={12}>
        <Typography textAlign="center">
          Has someone already sent you a game address?
        </Typography>
      </Grid>
      <Grid item xs={12} container justifyContent="center">
        <Grid item xs={9}>
          <TextField
            value={joinGameAddress}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setJoinGameAddress(event.target.value);
            }}
            placeholder="Enter Game Address"
            fullWidth
          />
        </Grid>
      </Grid>
      <Grid item xs={12} container justifyContent="center">
        <Button
          onClick={() => {
            setGameAddress(joinGameAddress);
          }}
          disabled={!isAddress(joinGameAddress)}
        >
          Join Game!
        </Button>
      </Grid>
    </Grid>
  );
}

export default SelectGameInstance;
