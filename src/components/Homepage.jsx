import { Link } from "react-router-dom";
import React from 'react';
import { getDocs, collection } from "firebase/firestore";
import db from "../firebase/firebase";

export default function Homepage(){
    const [recordCount, setRecordCount] = React.useState(0);

    React.useEffect(() => {
      const fetchRecordCount = async () => {
        try {
          const recordsCollection = collection(db, "user");
          const querySnapshot = await getDocs(recordsCollection);
  
          setRecordCount(querySnapshot.size);
        } catch (error) {
          console.error("Error fetching record count:", error);
        }
      };
  
      fetchRecordCount();
    }, []);
    return (
        <div className="outerBox">
            <div className="records">
                <h3>Number of Records</h3>
                <input type="text" value={recordCount} disabled/>
            </div>

            <div className="button-container">
                <button className="button create"><Link className="linkDecoration" to="/CreateRecord">Create Record</Link></button>
                <button className="button view"><Link className="linkDecoration" to="/ViewRecords" >View Records</Link> </button>
            </div>
        </div>
    )
}