import { useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { useNavigate } from "react-router-dom";

const UploadVideo = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    video: null,
    thumbnail: null,
  });
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.video || !formData.thumbnail) {
      setMessage("Video and Thumbnail are required!");
      return;
    }

    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("video", formData.video);
    data.append("thumbnail", formData.thumbnail);

    try {
      setUploading(true);
      const response = await axiosInstance.post("/videos/uploadvideo", data, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      setMessage(response.data.message || "Uploaded successfully!");
      navigate("/videos");
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-video-container">
      <h2>Upload Video</h2>
      <form onSubmit={handleSubmit} className="upload-form">
        <input
          type="text"
          name="title"
          placeholder="Title"
          value={formData.title}
          onChange={handleChange}
          required
        />
        <textarea
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
          required
        />
        <input type="file" name="video" accept="video/*" onChange={handleChange} required />
        <input type="file" name="thumbnail" accept="image/*" onChange={handleChange} required />

        <button type="submit" disabled={uploading}>
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default UploadVideo;
