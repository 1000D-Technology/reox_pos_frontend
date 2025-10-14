import { useState } from "react";
import Sidebar from "./Sidebar";
import {Bell, Calculator, ClipboardPlus, PanelLeft, Power, RotateCcw} from "lucide-react";
import {Link, Outlet} from "react-router-dom";


export default function Layout() {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div className="flex h-screen  w-full bg-gradient-to-r from-emerald-50 to-yellow-50 ">
            {/* Sidebar */}
            <Sidebar isOpen={isOpen} toggle={() => setIsOpen(!isOpen)} />

            {/* Main content */}
            <div className="flex-1 flex flex-col pt-3 pe-1 ">
                {/* Header */}
                <header className="h-16  flex items-center px-4 justify-between bg-white/10 backdrop-blur-md rounded-xl">


                            <button
                                onClick={() => setIsOpen(!isOpen)}
                                className="text-gray-400 hover:text-emerald-600 transition hover:cursor-pointer"
                            >
                                <PanelLeft/>
                            </button>


                    <div
                        className="flex items-center  justify-between gap-3 bg-white px-3 py-2  rounded-full ">
                        <Link to={"#"}
                              className="px-7 py-2 bg-gray-800 text-white rounded-full flex items-center gap-4"><ClipboardPlus
                            size={18}/>POS</Link>
                        <div className={'flex items-center gap-3 text-gray-400'}>

                            <Link to={'#'}>
                            <Calculator size={15} />
                            </Link>
                            <Link to={'#'} className={"p-2 rounded-full bg-red-50 "} >
                                <Power size={15}/>
                            </Link>
                            <Link to={'#'} className={"p-2 rounded-full bg-emerald-50"} >
                                <RotateCcw size={15}/>
                            </Link>

                            <Link to={'#'} className={'me-3'}>
                                <Bell size={15} />
                            </Link>
                            <div className={'flex flex-col leading-1 items-end border-s-2 ps-5 border-gray-200'}>
                                <span className="text-sm font-medium text-black">John Doe</span>
                                <br />
                                <span className="text-xs text-gray-500">Admin</span>
                            </div>
                            <div className="w-12 h-12 rounded-full flex justify-center items-center">

                                    <img
                                        src="https://i.pravatar.cc/40?img=1"
                                        alt="user"
                                        className="w-12 h-12 rounded-full"
                                    />


                            </div>
                        </div>

                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto ps-4 pe-1  my-3 me-3 h-full">
                    <Outlet/>
                </main>
            </div>
        </div>
    );
}
