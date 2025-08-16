import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance.js";

function Login() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await axiosInstance.post(
          "users/getuser",
          {},
          {
            withCredentials: true,
          }
        );
        if (response?.status === 200) {
          navigate("/user");
        }
      } catch (err) {
        console.log("User not logged in");
      }
    };

    checkLoginStatus();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => {
      return { ...prev, [e.target.name]: e.target.value };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const user = await axios.post("/api/v1/users/login", formData, {
        withCredentials: true,
      });
      console.log(user.data);
      setMessage(user.data.message);
      navigate("/user");
    } catch (error) {
      setMessage(error?.response?.data?.message || "invalid credentials");
    }
  };

  return (
    <>
      <h1>Login</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="username"
          name="username"
          value={formData.username}
          onChange={handleChange}
        />
        <input
          type="password"
          placeholder="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
        />

        <button type="submit">Submit</button>
      </form>

      {/* Register Navigation Button */}
      <button onClick={() => navigate("/register")}>
        Go to Register
      </button>

      {message}
    </>
  );
}

export default Login;
