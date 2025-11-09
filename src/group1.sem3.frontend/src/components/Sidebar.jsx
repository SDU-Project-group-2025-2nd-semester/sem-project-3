import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Icon from "@reacticons/bootstrap-icons";

export default function Sidebar({isOpen}) {
    const { currentUser } = useAuth();
    const location = useLocation(); // necessary for viewing URL 

    // Hide sidebar on login and signup pages
    const hiddenPaths = ["/", "/signuppage"];
    if (hiddenPaths.includes(location.pathname)) return null;
    // if (!currentUser) return null; // Don't show sidebar if not logged in

    const role = currentUser.role;

    if (role === "admin") return null; // Don't show sidebar for Admin (for now)

    const companies = ["Company A", "Company B", "Company C"]; // For now

    const [showCompanies, setShowCompanies] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState(companies[0]); // Default selection

    function handleCompanySelect(company) {
        setSelectedCompany(company);
        setShowCompanies(false); // Close list after selection
    }

    return (
        <aside className={`fixed top-16 left-0 h-screen bg-gray-100 shadow p-4 transition-all duration-300 ${isOpen ? "w-30 sm:w-48 md:w-48 lg:w-48" : "w-13 sm:w-16 md:w-16 lg:w-16"}`}>   
    
            {/* Profile Link */}         
            <Link to={`/${role}/settings`} className="group flex items-center mb-4 hover:text-blue-600">
                <Icon name="person" className="mr-2" />
                {isOpen ? (
                    <span>Profile</span>
                ) : (
                    <span className="absolute left-full ml-2 bg-white shadow px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        Profile
                    </span>
                )}
            </Link>

            {/* Company Section */}
            <div className="mb-4">
                <button onClick={() => setShowCompanies(!showCompanies)} className="group flex items-center hover:text-blue-600">
                    <Icon name="building" className="mr-2" />
                    {isOpen ? (
                        <span>{selectedCompany}</span>
                    ) : (
                        <span className="absolute left-full ml-2 bg-white shadow px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            {selectedCompany}
                        </span>
                    )}
                </button>
                {showCompanies && isOpen && (
                    <ul className="mt-2 ml-6 list-disc">
                        {companies.map((company, index) => (
                            <li key={index} onClick={() => handleCompanySelect(company)} className="hover:text-blue-500 cursor-pointer">
                                {company}
                            </li>    
                        ))}
                    </ul>
                )}
            </div>

            {/* Statistics (only for user) */}
            {role === "user" && (
                <Link to="/user/statistics" className="group flex items-center hover:text-blue-600">
                {/* No such page yet */}     
                    <Icon name="bar-chart" className="mr-2" />
                    {isOpen ? (
                        <span>Statistics</span>
                    ) : (
                        <span className="absolute left-full ml-2 bg-white shadow px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            Statistics
                        </span>
                    )}
                </Link>
            )}
        </aside>
    );
}