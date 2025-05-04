import { Link, Outlet, useLocation } from "react-router-dom"
import Header from "./Header"

export default function Navbar() {
    const location = useLocation()
    return (
        <div className="flex gap-1 overflow-x-hidden w-full">
            <div className="hidden md:block inset-y-0 z-[1000] left-0 w-52 max-w-full border-r dark:bg-zinc-900 bg-zinc-50">
                {/* <Header /> */}
                <div>
                    <div className="flex items-center justify-between p-4">
                        <h1 className="text-lg font-bold dark:text-white text-gray-900">My App</h1>

                    </div>
                </div>
                <nav className="flex flex-col text-md pl-4 pt-8 gap-6 ">
                    <Link className={`${location.pathname === '/dashboard' ? 'font-semibold underline' : 'text-neutral-500'}`} to={"/"}>Dashboard</Link>
                    <Link className={`${location.pathname === '/inventory' ? 'font-semibold ' : 'text-neutral-500'}`} to={"/inventory"}>Inventory</Link>
                    <Link className={`${location.pathname === '/billing' ? 'font-semibold' : 'text-neutral-500'}`} to={"/billing"}>Billing History</Link>
                    <Link className={`${location.pathname === '/invoice' ? 'font-semibold' : 'text-neutral-500'}`} to={"/invoice"}>Create Invoice</Link>
                    <Link className={`${location.pathname === '/customer' ? 'font-semibold' : 'text-neutral-500'}`} to={"/customer"}>Create Customer</Link>
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