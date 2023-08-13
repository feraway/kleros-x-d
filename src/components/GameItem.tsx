import { usePrepareContractWrite, useContractWrite, Address } from "wagmi";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Button from "@mui/material/Button";
import { GameType } from "@types";
import RPSLS from "abis/RPSLS";
import CircularProgress from "@mui/material/CircularProgress";

type GameItemProps = {
  game: GameType;
};

function GameItem(props: GameItemProps) {
  const { game } = props;
  const { address, salt, move } = game;
  const {
    config,
    error: contractWriteError,
    isError,
    isLoading,
    isFetching,
    refetch,
  } = usePrepareContractWrite({
    address: address as Address,
    abi: RPSLS.abi,
    functionName: "solve",
    args: [move, salt],
    staleTime: 1000,
  });

  const { write } = useContractWrite(config);
  if (isError && !isFetching) {
    setTimeout(() => refetch(), 1000);
  }
  return (
    <Card sx={{ minWidth: 275 }}>
      <CardContent>
        <Typography>{`Game Address: ${game.address}`}</Typography>
        <Typography variant="body2">{`Salt: ${game.salt}`}</Typography>
        <Typography variant="body2">{`Timeout: `}</Typography>
      </CardContent>
      <CardActions>
        <Button
          size="small"
          onClick={() => write && write()}
          disabled={isError || !write || isLoading}
        >
          {isLoading || isError || isFetching ? (
            <>
              Waiting for player 2 to play
              <CircularProgress size={15} />
            </>
          ) : (
            "Solve!"
          )}
        </Button>
      </CardActions>
    </Card>
  );
}

export default GameItem;
