import { useEffect, useState } from "react";
import API from "../utils/axios";
import { useNavigate } from "react-router-dom";

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [blockReason, setBlockReason] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    setLoading(true);
    API.get("/auth/users")
      .then((response) => setUsers(response.data))
      .catch((err) => {
        console.error("Failed to fetch users", err);
        alert("Failed to load users. Please try again.");
      })
      .finally(() => setLoading(false));
  };

  const handleBlockUser = async (userId, isCurrentlyBlocked) => {
    if (isCurrentlyBlocked) {
      // Unblock user directly
      try {
        await API.put(`/auth/users/${userId}/block`, { reason: "" });
        fetchUsers();
      } catch (err) {
        console.error("Failed to unblock user", err);
        alert(err.response?.data?.message || "Failed to unblock user");
      }
    } else {
      // Show modal for block reason
      setCurrentUserId(userId);
      document.getElementById("blockModal").showModal();
    }
  };

  const confirmBlock = async () => {
    if (!blockReason.trim()) {
      alert("Please provide a reason for blocking");
      return;
    }

    try {
      await API.put(`/auth/users/${currentUserId}/block`, {
        reason: blockReason,
      });
      fetchUsers();
      setBlockReason("");
      document.getElementById("blockModal").close();
    } catch (err) {
      console.error("Failed to block user", err);
      alert(err.response?.data?.message || "Failed to block user");
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      {/* Block User Modal */}
      <dialog id="blockModal" className="modal">
        <div className="modal-box bg-white p-6 rounded-lg shadow-xl max-w-md">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-800">Block User</h3>
              <p className="text-gray-600 mt-1">
                Provide a reason for blocking this user
              </p>
            </div>
            <button
              onClick={() => {
                document.getElementById("blockModal").close();
                setBlockReason("");
              }}
              className="btn btn-sm btn-circle btn-ghost text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <textarea
            className="textarea textarea-bordered w-full h-32 p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
            placeholder="Example: Violation of community guidelines..."
            value={blockReason}
            onChange={(e) => setBlockReason(e.target.value)}
          />

          <div className="modal-action mt-6 flex justify-end space-x-3">
            <button
              onClick={() => {
                document.getElementById("blockModal").close();
                setBlockReason("");
              }}
              className="btn btn-ghost border border-gray-300 hover:bg-gray-100 px-6 py-2 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={confirmBlock}
              className="btn bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z"
                  clipRule="evenodd"
                />
              </svg>
              Confirm Block
            </button>
          </div>
        </div>

        {/* Backdrop click to close */}
        <form method="dialog" className="modal-backdrop bg-black bg-opacity-50">
          <button>close</button>
        </form>
      </dialog>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Panel</h1>
        <button
          onClick={logout}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
        >
          Logout
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-xl font-semibold mb-4">All Registered Users</h2>

        {loading ? (
          <div className="flex justify-center">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user._id}>
                    <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${
                          user.isBlocked
                            ? "bg-red-100 text-red-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {user.isBlocked ? "Blocked" : "Active"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {user.blockedReason || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() =>
                          handleBlockUser(user._id, user.isBlocked)
                        }
                        className={`px-3 py-1 rounded-md text-sm font-medium 
                          ${
                            user.isBlocked
                              ? "bg-green-500 hover:bg-green-600"
                              : "bg-red-500 hover:bg-red-600"
                          } 
                          text-white transition`}
                      >
                        {user.isBlocked ? "Unblock" : "Block"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
