import { useContext, useState } from "react";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import GameItemPlayer1 from "components/GameItemPlayer1";
import GameItemPlayer2 from "components/GameItemPlayer2";
import StateContext from "state/StateContext";
import Button from "@mui/material/Button";
import AddGameModal from "components/AddGameModal";
import RemoveGameButton from "components/RemoveGameButton";
import uniqBy from "lodash.uniqby";
import { GameType } from "@types";

function GameList() {
  const { games, setGames } = useContext(StateContext);
  const [addGameModal, setAddGameModal] = useState(false);

  const addGame = (game: GameType, localStorageChecked: boolean) => {
    setGames((games: GameType[]): GameType[] => {
      return uniqBy([...games, game], "address");
    });

    if (localStorageChecked) {
      const localStorageGamesRaw = localStorage.getItem("games");
      const localStorageGamesInit = localStorageGamesRaw
        ? JSON.parse(localStorageGamesRaw)
        : [];
      const localStorageGames = uniqBy(
        [...localStorageGamesInit, game],
        "address"
      );
      localStorage.setItem("games", JSON.stringify(localStorageGames));
    }
  };

  return (
    <>
      <Grid container>
        <Grid item xs={12} container alignItems="center" flexDirection="column">
          <Typography variant="h6">Games List</Typography>
          {!games.length && (
            <Typography variant="h6">No active games to show</Typography>
          )}
          <Button onClick={() => setAddGameModal(true)}>
            Add Existing Game
          </Button>
        </Grid>
        <Grid container>
          {games.map((game) => (
            <Grid
              item
              container
              xs={12}
              key={game.address}
              justifyContent="center"
              alignItems="center"
              sx={{ marginBottom: 3, paddingLeft: "40px" }}
            >
              {game.salt ? (
                <GameItemPlayer1 game={game} />
              ) : (
                <GameItemPlayer2 game={game} />
              )}
              <RemoveGameButton address={game.address} />
            </Grid>
          ))}
        </Grid>
      </Grid>
      <AddGameModal
        open={addGameModal}
        handleClose={() => setAddGameModal(false)}
        handleSubmit={addGame}
      />
    </>
  );
}

export default GameList;
