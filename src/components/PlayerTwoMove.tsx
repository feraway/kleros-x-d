import { useState, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import {
  useBalance,
  useAccount,
  usePrepareContractWrite,
  useContractWrite,
  Address,
  useContractRead,
} from "wagmi";
import { formatUnits } from "viem";
import uniqBy from "lodash.uniqby";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Button from "@mui/material/Button";
import SelectMove from "components/SelectMove";
import StateContext from "state/StateContext";
import { GameType } from "@types";
import RPSLS from "abis/RPSLS";

function PlayerTwoMove() {
  const { gameAddress, bet: betRaw } = useParams();
  const [move, setMove] = useState<number>(0);
  const { address } = useAccount();
  const { setGames } = useContext(StateContext);

  const {
    data: balance,
    isLoading: isBalanceLoading,
    isError: isBalanceError,
  } = useBalance({
    address,
  });

  const betBigInt = BigInt(betRaw as `${number}`);

  const {
    data: player1Address,
    isLoading: isPlayer1AddressLoading,
    isError: isPlayer1AddressError,
  } = useContractRead({
    address: gameAddress as Address,
    abi: RPSLS.abi,
    functionName: "j1",
  });

  const {
    data: stake,
    isLoading: isStakeLoading,
    isError: isStakeError,
    isSuccess: isStakeSuccess,
  } = useContractRead({
    address: gameAddress as Address,
    abi: RPSLS.abi,
    functionName: "stake",
  });

  const {
    data: player2Move,
    isLoading: isMoveLoading,
    isError: isPlayer2MoveError,
  } = useContractRead({
    address: gameAddress as Address,
    abi: RPSLS.abi,
    functionName: "c2",
  });

  const { config, error: contractWriteError } = usePrepareContractWrite({
    address: gameAddress as Address,
    abi: RPSLS.abi,
    functionName: "play",
    args: [move],
    value: betBigInt,
    enabled: Boolean(move && balance && betBigInt <= balance.value),
    onSuccess: () => {
      const game = {
        address: gameAddress as Address,
        move,
        lastActionTimestamp: Math.floor(+new Date() / 1000),
      };

      setGames((games: GameType[]): GameType[] => {
        return uniqBy([...games, game], "address");
      });

      const localStorageGamesRaw = localStorage.getItem("games");
      const localStorageGamesInit = localStorageGamesRaw
        ? JSON.parse(localStorageGamesRaw)
        : [];
      const localStorageGames = uniqBy(
        [...localStorageGamesInit, game],
        "address"
      );
      localStorage.setItem("games", JSON.stringify(localStorageGames));
    },
  });
  const { write, isSuccess: isPlaySuccess } = useContractWrite(config);

  const bet = formatUnits(
    BigInt(betRaw as `${number}`),
    balance?.decimals || 18
  );
  const notEnoughBalance = !!balance && balance.value <= betBigInt;

  const isLoading =
    isBalanceLoading ||
    isStakeLoading ||
    isMoveLoading ||
    isPlayer1AddressLoading;

  const isError =
    isBalanceError ||
    isStakeError ||
    isPlayer2MoveError ||
    isPlayer1AddressError;

  if (isError) {
    return (
      <Grid container alignItems="center" flexDirection="column">
        <Typography variant="h6">
          There was an error fetching the information for this game
        </Typography>
        <Button component={Link} to="/">
          Go back Home
        </Button>
      </Grid>
    );
  }

  if (isLoading) {
    return (
      <Grid container alignItems="center" flexDirection="column">
        <CircularProgress />
      </Grid>
    );
  }

  if (player2Move) {
    return (
      <Grid container flexDirection="column" alignItems="center">
        <Typography gutterBottom variant="h6">
          Player Two Move
        </Typography>
        <Typography
          gutterBottom
        >{`You are playing the game with address: ${gameAddress}`}</Typography>
        <Typography gutterBottom>
          You already submitted your move for this game
        </Typography>
        <Button
          sx={{ marginTop: 3 }}
          component={Link}
          to="/gameList"
          variant="contained"
        >
          Go to Games Page
        </Button>
      </Grid>
    );
  }

  if (!stake && isStakeSuccess) {
    return (
      <Grid container flexDirection="column" alignItems="center">
        <Typography gutterBottom variant="h6">
          Player Two Move
        </Typography>
        <Typography
          gutterBottom
        >{`You are playing the game with address: ${gameAddress}`}</Typography>
        <Typography gutterBottom>This game was already solved</Typography>
        <Button
          sx={{ marginTop: 3 }}
          component={Link}
          to="/gameList"
          variant="contained"
        >
          Go to Games Page
        </Button>
      </Grid>
    );
  }

  if (isPlaySuccess) {
    return (
      <Grid container flexDirection="column" alignItems="center" xs={10}>
        <Typography gutterBottom variant="h6">
          Player Two Move
        </Typography>
        <Typography gutterBottom>
          You succesfully commited your move! Now Player 1 needs to solve the
          game. You can check the status of the game and call timeout if Player
          one takes more than five minutes on the Games page.
        </Typography>
        <Button
          sx={{ marginTop: 3 }}
          component={Link}
          to="/gameList"
          variant="contained"
        >
          Go to Games Page
        </Button>
      </Grid>
    );
  }

  return (
    <Grid container flexDirection="column" alignItems="center">
      <Typography gutterBottom variant="h6">
        Player Two Move
      </Typography>
      <Typography
        gutterBottom
      >{`You are playing the game with address: ${gameAddress}`}</Typography>
      <Typography
        gutterBottom
      >{`The bet is ${bet} Goerli${balance?.symbol}`}</Typography>
      <Typography gutterBottom>
        {`You are playing against ${player1Address}`}
      </Typography>
      <Typography
        gutterBottom
      >{`Your total balance is ${balance?.formatted} Goerli${balance?.symbol}`}</Typography>
      {notEnoughBalance && (
        <Typography gutterBottom color="red">
          You don't have enough balance to place the bet
        </Typography>
      )}
      <Typography gutterBottom variant="h6" sx={{ marginTop: 1 }}>
        Please Select your move
      </Typography>
      <Grid container sx={{ marginTop: 3, marginBottom: 1 }}>
        <SelectMove move={move} setMove={setMove} />
      </Grid>
      <Button
        sx={{ marginTop: 3 }}
        variant="contained"
        disabled={!!contractWriteError || notEnoughBalance || !move || !write}
        onClick={() => write && write()}
      >
        Commit your move!
      </Button>
    </Grid>
  );
}

export default PlayerTwoMove;
