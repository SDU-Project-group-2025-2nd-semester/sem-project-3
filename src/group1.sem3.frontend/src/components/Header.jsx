import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Icon from '@reacticons/bootstrap-icons';

export default function Header({ toggleSidebar }) {
    const { currentUser } = useAuth();

    // Profile moved to Sidebar
    const showSidebarIcon = currentUser && (currentUser.role === "user" || currentUser.role === "staff");
    const showScanner = currentUser && currentUser.role === "user";
    const showHomepageLink = currentUser && (currentUser.role === "user" || currentUser.role === "staff");


    return (
        <header className="w-full bg-white shadow px-4 py-2 flex items-center fixed top-0 left-0 z-50">
            {showSidebarIcon ? (
                <button
                    onClick={toggleSidebar}
                    className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center hover:bg-gray-400"
                >
                    <Icon name="list" className="w-6 h-6 text-black" />
                </button>
            ) : (
                <div className="w-8 h-8"></div>
            )}

            <div className="flex-1 flex justify-center">
                {showHomepageLink ? (
                    <Link
                        to={`/${currentUser.role}/homepage`}
                        className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center"
                    >
                        <Icon name="image" className="w-8 h-8 text-black" />    
                    </Link>
                ) : (
                    <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                        <Icon name="image" className="w-8 h-8 text-black" />
                    </div>
                )}
            </div>

            <div className="ml-auto">
                {showScanner ? (
                    /* 
                    <Link
                        to="/scan"
                        className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-400"
                    >
                        <span className="text-white font-bold">S</span>
                    </Link> */
                        <Icon name="upc-scan" className="w-8 h-8 text-black hover:text-gray-600 cursor-pointer" />
                ) : (
                    <div className="w-8 h-8"></div>
                )}
            </div>
        </header>
    );
}
