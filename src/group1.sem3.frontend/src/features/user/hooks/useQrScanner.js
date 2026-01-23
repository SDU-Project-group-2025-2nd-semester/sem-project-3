import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getDeskFromMac, createReservation } from "../user.services";
import { useAuth } from "@features/auth/AuthContext";

export function useQrScanner(companyId) {
  const { currentCompany } = useAuth();
  const navigate = useNavigate();

  const [scannedCodes, setScannedCodes] = useState([]);
  const [lookupResults, setLookupResults] = useState([]);
  const [reservationError, setReservationError] = useState(null);

  const handleScan = useCallback(
    async (detectedCodes) => {
      // Normalize input to an array of code objects
      if (!detectedCodes) return;

      let codes = detectedCodes;
      if (!Array.isArray(codes)) {
        if (typeof codes === "string") {
          codes = [{ format: "QR_CODE", rawValue: codes }];
        } else {
          codes = [codes];
        }
      }

      if (!codes.length) return;

      console.log("Detected codes:", codes);
      codes.forEach((code) => {
        console.log(`Format: ${ code.format }, Value: ${ code.rawValue } `);
      });

      setScannedCodes(codes);
      setReservationError(null);

      const COMPANY_ID = companyId ?? currentCompany?.id;

      // If no companyId is provided, skip booking
      if (!COMPANY_ID) {
        setLookupResults([]);
        return;
      }

      // QR contains a MAC address in rawValue; lookup desk id from backend
      const first = codes[0];
      const mac = first?.rawValue;
      if (!mac) return;

      let deskId = null;

      try {
        const res = await getDeskFromMac(COMPANY_ID, mac);

        // Backend may return a GUID (string) or an object
        if (!res) {
          setReservationError("Desk not found for scanned code.");
          return;
        }

        if (typeof res === "string") {
          deskId = res;
        } else {
          deskId = res.id ?? res.deskId ?? res.Id ?? null;
        }

        setLookupResults([res]);
      } catch (e) {
        console.error("Failed to lookup desk id from MAC", e);
        setReservationError("Failed to lookup desk from code");
        return;
      }

      if (!deskId) {
        setReservationError("Could not resolve desk from scanned code");
        return;
      }

      try {
        // Create 1-hour reservation starting now
        const now = new Date();
        const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

        const payload = {
          Start: now.toISOString(),
          End: oneHourLater.toISOString(),
          DeskId: deskId,
        };

        const reservation = await createReservation(COMPANY_ID, payload);

        const reservationId =
          reservation?.id ??
          reservation?.Id ??
          reservation?.reservationId;

        if (reservationId) {
          navigate(`/user/reservation/${reservationId}`);
        } else {
          // Fallback navigation if backend did not return an ID
          navigate("/user/desk", { state: { deskId, reservation } });
        }
      } catch (e) {
        console.error("Failed to create reservation for scanned desk", e);
        setReservationError("Could not reserve desk");
      }
    },
    [companyId, currentCompany, navigate]
  );

  const handleError = useCallback((error) => {
    console.error("QR Scanner Error:", error);
  }, []);

  return {
    scannedCodes,
    lookupResults,
    handleScan,
    handleError,
    reservationError,
  };
}