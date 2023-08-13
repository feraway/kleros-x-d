import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  useBalance,
  useAccount,
  usePrepareContractWrite,
  useContractWrite,
  Address,
} from "wagmi";
import { formatUnits } from "viem";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Button from "@mui/material/Button";
import SelectMove from "components/SelectMove";
import RPSLS from "abis/RPSLS";

function PlayerTwoMove() {
  const { gameAddress, bet: betRaw } = useParams();
  const [move, setMove] = useState<number>();
  const { address } = useAccount();
  const {
    data: balance,
    isLoading: isBalanceLoading,
    isError: isBalanceError,
  } = useBalance({
    address,
  });

  const betBigInt = BigInt(betRaw as `${number}`);

  const { config, error: contractWriteError } = usePrepareContractWrite({
    address: gameAddress as Address,
    abi: RPSLS.abi,
    functionName: "play",
    args: [move],
    value: betBigInt,
    enabled: Boolean(move && balance && betBigInt <= balance.value),
  });
  const { write } = useContractWrite(config);

  if (isBalanceError) {
    return (
      <Grid container alignItems="center" flexDirection="column">
        <Typography variant="h6">
          There was an error fetching your balance
        </Typography>
        <Button component={Link} to="/">
          Go back Home
        </Button>
      </Grid>
    );
  }

  if (isBalanceLoading || !balance) {
    return (
      <Grid container alignItems="center" flexDirection="column">
        <CircularProgress />
      </Grid>
    );
  }

  const bet = formatUnits(BigInt(betRaw as `${number}`), balance?.decimals);
  const notEnoughBalance = balance.value <= betBigInt;

  return (
    <Grid>
      <Typography variant="h6">Player Two Move</Typography>
      <Typography>{`You are playing on address ${gameAddress}`}</Typography>
      <Typography>{`The bet is ${bet} Goerli${balance?.symbol}`}</Typography>
      <Typography>{`Your total balance is ${balance?.formatted} Goerli${balance?.symbol}`}</Typography>
      {notEnoughBalance && (
        <Typography color="red">
          You don't have enough balance to place the bet
        </Typography>
      )}
      <Typography variant="h6">Please Select your move</Typography>
      <SelectMove move={move} setMove={setMove} />
      <Button
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
