import * as React from "react";
import { useRef } from "react";
import { MailIcon, BellIcon, ChevronDownIcon } from "lucide-react";
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
import { disconnect } from "../../../utils/wallet";

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
        variant="ghost"
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
        View all notifications
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);
// User Menu Component
const UserMenu = ({
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
      userName = "John Doe",
      userEmail = "john@example.com",
      userAvatar,
      notificationCount = 3,
      messageIndicator = true,
      onMessageClick,
      onNotificationItemClick,
      onUserItemClick,
      ...props
    },
    ref
  ) => {
    const containerRef = useRef<HTMLElement>(null);
    const address = useAddress((state) => state.address);
    const walletType = useAddress((state) => state.type);

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

    const handleDisconnect = async () => {
      try {
        await disconnect();
      } catch (error) {
        console.error("Failed to disconnect wallet:", error);
      }
    };

    const formatAddress = (addr: string) => {
      if (addr.length <= 10) return addr;
      return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    };

    return (
      <header
        ref={combinedRef}
        className={cn(
          "sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-6 [&_*]:no-underline",
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
            <div className="flex items-center gap-2">
              {/* Messages */}
              <Button
                size="icon"
                variant="ghost"
                className="text-muted-foreground relative size-8 rounded-full shadow-none"
                aria-label="Open messages"
                onClick={(e) => {
                  e.preventDefault();
                  if (onMessageClick) onMessageClick();
                }}
              >
                <MailIcon size={16} aria-hidden={true} />
                {messageIndicator && (
                  <div
                    aria-hidden={true}
                    className="bg-primary absolute top-0.5 right-0.5 size-1 rounded-full"
                  />
                )}
              </Button>
              {/* Notification menu */}
              <NotificationMenu
                notificationCount={notificationCount}
                onItemClick={onNotificationItemClick}
              />
            </div>

            {/* Wallet Connection Status */}
            {address && walletType ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 rounded-full">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs font-medium text-green-700 dark:text-green-400">
                    {walletType === "arconnect" ? "ArConnect" : "MetaMask"}
                  </span>
                  <span className="text-xs text-green-600 dark:text-green-500 font-mono">
                    {formatAddress(address)}
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDisconnect}
                  className="text-xs"
                >
                  Disconnect
                </Button>
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
export { Logo, NotificationMenu, UserMenu, NavBar };
