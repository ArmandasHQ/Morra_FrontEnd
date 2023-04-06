import "./App.css";
import { PeraWalletConnect } from "@perawallet/connect";
import algosdk, { waitForConfirmation } from "algosdk";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { useEffect, useState } from "react";

//const crypto = require("crypto");

const peraWallet = new PeraWalletConnect();

// The app ID on testnet
// Morra app
const appIndex = 176040391;
const appAddress = "SDWMFLNXAYNVKRNZZ5DVNBOFHPHP62WVISUFDBCGQKXMN7LSP6TMGMC5XY";

// connect to the algorand node
// token, address(server), port
const algod = new algosdk.Algodv2(
  "",
  "https://testnet-api.algonode.cloud",
  443
);

function App() {
  const [accountAddress, setAccountAddress] = useState(null);
  const [owner, setOwner] = useState(null);
  const [realhand, setRealHand] = useState(null);
  const isConnectedToPeraWallet = !!accountAddress; //convert string to boolean

  useEffect(() => {
    // Reconnect to the session when the component is mounted
    peraWallet
      .reconnectSession()
      .then((accounts) => {
        peraWallet.connector.on("disconnect", handleDisconnectWalletClick);
        console.log(accounts);
        if (accounts.length) {
          setAccountAddress(accounts[0]);
        }
      })
      .catch((e) => console.log(e));
  }, []);

  return (
    <Container>
      <meta name="name" content="Testing frontend for PyTeal" />
      <h1> Morra Game for BootCamp </h1>
      <Row>
        <Col>
          <Button
            onClick={
              isConnectedToPeraWallet
                ? handleDisconnectWalletClick
                : handleConnectWalletClick
            }
          >
            {isConnectedToPeraWallet ? "Disconnect" : "Connect to Pera Wallet"}
          </Button>
        </Col>
      </Row>
      <br />
      <Row>
        <Col>
          <Button onClick={() => optInMorraApp()}>OptIn</Button>
        </Col>
      </Row>
      <br />
      <Row>
        <Col>
          <Button onClick={() => setOwner(true)}>Start Game</Button>
        </Col>
        <Col>
          <Button onClick={() => setOwner(false)}>Join Game</Button>
        </Col>
        <Col>
          <Button onClick={() => resolveMorraApplication()}>Resolve Game</Button>
        </Col>
      </Row>
      <br />
      <Row>
        <Col>
          <Button
            onClick={
              !!owner === true
                ? () =>
                    startMorraApplication(
                      "Tk6O5CNCHChkSojH1nvKFuzrFGbWPl4TxpOBcxaz1tM=",
                      "ONE"
                    )
                : () => joinMorraApplication("ONE")
            }
          >
            1
          </Button>
        </Col>
        <Col>
          <Button
            onClick={
              !!owner === true
                ? () =>
                    startMorraApplication(
                      "36wGYMmGPDyIKhcNAH12GXRVu9ovHZ7Y2QXwOX880hE=",
                      "TWO"
                    )
                : () => joinMorraApplication("TWO")
            }
          >
            2
          </Button>
        </Col>
        <Col>
          <Button
            onClick={
              !!owner === true
                ? () =>
                    startMorraApplication(
                      "91HnfMA3fH8Dxgaom44mReaRvugsrS6DKfISHXcfvzk=",
                      "THREE"
                    )
                : () => joinMorraApplication("THREE")
            }
          >
            3
          </Button>
        </Col>
        <Col>
          <Button
            onClick={
              !!owner === true
                ? () =>
                    startMorraApplication(
                      "/LaonrsdCjYpnLSCwsGm1ETvug1rOKEF69hdb/ydN4k=",
                      "FOUR"
                    )
                : () => joinMorraApplication("FOUR")
            }
          >
            4
          </Button>
        </Col>
        <Col>
          <Button
            onClick={
              !!owner === true
                ? () =>
                    startMorraApplication(
                      "iH6jOGo6bkJFSQmysO4Q3Bovj+L52tfpnU1M7H8WtMg=",
                      "FIVE"
                    )
                : () => joinMorraApplication("FIVE")
            }
          >
            5
          </Button>
        </Col>
      </Row>
    </Container>
  );

  function handleConnectWalletClick() {
    peraWallet
      .connect()
      .then((newAccounts) => {
        peraWallet.connector.on("disconnect", handleDisconnectWalletClick);
        setAccountAddress(newAccounts[0]);
      })
      .catch((error) => {
        if (error?.data?.type !== "CONNECT_MODAL_CLOSED") {
          console.log(error);
        }
      });
  }

  function handleDisconnectWalletClick() {
    peraWallet.disconnect();
    setAccountAddress(null);
  }

  async function optInMorraApp() {
    try {
      // get suggested params
      const suggestedParams = await algod.getTransactionParams().do();

      const actionTx = algosdk.makeApplicationOptInTxn(
        accountAddress,
        suggestedParams,
        appIndex
      );

      const actionTxGroup = [{ txn: actionTx, signers: [accountAddress] }];

      const signedTx = await peraWallet.signTransaction([actionTxGroup]);
      console.log(signedTx);
      const { txId } = await algod.sendRawTransaction(signedTx).do();
      const result = await waitForConfirmation(algod, txId, 2);
    } catch (e) {
      console.error(`There was an error calling the morra app: ${e}`);
    }
  }

  async function startMorraApplication(
    hashedhand = "Tk6O5CNCHChkSojH1nvKFuzrFGbWPl4TxpOBcxaz1tM=",
    hand = "ONE"
  ) {
    try {
      setRealHand(hand);
      // get suggested params
      const suggestedParams = await algod.getTransactionParams().do();
      const appArgs = [
        new Uint8Array(Buffer.from("start")),
        new Uint8Array(Buffer.from(hashedhand, "base64")),
      ];

      // second account
      const accounts = [
        "6T7FXZIEQU7T3TDJZ6PMZ4PREZWDFMLWCVPMAYDGFMZK2ZZQYG5GR4N5MA",
      ];

      let actionTx = algosdk.makeApplicationNoOpTxn(
        accountAddress,
        suggestedParams,
        appIndex,
        appArgs,
        accounts
      );

      let payTx = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        from: accountAddress,
        to: appAddress,
        amount: 100000,
        suggestedParams: suggestedParams,
      });

      let txns = [actionTx, payTx];
      algosdk.assignGroupID(txns);

      const actionTxGroup = [
        { txn: actionTx, signers: [accountAddress] },
        { txn: payTx, signers: [accountAddress] },
      ];

      const signedTxns = await peraWallet.signTransaction([actionTxGroup]);

      console.log(signedTxns);
      const { txId } = await algod.sendRawTransaction(signedTxns).do();
      const result = await waitForConfirmation(algod, txId, 4);
      // checkCounterState();
    } catch (e) {
      console.error(`There was an error calling the morra app: ${e}`);
    }
  }

  async function joinMorraApplication(hand) {
    try {
      // get suggested params
      const suggestedParams = await algod.getTransactionParams().do();
      const appArgs = [
        new Uint8Array(Buffer.from("accept")),
        new Uint8Array(Buffer.from(hand)),
      ];

      const accounts = [
        "UMKIWTPPQ7GSW7GSDDTOEGGRVBHRO66HPC3C2IXXO2E4U4CJFKEABZBWGY",
      ];

      let actionTx = algosdk.makeApplicationNoOpTxn(
        accountAddress,
        suggestedParams,
        appIndex,
        appArgs,
        accounts
      );

      let payTx = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        from: accountAddress,
        to: appAddress,
        amount: 100000,
        suggestedParams: suggestedParams,
      });

      let txns = [actionTx, payTx];
      algosdk.assignGroupID(txns);

      const actionTxGroup = [
        { txn: actionTx, signers: [accountAddress] },
        { txn: payTx, signers: [accountAddress] },
      ];

      const signedTxns = await peraWallet.signTransaction([actionTxGroup]);

      console.log(signedTxns);
      const { txId } = await algod.sendRawTransaction(signedTxns).do();
      const result = await waitForConfirmation(algod, txId, 4);
      // checkCounterState();
    } catch (e) {
      console.error(`There was an error calling the morra app: ${e}`);
    }
  }

  // RESOLVE Morra WINNER
  async function resolveMorraApplication() {
    try {
      // get suggested params
      const suggestedParams = await algod.getTransactionParams().do();
      const appArgs = [
        new Uint8Array(Buffer.from("resolve")),
        new Uint8Array(Buffer.from(realhand)),
      ];

      const accounts = [
        "WF3HWK3UJEKG3BCHDYPGZ5TMW5BWAFBPDBTID6FJQGOOR6XA7MPJ2NWMVM",
      ];

      let actionTx = algosdk.makeApplicationNoOpTxn(
        accountAddress,
        suggestedParams,
        appIndex,
        appArgs,
        accounts
      );

      const actionTxGroup = [{ txn: actionTx, signers: [accountAddress] }];

      const signedTxns = await peraWallet.signTransaction([actionTxGroup]);
      const txns = [signedTxns];

      console.log(signedTxns);

      //const dr = algosdk.createDryrun(algod, txns);

      //test debugging
      //const dryRunResult = await algod.dryrun(dr).do();
      //console.log(dryRunResult);

      const { txId } = await algod.sendRawTransaction(signedTxns).do();
      const result = await waitForConfirmation(algod, txId, 4);
      console.log(result);
    } catch (e) {
      console.error(`There was an error calling the morra app: ${e}`);
    }
  }

  // Clear state
  // {
  //   "txn": {
  //     "apan": 3,
  //     "apid": 51,
  //     "fee": 1000,
  //     "fv": 13231,
  //     "gh": "ALXYc8IX90hlq7olIdloOUZjWfbnA3Ix1N5vLn81zI8=",
  //     "lv": 14231,
  //     "note": "U93ZQy24zJ0=",
  //     "snd": "LNTMAFSF43V7RQ7FBBRAWPXYZPVEBGKPNUELHHRFMCAWSARPFUYD2A623I",
  //     "type": "appl"
  //   }
  // }
}

export default App;
