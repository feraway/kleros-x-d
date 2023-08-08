import { Outlet } from "react-router-dom";
import Grid from "@mui/material/Grid";
import Header from "components/Header";

function Layout() {
  return (
    <Grid container justifyContent="center">
      <Grid item container flexDirection="column" alignItems="center" xs={6}>
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
