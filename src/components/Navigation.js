import React from "react";
import Navbar from "react-bootstrap/Navbar";
import Button from "react-bootstrap/Button";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";

import logo from "../logo.png";

function Navigation({ onAccountChange }) {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect({
    connector: new InjectedConnector(),
  });
  const { disconnect } = useDisconnect();

  const handleConnectWallet = async () => {
    if (isConnected) {
      await disconnect();
    } else {
      await connect();
    }
  };

  React.useEffect(() => {
    if (onAccountChange) {
      onAccountChange(address);
    }
  }, [address, onAccountChange]);

  return (
    <Navbar className="justify-content-between">
      <Navbar.Brand href="#">
        <img
          alt="logo"
          src={logo}
          width="60"
          height="60"
          className="d-inline-block align-top mx-3"
        />
        <span style={{ fontSize: "1.6rem" }}>Joseph Money (JMN) Crowdsale</span>
      </Navbar.Brand>
      <Button onClick={handleConnectWallet}>
        {isConnected
          ? `Disconnect ${address.slice(0, 6)}...${address.slice(-4)}`
          : "Connect Wallet"}
      </Button>
    </Navbar>
  );
}

export default Navigation;
