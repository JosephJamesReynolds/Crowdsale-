import { useEffect, useState, useCallback } from "react";
import { Container } from "react-bootstrap";
import {
  useAccount,
  useNetwork,
  useContract,
  useProvider,
  useSigner,
  useConnect,
} from "wagmi";
import { WagmiConfig, createClient, configureChains } from "wagmi";
import { publicProvider } from "wagmi/providers/public";
import { sepolia, hardhat } from "wagmi/chains";
import { ethers } from "ethers";
import { InjectedConnector } from "wagmi/connectors/injected";

// Components
import Navigation from "./Navigation";
import Buy from "./Buy";
import Progress from "./Progress";
import Info from "./Info";
import Loading from "./Loading";

// Artifacts
import CROWDSALE_ABI from "../abis/Crowdsale.json";
import TOKEN_ABI from "../abis/Token.json";

// Config
import config from "../config.json";

// Configure wagmi
const { provider, webSocketProvider } = configureChains(
  [sepolia, hardhat],
  [publicProvider()]
);

const client = createClient({
  autoConnect: true,
  provider,
  webSocketProvider,
});

function AppContent({ onAccountChange, currentAccount }) {
  const { address: account } = useAccount();
  const { chain } = useNetwork();
  const provider = useProvider();
  const { data: signer } = useSigner();
  const { connect } = useConnect({
    connector: new InjectedConnector(),
  });

  const [accountBalance, setAccountBalance] = useState(0);
  const [price, setPrice] = useState(0);
  const [maxTokens, setMaxTokens] = useState(0);
  const [tokensSold, setTokensSold] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const tokenContract = useContract({
    address: chain ? config[chain.id]?.token.address : undefined,
    abi: TOKEN_ABI,
    signerOrProvider: signer || provider,
  });

  const crowdsaleContract = useContract({
    address: chain ? config[chain.id]?.crowdsale.address : undefined,
    abi: CROWDSALE_ABI,
    signerOrProvider: signer || provider,
  });

  const updateAccountBalance = useCallback(async () => {
    if (currentAccount && tokenContract) {
      const balance = await tokenContract.balanceOf(currentAccount);
      setAccountBalance(ethers.utils.formatEther(balance));
    }
  }, [currentAccount, tokenContract]);

  const loadBlockchainData = useCallback(async () => {
    setIsLoading(true);
    if (!currentAccount || !chain || !tokenContract || !crowdsaleContract) {
      setIsLoading(false);
      return;
    }

    try {
      await updateAccountBalance();

      const priceInWei = await crowdsaleContract.price();
      setPrice(ethers.utils.formatEther(priceInWei));

      const maxTokensInWei = await crowdsaleContract.maxTokens();
      setMaxTokens(ethers.utils.formatEther(maxTokensInWei));

      const tokensSoldInWei = await crowdsaleContract.tokensSold();
      setTokensSold(ethers.utils.formatEther(tokensSoldInWei));
    } catch (error) {
      console.error("Error fetching blockchain data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [
    currentAccount,
    chain,
    tokenContract,
    crowdsaleContract,
    updateAccountBalance,
  ]);

  useEffect(() => {
    loadBlockchainData();
  }, [loadBlockchainData]);

  useEffect(() => {
    if (onAccountChange) {
      onAccountChange(account);
    }
  }, [account, onAccountChange]);

  const handleConnectWallet = async () => {
    await connect();
  };

  return (
    <Container>
      <Navigation onAccountChange={onAccountChange} />

      {!currentAccount ? (
        <div className="py-4 text-center">
          <h2 className="my-4" style={{ fontSize: "3rem" }}>
            Welcome to Joseph's Money Crowdsale!
          </h2>
          <button
            onClick={handleConnectWallet}
            className="btn btn-primary btn-lg"
            style={{ fontSize: "2.5rem", padding: "1rem 1.5rem" }} // Adjust font size and padding as needed
          >
            Connect your wallet
          </button>
          <p className="mt-3" style={{ fontSize: "2.5rem" }}>
            {" "}
            to get started.
          </p>
        </div>
      ) : (
        <>
          <h1 className="my-4 text-center">Introducing Joseph Money!</h1>

          {isLoading ? (
            <Loading />
          ) : (
            <>
              <p className="text-center">
                <strong>Current Price:</strong> {parseFloat(price).toFixed(3)}{" "}
                ETH
              </p>
              <Buy
                account={currentAccount}
                signer={signer}
                price={price}
                crowdsale={crowdsaleContract}
                setIsLoading={setIsLoading}
                updateAccountBalance={updateAccountBalance}
                loadBlockchainData={loadBlockchainData}
              />
              <Progress
                maxTokens={parseFloat(maxTokens).toFixed(0)}
                tokensSold={parseFloat(tokensSold).toFixed(0)}
              />
            </>
          )}

          <hr />

          <Info
            account={currentAccount}
            accountBalance={parseFloat(accountBalance).toFixed(2)}
          />
        </>
      )}
    </Container>
  );
}

function App() {
  const [currentAccount, setCurrentAccount] = useState(null);

  const handleAccountChange = (newAccount) => {
    setCurrentAccount(newAccount);
  };

  return (
    <WagmiConfig client={client}>
      <AppContent
        onAccountChange={handleAccountChange}
        currentAccount={currentAccount}
      />
    </WagmiConfig>
  );
}

export default App;
