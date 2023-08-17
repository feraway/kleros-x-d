import { useState, useEffect } from "react";
import {
  usePrepareContractWrite,
  useContractWrite,
  Address,
  useContractRead,
} from "wagmi";
import { formatUnits } from "viem";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Button from "@mui/material/Button";
import { GameType } from "@types";
import RPSLS from "abis/RPSLS";
import CircularProgress from "@mui/material/CircularProgress";
import getTimeout from "utils/getTimeout";
import CopyIcon from "./icons/CopyIcon";
import { MOVES } from "utils/constants";

function checkResult(player: number, oponent: number) {
  if (player % 2 === oponent % 2) return player < oponent;
  else return player > oponent;
}

type GameItemPlayer1Props = {
  game: GameType;
};

const counterTime = 30;

function GameItemPlayer1(props: GameItemPlayer1Props) {
  const { game } = props;
  const { address, salt, move = 0 } = game;
  const [counter, setCounter] = useState(counterTime);

  const {
    data: player2Address,
    isLoading: isPlayer2AddressLoading,
    isError: isPlayer2AddressError,
  } = useContractRead({
    address: address as Address,
    abi: RPSLS.abi,
    functionName: "j2",
  });

  const {
    data: player2Move,
    refetch: moveRefetch,
    isLoading: isPlayer2MoveLoading,
    isRefetching: isPlayer2MoveRefetching,
    isError: isPlayer2MoveError,
  } = useContractRead({
    address: address as Address,
    abi: RPSLS.abi,
    functionName: "c2",
  });

  const {
    data: lastActionTimestamp,
    isLoading: isLastActionTimestampLoading,
    isError: isLastActionTimestampError,
    refetch: refetchLastActionTimestamp,
  } = useContractRead({
    address: address as Address,
    abi: RPSLS.abi,
    functionName: "lastAction",
  });

  const {
    data: timeout,
    isLoading: isTimeoutLoading,
    isError: isTimeoutError,
  } = useContractRead({
    address: address as Address,
    abi: RPSLS.abi,
    functionName: "TIMEOUT",
  });

  const {
    data: stakeRaw,
    isLoading: isStakeLoading,
    refetch: stakeRefetch,
    isRefetching: isStakeRefetching,
    isError: isStakeError,
    isSuccess: isStakeSuccess,
  } = useContractRead({
    address: address as Address,
    abi: RPSLS.abi,
    functionName: "stake",
    cacheTime: 100,
  });

  const stake =
    typeof stakeRaw === "bigint"
      ? Number(formatUnits(stakeRaw as bigint, 18))
      : null;
  const isGameOver = stake === 0;

  const timeOutDate =
    lastActionTimestamp &&
    timeout &&
    getTimeout(lastActionTimestamp as bigint, timeout as bigint);

  const hasTimedOut = !!timeOutDate && timeOutDate < new Date();

  const {
    config: solveConfig,
    isFetching: isSolveFetching,
    isError: isSolveError,
  } = usePrepareContractWrite({
    address: address as Address,
    abi: RPSLS.abi,
    functionName: "solve",
    args: [move, salt],
    enabled: !!player2Move,
  });

  const { write: solveWrite, isSuccess: isSolveSuccess } =
    useContractWrite(solveConfig);

  const { config: playerTimeoutConfig, isFetching: isPlayerTimeoutFetching } =
    usePrepareContractWrite({
      address: address as Address,
      abi: RPSLS.abi,
      functionName: "j2Timeout",
      enabled:
        hasTimedOut &&
        !player2Move &&
        !isPlayer2MoveRefetching &&
        !isPlayer2MoveLoading,
    });

  const {
    write: playerTimeoutWrite,
    isSuccess: isPlayer2TimeoutSuccess,
    isError: isPlayer2TimeoutError,
  } = useContractWrite(playerTimeoutConfig);

  useEffect(() => {
    if (isGameOver) return;
    if (counter === 0) {
      moveRefetch();
      stakeRefetch();
      refetchLastActionTimestamp();
      setTimeout(() => setCounter(counterTime), 1000);
      return;
    }
    counter > 0 && setTimeout(() => setCounter((counter) => counter - 1), 1000);
  }, [
    counter,
    moveRefetch,
    player2Move,
    stakeRefetch,
    isGameOver,
    refetchLastActionTimestamp,
  ]);

  const isLoading =
    isSolveFetching ||
    isPlayerTimeoutFetching ||
    isTimeoutLoading ||
    isLastActionTimestampLoading ||
    isPlayer2MoveLoading ||
    isPlayer2MoveRefetching ||
    isStakeLoading ||
    isStakeRefetching ||
    isPlayer2AddressLoading;

  const gameUrl = `${
    window.location.origin
  }/playerTwoMove/${address}/${stakeRaw?.toString()}`;

  if (
    isPlayer2AddressError ||
    isPlayer2MoveError ||
    isLastActionTimestampError ||
    isTimeoutError ||
    isStakeError ||
    isSolveError ||
    isPlayer2TimeoutError
  ) {
    return (
      <Card sx={{ width: 550 }}>
        <CardContent>
          <Typography
            gutterBottom
          >{`Game Address: ${game.address}`}</Typography>
          <Typography gutterBottom variant="h6" color="red">
            There was an error fetching this game
          </Typography>
        </CardContent>
      </Card>
    );
  }

  if (
    (!stake && isStakeSuccess && !player2Move) ||
    (!stake && isStakeSuccess && !!player2Move && hasTimedOut) ||
    isPlayer2TimeoutSuccess
  ) {
    return (
      <Card sx={{ width: 550 }}>
        <CardContent>
          <Typography
            gutterBottom
          >{`Game Address: ${game.address}`}</Typography>
          <Typography gutterBottom>You are Player 1 in this game</Typography>
          <Typography gutterBottom variant="h6">
            Game Over
          </Typography>
          {isPlayer2TimeoutSuccess && (
            <Typography gutterBottom>
              The bet should be back in your wallet now
            </Typography>
          )}
        </CardContent>
      </Card>
    );
  }

  if (isSolveSuccess || (!stake && isStakeSuccess)) {
    const winner = checkResult(move, player2Move as number);
    return (
      <Card sx={{ width: 550 }}>
        <CardContent>
          <Typography>{`Game Address: ${game.address}`}</Typography>
          <Typography>{`Playing against: ${player2Address}`}</Typography>
          <Typography gutterBottom>You are Player 1 in this game</Typography>
          <Typography gutterBottom>{`Player 2 Played ${
            MOVES.find((m) => m.id === player2Move)?.name
          }`}</Typography>
          <Typography gutterBottom variant="h6">
            Game Over
          </Typography>
          {move === player2Move ? (
            <Typography variant="h6">Tie</Typography>
          ) : (
            <Typography variant="h6"> You {winner ? "Won" : "Lost"}</Typography>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ width: 550 }}>
      <CardContent>
        <Typography gutterBottom>{`Game Address: ${game.address}`}</Typography>
        <Typography
          gutterBottom
        >{`Playing against: ${player2Address}`}</Typography>
        <Typography gutterBottom>You are Player 1 in this game</Typography>
        {!hasTimedOut && (
          <Typography
            gutterBottom
          >{`Timeout will be available: ${timeOutDate?.toLocaleString()}`}</Typography>
        )}
        <Typography gutterBottom>Stake: {stake}</Typography>
        {!!player2Move && (
          <Grid container justifyContent="center">
            <Button
              size="small"
              onClick={() => {
                setCounter(0);
              }}
            >
              Check if Player 2 called timeout (
              {counter > 0 ? counter : counterTime})
            </Button>
          </Grid>
        )}
        {!player2Move && (
          <Grid container justifyContent="center">
            <Button
              size="small"
              onClick={() => {
                setCounter(0);
              }}
            >
              Check Player 2 move ({counter > 0 ? counter : counterTime})
            </Button>
          </Grid>
        )}
      </CardContent>
      <CardActions>
        {isLoading ? (
          <Grid item container xs={12} justifyContent="center">
            <CircularProgress size={31} />
          </Grid>
        ) : (
          <Grid container justifyContent="space-evenly">
            {!!player2Move && (
              <Button
                variant="contained"
                size="small"
                onClick={() => solveWrite && solveWrite()}
              >
                Solve!
              </Button>
            )}
            {hasTimedOut && !player2Move && (
              <Button
                variant="contained"
                size="small"
                onClick={() => playerTimeoutWrite && playerTimeoutWrite()}
              >
                Call Timeout
              </Button>
            )}
          </Grid>
        )}
      </CardActions>
      <CardActions>
        <Grid container justifyContent="center">
          <Button
            endIcon={<CopyIcon />}
            onClick={() => {
              navigator.clipboard.writeText(gameUrl);
            }}
          >
            Copy Game Url
          </Button>
        </Grid>
      </CardActions>
    </Card>
  );
}

export default GameItemPlayer1;
