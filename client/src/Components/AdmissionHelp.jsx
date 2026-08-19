import Bkash from "./Bkash";

const AdmissionHelp = () => {
  return (
    <div className="container-narrow px-4 py-12 text-center">
      {/* Main Title */}
      <h2 className="mb-8 font-heading text-display-sm font-extrabold leading-snug text-neutral-900 sm:text-display-md">
        <span className="text-primary-600">ভর্তি প্রক্রিয়া</span>
      </h2>

      {/* Instructions Section */}
      <div className="space-y-6 text-left text-neutral-700 sm:text-center">
        {/* Step 1 */}
        <div>
          <h3 className="mb-2 font-heading text-heading-lg font-semibold text-neutral-900">
            কিভাবে ফি প্রদান করবেন?
          </h3>
          <p className="text-body leading-relaxed sm:text-body-sm">
            ভর্তি হতে চাইলে আগে নির্ধারিত পেমেন্ট মাধ্যমের মাধ্যমে ফি প্রদান
            করতে হবে।
          </p>
        </div>

        {/* Bangladesh */}
        <div className="rounded-card border-l-4 border-success bg-success/5 p-5 text-left sm:text-center">
          <p className="mb-2 font-heading text-lg font-bold text-success">
            বাংলাদেশের শিক্ষার্থীদের জন্য
          </p>
          <p className="text-body">
            বিকাশ / নগদ এর মাধ্যমে পেমেন্ট করে, পেমেন্টের পর নিচের নাম্বারে তথ্য
            পাঠাতে হবে।
          </p>
        </div>

        {/* India */}
        <div className="rounded-card border-l-4 border-accent-500 bg-accent-50 p-5 text-left sm:text-center">
          <p className="mb-2 font-heading text-lg font-bold text-accent-700">
            ভারতের শিক্ষার্থীদের জন্য
          </p>
          <p className="text-body">
            গুগল পে / ফোন পে এর মাধ্যমে পেমেন্ট করে, পেমেন্টের পর একইভাবে তথ্য
            পাঠাতে হবে।
          </p>
        </div>

        {/* Info after payment */}
        <div>
          <h3 className="mb-3 font-heading text-heading-lg font-semibold text-neutral-900">
            পেমেন্টের পর যে তথ্যগুলো পাঠাতে হবে
          </h3>
          <ol className="mx-auto inline-block list-decimal space-y-1.5 text-left text-body sm:text-center">
            <li>যে নাম্বার থেকে টাকা পাঠিয়েছেন সেটি</li>
            <li>পেমেন্ট আইডি / ট্রান্সেকশন নাম্বার</li>
            <li>বাঙ্গালদের জন্য ১৫০০ টাকা</li>
            <li>ভারতীয়দের জন্য ১২০০ রুপি</li>
          </ol>
        </div>
      </div>

      {/* Divider */}
      <hr className="my-12 border-neutral-200" />

      {/* Payment Form */}
      <Bkash />
    </div>
  );
};

export default AdmissionHelp;
