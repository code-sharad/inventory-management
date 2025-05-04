import { Link, Outlet, useLocation } from "react-router-dom"
import Header from "./Header"
import { useState } from "react";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation()
    return (
        <div className="flex gap-1 overflow-x-hidden w-full">
            <div className="hidden md:block inset-y-0 z-[1000] left-0 w-52 max-w-full border-r bg-zinc-50">
                <Header />
                <nav className="flex flex-col text-md pl-4 pt-8 gap-6 ">
                    <Link className={`${location.pathname === '/dashboard' ? 'font-semibold underline' : 'text-neutral-500'}`} to={"/"}>Dashboard</Link>
                    <Link className={`${location.pathname === '/inventory' ? 'font-semibold ' : 'text-neutral-500'}`} to={"/inventory"}>Inventory</Link>
                    <Link className={`${location.pathname === '/billing' ? 'font-semibold' : 'text-neutral-500'}`} to={"/billing"}>Billing History</Link>
                    <Link className={`${location.pathname === '/invoice' ? 'font-semibold' : 'text-neutral-500'}`} to={"/invoice"}>Create Invoice</Link>
                    <Link className={`${location.pathname === '/customer' ? 'font-semibold' : 'text-neutral-500'}`} to={"/customer"}>Create Customer</Link>
                </nav>
            </div>
            <div className="flex-1 min-h-screen overflow-y-auto w-full">
                <div className="m-4 pt-12">
                    {/* <Header /> */}
                    <div className="md:hidden ">
                    <button onClick={() => setIsOpen(!isOpen)} className="p-4">
                        <div className="w-6 h-0.5 bg-black mb-1"></div>
                        <div className="w-6 h-0.5 bg-black mb-1"></div>
                        <div className="w-6 h-0.5 bg-black"></div>
                    </button>
                        <nav className={`bg-black/80 backdrop-blur-lg text-white fixed top-0 left-0 h-full w-64 max-w-full z-50 overflow-y-auto max-h-screen transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                        <div className="flex flex-col gap-6 p-4 pt-8">
                            <Link 
                                onClick={() => setIsOpen(false)}
                                className={`${location.pathname === '/dashboard' ? 'font-semibold' : 'text-neutral-500'}`} 
                                to="/"
                            >
                                Dashboard
                            </Link>
                            <Link 
                                onClick={() => setIsOpen(false)}
                                className={`${location.pathname === '/inventory' ? 'font-semibold' : 'text-neutral-500'}`} 
                                to="/inventory"
                            >
                                Inventory
                            </Link>
                            <Link 
                                onClick={() => setIsOpen(false)}
                                className={`${location.pathname === '/billing' ? 'font-semibold' : 'text-neutral-500'}`} 
                                to="/billing"
                            >
                                Billing
                            </Link>
                            <Link 
                                onClick={() => setIsOpen(false)}
                                className={`${location.pathname === '/invoice' ? 'font-semibold' : 'text-neutral-500'}`} 
                                to="/invoice"
                            >
                                Invoice
                            </Link>
                            <Link 
                                onClick={() => setIsOpen(false)}
                                className={`${location.pathname === '/customer' ? 'font-semibold' : 'text-neutral-500'}`} 
                                to="/customer"
                            >
                                Customer
                            </Link>
                        </div>
                    </nav>
                </div>
                    <Outlet />
                </div>
            </div>
        </div>
    )
}