import { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance.js";
import { useNavigate } from "react-router-dom";
import "../styles/User.css";

const User = () => {
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await axiosInstance.post("/users/getuser", {}, { withCredentials: true });
        setUser(user.data.data);
      } catch (err) {
        console.log("here is the error: ", err);
        setMessage(err.response?.data?.message || "Something went wrong");
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await axiosInstance.post("/users/logout", {}, { withCredentials: true });
      setUser(null);
      navigate("/login");
    } catch (err) {
      console.error(err);
      alert("Logout failed");
    }
  };

  return (
    <div className="user-container">
      <div className="user-card">
        {user ? (
          <>
            <div className="cover-image">
              <img src={user.coverImage} alt="cover" />
            </div>
            <div className="avatar-container">
              <img src={user.avatar} alt="avatar" className="avatar" />
            </div>
            <div className="user-info">
              <h2>{user.fullname}</h2>
              <p className="username">@{user.username}</p>
              <p className="email">{user.email}</p>
              <button className="logout-button" onClick={handleLogout}>
                Logout
              </button>
              <button 
                className="upload-video-button"
                onClick={() => navigate("/uploadvideo")}
              >
                Upload Video
              </button>
            </div>
          </>
        ) : (
          <p className="loading-text">Loading user info...</p>
        )}
        {message && <p className="error-message">{message}</p>}
      </div>
    </div>
  );
};

export default User;
