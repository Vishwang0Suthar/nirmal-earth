"use-client";
import React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "./ui/button";
import { formatDistanceToNow } from "date-fns";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Menu,
  Coins,
  Search,
  Bell,
  User,
  ChevronDown,
  LogIn,
  Earth,
} from "lucide-react";
// import { OpenloginAdapter } from "@web3auth/openlogin";

import { Badge } from "./ui/badge";
import { Web3Auth } from "@web3auth/modal";
import { CHAIN_NAMESPACES, IProvider, WEB3AUTH_NETWORK } from "@web3auth/base";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
// import { cosineDistance, is } from "drizzle-orm";
// import { log } from "console";
import {
  createUser,
  getRecentTransactions,
  getUnreadNotifications,
  getUserBalance,
  getUserByEmail,
  markNotificationAsRead,
} from "../utils/db/action";
import useMediaQuery from "@/hooks/useMediaQuery";

// const openloginAdapter = new OpenloginAdapter({
//   privateKeyProvider,
//   adapterSettings: {
//     uxMode: "redirect",
//   },
// });

const clientId =
  "BJKdDFkNtkWX87XqkuWrDu4rbkSvWyQZ5lswS0ucINxxcN0inRVW8zzKAywPPzgiOHP7_3PcfFwfpvcQvSdaLRs";

const chainConfig = {
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  chainId: "0xaa36a7",
  rpcTarget: "https://rpc.ankr.com/eth_sepolia",
  displayName: "Ethereum Sepolia Testnet",
  blockExplorerUrl: "https://sepolia.etherscan.io",
  ticker: "ETH",
  tickerName: "Ethereum",
  logo: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
};

const privateKeyProvider = new EthereumPrivateKeyProvider({
  config: { chainConfig },
});

const web3auth = new Web3Auth({
  clientId,
  web3AuthNetwork: WEB3AUTH_NETWORK.TESTNET, // Changed from SAPPHIRE_MAINNET to TESTNET
  privateKeyProvider,
});

type Transaction = {
  id: number;
  type: "earned_report" | "earned_collect" | "redeemed";
  amount: number;
  description: string;
  date: string;
  user: string;
};

type Notification = {
  id: number;
  message: string;
  created_at: string; // Assuming it's an ISO date string
};

interface HeaderProps {
  onMenuClick: () => void;
  totalEarnings: number;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const [provider, setProvider] = useState<IProvider | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  // console.log("user info", userInfo);

