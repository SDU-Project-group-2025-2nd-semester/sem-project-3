import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@features/auth/AuthContext";
import { getReservations, getAllDesks, getRooms } from "../admin.services";

export function useHealthStatsManager(viewMode, viewType) {
 const navigate = useNavigate();
 const { currentCompany } = useAuth();

 const [loading, setLoading] = useState(true);
 const [error, setError] = useState(null);
 const [reservations, setReservations] = useState([]);
 const [desks, setDesks] = useState([]);
 const [rooms, setRooms] = useState([]);
 const [chartData, setChartData] = useState([]);

 const fetchData = useCallback(async () => {
 try {
 setLoading(true);
 setError(null);

 if (!currentCompany?.id) {
 throw new Error("No company selected");
 }

 const [reservationsData, desksData, roomsData] = await Promise.all([
 getReservations(currentCompany.id),
 getAllDesks(currentCompany.id),
 getRooms(currentCompany.id),
 ]);

 setReservations(reservationsData || []);
 setDesks(desksData || []);
 setRooms(roomsData || []);
 } catch (err) {
 console.error("Error fetching data:", err);
 setError(err?.message || String(err));
 if (String(err?.message).includes("401") || String(err?.message).includes("Unauthorized") || String(err?.message).includes("company")) {
 setTimeout(() => navigate("/"),2000);
 }
 } finally {
 setLoading(false);
 }
 }, [currentCompany, navigate]);

 useEffect(() => {
 if (currentCompany?.id) fetchData();
 }, [currentCompany, fetchData]);

 // Timeout fallback: if loading takes too long, show timeout error
 useEffect(() => {
 const timeout = setTimeout(() => {
 if (loading) {
 setLoading(false);
 setError("Request timeout - please try again");
 }
 },10000);
 return () => clearTimeout(timeout);
 }, [loading]);

 const processChartData = useCallback(() => {
 const data = [];

 if (viewType === "company") {
 if (viewMode === "daily") {
 for (let i =6; i >=0; i--) {
 const date = new Date();
 date.setDate(date.getDate() - i);
 date.setHours(0,0,0,0);

 const dayReservations = reservations.filter((r) => {
 const resDate = new Date(r.start);
 return resDate.toDateString() === date.toDateString();
 });

 const totalHours = dayReservations.reduce((sum, r) => {
 const duration = (new Date(r.end) - new Date(r.start)) / (1000 *60 *60);
 return sum + duration;
 },0);

 data.push({
 name: date.toLocaleDateString("en-GB", { day: "numeric", weekday: "short", month: "short" }),
 total: Math.round(totalHours *100) /100,
 reservations: dayReservations.length,
 });
 }
 } else if (viewMode === "weekly") {
 for (let i =3; i >=0; i--) {
 const weekStart = new Date();
 weekStart.setDate(weekStart.getDate() - i *7 - weekStart.getDay());
 weekStart.setHours(0,0,0,0);

 const weekEnd = new Date(weekStart);
 weekEnd.setDate(weekEnd.getDate() +7);

 const weekReservations = reservations.filter((r) => {
 const resDate = new Date(r.start);
 return resDate >= weekStart && resDate < weekEnd;
 });

 const totalHours = weekReservations.reduce((sum, r) => {
 const duration = (new Date(r.end) - new Date(r.start)) / (1000 *60 *60);
 return sum + duration;
 },0);

 data.push({
 name: `${weekStart.toLocaleDateString("en-GB", { month: "short", day: "numeric" })}`,
 total: Math.round(totalHours *100) /100,
 reservations: weekReservations.length,
 });
 }
 } else if (viewMode === "monthly") {
 for (let i =5; i >=0; i--) {
 const monthStart = new Date();
 monthStart.setMonth(monthStart.getMonth() - i);
 monthStart.setDate(1);
 monthStart.setHours(0,0,0,0);

 const monthEnd = new Date(monthStart);
 monthEnd.setMonth(monthEnd.getMonth() +1);

 const monthReservations = reservations.filter((r) => {
 const resDate = new Date(r.start);
 return resDate >= monthStart && resDate < monthEnd;
 });

 const totalHours = monthReservations.reduce((sum, r) => {
 const duration = (new Date(r.end) - new Date(r.start)) / (1000 *60 *60);
 return sum + duration;
 },0);

 data.push({
 name: monthStart.toLocaleDateString("en-GB", { month: "short", year: "numeric" }),
 total: Math.round(totalHours *100) /100,
 reservations: monthReservations.length,
 });
 }
 }
 } else if (viewType === "room") {
 rooms.forEach((room) => {
 const roomDesks = desks.filter((d) => d.roomId === room.id);
 const roomDeskIds = new Set(roomDesks.map((d) => d.id));
 const roomReservations = reservations.filter((r) => roomDeskIds.has(r.deskId));

 const totalHours = roomReservations.reduce((sum, r) => {
 const duration = (new Date(r.end) - new Date(r.start)) / (1000 *60 *60);
 return sum + duration;
 },0);

 data.push({
 name: room.readableId || `Room ${room.id}`,
 total: Math.round(totalHours *100) /100,
 reservations: roomReservations.length,
 });
 });
 } else if (viewType === "desk") {
 desks.forEach((desk) => {
 const deskReservations = reservations.filter((r) => r.deskId === desk.id);

 const totalHours = deskReservations.reduce((sum, r) => {
 const duration = (new Date(r.end) - new Date(r.start)) / (1000 *60 *60);
 return sum + duration;
 },0);

 data.push({
 name: desk.readableId || `Desk ${desk.id}`,
 total: Math.round(totalHours *100) /100,
 reservations: deskReservations.length,
 });
 });
 }

 setChartData(data);
 }, [reservations, desks, rooms, viewMode, viewType]);

 useEffect(() => {
 processChartData();
 }, [processChartData]);

 const getTotalDeskTime = useCallback(() => {
 return reservations.reduce((sum, r) => {
 const duration = (new Date(r.end) - new Date(r.start)) / (1000 *60 *60);
 return sum + duration;
 },0);
 }, [reservations]);

 return {
 loading,
 error,
 reservations,
 desks,
 rooms,
 chartData,
 fetchData,
 getTotalDeskTime,
 };
}
