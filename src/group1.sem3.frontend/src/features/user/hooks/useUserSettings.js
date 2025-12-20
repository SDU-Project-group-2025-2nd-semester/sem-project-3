import { useNavigate } from "react-router-dom";
import { useAuth } from "@features/auth/AuthContext";
import { useUserProfile } from "./useUserProfile";
import { useUserHeight } from "./useUserHeight";
import { useHealthReminder } from "./useHealthReminder";

export function useUserSettings() {
 const { logout } = useAuth();
 const navigate = useNavigate();

 const { profile, setProfile, updateProfile } = useUserProfile();

 const {
 userHeight,
 setUserHeight,
 sittingHeight,
 setSittingHeight,
 standingHeight,
 setStandingHeight,
 sittingChanged,
 standingChanged,
 resetRecommended,
 setSittingChanged,
 setStandingChanged,
 } = useUserHeight(
 profile.userHeight,
 profile.sittingHeight,
 profile.standingHeight
 );

 const {
 pillOption,
 setPillOption,
 healthReminder,
 setHealthReminder,
 } = useHealthReminder(profile.pillOption, profile.healthReminder);

 function handleToggleHealthReminder() {
 const next = !healthReminder;
 setHealthReminder(next);
 setProfile((prev) => ({ ...prev, healthReminder: next }));
 }

 function handleSelectPillOption(option) {
 setPillOption(option);
 setProfile((prev) => ({ ...prev, pillOption: option }));
 }

 const handleSave = async () => {
 return await updateProfile();
 };

 const handleLogout = () => {
 logout();
 navigate("/");
 };

 const handleCancelUserHeight = () => {
 setUserHeight(profile.userHeight ?? "");
 setSittingHeight(profile.sittingHeight ?? "");
 setStandingHeight(profile.standingHeight ?? "");
 setSittingChanged(false);
 setStandingChanged(false);
 setProfile((prev) => ({ ...prev, showUserHeight: false }));
 };

 return {
 profile,
 setProfile,
 userHeight,
 setUserHeight,
 sittingHeight,
 setSittingHeight,
 standingHeight,
 setStandingHeight,
 sittingChanged,
 standingChanged,
 resetRecommended,
 pillOption,
 healthReminder,
 handleToggleHealthReminder,
 handleSelectPillOption,
 handleSave,
 handleLogout,
 handleCancelUserHeight,
 };
}
