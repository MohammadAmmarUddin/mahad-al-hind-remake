import { useState, useEffect, useRef, useCallback } from "react";
import {
  FaChevronLeft,
  FaChevronRight,
  FaSearch,
} from "react-icons/fa";
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
    const url = `${API}/api/user/allUsers`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setAllUsers(data);
      })
      .catch((error) => console.log(error));
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
      confirmButtonColor: "#125ca6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(`${API}/api/user/deleteUser/${id}`, { method: "DELETE" })
          .then((res) => res.json())
          .then(() => {
            Swal.fire({ title: "Deleted!", text: "The user has been deleted.", icon: "success", confirmButtonColor: "#125ca6" });
            fetchAllUsers();
          })
          .catch(() => {
            Swal.fire({ title: "Error!", text: "There was an error deleting the user.", icon: "error", confirmButtonColor: "#125ca6" });
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
      confirmButtonColor: "#125ca6",
      cancelButtonColor: "#d33",
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
            Swal.fire({
              title: "Done!",
              text: `${data.firstname} ${data.lastname} is now a "${data.role}"`,
              icon: "success",
              confirmButtonColor: "#125ca6",
            });
            setAllUsers((prev) =>
              prev.map((u) => (u._id === id ? { ...u, role: data.role } : u))
            );
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
    <div className="m-6">
      <h1 className="text-3xl font-bold text-primary mb-6">All Users</h1>

      <div className="relative mb-4 max-w-sm">
        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name, email, role, phone..."
          className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 outline-none focus:border-primary"
        />
      </div>

      <div className="overflow-x-auto border rounded-md">
        <table className="table table-zebra w-full">
          <thead>
            <tr className="grid grid-cols-6">
              <th>Sl no.</th>
              <th className="col-span-3">Name / Email</th>
              <th>Role</th>
              <th className="text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.length > 0 ? (
              currentUsers.map((user, index) => (
                <tr key={user._id} className="grid grid-cols-6 items-center">
                  <td>{indexOfFirstUser + index + 1}</td>
                  <td className="col-span-3">
                    <p className="font-medium">{user.firstname} {user.lastname}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </td>
                  <td>
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user._id, e.target.value)}
                      className="select select-bordered select-xs w-full max-w-[110px] rounded-md border-slate-200 text-sm"
                    >
                      {ROLE_OPTIONS.map((r) => (
                        <option key={r} value={r}>
                          {r.charAt(0).toUpperCase() + r.slice(1)}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="text-right">
                    <button
                      className="tooltip btn btn-ghost btn-xs p-1"
                      data-tip="Delete User"
                      onClick={() => handleDelete(user._id)}
                    >
                      <RiDeleteBin5Line className="text-lg text-error" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-8 text-slate-500">
                  {debouncedSearch ? "No users match your search." : "No users found."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <nav>
            <ul className="pagination flex items-center gap-3">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className={`text-2xl py-2 px-4 rounded ${
                  currentPage === 1
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-primary"
                }`}
              >
                <FaChevronLeft />
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <li key={i + 1} className="page-item">
                  <button
                    className={`page-link py-2 px-4 rounded text-white ${
                      currentPage === i + 1 ? "bg-primary" : "bg-primary/60"
                    }`}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                </li>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className={`text-2xl py-2 px-4 rounded ${
                  currentPage === totalPages
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-primary"
                }`}
              >
                <FaChevronRight />
              </button>
            </ul>
          </nav>
        </div>
      )}
    </div>
  );
};

export default AllUsers;
