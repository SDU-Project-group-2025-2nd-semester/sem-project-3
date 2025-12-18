import { useCompanyJoin } from "../hooks/useCompanyJoin";

export default function CompanyJoinPage() {
    const {
        loading,
        error,
        availableCompanies,
        inviteCodes,
        setInviteCodes,
        handleJoin
    } = useCompanyJoin();

    if (loading) {
        return (
        <div className="relative bg-background min-h-screen px-4 pt-20 pb-12">
            <main className="w-full max-w-2xl mx-auto">
                <h1 className="text-xl font-bold text-primary">
                    Please provide the invite code for the company you want to join.
                </h1>
                <p className="mt-4 text-gray-600">Loading companies…</p>
            </main>
        </div>
        );
    }

    return (
        <div className="relative bg-background min-h-screen w-full overflow-x-hidden px-4 pt-20 pb-12">
            <main className="w-full max-w-screen-sm sm:max-w-md md:max-w-3xl lg:max-w-4xl mx-auto">
                <h1 className="text-xl font-bold text-primary">
                    Please provide the invite code for the company you want to join.
                </h1>

                {error && (
                <div className="mt-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded">
                    {error}
                </div>
                )}

                {availableCompanies.length === 0 ? (
                    <p className="mt-6 text-gray-600">
                        No joinable companies found. You are either a member of every available company, or the company does not accept new members by invite code.
                    </p>
                ) : (
                    <ul className="mt-6 space-y-4">
                        {availableCompanies.map((c) => (
                        <li key={c.id} className="p-4 border rounded-md bg-white flex items-start sm:items-center gap-3 overflow-hidden">
                            <span className="flex-1 min-w-0 font-medium text-gray-800 truncate md:whitespace-normal md:break-words">{c.name}</span>
                            <input
                                type="text"
                                placeholder="Invite code"
                                value={inviteCodes[c.id] ?? ""}
                                onChange={(e) => setInviteCodes(prev => ({ ...prev, [c.id]: e.target.value }))}
                                className="border rounded px-3 py-2 text-sm w-32 sm:w-40 md:w-56 flex-shrink-0"
                            />
                            <button
                                onClick={() => handleJoin(c.id)}
                                className="bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent/90 transition shrink-0"
                                >
                                Join
                            </button>
                        </li>
                        ))}
                    </ul>
                )}
            </main>
        </div>
    );
} 