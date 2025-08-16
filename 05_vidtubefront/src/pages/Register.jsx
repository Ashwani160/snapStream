import React, { useState } from "react";
import axios from "axios";
import "../styles/Register.css";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    fullname: "",
    email: "",
    password: "",
    avatar: null,
    coverImage: null,
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, files, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("username", formData.username);
    data.append("fullname", formData.fullname);
    data.append("email", formData.email);
    data.append("password", formData.password);
    if (formData.avatar) data.append("avatar", formData.avatar);
    if (formData.coverImage) data.append("coverImage", formData.coverImage);

    try {
      const user = await axios.post("/api/v1/users/register", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });
      setMessage(user.data.message);
    } catch (err) {
      console.log(err);
      setMessage(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="register-container">
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <label>Username</label>
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
        />

        <label>Full Name</label>
        <input
          type="text"
          name="fullname"
          value={formData.fullname}
          onChange={handleChange}
        />

        <label>Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
        />

        <label>Password</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
        />

        <label>Avatar</label>
        <input type="file" name="avatar" onChange={handleChange} />

        <label>Cover Image</label>
        <input type="file" name="coverImage" onChange={handleChange} />

        <button type="submit">Register</button>
      </form>
      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default Register;
