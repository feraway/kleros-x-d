import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAccount, useNetwork } from "wagmi";
import Grid from "@mui/material/Grid";
import Header from "components/Header";

function Layout() {
  const { address } = useAccount();
  const { pathname } = useLocation();
  const { chain } = useNetwork();
  const navigate = useNavigate();

  useEffect(() => {
    if ((!address || chain?.id !== 5) && pathname !== "/") {
      navigate("/");
    }
  }, [navigate, pathname, address, chain]);

  return (
    <Grid container justifyContent="center">
      <Grid item container xs={10}>
        <Grid item xs={12} container justifyContent="center">
          <Header />
        </Grid>
        <Grid item container xs={12} justifyContent="center">
          <Outlet />
        </Grid>
      </Grid>
    </Grid>
  );
}

export default Layout;
