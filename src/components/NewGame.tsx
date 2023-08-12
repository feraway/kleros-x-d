import { useState, useContext } from "react";
import { Link } from "react-router-dom";
import {
  useAccount,
  useBalance,
  useWaitForTransaction,
  usePublicClient,
} from "wagmi";
import { goerli } from "wagmi/chains";
import {
  Hex as HexType,
  TransactionReceipt as TransactionReceiptType,
} from "viem";
import { getWalletClient } from "@wagmi/core";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";
import Hasher from "abis/Hasher";
import RPSLS from "abis/RPSLS";
import { customAlphabet } from "nanoid";
import { MOVES } from "utils/constants";
import { GameType } from "@types";
import StateContext from "state/StateContext";

const nanoidOnlyNumbers = customAlphabet("1234567890", 18);

function NewGame() {
  const { address } = useAccount();
  const { setGames } = useContext(StateContext);
  const [move, setMove] = useState<number>();
  const [localStorageChecked, setLocalStorageChecked] = useState(true);
  const [salt, setSalt] = useState<string>();
  const [player2Address, setPlayer2Address] = useState<string>("");
  const [stake, setStake] = useState("0");
  const [isContractDeploying, setIsContractDeploying] = useState(false);
  const [contractDeploymentError, setContractDeploymentError] = useState(false);
  const [contractTransactionHash, setcontractTransactionHash] =
    useState<string>("");
  const publicClient = usePublicClient();

  const {
    data: balance,
    isLoading: isBalanceLoading,
    isError: isBalanceError,
  } = useBalance({
    address,
  });

  const {
    data: contractDeploymentData,
    isLoading: isWaitingForContractDeployment,
  } = useWaitForTransaction({
    hash: contractTransactionHash as HexType,
    onSuccess: (data: TransactionReceiptType) => {
      setGames((games: GameType[]): GameType[] => {
        if (!data.contractAddress) return games;
        return [...games, { address: data.contractAddress, salt }];
      });
    },
  });

  const commitMove = async () => {
    try {
      setIsContractDeploying(true);
      const salt = nanoidOnlyNumbers();

      const playerOneMoveHash = await publicClient.readContract({
        address: "0x343f169686de37cf1b6b0cda861448e8aa8e1a58",
        abi: Hasher.abi,
        functionName: "hash",
        args: [move, salt],
      });
      const walletClient = await getWalletClient();
      const hash = await walletClient?.deployContract({
        abi: RPSLS.abi,
        account: address,
        args: [playerOneMoveHash, player2Address],
        bytecode: `0x${RPSLS.bytecode}`,
        chain: goerli,
      });

      if (hash) {
        setSalt(salt);
        setcontractTransactionHash(hash);
      } else {
        setContractDeploymentError(true);
      }

      setIsContractDeploying(false);
    } catch {
      setContractDeploymentError(true);
    }
  };

  const isStakeValid = Number(stake) <= Number(balance?.formatted);

  const loading =
    isBalanceLoading || isContractDeploying || isWaitingForContractDeployment;

  if (loading) {
    return (
      <Grid container alignItems="center" flexDirection="column">
        <CircularProgress />
        {(isContractDeploying || isWaitingForContractDeployment) && (
          <Typography>"Deploying contract..."</Typography>
        )}
      </Grid>
    );
  }

  if (contractDeploymentError || isBalanceError) {
    return (
      <Grid container alignItems="center" flexDirection="column">
        {contractDeploymentError && (
          <Typography variant="h6">
            There was an error deploying the contract
          </Typography>
        )}
        {isBalanceError && (
          <Typography variant="h6">
            There was an error fetching your balance
          </Typography>
        )}
        <Button component={Link} to="/">
          Go back Home
        </Button>
      </Grid>
    );
  }

  if (contractDeploymentData) {
    // TODO: Add copy buttons
    return (
      <Grid container alignItems="center" flexDirection="column">
        <Typography variant="h6">
          Your game was succesfully deployed!
        </Typography>
        <Typography variant="h6">
          The contract address to give to Player 2
        </Typography>
        <Typography>{contractDeploymentData.contractAddress}</Typography>
        <Typography variant="h6">
          The salt to resolve the game after Player 2 posts their move is
        </Typography>
        <Typography>{salt}</Typography>
        <Button component={Link} to="/">
          Go to Games Page
        </Button>
      </Grid>
    );
  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6">Step 1: Choose your move</Typography>
      </Grid>
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
      <Grid item xs={12}>
        <Typography variant="h6">
          Step 2: Place your bet! (Player 2 will have to match it)
        </Typography>
        <Grid
          item
          container
          xs={12}
          alignItems="center"
          flexDirection="column"
          sx={{ marginTop: 3 }}
        >
          <TextField
            label="Bet"
            value={stake}
            type="number"
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setStake(event.target.value);
            }}
            error={!isStakeValid}
            helperText={!isStakeValid && "Stake can't excede balance"}
          />
          <Typography>{`(Balance: ${balance?.formatted} Goerli${balance?.symbol})`}</Typography>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="h6">Step 3: Add Player 2 Address</Typography>
        <Grid
          item
          container
          xs={12}
          alignItems="center"
          flexDirection="column"
          sx={{ marginTop: 3 }}
        >
          <TextField
            label="Player 2 address"
            value={player2Address}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setPlayer2Address(event.target.value);
            }}
          />
        </Grid>
        <Grid
          item
          container
          xs={12}
          alignItems="center"
          flexDirection="column"
          sx={{ marginTop: 3 }}
        >
          <Button
            onClick={() => commitMove()}
            disabled={!move || !player2Address}
            variant="contained"
          >
            Commit Move {!move && "(please complete the steps)"}
          </Button>
          <Typography textAlign="center">
            Save address and Salt on localstorage?
          </Typography>
          <Checkbox
            checked={localStorageChecked}
            onClick={() => {
              setLocalStorageChecked(!localStorageChecked);
            }}
          />
        </Grid>
      </Grid>
    </Grid>
  );
}

export default NewGame;
