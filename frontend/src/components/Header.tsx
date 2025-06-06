import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { ThemeToggle } from "./ThemeToggle";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { forceLogout } from "@/lib/auth-utils";
import logoImage from "/logo.png"

export default function Header() {
  const { logout, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const handleLogout = async () => {
    console.log('Header logout clicked');
    try {
      // First try the normal logout
      await logout();
    } catch (error) {
      console.error('Normal logout failed, using force logout:', error);
      // If normal logout fails, force logout
      forceLogout('Header logout failed');
    }
  };

  return (
    <div className="flex items-center h-16 gap-1 border-b-1 justify-between w-full">
      <div className="flex items-center gap-1 z-[1000]">
        <div className="md:hidden block text-2xl font-bold">
          <div className="rounded-full overflow-hidden ml-2">
            <img
              src={logoImage}
              alt="Invoice Management Logo"
              className="w-24 h-12 object-cover rounded-[1000px] overflow-hidden "
              loading="eager"
              width={64}
              height={64}
            />
          </div>
        </div>
        <div className="md:hidden">
          <button onClick={() => setIsOpen(!isOpen)} className="p-4 dark:text-white">
            <div className="w-6 h-0.5 bg-black dark:bg-white mb-1"></div>
            <div className="w-6 h-0.5 bg-black dark:bg-white mb-1"></div>
            <div className="w-6 h-0.5 bg-black dark:bg-white"></div>
          </button>
          <nav className={`bg-black/80 backdrop-blur-lg text-white fixed top-0 left-0 h-full w-64 max-w-full z-50 overflow-y-auto max-h-screen transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="flex flex-col gap-6 p-4 pt-8">
              {user?.role === "admin" && (
                <Link
                  onClick={() => setIsOpen(false)}
                  className={`${location.pathname === '/' ? 'font-semibold underline underline-offset-4' : 'text-neutral-500'}`}
                  to="/"
                >
                  Dashboard
                </Link>
              )}
              <Link
                onClick={() => setIsOpen(false)}
                className={`${location.pathname === '/inventory' ? 'font-semibold underline underline-offset-4' : 'text-neutral-500'}`}
                to="/inventory"
              >
                Inventory
              </Link>
              <Link
                onClick={() => setIsOpen(false)}
                className={`${location.pathname === '/billing' ? 'font-semibold underline underline-offset-4' : 'text-neutral-500'}`}
                to="/billing"
              >
                Billing
              </Link>
              <Link
                onClick={() => setIsOpen(false)}
                className={`${location.pathname === '/invoice' ? 'font-semibold underline underline-offset-4' : 'text-neutral-500'}`}
                to="/invoice"
              >
                Invoice
              </Link>
              <Link
                onClick={() => setIsOpen(false)}
                className={`${location.pathname === '/customer' ? 'font-semibold underline underline-offset-4' : 'text-neutral-500'}`}
                to="/customer"
              >
                Customer
              </Link>
              {user?.role === "admin" && (
                <Link
                  onClick={() => setIsOpen(false)}
                  className={`${location.pathname === '/admin' ? 'font-semibold underline underline-offset-4' : 'text-neutral-500'}`}
                  to="/admin"
                >
                  Admin
                </Link>
              )}
            </div>
          </nav>
        </div>

      </div>
      <header className="w-screen z-10 flex justify-end items-center text-2xl lg:px-8 pr-8 lg:pr-18 sticky top-0 dark:bg-[#09090b] bg-white/90 backdrop-blur-3xl">
        <div className="flex gap-4 z-10 justify-center items-center">
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Avatar className="cursor-pointer">
                <AvatarImage src="https://github.com/shadcn.png" alt="User profile" />
                <AvatarFallback>
                  {user?.username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="mr-12">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>

              <div className="flex items-center gap-3 px-4 py-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 font-bold text-lg">
                  {user?.email?.[0]?.toUpperCase() || "U"}
                </div>
                <div className="flex flex-col">
                  <span className="text-base font-medium text-gray-800 dark:text-white">{user?.email}</span>
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{user?.username}</span>
                  <span className="text-xs font-semibold text-blue-500 uppercase tracking-wide">{user?.role}</span>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>Sign Out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
    </div>
  );
}
