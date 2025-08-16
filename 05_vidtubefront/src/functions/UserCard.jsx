import React from "react";

const UserCard = ({ user, handleLogout }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-blue-100 px-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden text-center relative">
        {/* Cover Image */}
        <img
          src={user.coverImage}
          alt="cover"
          className="w-full h-40 object-cover"
        />

        {/* Avatar (overlapping) */}
        <div className="absolute inset-x-0 -top-12 flex justify-center">
          <img
            src={user.avatar}
            alt="avatar"
            className="w-24 h-24 rounded-full border-4 border-white object-cover shadow-md"
          />
        </div>

        {/* Bottom Info Section */}
        <div className="pt-16 px-6 pb-6"> {/* Increased padding top */}
          <h2 className="text-xl font-semibold text-gray-800">
            {user.fullname}
          </h2>
          <p className="text-sm text-gray-500">@{user.username}</p>
          <p className="text-sm text-gray-500 mt-1">{user.email}</p>

          <button
            onClick={handleLogout}
            className="mt-5 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800 transition"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserCard;
