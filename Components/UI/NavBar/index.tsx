import * as React from "react";
import { useRef } from "react";
import {
  BellIcon,
  ChevronDownIcon,
  Check,
  User,
  Unplug,
  Wifi,
  Wallet,
  Moon,
  Sun,
} from "lucide-react";
import { Button } from "../../../src/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../src/components/ui/dropdown-menu";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../src/components/ui/avatar";
import { Badge } from "../../../src/components/ui/badge";
import { cn } from "../../../src/lib/utils";
import useAddress from "../../../store/useAddress";
import { Token } from "../../../utils/token";
import { useQuery } from "@tanstack/react-query";
import {
  get_ao_balance,
  get_ar_balance,
  get_ario_balance,
  get_war_balance,
} from "../../../utils/balance";
import { disconnect } from "../../../utils/wallet";
import Wander from "../../../Image/Wander";
import MetaMask from "../../../Image/MetaMask";
import { useTheme } from "../../../src/theme-provider";

// Simple logo component for the navbar
const Logo = (props: React.SVGAttributes<SVGElement>) => {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 324 323"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect
        x="88.1023"
        y="144.792"
        width="151.802"
        height="36.5788"
        rx="18.2894"
        transform="rotate(-38.5799 88.1023 144.792)"
        fill="currentColor"
      />
      <rect
        x="85.3459"
        y="244.537"
        width="151.802"
        height="36.5788"
        rx="18.2894"
        transform="rotate(-38.5799 85.3459 244.537)"
        fill="currentColor"
      />
    </svg>
  );
};
// Notification Menu Component
const NotificationMenu = ({
  notificationCount = 3,
  onItemClick,
}: {
  notificationCount?: number;
  onItemClick?: (item: string) => void;
}) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 relative rounded-full"
      >
        <BellIcon size={16} />
        {notificationCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
            {notificationCount > 9 ? "9+" : notificationCount}
          </Badge>
        )}
        <span className="sr-only">Notifications</span>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-80">
      <DropdownMenuLabel>Notifications</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={() => onItemClick?.("notification1")}>
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium">New message received</p>
          <p className="text-xs text-muted-foreground">2 minutes ago</p>
        </div>
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => onItemClick?.("notification2")}>
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium">System update available</p>
          <p className="text-xs text-muted-foreground">1 hour ago</p>
        </div>
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => onItemClick?.("notification3")}>
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium">Weekly report ready</p>
          <p className="text-xs text-muted-foreground">3 hours ago</p>
        </div>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={() => onItemClick?.("view-all")}>
        <Check />
        Mark all as read
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);
const formatAddress = (addr: string) => {
  if (addr.length <= 10) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
};

// Reusable hook to fetch a token balance with safe fallbacks
function useBalanceQuery(
  key: string,
  address: string,
  fetcher: (addr: string) => Promise<string>
) {
  return useQuery<string | null>({
    queryKey: [key, address],
    queryFn: async () => {
      if (!address) return null;
      try {
        const v = await fetcher(address);
        return v ?? null;
      } catch {
        return null;
      }
    },
    enabled: !!address,
  });
}
const UserButton = ({
  onItemClick,
  address,
}: {
  onItemClick?: (item: string) => void;
  address: string;
}) => {
  const wallet = useAddress((state) => state.type);
  const ario = useBalanceQuery("ario-balance", address, get_ario_balance);
  const ar = useBalanceQuery("ar-balance", address, get_ar_balance);
  const ao = useBalanceQuery("ao-balance", address, get_ao_balance);
  const war = useBalanceQuery("war-balance", address, get_war_balance);
  const theme = useTheme();
  React.useEffect(() => {
    console.log("Wallet type:", wallet);
  }, [wallet]);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-2 px-3 py-1.5 
             bg-green-100 dark:bg-green-900/30 
             rounded-sm hover:bg-green-200 
             dark:hover:bg-green-900/50"
        >
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <User className="w-4 h-4 text-green-700 dark:text-green-400" />
          <span className="text-xs text-green-600 dark:text-green-500 font-mono">
            {formatAddress(address)}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuItem className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-500 font-mono">
          <div className="flex justify-between w-full items-center">
            <div className="flex items-center gap-2">
              <Wifi className="text-green-500" />
              <span className="font-mono">Connected</span>
            </div>
            {wallet === "wander" ? (
              <Wander className="w-6 h-6" />
            ) : wallet === "metamask" ? (
              <MetaMask className="w-6 h-6" />
            ) : (
              <Wallet className="w-6 h-6" />
            )}
          </div>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <div className="flex justify-between w-full items-center">
            <img
              src={`https://arweave.net/${Token.find((e) => e.symbol === "ARIO")?.logo}`}
              className="w-6 h-6 mr-2"
            />
            <span className="text-sm font-medium">
              {ario.isLoading
                ? "Loading..."
                : ario.data
                  ? (Token.find((e) => e.symbol === "ARIO")?.denomination
                      ? parseFloat(ario.data) /
                        Math.pow(
                          10,
                          Token.find((e) => e.symbol === "ARIO")
                            ?.denomination ?? 1
                        )
                      : parseFloat(ario.data).toFixed(2)) + " $ARIO"
                  : "Failed to fetch"}
            </span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <div className="flex justify-between w-full items-center">
            <img
              src={`https://arweave.net/${Token.find((e) => e.symbol === "wAR")?.logo}`}
              className="w-6 h-6 mr-2"
            />
            <span className="text-sm font-medium">
              {war.isLoading
                ? "Loading..."
                : war.data
                  ? war.data + " $wAR"
                  : "Failed to fetch"}
            </span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <div className="flex justify-between w-full items-center">
            {theme.theme === "dark" ? (
              <img
                src="https://arweave.net/r6TvdrKbdBtWUaCs_m1sT9ce1JWxE4lhJlOOixb_INw"
                className="w-6 h-6 mr-2"
              />
            ) : (
              <img
                src="https://arweave.net/ntfnBJCwLW8nFY083UJCcGYCZt5uUuRBd3szkGoAE6E"
                className="w-6 h-6 mr-2"
              />
            )}
            <span className="text-sm font-medium">
              {ar.isLoading
                ? "Loading..."
                : ar.data
                  ? ar.data + " $AR"
                  : "Failed to fetch"}
            </span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <div className="flex justify-between w-full items-center">
            {theme.theme === "dark" ? (
              <img
                src="https://arweave.net/UVK6iwKDIqAo_vfWIMqIiwV7Qp4mY4y8QPyi2sdrCeo"
                className="w-6 h-6 mr-2"
              />
            ) : (
              <img
                src="https://arweave.net/O-DVZ_sUmrNdZKhgoPrACAsApCUTvMmeyjH_Et_UWi8"
                className="w-6 h-6 mr-2"
              />
            )}
            <span className="text-sm font-medium">
              {ao.isLoading
                ? "Loading..."
                : ao.data
                  ? ao.data + " $AO"
                  : "Failed to fetch"}
            </span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onItemClick?.("notification3")}>
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium">Submit Your Feedback</p>
            <p className="text-xs text-muted-foreground">
              Help us improve by sharing your thoughts!
            </p>
          </div>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => disconnect()} variant="destructive">
          <Unplug />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// User Menu Component
