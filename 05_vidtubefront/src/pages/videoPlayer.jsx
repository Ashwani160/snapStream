import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance.js";
import "../styles/VideoPlayer.css";

function VideoPlayer() {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const res = await axiosInstance.post(
          `videos/getvideo/${id}`,
          {}, // no body
          { withCredentials: true } // config for cookies
        );
        setVideo(res.data.data);
      } catch (err) {
        if (err.response?.status === 504) {
          setMessage("Please login to watch videos.");
          navigate("/login");
        } else {
          setMessage(err?.response?.data?.message || "Failed to load video");
        }
      }
    };

    fetchVideo();
  }, [id, navigate]);

  if (!video) return <p className="message">{message || "Loading..."}</p>;

  return (
    <div className="video-player-container">
      <div className="video-wrapper">
        <video controls src={video.videoFile}></video>
      </div>

      <h1 className="video-title">{video.title}</h1>
      <p className="video-description">{video.description}</p>

      <div className="owner-info">
        <img src={video.owner?.avatar} alt="owner" />
        <p>{video.owner?.username}</p>
      </div>
    </div>
  );
}

export default VideoPlayer;
