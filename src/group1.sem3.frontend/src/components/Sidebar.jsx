import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Icon from "@reacticons/bootstrap-icons";
export default function Sidebar({ isOpen, onClose }) {
    const { currentUser } = useAuth();
    const location = useLocation();
    if (["/", "/signuppage"].includes(location.pathname)) return null;

    const role = currentUser?.role;

    const companies = ["Company A", "Company B", "Company C"];
    const [showCompanies, setShowCompanies] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState(companies[0]);

    function handleCompanySelect(company) {
        setSelectedCompany(company);
        setShowCompanies(false);
    }

    // Role --> menu configuration
    const menuByRole = {
        0: [
            { to: `/user/settings`, icon: "person", label: "Profile" },
            { to: `/user/statistics`, icon: "bar-chart", label: "Statistics" },
        ],
        1: [
            { to: `/staff/settings`, icon: "person", label: "Profile" },
        ],
        2: [
            { to: `/admin/usersManager`, icon: "people", label: "Users" },
            { to: `/admin/profilesManager`, icon: "clock", label: "Profiles" },
            { to: `/admin/desksManager`, icon: "grid", label: "Desks" },
            { to: `/admin/healthStatsManager`, icon: "bar-chart", label: "Statistics" },
            { to: `/admin/damagesManager`, icon: "exclamation-triangle", label: "Damages" }, 
        ],
    };

    const menuItems = menuByRole[role] ?? [];

    return (
        <>
            {/* Overlay background */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40"
                    onClick={onClose}
                ></div>
            )}

            <aside
                className={`fixed top-0 left-0 h-screen bg-white shadow-lg transition-transform duration-300 z-50 
                    ${isOpen ? "translate-x-0 w-64" : "-translate-x-full w-64"}`}
            >
                <div className="p-4 pt-20">

                    {menuItems.map((item) => (
                        <Link
                            key={item.to}
                            to={item.to}
                            className="group flex items-center mb-4 hover:text-blue-600"
                            onClick={onClose}
                        >
                            <Icon name={item.icon} className="mr-2" />
                            <span>{item.label}</span>
                        </Link>
                    ))}

                    {(role === "0" || role === "1") && (
                        <div className="mb-4">
                            <button
                                onClick={() => setShowCompanies(!showCompanies)}
                                className="group flex items-center hover:text-blue-600"
                            >
                                <Icon name="building" className="mr-2" />
                                <span>{selectedCompany}</span>
                            </button>
                            {showCompanies && (
                                <ul className="mt-2 ml-6 list-disc">
                                    {companies.map((company) => (
                                        <li
                                            key={company}
                                            onClick={() => { handleCompanySelect(company); onClose(); }}
                                            className="hover:text-blue-500 cursor-pointer"
                                        >
                                            {company}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}
                </div>
            </aside>
        </>
    );
}
