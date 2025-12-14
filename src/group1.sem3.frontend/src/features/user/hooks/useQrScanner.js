import { useState, useCallback } from "react";

// Hook for QR scanning
export function useQrScanner() {
    const [scannedCodes, setScannedCodes] = useState([]);

    const handleScan = useCallback((detectedCodes) => {
        if (!detectedCodes || !detectedCodes.length) return;

        console.log("Detected codes:", detectedCodes);
        detectedCodes.forEach(code => {
            console.log(`Format: ${code.format}, Value: ${code.rawValue}`);
        });

        setScannedCodes(detectedCodes);
    }, []);

    const handleError = useCallback((error) => {
        console.error("QR Scanner Error:", error);
    }, []);

    return { scannedCodes, handleScan, handleError };
}
