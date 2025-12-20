import { useState, useCallback } from "react";
import { useNavigate } from 'react-router-dom';
import { getDeskFromMac } from "../user.services";

// Hook for QR scanning
export function useQrScanner(companyId) {
    const navigate = useNavigate();
    const [scannedCodes, setScannedCodes] = useState([]);
    const [lookupResults, setLookupResults] = useState([]);

    const handleScan = useCallback(async (detectedCodes) => {
        if (!detectedCodes || !detectedCodes.length) return;

        console.log("Detected codes:", detectedCodes);
        detectedCodes.forEach(code => {
            console.log(`Format: ${code.format}, Value: ${code.rawValue}`);
        });

        setScannedCodes(detectedCodes);

        // If no companyId is provided, skip lookup (tests and scanning without company should not call API)
        if (!companyId) {
            setLookupResults([]);
            return;
        }

        // Lookup all codes in parallel
        const lookups = detectedCodes.map(async (code) => {
            try {
                const res = await getDeskFromMac(companyId, code.rawValue ?? "");
                return res;
            } catch (e) {
                console.error("Lookup failed for code", code, e);
                return null;
            }
        });

        const results = await Promise.all(lookups);
        setLookupResults(results);

        if (results.length ===1 && results[0] && (results[0].id || results[0].deskId)) {
            const deskId = results[0].id ?? results[0].deskId;
            navigate('/user/desk', { state: { deskId } });
        }
    }, [companyId, navigate]);

    const handleError = useCallback((error) => {
        console.error("QR Scanner Error:", error);
    }, []);

    return { scannedCodes, lookupResults, handleScan, handleError };
}
