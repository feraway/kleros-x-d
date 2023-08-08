import Typography from "@mui/material/Typography";
import { Routes, Route, Link, BrowserRouter } from "react-router-dom";
import Layout from "components/Layout";
import GameIntro from "components/GameIntro";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<GameIntro />} />
          {/*  <Route path="games" element={<GameList />} /> */}
          <Route
            path="*"
            element={
              <Typography variant="h5" textAlign="center">
                404 not found: {<Link to="/">Go back Home</Link>}
              </Typography>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
