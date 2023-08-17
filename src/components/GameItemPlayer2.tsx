import { useState, useEffect } from "react";
import {
  usePrepareContractWrite,
  useContractWrite,
  Address,
  useContractRead,
} from "wagmi";
import { Link } from "react-router-dom";
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

type GameItemPlayer2Props = {
  game: GameType;
};

const counterTime = 30;

function GameItemPlayer2(props: GameItemPlayer2Props) {
  const { game } = props;
  const {
    address,
    move: player2MoveState,
    lastActionTimestamp: lastActionTimestampState = 0,
  } = game;
  const [counter, setCounter] = useState(counterTime);

  const {
    data: player1Address,
    isLoading: isPlayer1AddressLoading,
    isError: isPlayer1AddressError,
  } = useContractRead({
    address: address as Address,
    abi: RPSLS.abi,
    functionName: "j1",
  });

  const {
    data: player2MoveNw,
    isLoading: isPlayer2MoveLoading,
    isError: isPlayer2MoveError,
  } = useContractRead({
    address: address as Address,
    abi: RPSLS.abi,
    functionName: "c2",
    cacheTime: 100,
  });

  const player2Move = player2MoveNw || player2MoveState;

  const {
    data: lastActionTimestampNw,
    isLoading: isLastActionTimestampLoading,
    isError: isLastActionTimestampError,
    refetch: refetchLastActionTimestamp,
  } = useContractRead({
    address: address as Address,
    abi: RPSLS.abi,
    functionName: "lastAction",
  });

  const lastActionTimestamp =
    lastActionTimestampState > ((lastActionTimestampNw as number) || 0)
      ? lastActionTimestampState
      : lastActionTimestampNw;

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
    isError: isStakeError,
    refetch: refetchStake,
    isRefetching: isRefetchingStake,
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

  const { config: playerTimeoutConfig, isLoading: isPlayerTimeoutLoading } =
    usePrepareContractWrite({
      address: address as Address,
      abi: RPSLS.abi,
      functionName: "j1Timeout",
      enabled: hasTimedOut && !!player2Move,
      onSuccess: () => refetchStake(),
    });

  const { write: playerTimeoutWrite, isSuccess: isPlayerTimeoutSuccess } =
    useContractWrite(playerTimeoutConfig);

  useEffect(() => {
    if (isGameOver) return;
    if (counter === 0) {
      refetchStake();
      refetchLastActionTimestamp();
      setTimeout(() => setCounter(counterTime), 1000);
      return;
    }
    counter > 0 && setTimeout(() => setCounter((counter) => counter - 1), 1000);
  }, [counter, refetchStake, isGameOver, refetchLastActionTimestamp]);

  const isLoading =
    isPlayerTimeoutLoading ||
    isTimeoutLoading ||
    isLastActionTimestampLoading ||
    isStakeLoading ||
    isPlayer1AddressLoading ||
    isRefetchingStake ||
    isPlayer2MoveLoading;

  if (
    isPlayer1AddressError ||
    isLastActionTimestampError ||
    isTimeoutError ||
    isStakeError ||
    isPlayer2MoveError
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

  if (isPlayerTimeoutSuccess) {
    return (
      <Card sx={{ width: 550 }}>
        <CardContent>
          <Typography
            gutterBottom
          >{`Game Address: ${game.address}`}</Typography>
          <Typography gutterBottom>
            You succesfully called timeout on Player 1, the total bet should be
            back in your wallet balance
          </Typography>
        </CardContent>
      </Card>
    );
  }

  if (isGameOver) {
    return (
      <Card sx={{ width: 550 }}>
        <CardContent>
          <Typography
            gutterBottom
          >{`Game Address: ${game.address}`}</Typography>
          <Typography
            gutterBottom
          >{`Playing against: ${player1Address}`}</Typography>
          <Typography gutterBottom variant="h6">
            Game Over
          </Typography>
          <Typography gutterBottom>
            Ask Player 1 and/or check your balance to see the result!
          </Typography>
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
        >{`Playing against: ${player1Address}`}</Typography>
        <Typography gutterBottom>You are Player 2 in this game</Typography>
        {!hasTimedOut && (
          <Typography
            gutterBottom
          >{`Timeout will be available: ${timeOutDate?.toLocaleString()}`}</Typography>
        )}
        <Typography gutterBottom>{`Stake: ${stake}`}</Typography>
        {!isGameOver && !player2Move && (
          <Grid container justifyContent="center">
            <Button
              size="small"
              onClick={() => {
                setCounter(0);
              }}
            >
              {player2Move
                ? `Check if Player 1 Solved the Game (${
                    counter > 0 ? counter : counterTime
                  })`
                : `Check if player 1 called timeout (${
                    counter > 0 ? counter : counterTime
                  })`}
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
            {hasTimedOut && !!player2Move && (
              <Button
                variant="contained"
                size="small"
                onClick={() => playerTimeoutWrite && playerTimeoutWrite()}
              >
                Call Timeout
              </Button>
            )}
            {!player2Move && (
              <Button
                variant="contained"
                component={Link}
                to={`${window.location.origin}/playerTwoMove/${address}/${(
                  stakeRaw as bigint
                ).toString()}`}
              >
                Post your move for this game!
              </Button>
            )}
          </Grid>
        )}
      </CardActions>
    </Card>
  );
}

export default GameItemPlayer2;