  useEffect(() => {
    const init = async () => {
      try {
        await web3auth.initModal();
        setProvider(web3auth.provider);
        console.log(provider);

        if (web3auth.connected) {
          setLoggedIn(true);
          const user = await web3auth.getUserInfo();
          setUserInfo(user);

          if (user.email) {
            localStorage.setItem("userEmail", user.email);

            try {
              // First check if user exists
              const existingUser = await getUserByEmail(user.email);

              // Only create user if they don't exist
              if (!existingUser) {
                await createUser(user.email, user.name || "Anonymous User");
              }
            } catch (error) {
              // Check if error is not the unique constraint error
              if (
                !(
                  error instanceof Error &&
                  error.message.includes("unique constraint")
                )
              ) {
                console.error("Error handling user data:", error);
              }
            }
          }
        }
      } catch (error) {
        console.error("Error initializing Web3Auth:", error);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (userInfo && userInfo.email) {
        const user = await getUserByEmail(userInfo.email);
        if (user) {
          const unreadNotifications = await getUnreadNotifications(user.id);
          setNotifications(unreadNotifications);
        }
      }
    };

    fetchNotifications();

    // Set up periodic checking for new notifications
    const notificationInterval = setInterval(fetchNotifications, 30000); // Check every 30 seconds

    return () => clearInterval(notificationInterval);
  }, [userInfo]);

  useEffect(() => {
    const fetchUserBalance = async () => {
      if (userInfo && userInfo.email) {
        const user = await getUserByEmail(userInfo.email);
        if (user) {
          const userBalance = await getUserBalance(user.id);
          setBalance(userBalance);
        }
      }
    };

    fetchUserBalance();

    // Add an event listener for balance updates
    const handleBalanceUpdate = (event: CustomEvent<number>) => {
      setBalance(event.detail);
    };

    window.addEventListener(
      "balanceUpdated",
      handleBalanceUpdate as EventListener
    );

    return () => {
      window.removeEventListener(
        "balanceUpdated",
        handleBalanceUpdate as EventListener
      );
    };
  }, [userInfo]);

  const login = async () => {
    if (!web3auth) {
      console.log("web3auth not initialized yet");
      return;
    }
    try {
      const web3authProvider = await web3auth.connect();
      setProvider(web3authProvider);
      setLoggedIn(true);
      const user = await web3auth.getUserInfo();
      setUserInfo(user);
      if (user.email) {
        localStorage.setItem("userEmail", user.email);

        // Check if the user already exists before creating a new one
        const existingUser = await getUserByEmail(user.email);
        if (!existingUser) {
          try {
            await createUser(user.email, user.name || "Anonymous User");
          } catch (error) {
            console.error("Error creating user:", error);
          }
        } else {
          console.log("User already exists.");
        }
      }
    } catch (error) {
      console.error("Error during login:", error);
    }
  };

  const logout = async () => {
    if (!web3auth) {
      console.log("web3auth not initialized yet");
      return;
    }
    try {
      await web3auth.logout();
      setProvider(null);
      setLoggedIn(false);
      setUserInfo(null);
      localStorage.removeItem("userEmail");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  // const getUserInfo = async () => {
  //   if (web3auth.connected) {
  //     const user = await web3auth.getUserInfo();
  //     setUserInfo(user);
  //     if (user.email) {
  //       localStorage.setItem("userEmail", user.email);
  //       try {
  //         await createUser(user.email, user.name || "Anonymous User");
  //       } catch (error) {
  //         console.error("Error creating user:", error);
  //         // Handle the error appropriately, maybe show a message to the user
  //       }
  //     }
  //   }
  // };

  useEffect(() => {
    const fetchRecentTransaction = async () => {
      setLoading(true);
      try {
        const fetchedTransaction = await getRecentTransactions();
        setTransactions(fetchedTransaction as Transaction[]);
      } catch (error) {
        console.error("Error fetching user data and rewards:", error);
      }
    };
    fetchRecentTransaction();
  }, []);

  const handleNotificationClick = async (notificationId: number) => {
    await markNotificationAsRead(notificationId);
    setNotifications((prevNotifications) =>
      prevNotifications.filter(
        (notification) => notification.id !== notificationId
      )
    );
  };

  if (loading) {
    return <div>Loading Web3Auth...</div>;
  }

  return (
    <header className="bg-white flex flex-col sticky top-0 z-50">
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-2">
        <div className="flex items-center ">
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              className="mr-2  md:mr-4"
              onClick={onMenuClick}
            >
              <Menu className="h-6 w-6 text-gray-800" />
            </Button>
          )}
          <Link className="flex items-center " href="/">
            <Earth className="h-6 w-6 text-primary md:w-8 text-green-500 mr-1 md:mr-2" />
            {!isMobile && (
              <span className="text-xl md:text-2xl font-bold">
                Nirmal Earth
              </span>
            )}
          </Link>
        </div>
        {/* {!isMobile && (
          <div className="flex-1  max-w-xl mx-4">
            <div className=" relative ">
              <input
                type="text"
                placeholder="Search"
                className="w-full  transition-all peer px-4 py-2 border border-gray-300 rounded-full focus:border-none shadow-inner focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <Search className="absolute transition-all peer-focus:text-gray-300 right-3 top-1/2 h-6 w-6 transform -translate-y-1/2 text-gray-800" />
            </div>
          </div>
        )} */}
        <div className="flex items-center">
          {/* {isMobile && (
            <Button variant="ghost" size="icon" className="mr-2 ">
              <Search className="h-5 w-5 text-gray-800" />
            </Button>
          )} */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="mr-2 relative">
                <Bell className="h-6 w-6 text-gray-800" />
                {notifications.length > 0 && (
                  <Badge
                    className="absolute -top-1 -right-1 px-1 min-w-[1.2rem] h-5"
                    variant="destructive"
                    // size="sm"
                  >
                    {notifications.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              {notifications.length > 0 ? (
                notifications.map((notification: Notification) => (
                  <DropdownMenuItem
                    key={notification.id}
                    className="flex items-center justify-between px-4 py-2 hover:bg-gray-100"
                    onClick={() => handleNotificationClick(notification.id)}
                  >
                    <span className="text-sm">{notification.message}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(notification.created_at).toLocaleDateString()}
                    </span>
                  </DropdownMenuItem>
                ))
              ) : (
                <DropdownMenuItem className="px-4 py-2">
                  <span className="text-sm text-gray-500">
                    No new notifications
                  </span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="flex border-2 border-green-800 hover:shadow-3xl duration-300 hover:shadow-green-300 items-center gap-2 bg-gray-100 rounded-full px-2 md:px-3 py-1 mr-2 md:mr-4">
            <Coins className="h-4 md:h-5 w-4 md:w-5 text-green-400" />
            <span className="text-sm font-semibold md:text-base text-gray-800">
              {balance.toFixed(2)} {!isMobile && `points`}
            </span>
          </div>
          {!loggedIn ? (
            <Button
              variant="ghost"
              className="mr-2 text-white hover:text-white bg-green-600 hover:bg-green-700 flex  text-sm md:text-base md:mr-4"
              onClick={login}
            >
              <p>Login</p>
              <LogIn className="ml-1 md:ml-2 h-4 w-4 md:h-5 md:w-5 text-white" />
            </Button>
          ) : (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="mr-2 flex items-center"
                  >
                    <User className="h-6 w-6 text-gray-800" />
                    <ChevronDown className="h-4 w-4 text-gray-800" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuItem className="px-4 py-2">
                    <span className="text-sm text-gray-500">
                      {userInfo ? userInfo.name : "Profile"}
                    </span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="px-4 py-2">
                    <span className="text-sm text-gray-500">
                      <Link href={"/settings"}>Settings</Link>
                    </span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout} className="px-4 py-2">
                    <span className="text-sm text-gray-500">Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>
      <div className="bg-green-700 h-fit w-full">
        {/*  */}
        <marquee behavior="scroll" direction="left" scrollamount="5">
          <div className="text-[#FFFBCA] items-center font-mono z-50 flex">
            {transactions.length > 0 ? (
              transactions.slice(0, 6).map((transaction, index) => (
                <React.Fragment key={index}>
                  <p className="">
                    {transaction.user.replace("@gmail.com", "")}{" "}
                    {transaction.type === "earned_report"
                      ? "earned"
                      : transaction.type === "redeemed"
                      ? "redeemed"
                      : transaction.type === "earned_collect"
                      ? "collected"
                      : ""}{" "}
                    {transaction.amount}-points{" "}
                    {formatDistanceToNow(new Date(transaction.date), {
                      addSuffix: true,
                    })}
                  </p>
                  <pre className=""> | </pre>
                </React.Fragment>
              ))
            ) : (
              <p>No transactions found</p>
            )}
          </div>
        </marquee>
        {/* </marquee> */}
      </div>
    </header>
  );
}
