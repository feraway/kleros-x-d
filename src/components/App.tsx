import { useState } from "react";
import Typography from "@mui/material/Typography";
import { Routes, Route, Link, BrowserRouter } from "react-router-dom";
import Layout from "components/Layout";
import GameIntro from "components/GameIntro";
import NewGame from "components/NewGame";
import { WagmiConfig, createConfig, configureChains } from "wagmi";
import { goerli } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import StateContext from "state/StateContext";
import { GameType } from "@types";

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [goerli],
  [publicProvider()]
);

const config = createConfig({
  autoConnect: true,
  connectors: [
    new MetaMaskConnector({ chains, options: { shimDisconnect: true } }),
  ],
  publicClient,
  webSocketPublicClient,
});

function App() {
  const [games, setGames] = useState<GameType[]>([]);

  return (
    <StateContext.Provider value={{ games, setGames }}>
      <WagmiConfig config={config}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<GameIntro />} />
              <Route path="newGame" element={<NewGame />} />
              <Route
                path="*"
                element={
                  <Typography variant="h5" textAlign="center">
                    Page not found: {<Link to="/">Go back Home</Link>}
                  </Typography>
                }
              />
            </Route>
          </Routes>
        </BrowserRouter>
      </WagmiConfig>
    </StateContext.Provider>
  );
}

export default App;
