import React, { useContext, useRef } from 'react';
import axios from 'axios';
import featuresTabHook from "../../Noncomponents";
import { timeToMinutes } from '../../Noncomponents';

export default function Activity(props) {
  const { state, takeAction } = useContext(featuresTabHook);

  const actNameRef = useRef(null);
  const actStartRef = useRef(null);
  const actEndRef = useRef(null);
  const actPriorityRef = useRef(null);
  const activityRef = useRef(null);
  const editButtonImgRef = useRef(null);
  const editButtonRef = useRef(null);
  const deleteButtonRef = useRef(null);

  async function editActivity(event, id) {
    event.preventDefault();
    takeAction({ type: "changeEditActivityState" });
    if (!state.editActivity) {
      document.body.style.overflow = "hidden";
      const activityElement = activityRef.current;
      activityElement.style.position = "relative";
      activityElement.style.zIndex = 3;
      activityElement.style.backgroundImage = "linear-gradient(to right ,rgb(42, 42, 243), rgba(144, 10, 144, 0.925))";
      actNameRef.current.contentEditable = "true";
      actStartRef.current.contentEditable = "true";
      actEndRef.current.contentEditable = "true";
      actPriorityRef.current.contentEditable = "true";
      deleteButtonRef.current.style.visibility = "hidden";
      editButtonImgRef.current.src = "src/assets/ok.svg";
      editButtonRef.current.style.backgroundColor = "orange";
    } else {
      document.body.style.overflow = "auto";
      const activityElement = activityRef.current;
      activityElement.style.backgroundImage = "none";
      activityElement.style.zIndex = "auto";
      try {
        const actualActivity = (await axios.get(`http://localhost:3000/activity/${id}`)).data[0];
        const actName = actNameRef.current.textContent.trim();
        const actStart = actStartRef.current.textContent.trim();
        const actEnd = actEndRef.current.textContent.trim();
        const actPriority = actPriorityRef.current.textContent.trim();
        const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
        if ((actName !== actualActivity.activity_name || actStart !== actualActivity.activity_start_time || actEnd !== actualActivity.activity_end_time || actPriority !== actualActivity.activity_priority) &&
          actName.length > 0 && timeRegex.test(actStart) && timeRegex.test(actEnd) && !isNaN(actPriority) && actPriority.trim() !== '') {
          const startTimeInMin = timeToMinutes(actStart);
          const endTimeInMin = timeToMinutes(actEnd);
          if(startTimeInMin<endTimeInMin){
          let correctedPriority = actPriority;
          let correctedActName = actName.slice(0, 50);
          correctedPriority = Math.min(Math.max(correctedPriority, 0), 10);
          const data = { actName: correctedActName, actStart: actStart, actEnd: actEnd, actPriority: correctedPriority, id: id};
          try {
            await axios.patch(`http://localhost:3000/edit-activity`, { data });
          } catch (error) {
            console.error("Something went wrong", error);
          }
          actNameRef.current.textContent = correctedActName;
          actStartRef.current.textContent = actStart;
          actEndRef.current.textContent = actEnd;
          actPriorityRef.current.textContent = correctedPriority;
        } else {
          actNameRef.current.textContent = actualActivity.activity_name;
          actStartRef.current.textContent = actualActivity.activity_start_time.slice(0,5);
          actEndRef.current.textContent = actualActivity.activity_end_time.slice(0,5);
          actPriorityRef.current.textContent = actualActivity.activity_priority;
        }
        } else {
          actNameRef.current.textContent = actualActivity.activity_name;
          actStartRef.current.textContent = actualActivity.activity_start_time.slice(0,5);
          actEndRef.current.textContent = actualActivity.activity_end_time.slice(0,5);
          actPriorityRef.current.textContent = actualActivity.activity_priority;
        }
        actNameRef.current.contentEditable = "false";
        actStartRef.current.contentEditable = "false";
        actEndRef.current.contentEditable = "false";
        actPriorityRef.current.contentEditable = "false";
        deleteButtonRef.current.style.visibility = "visible";
        editButtonImgRef.current.src = "src/assets/edit.svg";
        editButtonRef.current.style.backgroundColor = "teal";
      } catch (error) {
        console.error("Something went wrong", error);
      }
    }
  }

  async function deleteActivity(event, id) {
    event.preventDefault();
    const activityElement = activityRef.current;
    document.body.style.overflow = "hidden";
    activityElement.style.backgroundImage = "linear-gradient(to right ,rgb(42, 42, 243), rgba(144, 10, 144, 0.925))";
    const userResponse = await new Promise((resolve) => {
      takeAction({ type: "changeDisclaimerState", payload: true });
      takeAction({ type: "changeDisclaimerButtons" });
      takeAction({ type: "setResolve", payload: resolve });
    });
    document.body.style.overflow = "auto";
    activityElement.style.backgroundImage = "none";
    if (userResponse) {
      try {
        await axios.delete(`http://localhost:3000/delete-activity/${id}`);
      } catch (error) {
        console.error("Something went wrong", error);
      }
    } else {
      console.log("Activity deletion was canceled by user.");
    }
    takeAction({ type: "changeActivityState", payload: false });
  }

  const getBackgroundColor = () => {
    const item = sessionStorage.getItem(props.id);
    if (item) {
        const parsedItem = JSON.parse(item);
        if (parsedItem.action === "complete") {
            return 'green';
        } else if (parsedItem.action === "skip") {
            return 'red';
        }
    }
    if (props.status == "0") {
        return 'red';
    } else if (props.status == "1") {
        return 'green';
    }
    return 'rgb(255, 255, 144)'
};

  return (
    <div className={`soloActivityBar ${state.darkMode ? "soloActivityBarDark" : "soloActivityBarNormal"}`} id={`activity-${props.id}`} ref={activityRef}>
      <div className="activity abid" id="actNo"> <p className="activityContent">{props.sno}</p></div>
      <div className="activity aba" id="actName"> <p className="activityContent editable" ref={actNameRef}>{props.activity}</p> </div>
      <div className="activity ab" id="actStart"> <p className="activityContent editable" ref={actStartRef}>{props.startTime}</p> </div>
      <div className="activity ab" id="actEnd"> <p className="activityContent editable" ref={actEndRef}>{props.endTime}</p> </div>
      <div className="activity ab" id="actPriority"> <p className="activityContent editable" ref={actPriorityRef}>{props.priority}</p> </div>
      <div className="activity ab abstatus"> <div className="activityStatus" style={{backgroundColor:getBackgroundColor()}} ></div></div>
      <button className="modifyIcon" id="editButton" ref={editButtonRef} onClick={(event) => editActivity(event, props.id)}>
        <img id="editButtonImg" className="asset" src="src/assets/edit.svg" alt="edit" ref={editButtonImgRef}/>
      </button>
      <button type="button" className="modifyIcon" id="deleteButton" onClick={(event) => deleteActivity(event, props.id)} ref={deleteButtonRef}>
        <img id="deleteButtonImg" className="asset" src="src/assets/trash.svg" alt="delete"/>
      </button>
    </div>
  );
}