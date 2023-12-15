import React from "react";
import db from "../firebase/firebase";
import { collection, getDocs } from "firebase/firestore";
import { doc, deleteDoc } from "firebase/firestore";
import { getStorage, deleteObject, ref } from "firebase/storage";
import { Link } from "react-router-dom";

export default function ViewRecords() {
  const [getUser, setGetUser] = React.useState([]);

  React.useEffect(() => {
    const fetchdata = async () => {
      const list = [];
      try {
        const querySnapshot = await getDocs(collection(db, "user"));
        querySnapshot.forEach((doc) => {
          // doc.data() is never undefined for query doc snapshots
          // console.log(doc.data());
          list.push({ id: doc.id, ...doc.data() });
        });
        setGetUser(list);
      } catch (error) {
        console.log(error);
      }
    };
    fetchdata();
  }, []);

  function trimImgUrl(url) {
    const startIndex = url.indexOf("o/") + "o/".length;
    const endIndex = url.indexOf("?");

    const trimmedUrl = url.substring(startIndex, endIndex);
    const decodedUrl = decodeURIComponent(trimmedUrl.replace(/\%20/g, " "));
    const location = `gs://test-session-578e5.appspot.com/${decodedUrl}`;
    return location;
  }

  function trimFileUrl(url) {
    const start2FIndex = url.indexOf("o/") + "o/".length;
    const endQuestionMarkIndex = url.indexOf("?");

    const trimmedUrl = url.substring(start2FIndex, endQuestionMarkIndex);
    const decodedUrl = decodeURIComponent(trimmedUrl.replace(/\%20/g, " "));
    const location = `gs://test-session-578e5.appspot.com/${decodedUrl}`;
    return location;
  }

  const deleteRecord = async (user) => {
    const storage = getStorage();

    const imgUrl = `${user.img}`;
    const resumeUrl = `${user.resume}`;

    // console.log(imgUrl);
    // console.log(resumeUrl);

    const imgTrimUrl = trimImgUrl(imgUrl);
    const resTrimUrl = trimFileUrl(resumeUrl);

    // console.log(imgTrimUrl);
    // console.log(resTrimUrl);

    try {
      await deleteDoc(doc(db, "user", user.id));
      setGetUser((prevUser) => prevUser.filter((u) => u.id !== user.id));
      await Promise.all([
      deleteObject(ref(storage, imgTrimUrl)),
      deleteObject(ref(storage, resTrimUrl)),
      ]);
    } catch (error) {
      console.log(error);
    }
    // console.log(user.id);
    // console.log(user);
  };

  return (
    <>
      <div className="tableContainer">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>pic</th>
              <th>Name</th>
              <th>contact</th>
              <th>address</th>
              <th>qualification</th>
              {/* <th>resume</th> */}
              <th>options</th>
            </tr>
          </thead>
          <tbody>
            {getUser.map((user, index) => (
              <tr key={user.id}>
                <td>{index + 1}</td>
                <td>
                  <img className="tableImage" src={user.img} alt="" />
                </td>
                <td>{user.name}</td>
                <td>{user.contact}</td>
                <td>{user.address}</td>
                <td>
                  <ul>
                    {user.qualifications.map((qualification, index) => (
                      <li key={index}>{qualification.qualification},</li>
                    ))}
                  </ul>
                </td>
                {/* <th>
                  <button>view</button>
                </th> */}
                <td className="tableButton">
                  <button>
                    <Link
                      className="linkDecoration"
                      to={`/ViewRecords/${user.id}/Edit`}
                    >
                      edit
                    </Link>
                  </button>
                  <button onClick={() => deleteRecord(user)}>delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
