import { Outlet } from "react-router-dom";
import Grid from "@mui/material/Grid";
import Header from "components/Header";

function Layout() {
  return (
    <Grid container justifyContent="center">
      <Header />
      <Outlet />
    </Grid>
  );
}

export default Layout;