const NotificationCenter = ({
  userName = "John Doe",
  userEmail = "john@example.com",
  userAvatar,
  onItemClick,
}: {
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
  onItemClick?: (item: string) => void;
}) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button
        variant="ghost"
        className="h-9 px-2 py-0 hover:bg-accent hover:text-accent-foreground"
      >
        <Avatar className="h-7 w-7">
          <AvatarImage src={userAvatar} alt={userName} />
          <AvatarFallback className="text-xs">
            {userName
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
        <ChevronDownIcon className="h-3 w-3 ml-1" />
        <span className="sr-only">User menu</span>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-56">
      <DropdownMenuLabel>
        <div className="flex flex-col space-y-1">
          <p className="text-sm font-medium leading-none">{userName}</p>
          <p className="text-xs leading-none text-muted-foreground">
            {userEmail}
          </p>
        </div>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={() => onItemClick?.("profile")}>
        Profile
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => onItemClick?.("settings")}>
        Settings
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => onItemClick?.("billing")}>
        Billing
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={() => onItemClick?.("logout")}>
        Log out
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);
// Types
export interface Navbar09NavItem {
  href?: string;
  label: string;
  icon: React.ComponentType<{
    size?: number;
    className?: string;
    "aria-hidden"?: boolean;
  }>;
}
export interface NavbarProps extends React.HTMLAttributes<HTMLElement> {
  logo?: React.ReactNode;
  logoHref?: string;
  navigationLinks?: Navbar09NavItem[];
  searchPlaceholder?: string;
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
  notificationCount?: number;
  messageIndicator?: boolean;
  onNavItemClick?: (href: string) => void;
  onSearchSubmit?: (query: string) => void;
  onMessageClick?: () => void;
  onNotificationItemClick?: (item: string) => void;
  onUserItemClick?: (item: string) => void;
}

const NavBar = React.forwardRef<HTMLElement, NavbarProps>(
  (
    {
      className,
      logo = <Logo />,
      notificationCount = 3,
      onNotificationItemClick,
      ...props
    },
    ref
  ) => {
    const containerRef = useRef<HTMLElement>(null);
    const address = useAddress((state) => state.address);
    const walletType = useAddress((state) => state.type);
    const { theme, setTheme } = useTheme();

    // Combine refs
    const combinedRef = React.useCallback(
      (node: HTMLElement | null) => {
        containerRef.current = node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      },
      [ref]
    );

    return (
      <header
        ref={combinedRef}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-6 [&_*]:no-underline",
          className
        )}
        {...props}
      >
        <div className="container mx-auto flex h-16 max-w-screen-2xl items-center justify-between gap-4">
          {/* Left side */}
          <div className="flex flex-1 items-center gap-2">
            <div className="flex items-center gap-6">
              <button
                onClick={(e) => e.preventDefault()}
                className="flex items-center space-x-2 text-primary hover:text-primary/90 transition-colors cursor-pointer"
              >
                <div className="text-2xl">{logo}</div>
                <span className="hidden font-bold text-xl sm:inline-block">
                  shadcn.io
                </span>
              </button>
            </div>
          </div>
          {/* Right side */}
          <div className="flex flex-1 items-center justify-end gap-4">
            {/* Theme toggle */}
            <Button
              variant="outline"
              size="icon"
              className="relative h-8 w-8"
              aria-label="Toggle theme"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            <div className="flex items-center gap-2">
              <NotificationMenu
                notificationCount={notificationCount}
                onItemClick={onNotificationItemClick}
              />
            </div>

            {/* Wallet Connection Status */}
            {address && walletType ? (
              <div className="flex items-center gap-2">
                <UserButton address={address} />
              </div>
            ) : (
              <Button size="sm">Connect</Button>
            )}
          </div>
        </div>
      </header>
    );
  }
);
export { Logo, NotificationMenu, NotificationCenter as UserMenu, NavBar };
