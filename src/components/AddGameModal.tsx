import { useState } from "react";
import { isAddress } from "viem";
import { Address } from "wagmi";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Checkbox from "@mui/material/Checkbox";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import SelectMove from "components/SelectMove";
import { GameType } from "@types";

type AddGameModalProps = {
  open: boolean;
  handleClose: () => void;
  handleSubmit: (game: GameType, localStorageChecked: boolean) => void;
};

function AddGameModal(props: AddGameModalProps) {
  const { open, handleClose, handleSubmit } = props;
  const [move, setMove] = useState<number>();
  const [gameAddress, setGameAddress] = useState<string>("");
  const [salt, setSalt] = useState("");
  const [showFormErrors, setShowFormErrors] = useState(false);
  const [localStorageChecked, setLocalStorageChecked] = useState(true);
  const isSaltValid = salt.length === 18;
  const isFormValid = isAddress(gameAddress) && move && isSaltValid;

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Add New Game</DialogTitle>
      <DialogContent>
        <Grid container>
          <Grid item xs={12} sx={{ marginTop: 3 }}>
            <TextField
              fullWidth
              label="Game Contract Address"
              value={gameAddress}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                setGameAddress(event.target.value);
              }}
              error={showFormErrors && !isAddress(gameAddress)}
              helperText={
                showFormErrors &&
                !isAddress(gameAddress) &&
                "Game address is invalid"
              }
            />
          </Grid>
          <Grid item xs={12} sx={{ marginTop: 3 }}>
            <TextField
              fullWidth
              label="Salt"
              value={salt}
              type="number"
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                setSalt(event.target.value);
              }}
              error={showFormErrors && !isSaltValid}
              helperText={
                showFormErrors && !isSaltValid && "Salt must be 18 digits long"
              }
            />
          </Grid>
          <Grid item xs={12} container sx={{ marginTop: 3 }}>
            <Grid item xs={12}>
              <SelectMove setMove={setMove} move={move} />
            </Grid>

            {showFormErrors && !move && (
              <Grid item xs={12}>
                <Typography textAlign="center" variant="body2" color="red">
                  Please select a move
                </Typography>
              </Grid>
            )}
          </Grid>
          <Grid
            item
            xs={12}
            container
            flexDirection="column"
            alignItems="center"
            sx={{ marginTop: 3 }}
          >
            <Typography textAlign="center">
              Save game info in localstorage?
            </Typography>
            <Checkbox
              checked={localStorageChecked}
              onClick={() => {
                setLocalStorageChecked(!localStorageChecked);
              }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={() => {
            if (isFormValid) {
              handleSubmit(
                { address: gameAddress as Address, salt, move },
                localStorageChecked
              );
            } else {
              setShowFormErrors(true);
            }
          }}
        >
          Add Game
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AddGameModal;
