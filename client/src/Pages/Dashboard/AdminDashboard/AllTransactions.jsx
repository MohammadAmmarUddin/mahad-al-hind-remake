import React, { useState, useEffect, useCallback } from "react";
import { FaCheckCircle, FaTimesCircle, FaHourglassHalf, FaChevronLeft, FaChevronRight, FaSearch } from "react-icons/fa";
import { TbCurrencyTaka } from "react-icons/tb";
import { API } from "../../../config/api";
import Swal from "sweetalert2";
import { getStoredAuthToken } from "../../../utils/authToken";

const statusConfig = {
  completed: { label: "Completed", class: "bg-emerald-100 text-emerald-700" },
  approved: { label: "Approved", class: "bg-blue-100 text-blue-700" },
  pending: { label: "Pending", class: "bg-amber-100 text-amber-700" },
  rejected: { label: "Rejected", class: "bg-red-100 text-red-700" },
};

const AllTransactions = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const transactionsPerPage = 15;

  const token = getStoredAuthToken();

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/api/course/all-enrollments`, {
        headers: token ? { Authorization: `Bearer ${token}`, "x-access-token": token } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setTransactions(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleApprove = async (tranId) => {
    const result = await Swal.fire({
      title: "Approve Enrollment?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#059669",
      confirmButtonText: "Approve",
    });
    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`${API}/api/course/approve-enrollment/${tranId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "x-access-token": token,
        },
      });
      if (res.ok) {
        Swal.fire({ icon: "success", title: "Approved", timer: 1500, showConfirmButton: false });
        fetchTransactions();
      } else {
        const data = await res.json();
        throw new Error(data.message || "Failed to approve");
      }
    } catch (error) {
      Swal.fire({ icon: "error", title: "Error", text: error.message });
    }
  };

  const handleReject = async (tranId) => {
    const result = await Swal.fire({
      title: "Reject Enrollment?",
      text: "This will remove the student from the course.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      confirmButtonText: "Reject",
    });
    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`${API}/api/course/reject-enrollment/${tranId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "x-access-token": token,
        },
      });
      if (res.ok) {
        Swal.fire({ icon: "success", title: "Rejected", timer: 1500, showConfirmButton: false });
        fetchTransactions();
      } else {
        const data = await res.json();
        throw new Error(data.message || "Failed to reject");
      }
    } catch (error) {
      Swal.fire({ icon: "error", title: "Error", text: error.message });
    }
  };

  const filteredTransactions = transactions.filter((t) => {
    const studentName = t.studentsId
      ? `${t.studentsId?.firstname || ""} ${t.studentsId?.lastname || ""}`.toLowerCase()
      : "";
    const courseName = (t.courseId?.title || "").toLowerCase();
    const term = searchTerm.toLowerCase();
    return studentName.includes(term) || courseName.includes(term) || (t.tranId || "").toLowerCase().includes(term);
  });

  const totalPages = Math.ceil(filteredTransactions.length / transactionsPerPage);
  const indexOfLast = currentPage * transactionsPerPage;
  const indexOfFirst = indexOfLast - transactionsPerPage;
  const currentItems = filteredTransactions.slice(indexOfFirst, indexOfLast);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-primary">Loading transactions...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <h1 className="text-3xl font-bold text-primary mb-8">Transaction History</h1>
      <div className="bg-white rounded-lg">
        <div className="flex justify-between items-center mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by student, course, or ID..."
              className="pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          <button onClick={fetchTransactions} className="px-4 py-2 border rounded-md text-sm font-semibold text-slate-700 hover:bg-slate-50">
            Refresh
          </button>
        </div>

        <div className="overflow-x-auto border rounded-md">
          <table className="table table-zebra w-full">
            <thead>
              <tr className="grid grid-cols-12 bg-gray-50">
                <th className="col-span-1">Sl. No.</th>
                <th className="col-span-2">Student</th>
                <th className="col-span-3">Course</th>
                <th className="col-span-2">Transaction ID</th>
                <th className="col-span-1">Amount</th>
                <th className="col-span-1">Status</th>
                <th className="col-span-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((t, index) => {
                  const studentName = t.studentsId
                    ? `${t.studentsId?.firstname || ""} ${t.studentsId?.lastname || ""}`
                    : "Unknown";
                  const courseName = t.courseId?.title || "Unknown";
                  const cfg = statusConfig[t.status] || statusConfig.completed;

                  return (
                    <tr key={t._id} className="grid grid-cols-12">
                      <td className="col-span-1">{indexOfFirst + index + 1}</td>
                      <td className="col-span-2 truncate">{studentName}</td>
                      <td className="col-span-3 truncate">{courseName}</td>
                      <td className="col-span-2 truncate text-xs">{t.tranId || t._id}</td>
                      <td className="col-span-1 flex items-center">
                        <p>{t.payment}</p>
                        <TbCurrencyTaka />
                      </td>
                      <td className="col-span-1">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${cfg.class}`}>
                          {t.status === "pending" && <FaHourglassHalf />}
                          {t.status === "approved" && <FaCheckCircle />}
                          {t.status === "rejected" && <FaTimesCircle />}
                          {t.status === "completed" && <FaCheckCircle />}
                          {cfg.label}
                        </span>
                      </td>
                      <td className="col-span-2 text-right">
                        {t.status === "pending" && (
                          <div className="flex gap-1 justify-end">
                            <button
                              onClick={() => handleApprove(t.tranId)}
                              className="rounded bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-700"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(t.tranId)}
                              className="rounded bg-red-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-red-700"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-500">
                    No transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <nav>
            <ul className="pagination flex items-center gap-3">
              <button
                onClick={() => setCurrentPage((p) => p - 1)}
                disabled={currentPage === 1}
                className={`text-2xl py-2 px-4 rounded ${currentPage === 1 ? "text-gray-400 cursor-not-allowed" : "text-primary"}`}
              >
                <FaChevronLeft />
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <li key={i + 1} className={`page-item ${currentPage === i + 1 ? "active" : ""}`}>
                  <button
                    className={`page-link py-2 px-4 rounded ${currentPage === i + 1 ? "bg-primary text-white" : "text-primary"}`}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                </li>
              ))}
              <button
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={currentPage === totalPages}
                className={`text-2xl py-2 px-4 rounded ${currentPage === totalPages ? "text-gray-400 cursor-not-allowed" : "text-primary"}`}
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

export default AllTransactions;
