import Typography from "@mui/material/Typography";
import { Link } from "react-router-dom";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import {
  useConnect,
  useAccount,
  useDisconnect,
  useNetwork,
  useSwitchNetwork,
} from "wagmi";
import ConnectWalletButton from "components/ConnectWalletButton";
import SwitchNetworkButton from "components/SwitchNetworkButton";

function Header() {
  const { error: connectError } = useConnect();
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const { chain } = useNetwork();
  const { error: switchNetworkError } = useSwitchNetwork();

  const error = connectError || switchNetworkError;
  return (
    <Grid container sx={{ marginBottom: 3 }}>
      <Grid item container justifyContent="flex-end">
        {error && <Typography variant="subtitle2">{error.message}</Typography>}
        {!address && <ConnectWalletButton />}
        {address && (
          <Grid
            container
            item
            alignItems="center"
            justifyContent="flex-end"
            xs={6}
          >
            <Typography variant="subtitle2">{address}</Typography>
            <Button
              size="small"
              onClick={() => {
                disconnect();
              }}
              color="error"
            >
              Disconnect Metamask
            </Button>
          </Grid>
        )}
        {address && chain?.id !== 5 && <SwitchNetworkButton />}
      </Grid>
      <Grid item xs={12}>
        <Typography variant="h1" textAlign="center">
          RPSLS
        </Typography>
        <Typography textAlign="center">
          Rock Paper Scissors Lizard Spock
        </Typography>
      </Grid>
      <Grid item container xs={12} justifyContent="center">
        <Button component={Link} to="/">
          Home
        </Button>
        <Button
          component={Link}
          to="/newGame"
          sx={{ marginLeft: 3, marginRight: 3 }}
        >
          New Game
        </Button>
        <Button component={Link} to="/gameList">
          Game List
        </Button>
      </Grid>
      <Grid item xs={12}>
        <Divider />
      </Grid>
    </Grid>
  );
}

export default Header;
