import Bkash from "./Bkash";

const AdmissionHelp = () => {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 text-center">
      {/* Main Title */}
      <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-8 leading-snug">
        📌 <span className="text-green-600">ভর্তি প্রক্রিয়া</span>
      </h2>

      {/* Instructions Section */}
      <div className="space-y-6 text-gray-700">
        {/* Step 1 */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            ✅ কিভাবে ফি প্রদান করবেন?
          </h3>
          <p className="text-base md:text-lg leading-relaxed">
            ভর্তি হতে চাইলে আগে নির্ধারিত পেমেন্ট মাধ্যমের মাধ্যমে ফি প্রদান
            করতে হবে।
          </p>
        </div>

        {/* Bangladesh */}
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded text-left md:text-center">
          <p className="text-lg font-bold text-green-700 mb-2">
            🇧🇩 বাংলাদেশের শিক্ষার্থীদের জন্য
          </p>
          <p className="text-base">
            বিকাশ / নগদ এর মাধ্যমে পেমেন্ট করে, পেমেন্টের পর নিচের নাম্বারে তথ্য
            পাঠাতে হবে।
          </p>
        </div>

        {/* India */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded text-left md:text-center">
          <p className="text-lg font-bold text-blue-700 mb-2">
            🇮🇳 ভারতের শিক্ষার্থীদের জন্য
          </p>
          <p className="text-base">
            গুগল পে / ফোন পে এর মাধ্যমে পেমেন্ট করে, পেমেন্টের পর একইভাবে তথ্য
            পাঠাতে হবে।
          </p>
        </div>

        {/* Info after payment */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            📲 পেমেন্টের পর যে তথ্যগুলো পাঠাতে হবে
          </h3>
          <ul className="list-decimal list-inside space-y-1 text-left md:text-center mx-auto inline-block text-base">
            <li>যে নাম্বার থেকে টাকা পাঠিয়েছেন সেটি</li>
            <li>পেমেন্ট আইডি / ট্রান্সেকশন নাম্বার</li>
            <li>বাঙ্গালদেশিদের জন্য ১৫০০ টাকা </li>
            <li>ভারতীয়দের জন্য ১২০০ রুপি </li>
          </ul>
        </div>
      </div>

      {/* Divider */}
      <hr className="my-10 border-gray-300" />

      {/* Payment Form */}
      <Bkash />
    </div>
  );
};

export default AdmissionHelp;
