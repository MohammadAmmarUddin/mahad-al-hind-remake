import { useEffect, useRef, useState } from "react";
import JoditEditor from "jodit-react";
import { RxCross2 } from "react-icons/rx";
import useAuthContext from "../../../hooks/useAuthContext";
import { API } from "../../../config/api";
import { uploadFilesToBackend, validateFile } from "../../../utils/uploadMedia";
import { resolveMediaUrl } from "../../../utils/media";

const AddCourses = () => {
  const { user } = useAuthContext();
  const editor = useRef(null);

  // Form state variables
  const [courseTitle, setCourseTitle] = useState("");
  const [magnetLine, setmagnetLine] = useState("");
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [price, setPrice] = useState("");
  const [discount, setDiscount] = useState("");
  const [requirements, setRequirements] = useState("");
  const [whatsappGroupLink, setWhatsappGroupLink] = useState("");
  const [content, setContent] = useState(""); // For course details
  const [searchTerm, setSearchTerm] = useState("");
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [selectInstructors, setSelectInstructors] = useState([]);
  const [selectedInstructors, setSelectedInstructors] = useState([]);
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  const [selectedVideos, setSelectedVideos] = useState([]);
  const [videoInputType, setVideoInputType] = useState("file");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [youtubeTitle, setYoutubeTitle] = useState("");
  const [selectedKeywords, setSelectedKeywords] = useState([]);
  const [keywordInput, setKeywordInput] = useState("");
  const [loading, setLoading] = useState(false); // Loading state for upload process
  const [uploadProgress, setUploadProgress] = useState(0); // Track the overall upload progress
  const [completedUploads, setCompletedUploads] = useState(0); // Added state for completed uploads
  const [totalFiles, setTotalFiles] = useState(0); // Moved here and made a state variable
  const [quizzes, setQuizzes] = useState([
    { question: "", options: ["", "", "", ""], answer: "", selectedAnswer: "" },
  ]);
  const baseUrl = API;
  // Fetch instructors data
  const fetchAllUsers = () => {
    const url = `${baseUrl}/api/user/allUsers`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setSelectInstructors(data);
      })
      .catch((error) => console.log(error));
  };

  useEffect(() => {
    fetchAllUsers();
  }, []);

  // Handle search input change
  const handleInputChange = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
    setDropdownVisible(value.length > 0);
  };

  // Handle suggestion click for instructors
  const handleSuggestionClick = (instructor) => {
    if (
      !selectedInstructors.find((selected) => selected._id === instructor._id)
    ) {
      setSelectedInstructors([...selectedInstructors, instructor]);
    }
    setSearchTerm("");
    setDropdownVisible(false);
  };

  // Handle removing instructor from selected instructors
  const handleRemoveInstructor = (id) => {
    setSelectedInstructors(
      selectedInstructors.filter((instructor) => instructor._id !== id)
    );
  };

  const handleAddVideoFile = (e) => {
    const videoFile = e.target.files[0];
    if (videoFile) {
      setSelectedVideos([
        ...selectedVideos,
        { videoTitle: videoFile.name, videoFile, resourceType: "video" },
      ]);
    }
  };

  const handleAddYoutubeVideo = () => {
    if (youtubeUrl.trim() && youtubeTitle.trim()) {
      setSelectedVideos([
        ...selectedVideos,
        {
          videoTitle: youtubeTitle.trim(),
          videoLink: youtubeUrl.trim(),
          resourceType: "youtube",
          publicId: "",
        },
      ]);
      setYoutubeUrl("");
      setYoutubeTitle("");
    }
  };

  // Handle keyword addition
  const handleAddKeyword = () => {
    if (keywordInput.trim() !== "") {
      setSelectedKeywords([...selectedKeywords, keywordInput.trim()]);
      setKeywordInput("");
    }
  };

  const uploadFileToCloudinary = async (file, folder, resourceType = "image") => {
    validateFile(file, {
      allowedTypes:
        resourceType === "video"
          ? ["video/mp4", "video/webm", "video/quicktime", "video/x-msvideo"]
          : resourceType === "raw"
            ? ["application/pdf"]
            : ["image/jpeg", "image/png", "image/webp", "image/gif"],
      maxSize:
        resourceType === "video"
          ? 250 * 1024 * 1024
          : resourceType === "raw"
            ? 20 * 1024 * 1024
            : 10 * 1024 * 1024,
    });

    const result = await uploadFilesToBackend({
      files: [file],
      folder,
      resourceType,
      onProgress: (progress) => {
        setUploadProgress(progress);
      },
    });

    setCompletedUploads((prev) => prev + 1);
    setUploadProgress(0);
    return Array.isArray(result) ? result[0] : result;
  };

  const handleAddQuiz = () => {
    setQuizzes([
      ...quizzes,
      {
        question: "",
        options: ["", "", "", ""],
        answer: "",
        selectedAnswer: "",
      },
    ]);
  };

  const handleQuizChange = (index, field, value, optionIndex = null) => {
    const newQuizzes = [...quizzes];
    if (field === "option") {
      newQuizzes[index].options[optionIndex] = value;
    } else if (field === "selectedAnswer") {
      newQuizzes[index].selectedAnswer = value;
      newQuizzes[index].answer = optionIndex.toString();
    } else {
      newQuizzes[index][field] = value;
    }
    setQuizzes(newQuizzes);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setUploadProgress(0);
    setCompletedUploads(0); // Reset completed uploads count

    const fileVideos = selectedVideos.filter((v) => v.videoFile);
    const total =
      fileVideos.length + (bannerFile ? 1 : 0) + (pdfFile ? 1 : 0);
    setTotalFiles(total);

    try {
      let bannerURL = "";
      let bannerPublicId = "";
      let pdfURL = "";
      let syllabusPublicId = "";
      const videoURLs = [];

      // Upload banner to Cloudinary through the backend
      if (bannerFile) {
        const bannerAsset = await uploadFileToCloudinary(
          bannerFile,
          "admin/courses/banner",
          "image"
        );
        bannerURL = bannerAsset?.secureUrl || bannerAsset?.image || "";
        bannerPublicId = bannerAsset?.publicId || "";
      }

      // Upload PDF to Cloudinary through the backend
      if (pdfFile) {
        const pdfAsset = await uploadFileToCloudinary(pdfFile, "admin/courses/syllabus", "raw");
        pdfURL = pdfAsset?.secureUrl || pdfAsset?.image || "";
        syllabusPublicId = pdfAsset?.publicId || "";
      }

      // Process each video — upload files to Cloudinary, keep YouTube URLs as-is
      for (const video of selectedVideos) {
        if (video.resourceType === "youtube") {
          videoURLs.push({
            videoTitle: video.videoTitle,
            videoLink: video.videoLink,
            publicId: "",
            resourceType: "youtube",
          });
        } else {
          const videoAsset = await uploadFileToCloudinary(
            video.videoFile,
            "admin/courses/videos",
            "video"
          );
          videoURLs.push({
            videoTitle: video.videoTitle,
            videoLink: videoAsset?.secureUrl || videoAsset?.image || "",
            publicId: videoAsset?.publicId || "",
            resourceType: videoAsset?.resourceType || "video",
          });
        }
      }

      // Prepare data for API
      const courseData = {
        userId: user?.user?._id,
        title: courseTitle, // Actual course title from the form
        magnetLine: magnetLine, // Actual magnet line from the form
        details: content, // Course details from the editor
        requirements, // Actual requirements from the form
        whatsappGroupLink, // Actual WhatsApp group link from the form
        instructorsId: selectedInstructors.map((inst) => inst._id),
        banner: bannerURL,
        bannerPublicId,
        videos: videoURLs,
        category, // Actual category from the form
        subCategory, // Actual sub-category from the form
        syllabus: pdfURL,
        syllabusPublicId,
        keywords: selectedKeywords,
        price, // Actual price from the form
        discount, // Actual discount from the form
        quizzes: quizzes.map((quiz) => ({
          question: quiz.question,
          options: quiz.options,
          answer: parseInt(quiz.answer),
        })),
      };
      const baseUrl = API;
      // Make a POST request to the backend API
      const response = await fetch(`${baseUrl}/api/course/createCourse`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(courseData),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Course created successfully:", data);
        setUploadProgress(100); // Set to 100% after successful creation
      } else {
        console.error("Failed to create course:", await response.text());
      }
    } catch (error) {
      console.error("Error uploading files:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {loading ? (
        <div className="fixed inset-0 bg-white flex flex-col justify-center items-center">
          <h2 className="text-2xl font-semibold text-center">
            Please wait. Files are uploading and processing. <br /> This may
            take a while.
          </h2>
          <div className="w-64 h-6 bg-gray-200 rounded-full mt-4 overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p className="mt-2 text-gray-600">{Math.round(uploadProgress)}%</p>
          <p className="mt-2 text-gray-600">
            {completedUploads}/{totalFiles} files uploaded
          </p>{" "}
          {/* Updated progress display */}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="lg:p-6 pt-6">
          <h1 className="text-3xl font-bold text-primary mb-8">Add Course</h1>
          <div className="flex md:flex-row flex-col justify-between gap-3">
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Course Title</span>
              </label>
              <input
                type="text"
                name="courseTitle"
                value={courseTitle}
                onChange={(e) => setCourseTitle(e.target.value)}
                placeholder="Course Title"
                className="px-3 py-[11px] rounded-md border border-slate-200"
              />
            </div>
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Magnet Line</span>
              </label>
              <input
                type="text"
                name="magnetLine"
                value={magnetLine}
                onChange={(e) => setmagnetLine(e.target.value)}
                placeholder="Magnet Line"
                className="px-3 py-[11px] rounded-md border border-slate-200"
              />
            </div>
          </div>

          <div className="flex justify-between gap-3">
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Category</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="px-3 py-[11px] rounded-md cursor-pointer border border-slate-200"
              >
                <option disabled selected>
                  Select a category
                </option>
                <option>Qira'at Hafs</option>
                <option>Qira'at Saba</option>
                <option>Qira'at A'shara</option>
                <option>Muqaddamatul Jazari</option>
              </select>
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Sub category</span>
              </label>
              <select
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
                className="px-3 py-[11px] rounded-md cursor-pointer border border-slate-200"
              >
                <option disabled selected>
                  Select a sub-category
                </option>

                <option>Ḥafṣ ʿan ʿĀṣim – Ṭarīq ash-Shāṭibiyyah</option>
                <option>Ḥafṣ ʿan ʿĀṣim – Ṭarīq aṭ-Ṭayyibah</option>
                <option>Shuʿbah ʿan ʿĀṣim – Ṭarīq ash-Shāṭibiyyah</option>


                <option>Warsh ʿan Nāfiʿ – Ṭarīq al-Azraq</option>
                <option>Warsh ʿan Nāfiʿ – Ṭarīq al-Asbahani</option>
                <option>Qālūn ʿan Nāfiʿ – Ṭarīq ash-Shāṭibiyyah</option>

                <option>ad-Dūrī ʿan Abū ʿAmr – Ṭarīq ash-Shāṭibiyyah</option>
                <option>as-Sūsī ʿan Abū ʿAmr – Ṭarīq ash-Shāṭibiyyah</option>

                <option>al-Bazzī ʿan Ibn Kathīr – Ṭarīq ash-Shāṭibiyyah</option>
                <option>Qunbul ʿan Ibn Kathīr – Ṭarīq ash-Shāṭibiyyah</option>

                <option>Khalaf ʿan Ḥamzah – Ṭarīq ash-Shāṭibiyyah</option>
                <option>Khalād ʿan Ḥamzah – Ṭarīq ash-Shāṭibiyyah</option>

                <option>Abū al-Ḥārith ʿan al-Kisāʾī – Ṭarīq ash-Shāṭibiyyah</option>
                <option>ad-Dūrī ʿan al-Kisāʾī – Ṭarīq ash-Shāṭibiyyah</option>

                <option>Ibn Wardan ʿan Abū Jaʿfar – Ṭarīq aṭ-Ṭayyibah</option>
                <option>Ibn Jammaz ʿan Abū Jaʿfar – Ṭarīq aṭ-Ṭayyibah</option>

                <option>Ruways ʿan Yaʿqūb – Ṭarīq aṭ-Ṭayyibah</option>
                <option>Rawḥ ʿan Yaʿqūb – Ṭarīq aṭ-Ṭayyibah</option>

                <option>Ishāq ʿan Khalaf al-ʿĀshir – Ṭarīq aṭ-Ṭayyibah</option>
                <option>Idrīs ʿan Khalaf al-ʿĀshir – Ṭarīq aṭ-Ṭayyibah</option>
              </select>
            </div>
          </div>

          <div className="flex justify-between gap-3">
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Price</span>
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Price"
                className="px-3 py-[11px] rounded-md border border-slate-200"
              />
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Discount</span>
              </label>
              <input
                type="number"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                placeholder="Discount"
                className="px-3 py-[11px] rounded-md border border-slate-200"
              />
            </div>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Course Details*</span>
            </label>
            <div className="custom-class -z-50 no-tailwind custom-ul custom-ol">
              <JoditEditor
                ref={editor}
                value={content}
                onChange={(newContent) => setContent(newContent)}
              />
            </div>
          </div>

          <div className="flex md:flex-row flex-col justify-between gap-3">
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Banner</span>
              </label>
              <input
                type="file"
                onChange={(e) => {
                  const file = e.target.files[0];
                  setBannerFile(file || null);
                  setBannerPreview(file ? URL.createObjectURL(file) : "");
                }}
                accept="image/*"
                className="file-input w-full file-input-bordered"
              />
              {bannerPreview && (
                <img
                  src={bannerPreview}
                  alt="Banner preview"
                  className="mt-3 h-40 w-full rounded-xl object-cover"
                />
              )}
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Syllabus</span>
              </label>
              <input
                type="file"
                onChange={(e) => setPdfFile(e.target.files[0])}
                accept="application/pdf"
                className="file-input w-full file-input-bordered"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 grid-cols-1 gap-3">
            <div className="grid grid-cols-4 gap-3">
              <div className="form-control col-span-4 w-full">
                <label className="label">
                  <span className="label-text">Videos</span>
                </label>
                <div className="flex gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => setVideoInputType("file")}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${
                      videoInputType === "file"
                        ? "bg-primary text-white"
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    Upload File
                  </button>
                  <button
                    type="button"
                    onClick={() => setVideoInputType("youtube")}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${
                      videoInputType === "youtube"
                        ? "bg-primary text-white"
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    YouTube Link
                  </button>
                </div>
                {videoInputType === "file" ? (
                  <input
                    type="file"
                    onChange={handleAddVideoFile}
                    accept="video/*"
                    className="file-input w-full file-input-bordered"
                  />
                ) : (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={youtubeTitle}
                      onChange={(e) => setYoutubeTitle(e.target.value)}
                      placeholder="Video Title"
                      className="w-full px-3 py-[11px] rounded-md border border-slate-200"
                    />
                    <input
                      type="url"
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      placeholder="YouTube URL (e.g. https://youtu.be/... or https://www.youtube.com/watch?v=...)"
                      className="w-full px-3 py-[11px] rounded-md border border-slate-200"
                    />
                    <button
                      type="button"
                      onClick={handleAddYoutubeVideo}
                      disabled={!youtubeUrl.trim() || !youtubeTitle.trim()}
                      className="px-4 py-2 rounded-md bg-primary text-white text-sm font-medium disabled:opacity-50"
                    >
                      Add YouTube Video
                    </button>
                  </div>
                )}
              </div>

              <div className="border mt-3 h-44 col-span-4 overflow-y-scroll rounded-md p-3">
                <p className="text-center pb-3">Your selected videos</p>
                {selectedVideos.map((video, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center gap-5 bg-slate-200 p-2 rounded-md mb-2"
                  >
                    <div className="flex gap-3 items-center">
                      <p>{index + 1}.</p>
                      {video.resourceType === "youtube" && (
                        <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-medium">YT</span>
                      )}
                      <p>
                        {video.videoTitle.slice(0, 18)}...
                      </p>
                    </div>
                    <RxCross2
                      className="text-red-600 cursor-pointer shrink-0"
                      onClick={() =>
                        setSelectedVideos(
                          selectedVideos.filter((_, i) => i !== index)
                        )
                      }
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="form-control w-full relative">
              <label className="label">
                <span className="label-text">Instructors</span>
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={handleInputChange}
                onFocus={() => setDropdownVisible(searchTerm.length > 0)}
                onBlur={() => setTimeout(() => setDropdownVisible(false), 100)}
                placeholder="Instructors"
                className="px-3 py-[11px] rounded-md border border-slate-200"
              />

              {dropdownVisible && (
                <ul className="absolute top-24 right-0 w-full bg-white text-black border border-gray-200 mt-1 z-10 rounded-md">
                  {selectInstructors
                    .filter((instructor) =>
                      `${instructor.firstname} ${instructor.lastname}`
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase())
                    )
                    .map((instructor) => (
                      <li
                        key={instructor._id}
                        className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                        onMouseDown={() => handleSuggestionClick(instructor)}
                      >
                        <div className="flex gap-3 items-center">
                          <div className="avatar">
                            <div className="w-10 h-10 border rounded-md object-cover">
                              <img src={resolveMediaUrl(instructor.img)} alt={instructor.img} />
                            </div>
                          </div>
                          <div>
                            <h5 className="font-semibold pb-2">
                              {instructor.firstname} {instructor.lastname}
                            </h5>
                          </div>
                        </div>
                      </li>
                    ))}
                </ul>
              )}

              <div className="border mt-6 h-44 col-span-4 overflow-y-scroll rounded-md p-3">
                <p className="text-center pb-3">Your selected instructors</p>
                {selectedInstructors.map((instructor, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center gap-5 bg-slate-200 p-2 rounded-md mb-2"
                  >
                    <div className="flex gap-3">
                      <p>{index + 1}.</p>
                      <p>
                        {instructor.firstname} {instructor.lastname}
                      </p>
                    </div>
                    <RxCross2
                      className="text-red-600 cursor-pointer"
                      onClick={() => handleRemoveInstructor(instructor._id)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="md:grid md:grid-cols-2 gap-3">
            <div className="grid md:grid-cols-4 grid-cols-1 gap-3">
              <div className="form-control col-span-3 w-full">
                <label className="label">
                  <span className="label-text">Keywords</span>
                </label>
                <input
                  type="text"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  placeholder="Add a keyword"
                  className="px-3 py-[11px] rounded-md border border-slate-200"
                />
              </div>
              <p
                onClick={handleAddKeyword}
                className="border h-fit px-4 text-center rounded-md py-[11px] cursor-pointer bg-slate-200 mt-9"
              >
                Add Keyword
              </p>

              <div className="border mt-3 h-44 col-span-4 overflow-y-scroll rounded-md p-3">
                <p className="text-center pb-3">Your selected keywords</p>
                <div className="flex gap-3 flex-wrap">
                  {selectedKeywords.map((keyword, index) => (
                    <div
                      key={index}
                      className="flex gap-5 w-fit items-center bg-slate-200 p-2 rounded-md mb-2"
                    >
                      <p>{keyword}</p>
                      <RxCross2
                        className="text-red-600 cursor-pointer"
                        onClick={() =>
                          setSelectedKeywords(
                            selectedKeywords.filter((_, i) => i !== index)
                          )
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div >
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">Requirements</span>
                </label>
                <input
                  type="text"
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  placeholder="Requirements"
                  className="px-3 py-[11px] rounded-md border border-slate-200"
                />
              </div>
              <div className="form-control w-full mt-3">
                <label className="label">
                  <span className="label-text">Whatsapp Group Link</span>
                </label>
                <input
                  type="text"
                  value={whatsappGroupLink}
                  onChange={(e) => setWhatsappGroupLink(e.target.value)}
                  placeholder="Whatsapp Group Link"
                  className="px-3 py-[11px] rounded-md border border-slate-200"
                />
              </div>
            </div>
            {/* Quiz Section */}
            <div className="col-span-2 mt-4">
              <h3 className="mb-2">Quizzes</h3>
              {quizzes.map((quiz, quizIndex) => (
                <div key={quizIndex} className="rounded-md pb-5">
                  <div className="flex gap-2 items-center">
                    <p>{quizIndex + 1}.</p>
                    <input
                      type="text"
                      value={quiz.question}
                      onChange={(e) =>
                        handleQuizChange(quizIndex, "question", e.target.value)
                      }
                      placeholder="Question"
                      className="w-full px-3 py-2 mb-2 rounded-md border border-slate-200"
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4 pt-2">
                    {quiz.options.map((option, optionIndex) => (
                      <div
                        key={optionIndex}
                        className="flex items-center gap-2"
                      >
                        <input
                          type="radio"
                          id={`quiz-${quizIndex}-option-${optionIndex}`}
                          name={`quiz-${quizIndex}-answer`}
                          value={optionIndex}
                          checked={
                            quiz.selectedAnswer === optionIndex.toString()
                          }
                          onChange={(e) =>
                            handleQuizChange(
                              quizIndex,
                              "selectedAnswer",
                              e.target.value,
                              optionIndex
                            )
                          }
                          className="radio"
                        />
                        <label
                          htmlFor={`quiz-${quizIndex}-option-${optionIndex}`}
                          className="flex items-center gap-2 w-full"
                        >
                          <span>{String.fromCharCode(97 + optionIndex)}.</span>
                          <input
                            type="text"
                            value={option}
                            onChange={(e) =>
                              handleQuizChange(
                                quizIndex,
                                "option",
                                e.target.value,
                                optionIndex
                              )
                            }
                            placeholder={`Option ${String.fromCharCode(
                              97 + optionIndex
                            )}`}
                            className="w-full px-3 py-2 rounded-md border border-slate-200"
                          />
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddQuiz}
                className="px-4 py-2 bg-slate-200 rounded-md mt-4"
              >
                Add More Quiz
              </button>
            </div>
          </div>

          <div className="pt-8 text-center">
            <button
              type="submit"
              className="rounded-md py-[11px] px-4 bg-primary font-semibold text-white"
            >
              Add Course
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default AddCourses;
