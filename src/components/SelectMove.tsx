import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import { MOVES } from "utils/constants";

type SelectMoveProps = {
  setMove: (move: number) => void;
  move?: number;
};

function SelectMove(props: SelectMoveProps) {
  const { setMove, move } = props;
  return (
    <Grid item container xs={12} justifyContent="space-evenly">
      {MOVES.map(({ id, name }) => (
        <Button
          key={id}
          onClick={() => setMove(id)}
          color={move === id ? "success" : "primary"}
          variant="contained"
        >
          {name}
        </Button>
      ))}
    </Grid>
  );
}

export default SelectMove;
