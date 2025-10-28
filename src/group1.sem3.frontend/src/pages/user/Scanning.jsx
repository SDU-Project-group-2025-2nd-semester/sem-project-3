import { Scanner } from '@yudiel/react-qr-scanner';
export default function Scanning() {
    const handleScan = (detectedCodes) => {
        console.log('Detected codes:', detectedCodes);
        detectedCodes.forEach(code => {
            console.log(`Format: ${code.format}, Value: ${code.rawValue}`);
        });
    };

    return (
        <Scanner
            onScan={handleScan}
            onError={(error) => console.error(error)}
        />
    );

}