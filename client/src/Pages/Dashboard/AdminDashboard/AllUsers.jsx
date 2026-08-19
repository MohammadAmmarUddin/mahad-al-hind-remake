import { useState, useEffect, useRef, useCallback } from "react";
import { FaChevronLeft, FaChevronRight, FaSearch } from "react-icons/fa";
import { RiDeleteBin5Line } from "react-icons/ri";
import Swal from "sweetalert2";
import { API } from "../../../config/api";

const ROLE_OPTIONS = ["student", "instructor", "admin"];

const AllUsers = () => {
  const [allUsers, setAllUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const debounceRef = useRef(null);
  const usersPerPage = 15;

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [searchTerm]);

  const fetchAllUsers = useCallback(() => {
    fetch(`${API}/api/user/allUsers`)
      .then((res) => res.json())
      .then(setAllUsers)
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchAllUsers();
  }, [fetchAllUsers]);

  const filteredUsers = allUsers.filter((user) => {
    if (!debouncedSearch) return true;
    const q = debouncedSearch.toLowerCase();
    return (
      `${user.firstname} ${user.lastname}`.toLowerCase().includes(q) ||
      user.email?.toLowerCase().includes(q) ||
      user.role?.toLowerCase().includes(q) ||
      user.phone?.includes(q) ||
      user._id?.includes(q)
    );
  });

  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#047857",
      cancelButtonColor: "#dc2626",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(`${API}/api/user/deleteUser/${id}`, { method: "DELETE" })
          .then((res) => res.json())
          .then(() => {
            Swal.fire({ title: "Deleted!", text: "The user has been deleted.", icon: "success", confirmButtonColor: "#047857" });
            fetchAllUsers();
          })
          .catch(() => {
            Swal.fire({ title: "Error!", text: "There was an error deleting the user.", icon: "error", confirmButtonColor: "#047857" });
          });
      }
    });
  };

  const handleRoleChange = (id, newRole) => {
    Swal.fire({
      title: "Are you sure?",
      text: `Change this user's role to "${newRole}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#047857",
      cancelButtonColor: "#dc2626",
      confirmButtonText: "Yes, do it!",
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(`${API}/api/user/changeRole/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: newRole }),
        })
          .then((res) => {
            if (!res.ok) throw new Error("Failed to change role");
            return res.json();
          })
          .then((data) => {
            Swal.fire({ title: "Done!", text: `${data.firstname} ${data.lastname} is now a "${data.role}"`, icon: "success", confirmButtonColor: "#047857" });
            setAllUsers((prev) => prev.map((u) => (u._id === id ? { ...u, role: data.role } : u)));
          })
          .catch((err) => {
            Swal.fire({ title: "Error", text: err.message, icon: "error" });
          });
      }
    });
  };

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  return (
    <div className="p-4 pt-6 lg:p-6">
      <h1 className="mb-6 font-heading text-display-sm font-bold text-neutral-900">All Users</h1>

      <div className="relative mb-5 max-w-sm">
        <FaSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name, email, role, phone..."
          className="input-base pl-10"
        />
      </div>

      <div className="card-base overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50">
                <th className="px-4 py-3 text-meta font-semibold text-neutral-500">Sl no.</th>
                <th className="px-4 py-3 text-meta font-semibold text-neutral-500">Name / Email</th>
                <th className="px-4 py-3 text-meta font-semibold text-neutral-500">Role</th>
                <th className="px-4 py-3 text-right text-meta font-semibold text-neutral-500">Action</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.length > 0 ? (
                currentUsers.map((user, index) => (
                  <tr key={user._id} className="border-b border-neutral-50 transition-colors hover:bg-neutral-50/50">
                    <td className="px-4 py-3 text-neutral-500">{indexOfFirstUser + index + 1}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-neutral-800">{user.firstname} {user.lastname}</p>
                      <p className="text-xs text-neutral-400">{user.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user._id, e.target.value)}
                        className="rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 text-xs font-medium text-neutral-700 outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                      >
                        {ROLE_OPTIONS.map((r) => (
                          <option key={r} value={r}>
                            {r.charAt(0).toUpperCase() + r.slice(1)}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDelete(user._id)}
                        className="inline-flex items-center justify-center rounded-lg p-2 text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-500"
                        title="Delete User"
                      >
                        <RiDeleteBin5Line className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-4 py-12 text-center text-body-sm text-neutral-400">
                    {debouncedSearch ? "No users match your search." : "No users found."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-1.5">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-500 transition-colors hover:border-primary-300 hover:text-primary-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <FaChevronLeft className="h-3 w-3" />
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-all duration-200 ${
                currentPage === i + 1
                  ? "bg-primary-600 text-white shadow-sm"
                  : "border border-neutral-200 bg-white text-neutral-600 hover:border-primary-300 hover:text-primary-600"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-500 transition-colors hover:border-primary-300 hover:text-primary-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <FaChevronRight className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  );
};

export default AllUsers;
