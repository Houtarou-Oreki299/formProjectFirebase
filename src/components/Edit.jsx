import React from "react";
import db from "../firebase/firebase";
import { deleteObject, getStorage, ref } from "firebase/storage";
import { storage } from "../firebase/firebase";
import { uploadBytesResumable, getDownloadURL } from "firebase/storage";
import {
  setDoc,
  doc,
  updateDoc,
  getDocs,
  collection,
  getDoc,
  deleteDoc,
} from "firebase/firestore";
import { useParams } from "react-router-dom";
import { Navigate } from "react-router-dom";

function Edit() {
  const { id } = useParams();
  const [isUploading, setIsUploading] = React.useState(false);
  // console.log(id);
  const [userData, setUserData] = React.useState({
    name: "",
    address: "",
    contact: "",
    email: "",
    DOB: "",
    qualifications: [],
  });

  console.log(userData);

  const [imgFile, setimgFile] = React.useState();
  const [resumeFile, setResumeFile] = React.useState();
  const [imgURL, setImgUrl] = React.useState();
  const [resumeUrl, setResumeUrl] = React.useState();

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const userDoc = await getDoc(doc(db, "user", id));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
          setImgUrl(userDoc.data().img);
          setResumeUrl(userDoc.data().resume);
          // console.log(userDoc.data());
          // console.log(imgURL);
          // console.log(resumeUrl);
        } else {
          console.log("User not found");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchData();
  }, [id]);

  const addField = (e) => {
    e.preventDefault();
    setUserData((prevData) => ({
      ...prevData,
      qualifications: [...prevData.qualifications, { qualification: "" }],
    }));
  };

  const removeField = (index, e) => {
    e.preventDefault();
    let updatedQualifications = [...userData.qualifications];
    updatedQualifications.splice(index, 1);
    setUserData((prevData) => ({
      ...prevData,
      qualifications: updatedQualifications,
    }));
  };

  const handleChangeDynamic = (index, event) => {
    const { name, value } = event.target;
    const updatedQualifications = [...userData.qualifications];
    updatedQualifications[index] = {
      ...updatedQualifications[index],
      [name]: value,
    };
    setUserData((prevData) => ({
      ...prevData,
      qualifications: updatedQualifications,
    }));
  };

  function handleChange(e) {
    if (e.target.name == "img" || e.target.name == "resume") {
      return;
    }
    setUserData({
      ...userData,
      [e.target.name]: e.target.value,
    });
    // console.log("handleChange - userData:", userData);
  }

  //   console.log(userData);---
  async function handelUpdate(e) {
    e.preventDefault();
    setIsUploading(true);

    let imageURL = imgURL;
    let resumeURL = resumeUrl;

    try {
      // Upload image and resume to Firebase Storage
      if (imgFile) {
        const imageURL = await uploadFile("images", imgFile, id);
        setImgUrl(imageURL);
      }
      if (resumeFile) {
        const resumeURL = await uploadFile("resumes", resumeFile, id);
        setResumeUrl(resumeURL);
      }

      // console.log("handelUpdate - resumeUrl:", resumeUrl); ///state vala
      // console.log("handelUpdate - imgUrl", imgURL); //state vala

      // console.log("handelUpdate - imageURL:", imageURL); ///update vala
      // console.log("handelUpdate - resumeURL:", resumeURL); //update vala
      setUserData((prev) => ({
        ...prev,
        img: imageURL,
        resume: resumeURL,
      }));
      // console.log("handelUpdate - userData:", userData);

      const dataRef = doc(db, "user", id);

      updateDoc(dataRef, {
        img: imageURL,
        resume: resumeURL,
        name: userData.name,
        address: userData.address,
        contact: userData.contact,
        email: userData.email,
        DOB: userData.DOB,
        qualifications: userData.qualifications,
      })
        .then(() => {
          console.log("document updated");
          window.alert("Updated the data");
          setIsUploading(false);
        })
        .catch((error) => {
          console.log(error);
        });
      // });
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  }

  const uploadFile = async (folderName, file) => {
    const storageRef = ref(storage, `${folderName}/${id}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log("Upload is " + progress + "% done");
          switch (snapshot.state) {
            case "paused":
              console.log("Upload is paused");
              break;
            case "running":
              console.log("Upload is running");
              break;
          }
        },
        (error) => {
          console.error(error);
          reject(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref)
            .then((downloadURL) => {
              resolve(downloadURL);
            })
            .catch((error) => {
              reject(error);
            });
        }
      );
    });
  };

  async function viewResume(){

  }

  return (
    <>
      <form onSubmit={(e) => handelUpdate(e)}>
        <div className="editOuterContainer">
          <div className="editPicture">
            {imgFile ? (
              <img src={URL.createObjectURL(imgFile)} alt="" />
            ) : imgURL ? (
              <img src={imgURL} alt="" />
            ) : (
              <img src="/user.png" alt="" />
            )}
            <input
              name="img"
              type="file"
              accept="image/*"
              onChange={(e) => setimgFile(e.target.files[0])}
            />
          </div>
          <div>
            <button><a href={userData.resume} target="_blank">view resume</a></button>
          </div>
          <div>
            <label htmlFor="Name">Name: </label>
            <input
              name="name"
              type="text"
              id="Name"
              value={userData.name}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="Address">Address: </label>
            <input
              name="address"
              type="text"
              id="Address"
              value={userData.address}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="Contact">Contact: </label>
            <input
              name="contact"
              type="text"
              id="Contact"
              value={userData.contact}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="EmailId">Email ID: </label>
            <input
              name="email"
              type="text"
              id="EmailId"
              value={userData.email}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="DoB">DOB: </label>
            <input
              name="DOB"
              type="date"
              id="Dob"
              value={userData.DOB}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="resume">resume:</label>
            <input
              name="resume"
              id="resume"
              type="file"
              accept=".pdf ,.pptx , .doc , .docx"
              onChange={(e) => setResumeFile(e.target.files[0])}
            />
          </div>

          <div>
            <label htmlFor="">Qualifications</label>
            <button onClick={addField}>+</button>
          </div>

          <div>
            {userData.qualifications.map((data, index) => (
              <div key={index}>
                <input
                  className="qualification-input"
                  type="text"
                  name="qualification"
                  value={data.qualification}
                  onChange={(event) => handleChangeDynamic(index, event)}
                />
                <button
                  className="removeButton"
                  onClick={(e) => removeField(index, e)}
                >
                  -
                </button>
              </div>
            ))}
          </div>
          <div className="editControlButton">
            <button type="submit" disabled={isUploading}>
              update
            </button>
            {/* <button onClick={(e) => deleteResume(userData.resume, e)}>
              delete Resume
            </button> */}
            {/* <button onClick={(e) => deleteImage(userData.img, e)}>
              delete profile pic
            </button> */}
          </div>
        </div>
      </form>
    </>
  );
}

export default Edit;
