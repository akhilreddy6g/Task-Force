import {useContext, useEffect} from "react";
import featuresTabHook from "../../Noncomponents";
import Activitytab from "./Activitytab";
import Activityframe from "./ActivityFrame";
import Currentdayactivity from "./Currentdayactivity";
import axios from "axios"

export default function CurrentSchedule(){
    const {state, takeAction} = useContext(featuresTabHook);
    var caData = state.combinedActivityData;
    
    async function alterData(){
        const combinedAct = await axios.get("http://localhost:3000/combined-activities");
        takeAction({type:"changeCombinedActivityData", payload: combinedAct.data})
      };

    function convertTimeToAmPm(time24hr) {
      let [hours, minutes] = time24hr.split(':').map(Number);
      let period = hours < 12 ? 'AM' : 'PM';
      if (hours === 0) {
          hours = 12; 
      } else if (hours > 12) {
          hours -= 12; 
      }
      return `${hours}:${minutes.toString().padStart(2, '0')} ${period}`;
    }
      
    function activityMapping(object, index){
        return <Activitytab
        sno = {index+1}
        id = {object.activity_uuid} 
        key = {object.activity_uuid}
        activity={object.activity_name} 
        startTime={object.activity_start_time.slice(0,5)} 
        endTime={object.activity_end_time.slice(0,5)}  
        priority={object.activity_priority}
        type ={object.activity_type}
        />
    };

    useEffect(() => {
        alterData();
      },[state.updateActivity]);

    if (!caData || caData.length === 0) {
        return <><div className={`scheduleDisclaimer ${state.fthState? "scheduleDisclaimer1" : "scheduleDisclaimer2"}`}><p className="scheduleContext">No schedule to show. Add activities, to view schedule</p></div><Currentdayactivity /></>;
    }
    
    return (
      <>
        <div className={`activityListHView ${state.fthState ? "activityListHView1" : "activityListHView2"}`}>
          {caData.map(activityMapping)}
        </div>
        {caData && caData.length > 0 && (
          <Activityframe
            id={state.csActivityIndex==null? caData[0].activity_uuid: caData[state.csActivityIndex].activity_uuid}
            key={state.csActivityIndex==null? caData[0].activity_uuid: caData[state.csActivityIndex].activity_uuid}
            activity={state.csActivityIndex==null? caData[0].activity_name: caData[state.csActivityIndex].activity_name}
            startTime={state.csActivityIndex==null? caData[0].activity_start_time.slice(0, 5): caData[state.csActivityIndex].activity_start_time.slice(0, 5)}
            endTime={state.csActivityIndex==null? caData[0].activity_end_time.slice(0, 5): caData[state.csActivityIndex].activity_end_time.slice(0, 5)}
            priority={state.csActivityIndex==null? caData[0].activity_priority: caData[state.csActivityIndex].activity_priority}
            notes={state.csActivityIndex==null? caData[0].activity_description : caData[state.csActivityIndex].activity_description}
            type={state.csActivityIndex==null? caData[0].activity_type : caData[state.csActivityIndex].activity_type}
          />
        )}
        <Currentdayactivity />
      </>
    );
}    