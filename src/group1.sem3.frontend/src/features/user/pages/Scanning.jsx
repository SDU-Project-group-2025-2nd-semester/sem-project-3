import { Scanner } from '@yudiel/react-qr-scanner';
import { Link } from "react-router-dom";
export default function Scanning() {
    const handleScan = (detectedCodes) => {
        console.log('Detected codes:', detectedCodes);
        detectedCodes.forEach(code => {
            console.log(`Format: ${code.format}, Value: ${code.rawValue}`);
        });
    };

    return (
        <div className="pt-24 pl-1 pr-1">
            <div>
            <Scanner
                onScan={handleScan}
                onError={(error) => console.error(error)}
            />
            </div>
            <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2">
                <Link
                    to="/user/homepage"
                    className="px-6 py-3 text-white bg-red-500 rounded-2xl"
                >
                    Stop
                </Link>
            </div>

        </div>
    );

}