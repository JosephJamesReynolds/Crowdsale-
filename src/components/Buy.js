import { useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Spinner from "react-bootstrap/Spinner";
import { ethers } from "ethers";

const Buy = ({
  signer,
  price,
  crowdsale,
  setIsLoading,
  updateAccountBalance,
  loadBlockchainData,
}) => {
  const [amount, setAmount] = useState("0");
  const [isWaiting, setIsWaiting] = useState(false);

  const buyHandler = async (e) => {
    e.preventDefault();
    setIsWaiting(true);
    setIsLoading(true);

    try {
      const ethAmount = (parseFloat(amount) * parseFloat(price)).toString();
      const value = ethers.utils.parseEther(ethAmount);
      const tokenAmount = ethers.utils.parseUnits(amount, "ether");

      const transaction = await crowdsale
        .connect(signer)
        .buyTokens(tokenAmount, { value: value });

      await transaction.wait();

      await updateAccountBalance();
      await loadBlockchainData();
    } catch (error) {
      console.error("Error buying tokens:", error);
      window.alert("User rejected or transaction reverted");
    } finally {
      setIsWaiting(false);
      setIsLoading(false);
    }
  };

  return (
    <Form
      onSubmit={buyHandler}
      style={{ maxWidth: "800px", margin: "50px auto" }}
    >
      <Form.Group as={Row}>
        <Col>
          <Form.Control
            type="number"
            placeholder="Enter amount"
            onChange={(e) => setAmount(e.target.value)}
          ></Form.Control>
        </Col>
        <Col className="text-center">
          {isWaiting ? (
            <Spinner animation="border" />
          ) : (
            <Button variant="primary" type="submit" style={{ width: "100%" }}>
              Buy Tokens
            </Button>
          )}
        </Col>
      </Form.Group>
    </Form>
  );
};

export default Buy;
