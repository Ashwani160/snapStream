import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import Modal from "react-modal";
import "../styles/UsersList.css";

Modal.setAppElement("#root");

const UsersList = () => {
  const [list, setList] = useState(null);
  const [message, setMessage] = useState("");
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [subscribers, setSubscribers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");

  const fetchLoggedInUser = async () => {
    try {
      const res = await axiosInstance.post("/users/getuser", {}, { withCredentials: true });
      setLoggedInUser(res.data.data);
      return res.data.data;
    } catch (err) {
      console.log("Not logged in");
      return null;
    }
  };

  const getUsers = async (currentUser) => {
    try {
      const res = await axiosInstance.get("/users/allusers", { withCredentials: true });
      const users = res.data.data;

      if (!currentUser) {
        const anonymousList = users.map(user => ({ ...user, isSubscribed: null }));
        setList(anonymousList);
        return;
      }

      const statusPromises = users.map(async (user) => {
        if (user._id === currentUser._id) return { ...user, isSubscribed: null };
        try {
          const subStatus = await axiosInstance.post(`/subs/status/${user._id}`, {}, { withCredentials: true });
          return {
            ...user,
            isSubscribed: subStatus.data.data.isSubscribed,
          };
        } catch (e) {
          console.log(`Failed status check for ${user.username}`);
          return { ...user, isSubscribed: false };
        }
      });

      const enrichedUsers = await Promise.all(statusPromises);
      setList(enrichedUsers);
    } catch (err) {
      console.log(err);
      setMessage("Failed to fetch users");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const currentUser = await fetchLoggedInUser();
      await getUsers(currentUser);
    };
    fetchData();
  }, []);

  const handleSubscribe = async (channelId) => {
    try {
      const res = await axiosInstance.post(`/subs/s/${channelId}`, {}, { withCredentials: true });
      console.log(res.data.message);

      setList((prevList) =>
        prevList.map((user) =>
          user._id === channelId ? { ...user, isSubscribed: !user.isSubscribed } : user
        )
      );
    } catch (err) {
      console.log(err?.response?.data?.message || "Failed to toggle subscription");
    }
  };

  const handleViewSubscribers = async (channelId, name) => {
    try {
      const res = await axiosInstance.get(`/subs/getsubscribers/${channelId}`);
      setSubscribers(res.data.data[0]?.subscribers || []);
      setModalTitle(name + "'s Subscribers");
      setIsModalOpen(true);
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "Failed to load subscribers");
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSubscribers([]);
  };

  return (
    <div className="page">
      <h2 className="heading">🌐 Community Directory</h2>
      {message && <p className="message">{message}</p>}

      {list ? (
        <div className="user-grid">
          {list.map((user) => (
            <div key={user.username} className="card">
              <img src={user.coverImage} alt="cover" className="cover-image" />
              <div className="avatar-box">
                <img src={user.avatar} alt="avatar" className="avatar" />
              </div>
              <div className="info">
                <h3 className="name">{user.fullname}</h3>
                <p className="username">@{user.username}</p>
                <p className="email">{user.email}</p>

                <div className="actions">
                  <button
                    onClick={() => handleViewSubscribers(user._id, user.username)}
                    className="button-secondary"
                  >
                    View Subscribers
                  </button>

                  {loggedInUser && loggedInUser._id !== user._id && (
                    <button
                      onClick={() => handleSubscribe(user._id)}
                      className={user.isSubscribed ? "button-unsub" : "button-primary"}
                    >
                      {user.isSubscribed ? "Unsubscribe" : "Subscribe"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="message">Loading users...</p>
      )}

      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Subscribers Modal"
        style={{
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            zIndex: 1000,
          },
          content: {
            backgroundColor: "var(--modal-bg)",
            color: "var(--modal-text)",
            maxWidth: "500px",
            maxHeight: "80vh",
            overflowY: "auto",
            margin: "auto",
            borderRadius: "16px",
            padding: "30px",
            fontFamily: "Segoe UI, sans-serif",
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.3)",
          },
        }}
      >
        <h2>{modalTitle}</h2>
        <button onClick={closeModal} className="close-button">✖</button>
        {subscribers.length > 0 ? (
          <ul className="sub-list">
            {subscribers.map((sub, idx) => (
              <li key={idx} className="sub-list-item">@{sub.username}</li>
            ))}
          </ul>
        ) : (
          <p>No subscribers found.</p>
        )}
      </Modal>
    </div>
  );
};

export default UsersList;
