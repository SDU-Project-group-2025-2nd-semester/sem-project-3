import Card from "@shared/ui/Card";
import Input from "@shared/ui/Input";
import Button from "@shared/ui/Button";
import FloatingActionButton from "@shared/ui/FloatingActionButton";
import NotificationBanner from "@shared/ui/NotificationBanner";
import { useBooking } from "../hooks/useBooking";

export default function BookingPage() {
    const {
        todayStr,
        dateInput,
        selectedDate,
        openRooms,
        desks,
        selectedRoom,
        selectedTable,
        startTime,
        endTime,
        startOptions,
        endOptions,
        isDeskFullyBooked,
        loadingRooms,
        desksLoading,
        reservationsLoading,
        bookingSubmitting,
        bookingError,
        canBook,
        availabilityLabel,
        handleDateChange,
        handleSelectRoom,
        handleSelectDesk,
        setStartTime,
        setEndTime,
        handleBook,
    } = useBooking();

    return (
        <div className="min-h-screen px-4 pt-24 pb-32">
            <Input
                type="date"
                value={dateInput}
                min={todayStr}
                onChange={handleDateChange}
            />

            {selectedDate && (
                <Card>
                    {loadingRooms ? (
                        "Loading rooms…"
                    ) : (
                        openRooms.map((r) => (
                            <Button
                                key={r.id}
                                onClick={() => handleSelectRoom(r)}
                                variant={
                                    selectedRoom?.id === r.id
                                        ? "primary"
                                        : "ghost"
                                }
                            >
                                {r.readableId}
                            </Button>
                        ))
                    )}
                </Card>
            )}

            {selectedRoom && (
                <Card>
                    {desksLoading || reservationsLoading ? (
                        "Loading desks…"
                    ) : (
                        desks.map((d) => {
                            const full = isDeskFullyBooked(d.id);
                            return (
                                <Button
                                    key={d.id}
                                    disabled={full}
                                    onClick={() =>
                                        !full && handleSelectDesk(d)
                                    }
                                    variant={
                                        selectedTable?.id === d.id
                                            ? "primary"
                                            : "ghost"
                                    }
                                >
                                    {d.readableId}
                                </Button>
                            );
                        })
                    )}
                </Card>
            )}

            {selectedTable && (
                <>
                    <Card>
                        <div className="text-sm text-gray-700 bg-white rounded-lg px-4 py-2 shadow mb-4">
                            <span className="font-medium">Available this day: </span>
                            {availabilityLabel}
                        </div>

                        <div className="flex flex-row gap-4">
                            <select
                                value={startTime}
                                onChange={(e) => {
                                    setStartTime(e.target.value);
                                    setEndTime("");
                                }}
                                className="px-4 py-2 rounded-lg border border-primary bg-white text-primary font-medium shadow flex-1"
                            >
                                <option value="">From</option>
                                {startOptions.map((t) => (
                                    <option key={t} value={t}>
                                        {t}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                className={`px-4 py-2 rounded-lg border border-primary text-primary font-medium shadow flex-1 ${
                                    !startTime || !endOptions.length
                                        ? "bg-gray-200 cursor-not-allowed text-gray-500"
                                        : "bg-white hover:bg-secondary/90"
                                }`}
                                disabled={!startTime}
                            >
                                <option value="">To</option>
                                {endOptions.map((t) => (
                                    <option key={t} value={t}>
                                        {t}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </Card>
                </>
            )}

            {bookingError && (
                <NotificationBanner type="error">
                    {bookingError}
                </NotificationBanner>
            )}

            <FloatingActionButton
                disabled={!canBook || bookingSubmitting}
                onClick={handleBook}
            >
                {bookingSubmitting ? "Booking…" : "Book"}
            </FloatingActionButton>
        </div>
    );
}
