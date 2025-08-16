// src/pages/Videos.jsx
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance.js";
import "../styles/videos.css"; // Import external CSS file

function Videos() {
  const [videos, setVideos] = useState([]);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await axiosInstance.get("videos", {
          withCredentials: true,
        });
        setVideos(res.data.data); // ApiResponse -> { status, data, message }
      } catch (err) {
        console.error("Error fetching videos:", err);

        if (err.response?.status === 401) {
          setMessage("Please login to view videos.");
          navigate("/login");
        } else {
          setMessage(err?.response?.data?.message || "Failed to load videos");
        }
      }
    };

    fetchVideos();
  }, [navigate]);

  if (!videos.length) return <p className="loading-text">{message || "Loading..."}</p>;

  return (
    <div className="videos-container">
      {videos.map((video) => (
        <div key={video._id} className="video-card">
          <Link to={`/videos/${video._id}`}>
            <img
              src={video.thumbnail}
              alt={video.title}
              className="video-thumbnail"
            />
          </Link>
          <div className="video-info">
            <h2 className="video-title">{video.title}</h2>
            <p className="video-description">{video.description}</p>
            <div className="video-owner">
              <img
                src={video.owner?.avatar}
                alt={video.owner?.username}
                className="owner-avatar"
              />
              <span className="owner-name">{video.owner?.username}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Videos;
