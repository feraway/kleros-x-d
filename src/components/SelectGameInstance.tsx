import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";

function SelectGameInstance() {
  return (
    <Grid
      container
      flexDirection="column"
      alignItems="center"
      spacing={3}
      sx={{ marginTop: 1 }}
    >
      <Grid item container flexDirection="column">
        <Typography textAlign="center">Want to play with someone?</Typography>
        <Button>Create a new game</Button>
      </Grid>
      <Grid item>
        <Typography>Has someone already sent you a game address?</Typography>
      </Grid>
      <Grid item xs={12}>
        <TextField placeholder="Enter Address" fullWidth />
      </Grid>
      <Grid item>
        <Button>Join Game!</Button>
      </Grid>
    </Grid>
  );
}

export default SelectGameInstance;
