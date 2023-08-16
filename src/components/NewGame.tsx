import { useState, useContext } from "react";
import { Link } from "react-router-dom";
import {
  useAccount,
  useBalance,
  useWaitForTransaction,
  usePublicClient,
  Address,
} from "wagmi";
import { goerli } from "wagmi/chains";
import { parseUnits, isAddress } from "viem";
import { Hex as HexType } from "viem";
import uniqBy from "lodash.uniqby";
import { getWalletClient } from "@wagmi/core";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import TextField from "@mui/material/TextField";
import Divider from "@mui/material/Divider";
import CircularProgress from "@mui/material/CircularProgress";
import SelectMove from "components/SelectMove";
import Hasher from "abis/Hasher";
import RPSLS from "abis/RPSLS";
import { customAlphabet } from "nanoid";
import { GameType } from "@types";
import StateContext from "state/StateContext";
import { MOVES } from "utils/constants";
import CopyIcon from "components/icons/CopyIcon";

const nanoidOnlyNumbers = customAlphabet("1234567890", 18);

function NewGame() {
  const { address } = useAccount();
  const { setGames } = useContext(StateContext);
  const [move, setMove] = useState<number>(0);
  const [localStorageChecked, setLocalStorageChecked] = useState(true);
  const [salt, setSalt] = useState<string>("");
  const [player2Address, setPlayer2Address] = useState<string>("");
  const [bet, setBet] = useState("0");
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
    onSuccess: async (data) => {
      if (!data.contractAddress) {
        setContractDeploymentError(true);
        return;
      }

      const game = {
        address: data.contractAddress as Address,
        salt,
        move,
      };

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
    },
  });

  const gameUrl =
    !!contractDeploymentData && !!balance
      ? `${window.location.origin}/playerTwoMove/${
          contractDeploymentData.contractAddress
        }/${parseUnits(bet, balance.decimals).toString()}`
      : "";

  const loading =
    isBalanceLoading || isContractDeploying || isWaitingForContractDeployment;

  if (loading && !contractDeploymentError) {
    return (
      <Grid container alignItems="center" flexDirection="column">
        <CircularProgress />
        {(isContractDeploying || isWaitingForContractDeployment) && (
          <Typography gutterBottom sx={{ marginTop: 3 }}>
            "Deploying contract..."
          </Typography>
        )}
      </Grid>
    );
  }

  const commitMove = async () => {
    try {
      if (!balance) {
        setContractDeploymentError(true);
        return;
      }
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
        value: parseUnits(bet, balance.decimals),
      });

      if (hash) {
        setSalt(salt);
        setcontractTransactionHash(hash);
      } else {
        setContractDeploymentError(true);
      }

      setIsContractDeploying(false);
    } catch (err) {
      console.error(err);
      setContractDeploymentError(true);
    }
  };

  const isBetValid = balance ? Number(bet) <= Number(balance.formatted) : false;

  if (contractDeploymentError || isBalanceError) {
    return (
      <Grid container alignItems="center" flexDirection="column">
        {contractDeploymentError && (
          <Typography gutterBottom variant="h6">
            There was an error deploying the contract
          </Typography>
        )}
        {isBalanceError && (
          <Typography gutterBottom variant="h6">
            There was an error fetching your balance
          </Typography>
        )}
        <Button component={Link} to="/">
          Go back Home
        </Button>
      </Grid>
    );
  }

  if (contractDeploymentData && balance) {
    return (
      <Grid container justifyContent="center">
        <Grid container alignItems="center" flexDirection="column" item lg={8}>
          <Typography gutterBottom textAlign="center" variant="h6">
            Your game was succesfully deployed!
          </Typography>
          <Typography textAlign="center" gutterBottom variant="h6">
            Please give this link to player two (if they take longer than five
            minutes to post their move you can claim timeout and get your bet
            back).
          </Typography>
          <Typography gutterBottom textAlign="center" sx={{ marginTop: 3 }}>
            {gameUrl}
          </Typography>
          <Button
            endIcon={<CopyIcon />}
            onClick={() => {
              navigator.clipboard.writeText(gameUrl);
            }}
          >
            Copy Game Url
          </Button>
          <Divider />
          <Typography
            sx={{ marginTop: 3 }}
            gutterBottom
            textAlign="center"
            variant="h6"
          >
            The contract address is
          </Typography>
          <Typography
            gutterBottom
            variant="h6"
            textAlign="center"
            color="primary"
          >
            {contractDeploymentData.contractAddress}
          </Typography>
          <Typography variant="h6">
            Make sure to save all this information somewhere safe, specially if
            you're not storing it in localStorage. Loosing the salt will result
            in the game being unsolvable.
          </Typography>
          <Typography gutterBottom variant="h6">
            The salt to resolve the game after Player 2 posts their move is
          </Typography>
          <Typography gutterBottom variant="h6" color="primary">
            {salt}
          </Typography>
          <Typography gutterBottom variant="h6">
            Your move was{" "}
            {
              <Typography
                gutterBottom
                color="primary"
                component="span"
                variant="h6"
              >
                {MOVES.find((m) => m.id === move)?.name}
              </Typography>
            }
          </Typography>
          <Button
            component={Link}
            to="/gameList"
            sx={{ marginBottom: 3, marginTop: 3 }}
          >
            Go to Games Page
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setMove(0);
              setSalt("");
              setPlayer2Address("");
              setBet("0");
              setIsContractDeploying(false);
              setContractDeploymentError(false);
              setcontractTransactionHash("");
            }}
          >
            Create New Game
          </Button>
        </Grid>
      </Grid>
    );
  }

  return (
    <Grid container justifyContent="center">
      <Grid container item lg={8} spacing={3}>
        <Grid item xs={12}>
          <Typography gutterBottom variant="h6">
            Step 1: Choose your move
          </Typography>
        </Grid>
        <SelectMove setMove={setMove} move={move} />
        <Grid item xs={12}>
          <Typography gutterBottom variant="h6">
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
              value={bet}
              type="number"
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                setBet(event.target.value);
              }}
              error={!isBetValid}
              helperText={!isBetValid && "Stake can't excede balance"}
            />
            <Typography
              gutterBottom
            >{`(Balance: ${balance?.formatted} Goerli${balance?.symbol})`}</Typography>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Typography gutterBottom variant="h6">
            Step 3: Add Player 2 Address
          </Typography>
          <Grid
            item
            container
            xs={12}
            alignItems="center"
            flexDirection="column"
            sx={{ marginTop: 3, paddingLeft: 3, paddingRight: 3 }}
          >
            <TextField
              sx={{ maxWidth: 600 }}
              fullWidth
              label="Player 2 address"
              value={player2Address}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                setPlayer2Address(event.target.value);
              }}
              error={!!player2Address && !isAddress(player2Address)}
              helperText={
                !!player2Address &&
                !isAddress(player2Address) &&
                "Player 2 address is invalid"
              }
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
              disabled={!move || !player2Address || !Number(bet)}
              variant="contained"
            >
              Commit Move {!move && "(please complete the steps)"}
            </Button>
            <Typography gutterBottom textAlign="center">
              Save game info in LocalStorage?
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
    </Grid>
  );
}

export default NewGame;
