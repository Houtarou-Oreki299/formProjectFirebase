import React, { useEffect } from "react";
import db from "../firebase/firebase";
import { addDoc, collection, doc, setDoc } from "firebase/firestore";
import { nanoid } from "nanoid";
import { storage } from "../firebase/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { useNavigate } from "react-router-dom";

export default function CreateRec() {
  const Navigate = useNavigate();
  const [formData, setFormData] = React.useState({
    name: "",
    address: "",
    contact: "",
    email: "",
    DOB: "",
    qualifications: [],
  });

  const [file, setFile] = React.useState("");
  const [resume, setResume] = React.useState("");
  const [imageURL, setImageURL] = React.useState("");
  const [resumeURL, setResumeURL] = React.useState("");
  const [isUploading , setIsUploading] = React.useState(false);

  const addField = (e) => {
    e.preventDefault();
    setFormData((prevData) => ({
      ...prevData,
      qualifications: [...prevData.qualifications, { qualification: "" }],
    }));
  };

  const removeField = (index, e) => {
    e.preventDefault();
    let updatedQualifications = [...formData.qualifications];
    updatedQualifications.splice(index, 1);
    setFormData((prevData) => ({
      ...prevData,
      qualifications: updatedQualifications,
    }));
  };

  const handleChangeDynamic = (index, event) => {
    const { name, value } = event.target;
    const updatedQualifications = [...formData.qualifications];
    updatedQualifications[index] = {
      ...updatedQualifications[index],
      [name]: value,
    };
    setFormData((prevData) => ({
      ...prevData,
      qualifications: updatedQualifications,
    }));
  };

  const uploadFile = async (file, folderName , genrateID) => {
    const storageRef = ref(storage, `${folderName}/${genrateID}`);
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

  async function submitForm(e) {
    e.preventDefault();
    setIsUploading(true)
    const genrateID= nanoid();


    try {
      const imageUrl = file ? await uploadFile(file, "images" , genrateID) : "";
      const resumeUrl = resume ? await uploadFile(resume, "resumes" , genrateID) : "";

      setImageURL(imageUrl);
      setResumeURL(resumeUrl);

      const docRef = await setDoc(doc(db, "user", genrateID), {
        ...formData,
        img: imageUrl,
        resume: resumeUrl,
      });

      console.log("uploaded");
    } catch (error) {
      console.error("Error adding document: ", error);
    }finally{
      setIsUploading(false)
      Navigate("/ViewRecords")
    }

    setFormData({
      name: "",
      address: "",
      contact: "",
      email: "",
      DOB: "",
      qualifications: [],
    });

    window.alert("uploaded the data")
    setFile(null);
    setResume(null);
    setImageURL(null);
    setResumeURL(null);
    
  }

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  return (
    <form onSubmit={submitForm}>
      <div className="create-outbox">
        <div className="inputFields">
          <div className="inputdiv">
            <label htmlFor="Name">Name: </label>
            <input
              name="name"
              type="text"
              id="Name"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div className="inputdiv">
            <label htmlFor="Address">Address: </label>
            <input
            name="address"
              type="text"
              id="Address"
              value={formData.address}
              onChange={handleChange}
            />
          </div>

          <div className="inputdiv">
            <label htmlFor="Contact">Contact: </label>
            <input
              name="contact"
              type="text"
              id="Contact"
              value={formData.contact}
              onChange={handleChange}
            />
          </div>

          <div className="inputdiv">
            <label htmlFor="EmailId">Email ID: </label>
            <input
              name="email"
              type="text"
              id="EmailId"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="inputdiv">
            <label htmlFor="DoB">DOB: </label>
            <input
              name="DOB"
              type="date"
              id="Dob"
              value={formData.DOB}
              onChange={handleChange}
            />
          </div>

          <div className="dynamicField">
            <div className="dynamicInput">
              <div className="addButtion">
                <label htmlFor="">Qualifications</label>
                <button onClick={addField}>+</button>
                {/* {formData.qualifications.length > 0 && (
                <button onClick={(e)=>removeField(formData.qualifications.length - 1,e)}>-</button>
              )} */}
              </div>

              {formData.qualifications.map((form, index) => (
                <div key={index}>
                  <input
                    className="qualification-input"
                    type="text"
                    name="qualification"
                    value={form.qualification}
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
          </div>

          <div className="inputdiv">
            <label htmlFor="resume">Resume</label>
            <input
              type="file"
              id="resume"
              name="resume "
              accept="pdf"
              onChange={(e) => setResume(e.target.files[0])}
              required
            />
          </div>
        </div>

        <div className="save-delete">
          <button className="button saveButton" type="submit" disabled={isUploading}>
            {isUploading ? "uploading" : "save" }
          </button>
          {/* <button className="button deleteButton">Delete</button> */}
        </div>
        <div className="imagefile">
          <img
            src={file ? URL.createObjectURL(file) : "/user.png"}
            alt="no image"
          />
          <input
            type="file"
            accept="image/*"
            label="upload image"
            onChange={(e) => setFile(e.target.files[0])}
            required
          />
        </div>
      </div>
    </form>
  );
}
