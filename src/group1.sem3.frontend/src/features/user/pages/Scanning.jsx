import { Scanner } from '@yudiel/react-qr-scanner';
import { Link } from "react-router-dom";
import Button from "@shared/ui/Button";
import { useQrScanner } from "../hooks/useQrScanner";

export default function Scanning() {
    const { scannedCodes, handleScan, handleError } = useQrScanner();

    return (
        <div className="pt-24 pl-1 pr-1">
            <Scanner
                onScan={handleScan}
                onError={handleError}
            />

            <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2">
                <Link to="/user/homepage">
                    <Button variant="danger">Stop</Button>
                </Link>
            </div>
        </div>
    );
}
