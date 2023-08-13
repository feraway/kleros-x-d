import { useContext, useState } from "react";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import GameItem from "components/GameItem";
import StateContext from "state/StateContext";
import Button from "@mui/material/Button";
import AddGameModal from "components/AddGameModal";
import { GameType } from "@types";

function GameList() {
  const { games, setGames } = useContext(StateContext);
  const [addGameModal, setAddGameModal] = useState(false);

  const addGame = (game: GameType, localStorageChecked: boolean) => {
    setGames((games: GameType[]): GameType[] => {
      return [...games, game];
    });

    if (localStorageChecked) {
      const localStorageGamesRaw = localStorage.getItem("games");
      const localStorageGamesInit = localStorageGamesRaw
        ? JSON.parse(localStorageGamesRaw)
        : [];
      const localStorageGames = [...localStorageGamesInit, game];
      localStorage.setItem("games", JSON.stringify(localStorageGames));
    }
  };
  return (
    <Grid container>
      <Grid item xs={12}>
        <Typography variant="h6">Games List</Typography>
        <Button onClick={() => setAddGameModal(true)}>Add Game</Button>
      </Grid>
      <Grid container>
        {games.map((game) => (
          <Grid item container xs={12}>
            <GameItem game={game} key={game.address} />
          </Grid>
        ))}
      </Grid>
      <AddGameModal
        open={addGameModal}
        handleClose={() => setAddGameModal(false)}
        handleSubmit={addGame}
      />
    </Grid>
  );
}

export default GameList;
