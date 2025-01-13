"use-client";
import React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Menu,
  Coins,
  Leaf,
  Search,
  Bell,
  User,
  ChevronDown,
  LogIn,
  LogOut,
  Earth,
} from "lucide-react";

import { Badge } from "./ui/badge";
import { Web3Auth } from "@web3auth/modal";
import { CHAIN_NAMESPACES, IProvider, WEB3AUTH_NETWORK } from "@web3auth/base";
import {
  EthereumPrivateKeyProvider,
  EthereumPrivateProvider,
} from "@web3auth/ethereum-provider";
import { cosineDistance } from "drizzle-orm";
import { log } from "console";
import {
  createUser,
  getUnreadNotifications,
  getUserBalance,
  getUserByEmail,
  markNotificationAsRead,
} from "../../utils/db/action";

const clientId = process.env.WEB3_AUTH_CLIENT_ID;

if (!clientId) {
  throw new Error(
    "WEB3_AUTH_CLIENT_ID is not defined. Please set the environment variable."
  );
}

const chainConfig = {
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  chainId: "0xaa36a7",
  rpcTarget: "https://rpc.ankr.com/eth_sepolia",
  displayName: "Sepolia Testnet",
  blockExplorerUrl: "https://explorer-sepolia.ankr.com/",
  ticker: "ETH",
  tickerName: "Etherum",
  logo: "https://assets.web3auth.io/evm-chains/sepolia.png",
};

const privateKeyProvider = new EthereumPrivateKeyProvider({
  config: { chainConfig },
});
const web3auth = new Web3Auth({
  clientId,
  web3AuthNetwork: WEB3AUTH_NETWORK.TESTNET, // Changed from SAPPHIRE_MAINNET to TESTNET
  privateKeyProvider,
});

interface HeaderProps {
  onMenuClick: () => void;
  totalEarnings: number;
}

// type Props = {};

const Header = ({ onMenuClick, totalEarnings }: HeaderProps) => {
  const [provider, setProvider] = useState<IProvider | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [notification, setNotification] = useState<Notification[]>([]);
  const [balance, setBalance] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    let isMounted = true; // Track if the component is mounted

    const init = async () => {
      try {
        if (!clientId) {
          throw new Error("WEB3_AUTH_CLIENT_ID is not defined");
        }

        await web3auth.initModal();

        if (isMounted) {
          setProvider(web3auth.provider);

          if (web3auth.connected) {
            setLoggedIn(true);
            const user = await web3auth.getUserInfo();
            setUserInfo(user);

            if (user.email) {
              localStorage.setItem("userEmail", user.email);
              try {
                await createUser(user.email, user.name || "Anonymous User");
              } catch (error) {
                console.error("Error creating user:", error);
                // Optionally, display a user-friendly message here
              }
            }
          }
        }
      } catch (error) {
        console.error("Error initializing Web3Auth:", error);
        // Optionally, implement further error handling or user notifications
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    init();

    return () => {
      isMounted = false; // Cleanup function to set isMounted to false
    };
  }, []);

  useEffect(() => {
    const fetchnotifications = async () => {
      if (userInfo && userInfo.email) {
        const user = await getUserByEmail(userInfo.email);
        if (user) {
          const unreadNotifications = await getUnreadNotifications(user.id);
          setNotification(unreadNotifications);
        }
      }
    };
    fetchnotifications();
    const notificationInterval = setInterval(fetchnotifications, 30000);
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

    const handleBalanceUpdate = (event: CustomEvent) => {
      setBalance(event.detail);
    };

    window.addEventListener(
      "balanceUpdate",
      handleBalanceUpdate as EventListener
    );

    return () => {
      window.removeEventListener(
        "balanceUpdate",
        handleBalanceUpdate as EventListener
      );
    };
  }, [userInfo]);

  const login = async () => {
    if (!web3auth) {
      console.log("Web3Auth is not intialized");
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
        try {
          await createUser(user.email, user.name || "Anonymous User");
        } catch (error) {
          console.error("Error creating user:", error);
        }
      }
    } catch (error) {
      console.error("Error logging in:", error);
    }
  };

  const logout = async () => {
    if (!web3auth) {
      console.log("Web3Auth is not intialized");
      return;
    }
    try {
      await web3auth.logout();
      setProvider(null);
      setLoggedIn(false);
      setUserInfo(null);
      localStorage.removeItem("userEmail");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const getUserInfo = async () => {
    if (!web3auth.connected) {
      const user = await web3auth.getUserInfo();
      setUserInfo(user);
      if (user.email) {
        localStorage.setItem("userEmail", user.email);
        try {
          await createUser(user.email, user.name || "Anonymous User");
        } catch (error) {
          console.error("Error creating user:", error);
        }
      }
    }
  };

  const handleNotificationClick = async (notificationId: number) => {
    await markNotificationAsRead(notificationId);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="mr-2  md:mr-4"
            onClick={onMenuClick}
          >
            <Menu className="h-6 w-6" />
          </Button>
          <Link className="flex items-center" href="/">
            <Earth className="h-6 w-6 text-primary md:w-8 text-green-500 mr-1 md:mr-2" />
            <span className="text-xl font-bold">Nirmal Earth</span>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
