import Web3 from "web3";
import React, { useState } from "react";
import { ABI, CONTRACT_ADDRESS } from "./constants/data";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./styles/index.css";
import robinos from "./assets/images/robinos-black-text.png";
function App() {
  const [errorState, setErrorState] = useState(false);
  const [account, setAccount] = useState(null);
  const [allowance, setAllowance] = useState(0);
  const [decimals, setDecimals] = useState(1);
  const [balance, setBalance] = useState(0);

  const [loading, setLoading] = useState(false);
  const [OT, setOT] = useState(0);
  const [YT, setYT] = useState(0);
  const [usdc, setUsdc] = useState(0);
  const [currentDate, setCurrentDate] = useState(null);

  const transferTokens = async () => {
    await erc20Contract()
      .methods.transfer(
        CONTRACT_ADDRESS,
        (Math.pow(10, decimals) * usdc).toString()
      )
      .send({ from: account })
      .on("transactionHash", async (hash) => {
        toast.error("RBN transfer is processing.", {
          position: toast.POSITION.TOP_RIGHT,
        });
      })
      .on("receipt", async (receipt) => {
        checkAllowance();
        toast.success("RBN successful transfer.", {
          position: toast.POSITION.TOP_RIGHT,
        });
      })
      .on("error", async (error) => {
        toast.error("Something went wrong", {
          position: toast.POSITION.TOP_RIGHT,
        });
        console.log("error", error);
      });
  };

  const approveMethod = async () => {
    try {
      const web3 = window.web3;
      let b = web3.utils.toWei('999999999');
     
      await erc20Contract()
        .methods.approve(
          CONTRACT_ADDRESS,
          b
        )
        .send({ from: account })
        .on("transactionHash", async (hash) => {
          toast.error("RBN Approve is processing.", {
            position: toast.POSITION.TOP_RIGHT,
          });
        })
        .on("receipt", async (receipt) => {
          checkAllowance();
          toast.success("RBN successful Approved.", {
            position: toast.POSITION.TOP_RIGHT,
          });
        })
        .on("error", async (error) => {
          toast.error("Something went wrong", {
            position: toast.POSITION.TOP_RIGHT,
          });
          console.log("error", error);
        });
    } catch (error) {
      console.log("approve error",error)
    }
   
  };
  const processTransferTokens = async () => {
    accounts();
    if (account === null) {
      toast.error("Whoops..., Metamask is not connected.", {
        position: toast.POSITION.TOP_RIGHT,
      });
      return;
    } else {
      try {
        await transferTokens();
      } catch (e) {
        console.log("error rejection", e);
      }
    }
  };

  const erc20Contract = () => {
    return new window.web3.eth.Contract(ABI, CONTRACT_ADDRESS);
  };

  const web3 = async () => {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
      return true;
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
      return true;
    } else {
      setErrorState(true);
      toast.error("Whoops..., Metamask is not connected.");
      return false;
    }
  };

  const accounts = async () => {
    const accounts = await window.web3.eth.getAccounts();
    setAccount(accounts[0]);
    return accounts;
  };

  const checkAllowance = async () => {
    const _accounts = await accounts();
    try {
      const _allowance = await erc20Contract()
        .methods.allowance(_accounts[0], CONTRACT_ADDRESS)
        .call();
      const web3 = window.web3;
      let b = web3.utils.fromWei(_allowance);
      setAllowance(b);
    } catch (error) {
      console.log(error);
    }
  };
  const checkBalance = async () => {
    try {
      const _accounts = await accounts();
      const web3 = window.web3;
      const _allowance = await erc20Contract()
        .methods.balanceOf(_accounts[0])
        .call();
      let b = web3.utils.fromWei(_allowance);
      setBalance(b);
    } catch (error) {
      console.log(error);
    }
  };

  const metamask = async () => {
    let isConnected = false;

    try {
      setErrorState(false);

      isConnected = await web3();

      if (isConnected === true) {
        toast.success("Wallet connected", {
          position: toast.POSITION.TOP_RIGHT,
        });

        const decimal = await erc20Contract().methods.decimals().call();
        checkBalance();
        checkAllowance();
        setDecimals(decimal);

        window.ethereum.on("accountsChanged", async (account) => {
          setAccount(account);
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="w-100 overflow-hidden ">
      <ToastContainer />
      <header className="container-fluid header-section overflow-hidden">
        <nav className="navbar navbar-expand custom-nav-container">
       <img src={robinos} alt='Robinos Logo' 
     height={"40px"} />
          <ul className="navbar-nav me-auto ms-auto d-flex align-items-end">
            <li className="nav-item">
              <a className="nav-link header-link" href="#">
                Migration App
              </a>
            </li>
          </ul>
          <button className="header-connect-btn" onClick={() => metamask()}>
            {account
              ? `${account.slice(0, 4)}...${account.slice(
                  account.length - 4,
                  account.length
                )}`
              : "Connect Wallet"}
          </button>
        </nav>
      </header>
      <div className="row p-5">
        <div className="card-container d-flex justify-content-center align-items-center mt-5 col-12 ">
          <div className="card d-flex justify-content-center align-items-center">
            <div className="card-body col-11">
              <div className="row">
                <div className="col-6 me-auto">
                  <span className="card-heading">
                    <b>Migration</b>
                  </span>
                </div>
              </div>
              <div className="row swap-heading ">
                <div className="col-12">
                  <span>
                    {" "}
                    Send your token to contract to recieve $RBN on Telos network{" "}
                  </span>
                </div>
              </div>

              <div className="stake-container bg-light">
                <div className="row">
                  <div className="col-12">
                    <span>Amount</span>
                  </div>
                </div>
                <div className="row">
                  <div className="col-12 pb-3 d-flex align-items-center">
                    <input
                      type="number"
                      style={{ width: "100%" }}
                      id="quantity"
                      name="quantity"
                      value={usdc}
                      onChange={(e) => {
                        setUsdc(e.target.value);
                      }}
                    />
                    <button
                      className="card-connect-btn"
                      style={{ width: "90px" }}
                      onClick={() => setUsdc(balance)}
                    >
                      Max
                    </button>
                  </div>
                </div>
              </div>

              <div className="row mt-4 pt-3">
                <div className="col-12">
                  {account ? (
                    <>
                     {allowance<balance? <button
                        className="card-connect-btn"
                        onClick={() => approveMethod()}
                      >
                        {"Approve"}
                      </button>:
                      <button
                        className="card-connect-btn"
                        onClick={() => processTransferTokens()}
                      >
                        {"Transfer"}
                      </button>}
                    </>
                  ) : (
                    <button className="card-connect-btn" onClick={metamask}>
                      Connect wallet
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
