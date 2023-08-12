import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAccount } from "wagmi";
import Grid from "@mui/material/Grid";
import Header from "components/Header";

function Layout() {
  const { address } = useAccount();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!address && pathname !== "/") {
      navigate("/");
    }
  }, [navigate, pathname, address]);

  return (
    <Grid container justifyContent="center">
      <Grid item container flexDirection="column" alignItems="center" xs={10}>
        <Grid item>
          <Header />
        </Grid>
        <Grid item>
          <Outlet />
        </Grid>
      </Grid>
    </Grid>
  );
}

export default Layout;
