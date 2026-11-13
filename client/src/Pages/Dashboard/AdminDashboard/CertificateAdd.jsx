import { useState, useEffect, useRef, useCallback } from "react";
import {
    FaSearch,
    FaChevronLeft,
    FaChevronRight,
    FaEdit,
    FaTimes,
} from "react-icons/fa";
import { RiDeleteBin5Line } from "react-icons/ri";
import Swal from "sweetalert2";
import { API } from "../../../config/api";
import { getStoredAuthToken } from "../../../utils/authToken";
import { downloadCertificateQr } from "../../../utils/certificateQr";

const EMPTY_FORM = {
    certificateId: "",
    studentName: "",
    courseName: "",
    dob: "",
    address: "",
    issueDate: "",
};

const PAGE_SIZE = 15;

const authHeaders = () => {
    const token = getStoredAuthToken();
    const headers = { "Content-Type": "application/json" };
    if (token) {
        headers.Authorization = `Bearer ${token}`;
        headers["x-access-token"] = token;
    }
    return headers;
};

const toDateInput = (value) => {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
};

const CertificateAdd = () => {
    const [formData, setFormData] = useState({ ...EMPTY_FORM });
    const [editingId, setEditingId] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [qrLoading, setQrLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const baseUrl = API;

    const [certificates, setCertificates] = useState([]);
    const [listLoading, setListLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const debounceRef = useRef(null);
    const abortRef = useRef(null);
    const formRef = useRef(null);

    useEffect(() => {
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            setDebouncedSearch(search.trim());
            setPage(1);
        }, 300);
        return () => clearTimeout(debounceRef.current);
    }, [search]);

    const fetchCertificates = useCallback(async () => {
        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        setListLoading(true);
        try {
            const params = new URLSearchParams({
                page: String(page),
                limit: String(PAGE_SIZE),
            });
            if (debouncedSearch) params.set("search", debouncedSearch);

            const res = await fetch(`${baseUrl}/api/certificate?${params}`, {
                headers: authHeaders(),
                signal: controller.signal,
            });
            if (!res.ok) throw new Error("Failed to load certificates");
            const data = await res.json();
            if (controller.signal.aborted) return;

            setCertificates(Array.isArray(data.certificates) ? data.certificates : []);
            setTotal(Number(data.total) || 0);
        } catch (err) {
            if (err?.name === "AbortError") return;
            setCertificates([]);
            setTotal(0);
        } finally {
            if (!controller.signal.aborted) setListLoading(false);
        }
    }, [baseUrl, page, debouncedSearch]);

    useEffect(() => {
        fetchCertificates();
        return () => abortRef.current?.abort();
    }, [fetchCertificates]);

    const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const startEdit = (cert) => {
        setEditingId(cert._id);
        setMessage(null);
        setFormData({
            certificateId: cert.certificateId || "",
            studentName: cert.studentName || "",
            courseName: cert.courseName || "",
            dob: toDateInput(cert.dob),
            address: cert.address || "",
            issueDate: toDateInput(cert.issueDate),
        });
        formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setFormData({ ...EMPTY_FORM });
        setMessage(null);
    };

    const handleDownloadQr = async () => {
        const uid = formData.certificateId.trim();
        if (!uid) {
            setMessage({ type: "error", text: "Enter a Certificate ID first." });
            return;
        }

        setQrLoading(true);
        setMessage(null);
        try {
            await downloadCertificateQr(uid);
            setMessage({
                type: "success",
                text: `✅ QR code downloaded for ${uid}.`,
            });
        } catch {
            setMessage({ type: "error", text: "❌ Could not generate QR code." });
        } finally {
            setQrLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setMessage(null);

        try {
            const isEditing = Boolean(editingId);
            const url = isEditing
                ? `${baseUrl}/api/certificate/${editingId}`
                : `${baseUrl}/api/certificate/createCertificate`;
            const res = await fetch(url, {
                method: isEditing ? "PUT" : "POST",
                headers: authHeaders(),
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (res.ok) {
                if (!isEditing && data.exists) {
                    setMessage({ type: "error", text: "❌ Certificate already exists." });
                } else {
                    setMessage({
                        type: "success",
                        text: isEditing
                            ? "✅ Certificate updated successfully."
                            : "✅ Certificate successfully created.",
                    });
                    setEditingId(null);
                    setFormData({ ...EMPTY_FORM });
                    fetchCertificates();
                }
            } else {
                setMessage({
                    type: "error",
                    text: data.message || "❌ Something went wrong.",
                });
            }
        } catch {
            setMessage({ type: "error", text: "❌ Server error. Please try again." });
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = (cert) => {
        Swal.fire({
            title: "Delete this certificate?",
            text: `${cert.certificateId} — ${cert.studentName}`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#047857",
            cancelButtonColor: "#dc2626",
            confirmButtonText: "Yes, delete it!",
        }).then(async (result) => {
            if (!result.isConfirmed) return;
            try {
                const res = await fetch(`${baseUrl}/api/certificate/${cert._id}`, {
                    method: "DELETE",
                    headers: authHeaders(),
                });
                if (!res.ok) throw new Error();
                Swal.fire({
                    title: "Deleted!",
                    text: "The certificate has been deleted.",
                    icon: "success",
                    confirmButtonColor: "#047857",
                });
                if (editingId === cert._id) cancelEdit();
                fetchCertificates();
            } catch {
                Swal.fire({
                    title: "Error!",
                    text: "Could not delete the certificate.",
                    icon: "error",
                    confirmButtonColor: "#047857",
                });
            }
        });
    };

    const inputClass =
        "w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-600";

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#065f46] via-[#047857] to-[#ecfccb] p-4 space-y-6">
            {/* Form */}
            <div ref={formRef} className="flex items-start justify-center">
                <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-2xl">
                    <div className="mb-6 flex items-center justify-between">
                        <h2 className="text-3xl font-bold text-emerald-800 text-center flex-1">
                            {editingId ? "Edit Certificate" : "Certificate Submission"}
                        </h2>
                        {editingId && (
                            <button
                                type="button"
                                onClick={cancelEdit}
                                className="flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-red-600"
                                title="Cancel editing"
                            >
                                <FaTimes /> Cancel
                            </button>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block mb-2 font-semibold text-gray-700">Certificate ID</label>
                            <input
                                type="text"
                                name="certificateId"
                                value={formData.certificateId}
                                onChange={handleChange}
                                required
                                className={inputClass}
                            />
                            <button
                                type="button"
                                onClick={handleDownloadQr}
                                disabled={qrLoading || !formData.certificateId.trim()}
                                className="w-full mt-2 border border-emerald-600 text-emerald-700 hover:bg-emerald-50 py-3 rounded-md font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Download a QR code for this certificate's verification link"
                            >
                                {qrLoading ? "Generating QR..." : "Download QR Code"}
                            </button>
                        </div>

                        <div>
                            <label className="block mb-2 font-semibold text-gray-700">Student Name</label>
                            <input
                                type="text"
                                name="studentName"
                                value={formData.studentName}
                                onChange={handleChange}
                                required
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label className="block mb-2 font-semibold text-gray-700">Course Name</label>
                            <input
                                type="text"
                                name="courseName"
                                value={formData.courseName}
                                onChange={handleChange}
                                required
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label className="block mb-2 font-semibold text-gray-700">Date of Birth</label>
                            <input
                                type="date"
                                name="dob"
                                value={formData.dob}
                                onChange={handleChange}
                                required
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label className="block mb-2 font-semibold text-gray-700">Address</label>
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                required
                                rows={3}
                                placeholder="Enter student's full address"
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label className="block mb-2 font-semibold text-gray-700">Issue Date</label>
                            <input
                                type="date"
                                name="issueDate"
                                value={formData.issueDate}
                                onChange={handleChange}
                                required
                                className={inputClass}
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-md font-semibold shadow-md transition-all duration-300"
                            disabled={submitting}
                        >
                            {submitting
                                ? "Submitting..."
                                : editingId
                                ? "Update Certificate"
                                : "Submit"}
                        </button>
                    </form>

                    {message && (
                        <div
                            className={`mt-4 p-4 rounded-md text-center font-semibold ${
                                message.type === "success"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                            }`}
                        >
                            {message.text}
                        </div>
                    )}
                </div>
            </div>

            {/* List with search */}
            <div className="mx-auto w-full max-w-6xl">
                <div className="bg-white p-6 rounded-lg shadow-lg">
                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <h3 className="text-xl font-bold text-emerald-800">
                            Certificates{" "}
                            <span className="text-sm font-semibold text-gray-500">({total})</span>
                        </h3>
                        <div className="relative w-full sm:w-80">
                            <FaSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by ID, name, course, address..."
                                className="w-full border border-gray-300 rounded-md pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-gray-200 bg-gray-50">
                                    <th className="px-3 py-3 font-semibold text-gray-600">UID</th>
                                    <th className="px-3 py-3 font-semibold text-gray-600">Student</th>
                                    <th className="px-3 py-3 font-semibold text-gray-600">Course</th>
                                    <th className="px-3 py-3 font-semibold text-gray-600">DOB</th>
                                    <th className="px-3 py-3 font-semibold text-gray-600">Issue Date</th>
                                    <th className="px-3 py-3 font-semibold text-gray-600 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {listLoading ? (
                                    <tr>
                                        <td colSpan={6} className="px-3 py-10 text-center text-gray-500">
                                            Loading...
                                        </td>
                                    </tr>
                                ) : certificates.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-3 py-10 text-center text-gray-500">
                                            {debouncedSearch
                                                ? "No certificates match your search."
                                                : "No certificates yet."}
                                        </td>
                                    </tr>
                                ) : (
                                    certificates.map((cert) => (
                                        <tr
                                            key={cert._id}
                                            className={`border-b border-gray-100 hover:bg-emerald-50/40 ${
                                                editingId === cert._id ? "bg-emerald-50" : ""
                                            }`}
                                        >
                                            <td className="px-3 py-3 font-mono text-xs font-semibold text-emerald-800">
                                                {cert.certificateId}
                                            </td>
                                            <td className="px-3 py-3 font-medium text-gray-800">
                                                {cert.studentName}
                                            </td>
                                            <td className="px-3 py-3 text-gray-600">{cert.courseName}</td>
                                            <td className="px-3 py-3 text-gray-600">
                                                {cert.dob ? toDateInput(cert.dob) : "—"}
                                            </td>
                                            <td className="px-3 py-3 text-gray-600">
                                                {cert.issueDate ? toDateInput(cert.issueDate) : "—"}
                                            </td>
                                            <td className="px-3 py-3">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => startEdit(cert)}
                                                        className="rounded-md bg-emerald-100 p-2 text-emerald-700 hover:bg-emerald-200"
                                                        title="Edit"
                                                    >
                                                        <FaEdit className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(cert)}
                                                        className="rounded-md bg-red-100 p-2 text-red-600 hover:bg-red-200"
                                                        title="Delete"
                                                    >
                                                        <RiDeleteBin5Line className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {pages > 1 && (
                        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
                            <span>
                                Page {page} of {pages}
                            </span>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page <= 1}
                                    className="flex items-center gap-1 rounded-md border border-gray-300 px-3 py-1.5 hover:bg-gray-50 disabled:opacity-40"
                                >
                                    <FaChevronLeft className="h-3 w-3" /> Prev
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPage((p) => Math.min(pages, p + 1))}
                                    disabled={page >= pages}
                                    className="flex items-center gap-1 rounded-md border border-gray-300 px-3 py-1.5 hover:bg-gray-50 disabled:opacity-40"
                                >
                                    Next <FaChevronRight className="h-3 w-3" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CertificateAdd;
