import React, { useState } from "react";
import useAuthContext from "../hooks/useAuthContext";
import Swal from "sweetalert2";

const Bkash = () => {
  const { user } = useAuthContext();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    country: "Bangladesh",
    streetAddress: "",
    city: "",
    district: "",
    postcode: "",
    phone: "",
    notes: "",
    paymentMethod: "bKash", // default bKash
    paymentNumber: "",
    transactionId: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePaymentChange = (method) => {
    setForm({
      ...form,
      paymentMethod: method,
      paymentNumber: "",
      transactionId: "",
    });
  };
  const baseUrl = import.meta.env.VITE_MAHAD_baseUrl;
  const handleSubmit = async () => {
    // Required fields list
    const requiredFields = [
      "firstName",
      "lastName",
      "country",
      "streetAddress",
      "city",
      "district",
      "postcode",
      "phone",
      "paymentMethod",
      "paymentNumber",
      "transactionId",
    ];

    // Check missing fields
    const missing = requiredFields.filter((field) => !form[field]?.trim());

    if (missing.length > 0) {
      Swal.fire({
        position: "top-end",
        icon: "warning",
        title: "⚠️ Please fill out all required fields!",
        showConfirmButton: false,
        timer: 2000,
      });
      return;
    }

    // Proceed if no missing fields
    try {
      const res = await fetch(`${baseUrl}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      console.log(data);

      if (res.ok) {
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: "✅ Order placed successfully!",
          showConfirmButton: false,
          timer: 2000,
        });
      } else {
        Swal.fire({
          position: "top-end",
          icon: "error",
          title: data.message || "❌ Something went wrong!",
          showConfirmButton: false,
          timer: 2000,
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        position: "top-end",
        icon: "error",
        title: "❌ Server not responding!",
        showConfirmButton: false,
        timer: 2000,
      });
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-2xl shadow">
      {/* Contact */}
      <h2 className="text-xl font-semibold mb-4">Contact</h2>
      <p className="text-gray-600 text-sm mb-6">Hi {user?.firstname}</p>

      {/* Billing Details */}
      <h2 className="text-xl font-semibold mb-4">Billing Details</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <input
          type="text"
          name="firstName"
          placeholder="First name"
          value={form.firstName}
          onChange={handleChange}
          className="border p-2 rounded w-full"
        />
        <input
          type="text"
          name="lastName"
          placeholder="Last name"
          value={form.lastName}
          onChange={handleChange}
          className="border p-2 rounded w-full"
        />
      </div>

      <div className="mb-4">
        <select
          name="country"
          value={form.country}
          onChange={handleChange}
          className="border p-2 rounded w-full"
        >
          <option>Bangladesh</option>
          <option>India</option>
        </select>
      </div>

      <input
        type="text"
        name="streetAddress"
        placeholder="Street address"
        value={form.streetAddress}
        onChange={handleChange}
        className="border p-2 rounded w-full mb-4"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <input
          type="text"
          name="city"
          placeholder="Town / City"
          value={form.city}
          onChange={handleChange}
          className="border p-2 rounded w-full"
        />
        <input
          type="text"
          name="district"
          placeholder="District"
          value={form.district}
          onChange={handleChange}
          className="border p-2 rounded w-full"
        />
        <input
          type="text"
          name="postcode"
          placeholder="Postcode / ZIP"
          value={form.postcode}
          onChange={handleChange}
          className="border p-2 rounded w-full"
        />
      </div>

      <input
        type="text"
        name="phone"
        placeholder="Phone"
        value={form.phone}
        onChange={handleChange}
        className="border p-2 rounded w-full mb-6"
      />

      {/* Additional Information */}
      <h2 className="text-xl font-semibold mb-4">Additional Information</h2>
      <textarea
        name="notes"
        placeholder="Notes about your order, e.g. special notes for delivery."
        value={form.notes}
        onChange={handleChange}
        className="border p-2 rounded w-full mb-6"
        rows="3"
      />

      {/* Payment Section */}
      <h2 className="text-xl font-semibold mb-4">Payment</h2>

      {/* Option 1: bKash / Nagad */}
      <div className="border border-green-500 rounded p-4 bg-green-50 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <input
            type="radio"
            name="paymentMethod"
            value="bKash"
            checked={form.paymentMethod === "bKash"}
            onChange={() => handlePaymentChange("bKash")}
          />
          <span className="font-semibold text-pink-600">bKash</span>

          <input
            type="radio"
            name="paymentMethod"
            value="Nagad"
            checked={form.paymentMethod === "Nagad"}
            onChange={() => handlePaymentChange("Nagad")}
            className="ml-6"
          />
          <span className="font-semibold text-red-600">Nagad</span>
        </div>

        {(form.paymentMethod === "bKash" || form.paymentMethod === "Nagad") && (
          <>
            <p className="text-sm text-gray-700 mb-4">
              Please complete your {form.paymentMethod} payment first, then fill
              up the form.
            </p>
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {form.paymentMethod} Personal Number:
              </label>
              <div className="font-semibold text-gray-800">
                {form.paymentMethod === "bKash"
                  ? "+8801883128299"
                  : "+8801883128299"}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                name="paymentNumber"
                placeholder={`${form.paymentMethod} Number`}
                value={form.paymentNumber}
                onChange={handleChange}
                className="border p-2 rounded w-full"
              />
              <input
                type="text"
                name="transactionId"
                placeholder={`${form.paymentMethod} Transaction ID`}
                value={form.transactionId}
                onChange={handleChange}
                className="border p-2 rounded w-full"
              />
            </div>
          </>
        )}
      </div>

      {/* Option 2: Google Pay / PhonePe */}
      <div className="border border-blue-500 rounded p-4 bg-blue-50 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <input
            type="radio"
            name="paymentMethod"
            value="GooglePay"
            checked={form.paymentMethod === "GooglePay"}
            onChange={() => handlePaymentChange("GooglePay")}
          />
          <span className="font-semibold text-blue-600">Google Pay</span>

          <input
            type="radio"
            name="paymentMethod"
            value="PhonePe"
            checked={form.paymentMethod === "PhonePe"}
            onChange={() => handlePaymentChange("PhonePe")}
            className="ml-6"
          />
          <span className="font-semibold text-purple-600">PhonePe</span>
        </div>

        {(form.paymentMethod === "GooglePay" ||
          form.paymentMethod === "PhonePe") && (
          <>
            <p className="text-sm text-gray-700 mb-4">
              Please complete your {form.paymentMethod} payment first, then fill
              up the form.
            </p>
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                UPI Number:
              </label>
              <div className="font-semibold text-gray-800">+91 93652 62648</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                name="paymentNumber"
                placeholder={`${form.paymentMethod} UPI ID / Number`}
                value={form.paymentNumber}
                onChange={handleChange}
                className="border p-2 rounded w-full"
              />
              <input
                type="text"
                name="transactionId"
                placeholder={`${form.paymentMethod} Transaction ID`}
                value={form.transactionId}
                onChange={handleChange}
                className="border p-2 rounded w-full"
              />
            </div>
          </>
        )}
      </div>

      {/* Place Order */}
      <button
        onClick={handleSubmit}
        className="bg-green-600 text-white w-full py-3 rounded font-bold hover:bg-green-700"
      >
        Place Order 1500tk/1200Rupee
      </button>
    </div>
  );
};

export default Bkash;
