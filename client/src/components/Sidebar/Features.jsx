import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Feature from "./Feature";
import featuresTabHook from "../Noncomponents";
import Userprofile from "./Userprofile";
import useSignOut from 'react-auth-kit/hooks/useSignOut';
import { apiUrl } from "../Noncomponents";

export default function Features() {
    let { state, takeAction } = useContext(featuresTabHook);
    const signOut = useSignOut();
    const navigate = useNavigate();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    async function handleLogout(e) {
        e.preventDefault();
        takeAction({ type: "changeCurrentAction", payload: "logout?" });
        
        const userResponse = await new Promise((resolve) => {
            takeAction({ type: "changeDisclaimerState", payload: true });
            takeAction({ type: "changeDisclaimerButtons" });
            takeAction({ type: "setResolve", payload: resolve });
        });

        if (userResponse) {
            setIsLoggingOut(true);
            takeAction({ type: "changeInitialComponentsState", payload: false });
            await apiUrl.post('/logout');
            sessionStorage.clear();
            signOut();
            navigate("/login");
        } else {
            console.log("Logout Cancelled by the User");
            setIsLoggingOut(false);
        }
    };

    return (
        <div className={`featureContainer ${state.fthState ? "featureContainer1" : "featureContainer2"}`}>
            {isLoggingOut ? (
                <div className="loadingScreen">
                    <h2>Logging you out...</h2>
                </div>
            ) : (
                <div className={`background ${state.darkMode && "backgdarkMode"}`}>
                    <Userprofile id="0" title="userPicture" src="src/assets/user.svg" />
                    <Feature id="1" featureName="currentSchedule" title="Current Schedule" show="cs" path="/current-schedule" />
                    <Feature id="2" featureName="dailyActivities" title="Daily Activities" show="da" path="/daily-activities" />
                    <Feature id="3" featureName="quickActivitySession" title="Quick Session" show="qa" path="/quick-session" />
                    <Feature id="4" featureName="trendsNProgress" title="Trends & Progress" show="tnp" path="/trends-and-progress" />
                    <Feature id="5" featureName="missedActivities" title="Missed Activities" show="ma" path="/missed-activities" />
                    <Feature id="6" featureName="planAhead" title="Plan Ahead" show="pa" path="/plan-ahead" />
                    <Feature id="7" featureName="setYourDay" title="Set Your Day" show="syd" path="/set-your-day" />
                </div>
            )}
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                <button 
                    className="submitActivity" 
                    onClick={(event) => { handleLogout(event) }} 
                    style={{ width: "100px", height: "30px", fontSize: "16px", position: "fixed", top: "90vh" }}
                >
                    Log Out
                </button>
            </div>
        </div>
    );
}
