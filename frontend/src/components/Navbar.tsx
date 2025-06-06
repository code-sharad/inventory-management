import { Link, Outlet, useLocation } from "react-router-dom"
import Header from "./Header"
import { useAuth } from "@/contexts/AuthContext";
import {
    BarChart3,
    Package,
    Receipt,
    FileText,
    Users,
    Settings
} from "lucide-react";
import logoImage from "/logo.png"

export default function Navbar() {
    const location = useLocation()
    const { user } = useAuth();

    return (
        <div className="flex gap-1 z-10 overflow-x-hidden w-full">
            <div className="hidden md:block inset-y-0 z-[1000] left-0 w-52 max-w-full border-r dark:bg-zinc-900 bg-zinc-50">
                {/* <Header /> */}
                <div>
                    <div className="flex items-center justify-center p-2">
                        <div className="rounded-full overflow-hidden mr-2 scale-125">
                            <img
                                src={logoImage}
                                alt="Invoice Management Logo"
                                className="w-16 h-12 object-cover rounded-[1000px] overflow-hidden "
                                loading="eager"
                                width={64}
                                height={64}
                            />
                        </div>
                        <h1 className="text-lg font-bold dark:text-white text-gray-900">Invoice Management</h1>
                    </div>
                </div>
                <nav className="flex flex-col text-md pl-4 pt-8 gap-6 ">
                    {user?.role === "admin" && (
                        <Link className={`${location.pathname === '/' ? 'font-semibold underline underline-offset-4' : 'text-neutral-500'} flex items-center gap-3`} to={"/"}>
                            <BarChart3 className="w-5 h-5" />
                            Dashboard
                        </Link>
                    )}
                    <Link className={`${location.pathname === '/inventory' ? 'font-semibold underline underline-offset-4  transition-all' : 'text-neutral-500'} flex items-center gap-3`} to={"/inventory"}>
                        <Package className="w-5 h-5" />
                        Inventory
                    </Link>
                    <Link className={`${location.pathname === '/billing' ? 'font-semibold  transition-all underline underline-offset-4' : 'text-neutral-500'} flex items-center gap-3`} to={"/billing"}>
                        <Receipt className="w-5 h-5" />
                        Billing History
                    </Link>
                    <Link className={`${location.pathname === '/invoice' ? 'font-semibold  transition-all underline underline-offset-4' : 'text-neutral-500'} flex items-center gap-3`} to={"/invoice"}>
                        <FileText className="w-5 h-5" />
                        Invoice Maker
                    </Link>
                    <Link className={`${location.pathname === '/customer' ? 'font-semibold  transition-all underline underline-offset-4' : 'text-neutral-500'} flex items-center gap-3`} to={"/customer"}>
                        <Users className="w-5 h-5" />
                        Customer
                    </Link>
                    {user?.role === "admin" && (
                        <Link className={`${location.pathname === '/admin' ? 'font-semibold  transition-all underline underline-offset-4    ' : 'text-neutral-500'} flex items-center gap-3`} to={"/admin"}>
                            <Settings className="w-5 h-5" />
                            Admin
                        </Link>
                    )}
                </nav>
            </div>
            <div className="flex-1 min-h-screen overflow-y-auto w-full">
                <div className="mt-0 pt-0">
                    <Header />

                    <Outlet />
                </div>
            </div>
        </div>
    )
}