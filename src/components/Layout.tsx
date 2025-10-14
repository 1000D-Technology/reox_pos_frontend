 import { useState } from "react";
import Sidebar from "./Sidebar";
import {Bell, Calculator, ClipboardPlus, PanelLeft, Power, RotateCcw} from "lucide-react";
import {Link, Outlet} from "react-router-dom";

// Remove the StokeInvoice import since we'll render it in the QuotationList component
// import StokeInvoice from "./StokeInvoice"; 

export default function Layout() {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div className="flex h-screen w-full bg-gradient-to-r from-emerald-50 to-yellow-50">
            {/* Sidebar */}
            <Sidebar isOpen={isOpen} toggle={() => setIsOpen(!isOpen)} />

            {/* Main content */}
            <div className="flex-1 flex flex-col pt-3 pe-1">
                {/* Header */}
                <header className="h-16 flex items-center px-4 justify-between bg-white/10 backdrop-blur-md rounded-xl">
                    {/* ...existing header content */}
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto ps-4 pe-1 my-3 me-3 h-full">
                    <Outlet/>
                </main>
            </div>
            {/* Remove StokeInvoice from here */}
            {/* <StokeInvoice/> */}
        </div>
    );
}