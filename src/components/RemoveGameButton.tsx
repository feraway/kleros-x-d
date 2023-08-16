import { useContext, useState } from "react";
import { Address } from "wagmi";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import TrashCanIcon from "components/icons/TrashCanIcon";
import StateContext from "state/StateContext";
import { GameType } from "@types";

type ConfirmDeleteModalProps = {
  onConfirm: () => void;
  setOpen: (open: boolean) => void;
  open: boolean;
};

function ConfirmDeleteModal(props: ConfirmDeleteModalProps) {
  const { setOpen, open, onConfirm } = props;

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle id="alert-dialog-title">Delete game?</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          The game will be deleted from the list and localstorage, this action
          can't be reverted. Make sure to save the game information somwhere
          safe if it's not yet over.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={() => onConfirm()}
          autoFocus
          variant="contained"
          color="error"
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}

type RemoveGameFromLocalStorageButtonProps = {
  address: Address;
};

function RemoveGameFromLocalStorageButton(
  props: RemoveGameFromLocalStorageButtonProps
) {
  const { address } = props;
  const { setGames } = useContext(StateContext);
  const [open, setOpen] = useState(false);

  const onConfirm = () => {
    setGames((games) => games.filter((game) => game.address !== address));
    const localStorageGamesRaw = localStorage.getItem("games");
    const localStorageGamesInit = localStorageGamesRaw
      ? JSON.parse(localStorageGamesRaw)
      : [];
    const localStorageGames = localStorageGamesInit.filter(
      (game: GameType) => game.address !== address
    );
    localStorage.setItem("games", JSON.stringify(localStorageGames));
  };

  return (
    <>
      <IconButton
        onClick={() => {
          setOpen(true);
        }}
      >
        <TrashCanIcon />
      </IconButton>
      <ConfirmDeleteModal open={open} setOpen={setOpen} onConfirm={onConfirm} />
    </>
  );
}

export default RemoveGameFromLocalStorageButton;
