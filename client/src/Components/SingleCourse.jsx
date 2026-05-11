import { useState, useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { IoMdDownload } from "react-icons/io";
import {
  FaChevronLeft,
  FaChevronRight,
  FaDownload,
  FaLock,
  FaRegStar,
  FaStar,
  FaStarHalfAlt,
  FaWhatsapp,
  FaTimes,
  FaCheckCircle,
  FaHourglassHalf,
  FaPlayCircle,
  FaBars,
  FaChevronDown,
  FaChevronUp,
  FaClock,
  FaSignal,
  FaInfinity,
  FaClipboardList,
} from "react-icons/fa";
import { PiExam } from "react-icons/pi";
import Navbar from "./Navbar";
import { MdOutlineSlowMotionVideo } from "react-icons/md";
import { GoNote } from "react-icons/go";
import { TbCurrencyTaka, TbLivePhoto } from "react-icons/tb";
import Footer from "./Footer";
import { FaRegCirclePlay } from "react-icons/fa6";
import { RiBankCard2Line } from "react-icons/ri";
import useAuthContext from "../hooks/useAuthContext";
import Swal from "sweetalert2";
import parse from "html-react-parser";
import { API } from "../config/api";
import { resolveMediaUrl } from "../utils/media";

const BRAND = "#0b148f";

const getYouTubeEmbedUrl = (url) => {
  if (!url || typeof url !== "string") return null;
  const id = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/)|youtu\.be\/|m\.youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/
  )?.[1];
  if (!id || !/^[a-zA-Z0-9_-]{11}$/.test(id)) return null;
  return `https://www.youtube.com/embed/${id}`;
};

const isYouTube = (video) =>
  video?.resourceType === "youtube" ||
  /(?:youtube\.com|youtu\.be)/.test(video?.videoLink || "");

const StarRating = ({ rating, size = "sm" }) => {
  const stars = [];
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.25 && rating % 1 < 0.75;
  const empty = 5 - Math.ceil(rating);
  const cls = size === "lg" ? "text-lg" : "text-sm";
  for (let i = 0; i < full; i++) stars.push(<FaStar key={`f${i}`} className={`${cls} text-amber-400`} />);
  if (half) stars.push(<FaStarHalfAlt key="half" className={`${cls} text-amber-400`} />);
  for (let i = 0; i < empty; i++) stars.push(<FaRegStar key={`e${i}`} className={`${cls} text-amber-400`} />);
  return <span className="inline-flex gap-0.5">{stars}</span>;
};

const groupIntoChunks = (arr, size = 5) => {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
};

const SingleCourse = () => {
  const { id } = useParams();
  const courseId = id;
  const { user } = useAuthContext();
  const [courseData, setCourseData] = useState(null);
  const [reletedCourses, setreletedCourses] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isAdminOrStudent, setIsAdminOrStudent] = useState(false);
  const [rating, setRating] = useState(null);
  const [comments, setComments] = useState("");
  const [unlockedVideos, setUnlockedVideos] = useState(1);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [courseComplete, setCourseComplete] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [quizzes, setQuizzes] = useState([]);
  const [quizComplete, setQuizComplete] = useState(false);
  const [isCourseAlreadyComplete, setIsCourseAlreadyComplete] = useState(false);
  const [certificateId, setCertificateId] = useState("");
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [enrollmentRequested, setEnrollmentRequested] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [manualPaymentMethod, setManualPaymentMethod] = useState("bKash");
  const [manualPaymentNumber, setManualPaymentNumber] = useState("");
  const [manualTransactionId, setManualTransactionId] = useState("");
  const [managingPayment, setManagingPayment] = useState(false);
  const [showMobileCurriculum, setShowMobileCurriculum] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [expandedSections, setExpandedSections] = useState({});
  const userId = user?.user?._id;

  const studentsOpinionCarouselRef = useRef(null);
  const reletedCoursesCarouselRef = useRef(null);

  const discountAmount =
    courseData?.price && courseData?.discount
      ? (parseInt(courseData.price) * parseInt(courseData.discount)) / 100
      : 0;
  const finalPrice = courseData?.price
    ? parseInt(courseData.price) - discountAmount
    : null;

  useEffect(() => {
    if (courseData && courseData.students && userId) {
      const currentStudent = courseData.students.find(
        (student) => String(student.studentsId) === String(userId)
      );
      if (currentStudent) {
        setPaymentComplete(!!currentStudent.paymentComplete);
        setIsAdminOrStudent(!!currentStudent.paymentComplete);
        setUnlockedVideos(currentStudent.unlockedVideo || 1);
        setCourseComplete(
          currentStudent.unlockedVideo === courseData.videos.length
        );
        setQuizComplete(!!currentStudent.isQuizComplete);
        setIsCourseAlreadyComplete(!!currentStudent.isCourseComplete);
        setCertificateId(currentStudent.certificateUrl || "");
        if (!currentStudent.paymentComplete) {
          setEnrollmentRequested(true);
        }
      } else {
        setIsAdminOrStudent(false);
        setPaymentComplete(false);
        setUnlockedVideos(1);
        setQuizComplete(false);
        setIsCourseAlreadyComplete(false);
        setCertificateId("");
      }
    }
  }, [courseData, userId]);

  const baseUrl = API;

  const courseCompleteAction = async () => {
    try {
      const response = await fetch(
        `${baseUrl}/api/course/completeCourse/${userId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ _id: courseData._id }),
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to complete the course");
      const certId = data.certificateId;
      const result = await Swal.fire({
        title: "Congratulations!",
        text: "You have completed the course!",
        icon: "success",
        confirmButtonText: "View Certificate",
      });
      if (result.isConfirmed && certId) {
        window.location.href = `/certificate?certId=${certId}`;
      }
      setCourseComplete(true);
      fetchSingleCourse();
    } catch (error) {
      Swal.fire({ title: "Error", text: error.message || "Failed to complete the course.", icon: "error", confirmButtonText: "OK" });
    }
  };

  const downloadFiteAtURL = (url) => {
    const fileName = url?.split("/").pop().split("?")[0];
    const aTag = document.createElement("a");
    aTag.href = url;
    aTag.setAttribute("download", fileName);
    document.body.appendChild(aTag);
    aTag.click();
    aTag.remove();
  };

  const unlockNextVideo = async () => {
    if (unlockedVideos < courseData.videos.length) {
      try {
        const response = await fetch(
          `${baseUrl}/api/course/unlockVideo/${userId}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ _id: courseData._id }),
          }
        );
        if (response.ok) {
          const newUnlockedVideos = unlockedVideos + 1;
          setUnlockedVideos(newUnlockedVideos);
          if (newUnlockedVideos === courseData.videos.length) {
            setCourseComplete(true);
          }
        }
      } catch (error) {
        console.error("Error unlocking video:", error);
      }
    }
  };

  const handleRatingClick = (rate) => setRating(rate);

  const handleSubmitRating = async () => {
    try {
      const response = await fetch(
        `${baseUrl}/api/course/giveRating/${courseData._id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reviewerId: userId, rating: rating.toString(), comments }),
        }
      );
      if (!response.ok) {
        const data = await response.json();
        if (data.message === "An user cannot give multiple reviews") {
          Swal.fire({ icon: "error", title: "Oops...", text: data.message });
        } else {
          throw new Error("Failed to submit rating");
        }
      } else {
        Swal.fire({ icon: "success", title: "Thank You", text: "Your review is submitted successfully" });
        fetchSingleCourse();
      }
    } catch (error) {
      console.error("Error submitting rating:", error);
    }
  };

  const fetchSingleCourse = async () => {
    try {
      const response = await fetch(`${baseUrl}/api/course/getSingleCourse/${id}`);
      if (!response.ok) throw new Error("Failed to fetch course");
      const data = await response.json();
      setCourseData(data);
      setSelectedVideo(data.videos[0]);
      setQuizzes(
        data.quiz?.map((q) => ({ ...q, selectedAnswer: null })) || []
      );
    } catch (error) {
      console.error("Error fetching course:", error);
    }
  };

  const fetchreletedCourses = () => {
    fetch(`${baseUrl}/api/course/getAllCourses`)
      .then((res) => res.json())
      .then((data) => {
        const courseKeywords = courseData?.keywords?.map((k) => k?.toLowerCase().trim());
        const filtered = data?.filter((course) =>
          course?.keywords?.some((keyword) =>
            courseKeywords?.includes(keyword?.toLowerCase().trim())
          )
        );
        setreletedCourses(filtered);
      })
      .catch((error) => console.log(error));
  };

  const fetchAllUsers = () => {
    fetch(`${baseUrl}/api/user/allUsers`)
      .then((res) => res.json())
      .then((data) => setAllUsers(data))
      .catch((error) => console.log(error));
  };

  useEffect(() => {
    fetchSingleCourse();
    fetchAllUsers();
  }, [id]);

  useEffect(() => {
    if (courseData && courseData.videos && !selectedVideo) {
      setSelectedVideo(courseData.videos[0]);
    }
    if (courseData && courseData.keywords) {
      fetchreletedCourses();
    }
  }, [courseData]);

  const handleVideoSelect = (video, index) => {
    if (!showQuiz) {
      setSelectedVideo(video);
      setCurrentVideoIndex(index);
      setShowMobileCurriculum(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const scrollCarousel = (ref, direction) => {
    if (ref.current) {
      ref.current.scrollBy({ left: direction === "left" ? -200 : 200, behavior: "smooth" });
    }
  };

  const calculateAverageRating = () => {
    if (!courseData?.studentsOpinion || courseData.studentsOpinion.length === 0) return 0;
    const total = courseData.studentsOpinion.reduce((acc, o) => acc + parseInt(o.rating), 0);
    return parseFloat((total / courseData.studentsOpinion.length).toFixed(1));
  };

  const handleQuizChange = (quizIndex, value) => {
    const updated = [...quizzes];
    updated[quizIndex].selectedAnswer = value;
    setQuizzes(updated);
  };

  const handleQuizOpen = () => {
    setShowQuiz(true);
    setSelectedVideo(null);
  };

  const handleQuizSubmit = () => {
    let newScore = 0;
    quizzes.forEach((quiz) => {
      if (quiz.selectedAnswer === quiz.ans.toString()) newScore++;
    });
    setScore(newScore);
    setQuizSubmitted(true);
    setUnlockedVideos(courseData.videos.length);
    const currentQuizState = [...quizzes];
    quizCompleteAction(newScore).then(() => setQuizzes(currentQuizState));
  };

  const handleCloseQuiz = () => {
    setShowQuiz(false);
    setSelectedVideo(courseData.videos[0]);
  };

  const quizCompleteAction = async (newScore) => {
    const quizMarksPercentage = (newScore * 100) / quizzes.length;
    try {
      if (quizMarksPercentage < 40) {
        Swal.fire({ title: "Error", text: `You got ${quizMarksPercentage}% marks. You need at least 40%.`, icon: "error", confirmButtonText: "OK" });
        return;
      }
      const response = await fetch(
        `${baseUrl}/api/course/completeQuiz/${userId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ _id: courseData._id, quizMarks: newScore, quizMarksPercentage }),
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to complete the quiz");
      setQuizComplete(true);
      Swal.fire({ title: "Congratulations!", text: `You got ${quizMarksPercentage}% marks in your quiz!`, icon: "success", confirmButtonText: "OK" });
    } catch (error) {
      Swal.fire({ title: "Error", text: error.message, icon: "error", confirmButtonText: "OK" });
    }
  };

  const renderQuizContent = () => (
    <div className="p-6 rounded-lg border border-slate-200 bg-white">
      <h1 className="text-2xl font-bold mb-6 text-center">Quiz</h1>
      {quizzes.map((quiz, qi) => (
        <div key={qi} className="mb-6 border rounded-lg p-5">
          <p className="font-semibold mb-3">{qi + 1}. {quiz.ques}</p>
          <div className="space-y-2">
            {quiz.options.map((opt, oi) => (
              <label
                key={oi}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${
                  quizSubmitted
                    ? oi.toString() === quiz.ans.toString()
                      ? "border-green-400 bg-green-50"
                      : quiz.selectedAnswer === oi.toString()
                      ? "border-red-400 bg-red-50"
                      : "border-slate-200"
                    : "border-slate-200 hover:border-primary"
                }`}
              >
                <input
                  type="radio"
                  name={`quiz-${qi}`}
                  value={oi.toString()}
                  checked={quiz.selectedAnswer === oi.toString()}
                  onChange={(e) => handleQuizChange(qi, e.target.value)}
                  disabled={quizSubmitted}
                  className="radio radio-sm"
                />
                <span className="text-sm">{opt}</span>
                {quizSubmitted && oi.toString() === quiz.ans.toString() && (
                  <FaCheckCircle className="text-green-500 ml-auto shrink-0" />
                )}
              </label>
            ))}
          </div>
        </div>
      ))}
      {!quizSubmitted && (
        <button onClick={handleQuizSubmit} className="w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-primary/90 transition">
          Submit
        </button>
      )}
      {quizSubmitted && (
        <div className="text-center mt-4">
          <p className="text-lg font-bold">Score: {score}/{quizzes.length}</p>
          <button onClick={handleCloseQuiz} className="mt-3 w-full bg-primary text-white font-bold py-3 rounded-lg transition">
            Return to Videos
          </button>
        </div>
      )}
    </div>
  );

  const makePayment = async () => {
    const paymentData = { courseId: courseData._id, studentsId: userId, price: Math.round(finalPrice) };
    fetch(`${baseUrl}/api/course/payment/order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(paymentData),
    })
      .then((res) => res.json())
      .then((result) => { window.location.replace(result.url); })
      .catch((error) => console.error("Error during payment process:", error));
  };

  const handleManualEnroll = async () => {
    if (!manualTransactionId.trim()) {
      Swal.fire({ icon: "error", title: "Error", text: "Please enter your transaction ID." });
      return;
    }
    setManagingPayment(true);
    try {
      const res = await fetch(`${baseUrl}/api/course/manual-enroll`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: courseData._id, studentsId: userId, payment: Math.round(finalPrice),
          paymentMethod: manualPaymentMethod, paymentNumber: manualPaymentNumber,
          transactionId: manualTransactionId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Enrollment failed");
      setShowPaymentModal(false);
      setEnrollmentRequested(true);
      Swal.fire({ icon: "success", title: "Request Submitted", text: "Your enrollment request has been submitted. An admin will review it shortly." });
      setCourseData((prev) => ({
        ...prev,
        students: [...(prev.students || []), { studentsId: userId, paymentComplete: false }],
      }));
    } catch (error) {
      Swal.fire({ icon: "error", title: "Error", text: error.message });
    } finally {
      setManagingPayment(false);
    }
  };

  const toggleSection = (idx) => {
    setExpandedSections((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const videoSections = groupIntoChunks(courseData?.videos || [], 5);

  useEffect(() => {
    if (videoSections.length > 0) {
      setExpandedSections({ 0: true });
    }
  }, [courseData?.videos?.length]);

  // ---------- Sidebar / Curriculum Component ----------
  const renderSidebar = (mobile = false) => {
    const content = (
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-slate-200 shrink-0">
          <h3 className="font-bold text-slate-900 text-base">Course content</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {courseData?.videos?.length || 0} lectures
            {courseComplete && quizComplete ? " \u00B7 Completed" : ""}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {videoSections.map((section, sIdx) => {
            const isOpen = expandedSections[sIdx];
            return (
              <div key={sIdx} className="border-b border-slate-100">
                <button
                  onClick={() => toggleSection(sIdx)}
                  className="flex items-center justify-between w-full px-4 py-3 text-left hover:bg-slate-50 transition"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-800 truncate">
                      Section {sIdx + 1}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">{section.length} lectures</p>
                  </div>
                  {isOpen ? <FaChevronUp className="shrink-0 text-slate-400 text-xs" /> : <FaChevronDown className="shrink-0 text-slate-400 text-xs" />}
                </button>

                {isOpen && (
                  <div>
                    {section.map((video, vIdx) => {
                      const globalIdx = sIdx * 5 + vIdx;
                      const isLocked = globalIdx >= unlockedVideos;
                      const isActive = selectedVideo?._id === video._id;
                      return (
                        <div
                          key={video._id}
                          onClick={() => !showQuiz && !isLocked && handleVideoSelect(video, globalIdx)}
                          className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition border-l-2 ${
                            isActive
                              ? "bg-[#0b148f]/5 border-l-[#0b148f]"
                              : "border-l-transparent hover:bg-slate-50"
                          } ${showQuiz || isLocked ? "cursor-not-allowed opacity-60" : ""}`}
                        >
                          {isLocked ? (
                            <FaLock className="shrink-0 text-slate-300 text-xs" />
                          ) : (
                            <FaPlayCircle className={`shrink-0 text-xs ${isActive ? "text-[#0b148f]" : "text-slate-400"}`} />
                          )}
                          <div className="min-w-0 flex-1">
                            <p className={`text-xs leading-snug truncate ${isActive ? "font-semibold text-[#0b148f]" : "text-slate-700"}`}>
                              {video.videoTitle}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {courseData?.videos?.length > 0 && (
            <div className="px-4 py-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FaClipboardList className="text-slate-400 text-xs" />
                  <span className="text-xs text-slate-600">Quiz</span>
                </div>
                <button
                  onClick={courseComplete ? handleQuizOpen : undefined}
                  disabled={!courseComplete}
                  className={`text-xs font-semibold px-3 py-1 rounded-full transition ${
                    courseComplete
                      ? "bg-[#0b148f] text-white hover:bg-[#0b148f]/90"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  {!courseComplete ? "Locked" : !quizComplete ? "Start" : "Retake"}
                </button>
              </div>
            </div>
          )}
        </div>

        {courseComplete && quizComplete && (
          <div className="border-t border-slate-200 p-4 shrink-0">
            <button
              onClick={courseCompleteAction}
              className="w-full bg-emerald-600 text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-emerald-700 transition"
            >
              Complete Course
            </button>
          </div>
        )}
      </div>
    );

    if (mobile) {
      return (
        <>
          {showMobileCurriculum && (
            <div className="fixed inset-0 z-50 flex flex-col bg-white">
              <div className="sticky top-0 bg-white border-b border-slate-200 flex items-center justify-between px-4 py-3 z-10">
                <h3 className="font-bold text-base text-slate-900">Course content</h3>
                <button onClick={() => setShowMobileCurriculum(false)} className="p-1.5 hover:bg-slate-100 rounded-lg transition">
                  <FaTimes className="text-slate-500" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                {content}
              </div>
            </div>
          )}

          <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-[0_-2px_10px_rgba(0,0,0,0.08)]">
            <button
              onClick={() => setShowMobileCurriculum(true)}
              className="flex items-center justify-center gap-2 w-full py-3 text-sm font-semibold text-[#0b148f]"
            >
              <FaBars />
              Course Content
            </button>
          </div>
        </>
      );
    }

    return (
      <div className="h-full border-l border-slate-200 bg-white flex flex-col">
        {content}
      </div>
    );
  };

  // ---------- Render ----------
  if (!courseData) {
    return (
      <div>
        <Navbar />
        <div className="pt-[73px] flex items-center justify-center min-h-[60vh]">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
        <Footer />
      </div>
    );
  }

  const avgRating = calculateAverageRating();
  const instructorList = courseData.instructorsId
    ?.map((iid) => allUsers.find((u) => u._id === iid))
    .filter(Boolean);

  // ---------- Non-enrolled (Visitor) View ----------
  if (!isAdminOrStudent) {
    return (
      <div>
        <Navbar />
        <div className="pt-[73px]">
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
            <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
              <div className="grid md:grid-cols-12 gap-8">
                <div className="md:col-span-7 lg:col-span-8">
                  <h1 className="text-2xl md:text-4xl font-bold leading-tight">{courseData?.title}</h1>
                  <p className="mt-3 text-slate-300 text-sm md:text-base">{courseData?.magnetLine}</p>
                  <div className="flex flex-wrap items-center gap-3 mt-4 text-sm">
                    <div className="flex items-center gap-1">
                      <span className="text-amber-400 font-semibold">{avgRating}</span>
                      <StarRating rating={avgRating} />
                      <span className="text-slate-400 ml-1">({courseData?.studentsOpinion?.length || 0})</span>
                    </div>
                    <span className="text-slate-500">|</span>
                    <span>{courseData?.videos?.length} lectures</span>
                  </div>
                  {instructorList?.length > 0 && (
                    <p className="mt-4 text-sm text-slate-300">
                      Created by <span className="text-white font-medium">{instructorList.map((i) => `${i.firstname} ${i.lastname}`).join(", ")}</span>
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-4 mt-5 text-xs text-slate-400">
                    {courseData?.category && <span><FaSignal className="inline mr-1" />{courseData.category}</span>}
                  </div>
                </div>
                <div className="md:col-span-5 lg:col-span-4 hidden md:block">
                  <div className="rounded-xl bg-white shadow-2xl overflow-hidden sticky top-24">
                    <img className="w-full aspect-video object-cover" src={resolveMediaUrl(courseData?.banner)} alt="" />
                    <div className="p-5">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="text-3xl font-bold text-slate-900">{Math.round(finalPrice)}</span>
                        <TbCurrencyTaka className="text-3xl text-slate-900" />
                        {courseData?.discount > 0 && (
                          <>
                            <del className="text-slate-400 flex items-center text-lg"><TbCurrencyTaka />{courseData.price}</del>
                            <span className="bg-emerald-100 text-emerald-700 text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap">{courseData.discount}% off</span>
                          </>
                        )}
                      </div>
                      {enrollmentRequested ? (
                        <div className="flex items-center gap-2 mt-4 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-amber-700 text-sm">
                          <FaHourglassHalf />
                          <span>Enrollment pending approval</span>
                        </div>
                      ) : (
                        <div className="mt-4 space-y-2">
                          <button
                            onClick={() => { setManualPaymentMethod("bKash"); setManualPaymentNumber(""); setManualTransactionId(""); setShowPaymentModal(true); }}
                            className="w-full bg-emerald-600 text-white font-semibold py-3 rounded-lg hover:bg-emerald-700 transition flex items-center justify-center gap-2"
                          >
                            <RiBankCard2Line /> Manual Payment
                          </button>
                          <button onClick={makePayment} className="w-full bg-primary text-white font-semibold py-3 rounded-lg hover:bg-primary/90 transition">
                            Pay Online (SSLCommerz)
                          </button>
                        </div>
                      )}
                      <div className="mt-4 space-y-2 text-sm text-slate-600">
                        <p><FaInfinity className="inline mr-2 text-slate-400" />Full lifetime access</p>
                        <p><FaDownload className="inline mr-2 text-slate-400" />Certificate on completion</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="md:hidden bg-white border-b">
            <img className="w-full aspect-video object-cover" src={resolveMediaUrl(courseData?.banner)} alt="" />
            <div className="p-4">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="text-2xl font-bold text-slate-900">{Math.round(finalPrice)}</span>
                <TbCurrencyTaka className="text-2xl text-slate-900" />
                {courseData?.discount > 0 && (
                  <>
                    <del className="text-slate-400 flex items-center text-sm"><TbCurrencyTaka />{courseData.price}</del>
                    <span className="bg-emerald-100 text-emerald-700 text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap">{courseData.discount}% off</span>
                  </>
                )}
              </div>
              {enrollmentRequested ? (
                <div className="flex items-center gap-2 mt-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-amber-700 text-sm">
                  <FaHourglassHalf />
                  <span>Enrollment pending approval</span>
                </div>
              ) : (
                <div className="mt-3 space-y-2">
                  <button
                    onClick={() => { setManualPaymentMethod("bKash"); setManualPaymentNumber(""); setManualTransactionId(""); setShowPaymentModal(true); }}
                    className="w-full bg-emerald-600 text-white font-semibold py-3 rounded-lg hover:bg-emerald-700 transition flex items-center justify-center gap-2"
                  >
                    <RiBankCard2Line /> Manual Payment
                  </button>
                  <button onClick={makePayment} className="w-full bg-primary text-white font-semibold py-3 rounded-lg hover:bg-primary/90 transition">
                    Pay Online (SSLCommerz)
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="grid md:grid-cols-12 gap-8">
              <div className="md:col-span-7 lg:col-span-8 space-y-8">
                <div className="flex gap-6 border-b border-slate-200">
                  {["overview", "curriculum", "reviews"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`pb-3 text-sm font-semibold capitalize border-b-2 transition ${
                        activeTab === tab ? "border-primary text-primary" : "border-transparent text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {activeTab === "overview" && (
                  <>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 mb-3">What you'll learn</h2>
                      <div className="grid sm:grid-cols-2 gap-2 text-sm text-slate-600">
                        <p className="flex items-start gap-2"><FaCheckCircle className="mt-0.5 text-emerald-500 shrink-0" />{courseData?.videos?.length} video lectures</p>
                        <p className="flex items-start gap-2"><FaCheckCircle className="mt-0.5 text-emerald-500 shrink-0" />Regular live classes</p>
                        <p className="flex items-start gap-2"><FaCheckCircle className="mt-0.5 text-emerald-500 shrink-0" />Quiz after completing all lectures</p>
                        <p className="flex items-start gap-2"><FaCheckCircle className="mt-0.5 text-emerald-500 shrink-0" />Free certificate on completion</p>
                      </div>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 mb-3">Course Details</h2>
                      <div className="prose prose-sm max-w-none text-slate-600">
                        {parse(courseData?.details || "No course details available.")}
                      </div>
                    </div>
                    {courseData?.requirements && (
                      <div>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">Requirements</h2>
                        <p className="text-sm text-slate-600">{courseData.requirements}</p>
                      </div>
                    )}
                    {instructorList?.length > 0 && (
                      <div>
                        <h2 className="text-xl font-bold text-slate-900 mb-4">Instructors</h2>
                        <div className="space-y-4">
                          {instructorList.map((inst, i) => (
                            <div key={i} className="flex items-center gap-4">
                              <img className="w-14 h-14 rounded-full object-cover border" src={resolveMediaUrl(inst.img)} alt="" />
                              <div>
                                <p className="font-semibold text-slate-900">{inst.firstname} {inst.lastname}</p>
                                <p className="text-sm text-slate-500">{inst.profession?.[0]?.position || "Instructor"}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {activeTab === "curriculum" && (
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 mb-4">Course Content</h2>
                    <div className="border rounded-xl divide-y divide-slate-100">
                      {courseData?.videos?.map((video, index) => (
                        <div key={video._id} className="flex items-center gap-3 px-4 py-3">
                          <FaRegCirclePlay className="text-slate-400 shrink-0" />
                          <span className="text-sm text-slate-700">{video.videoTitle}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "reviews" && (
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 mb-4">Student Reviews</h2>
                    {courseData?.studentsOpinion?.length > 0 ? (
                      <div className="space-y-4">
                        {courseData.studentsOpinion.map((opinion, i) => {
                          const reviewer = allUsers.find((u) => u._id === opinion.reviewerId);
                          return (
                            <div key={i} className="border rounded-lg p-4">
                              <div className="flex items-center gap-3 mb-2">
                                <img className="w-10 h-10 rounded-full object-cover" src={resolveMediaUrl(reviewer?.img)} alt="" />
                                <div>
                                  <p className="font-semibold text-sm">{reviewer?.firstname} {reviewer?.lastname}</p>
                                  <StarRating rating={parseInt(opinion.rating)} />
                                </div>
                              </div>
                              <p className="text-sm text-slate-600">{opinion.comments}</p>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-400">No reviews yet.</p>
                    )}
                  </div>
                )}

                {reletedCourses?.length > 0 && (
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 mb-4">Related Courses</h2>
                    <div className="flex gap-4 overflow-x-auto pb-2">
                      {reletedCourses.map((rc) => (
                        <Link key={rc._id} to={`/singleCourse/${rc._id}`} className="shrink-0">
                          <img className="w-32 h-20 rounded-lg object-cover border" src={resolveMediaUrl(rc.banner)} alt={rc.title} />
                          <p className="text-xs font-medium text-slate-700 mt-1 w-32 truncate">{rc.title}</p>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {courseData?.syllabus && (
                  <button onClick={() => downloadFiteAtURL(courseData.syllabus)} className="flex items-center gap-2 text-primary font-semibold text-sm hover:underline">
                    <IoMdDownload /> Download Syllabus
                  </button>
                )}
              </div>
              <div className="hidden md:block md:col-span-5 lg:col-span-4" />
            </div>
          </div>
        </div>
        <Footer />

        {showPaymentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-xl font-semibold text-slate-900">Manual Payment</h3>
                <button onClick={() => setShowPaymentModal(false)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><FaTimes /></button>
              </div>
              <p className="mb-4 text-sm text-slate-600">Complete your payment to the following bKash/Nagad number, then enter the details below.</p>
              <div className="mb-4 rounded-lg bg-slate-50 p-4 text-center">
                <p className="text-sm font-semibold text-slate-700">Send payment to:</p>
                <p className="mt-1 text-lg font-bold text-emerald-700">017XXXXXXXX</p>
                <p className="mt-1 text-sm text-slate-500">bKash / Nagad</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">Payment Method</label>
                  <select value={manualPaymentMethod} onChange={(e) => setManualPaymentMethod(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500">
                    <option value="bKash">bKash</option>
                    <option value="Nagad">Nagad</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">Your Transaction ID</label>
                  <input type="text" value={manualTransactionId} onChange={(e) => setManualTransactionId(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500" placeholder="Enter transaction ID" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">Amount Paid</label>
                  <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-3">
                    <TbCurrencyTaka className="text-lg text-slate-500" />
                    <span className="font-semibold text-slate-900">{Math.round(finalPrice)}</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex items-center justify-end gap-3">
                <button onClick={() => setShowPaymentModal(false)} className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700" disabled={managingPayment}>Cancel</button>
                <button onClick={handleManualEnroll} disabled={managingPayment || !manualTransactionId.trim()}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">
                  {managingPayment ? "Submitting..." : "Submit Request"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ---------- Enrolled (Student) View ----------
  return (
    <div className="h-screen flex flex-col bg-slate-50">
      {/* Sticky Top Navbar */}
      <div className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="flex items-center justify-between px-3 sm:px-4 h-12">
          <div className="flex items-center gap-3 min-w-0">
            <Link to="/dashboard/user/userCourses" className="shrink-0 text-slate-600 hover:text-slate-900 transition p-1 -ml-1">
              <FaChevronLeft className="text-sm" />
            </Link>
            <p className="text-sm font-medium text-slate-800 truncate hidden sm:block">
              {courseData?.title}
            </p>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {(user?.user?.role === "admin" || courseData?.instructorsId?.includes(userId)) && (
              <Link
                to={`/dashboard/admin/schedulemeet?${courseId}`}
                className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1.5 rounded-lg transition flex items-center gap-1.5"
                title="Create Meet"
              >
                <TbLivePhoto className="text-sm" />
                <span className="hidden sm:inline font-medium">Meet</span>
              </Link>
            )}
            <button
              onClick={() => downloadFiteAtURL(courseData?.syllabus)}
              className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1.5 rounded-lg transition flex items-center gap-1.5"
              title="Download Syllabus"
            >
              <IoMdDownload className="text-sm" />
              <span className="hidden sm:inline font-medium">Syllabus</span>
            </button>
            <Link
              to={courseData?.whatsappGroupLink}
              target="_blank"
              className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1.5 rounded-lg transition flex items-center gap-1.5"
              title="Join WhatsApp Group"
            >
              <FaWhatsapp className="text-sm" />
              <span className="hidden sm:inline font-medium">Group</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content: Two-column grid */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: Video + Tabs */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Video Player */}
          <div className="bg-black w-full">
            {showQuiz ? (
              <div className="max-w-4xl mx-auto p-4 md:p-8 bg-white min-h-screen">
                {renderQuizContent()}
              </div>
            ) : selectedVideo && isYouTube(selectedVideo) ? (
              <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={getYouTubeEmbedUrl(selectedVideo.videoLink)}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={selectedVideo.videoTitle}
                />
              </div>
            ) : (
              <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                <video
                  className="absolute inset-0 w-full h-full"
                  src={selectedVideo?.videoLink}
                  controls
                />
              </div>
            )}
          </div>

          {/* Lecture Title + Navigation */}
          <div className="px-4 sm:px-6 pt-4 pb-2 flex items-start justify-between gap-4">
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug min-w-0 flex-1">
              {selectedVideo?.videoTitle || courseData?.title}
            </h1>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  if (currentVideoIndex > 0) {
                    handleVideoSelect(
                      courseData.videos[currentVideoIndex - 1],
                      currentVideoIndex - 1
                    );
                  }
                }}
                disabled={currentVideoIndex === 0 || showQuiz}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  currentVideoIndex === 0 || showQuiz
                    ? "bg-slate-100 text-slate-300 cursor-not-allowed"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                Prev
              </button>
              <button
                onClick={() => {
                  if (currentVideoIndex < courseData.videos.length - 1) {
                    if (currentVideoIndex + 1 < unlockedVideos) {
                      handleVideoSelect(
                        courseData.videos[currentVideoIndex + 1],
                        currentVideoIndex + 1
                      );
                    } else {
                      unlockNextVideo().then(() => {
                        handleVideoSelect(
                          courseData.videos[currentVideoIndex + 1],
                          currentVideoIndex + 1
                        );
                      });
                    }
                  }
                }}
                disabled={currentVideoIndex === courseData.videos.length - 1 || showQuiz}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  currentVideoIndex === courseData.videos.length - 1 || showQuiz
                    ? "bg-slate-100 text-slate-300 cursor-not-allowed"
                    : "bg-[#0b148f] text-white hover:bg-[#0b148f]/90"
                }`}
              >
                Next
              </button>
            </div>
          </div>

          {/* Tab Bar */}
          <div className="px-4 sm:px-6 border-b border-slate-200">
            <div className="flex gap-5 -mb-px overflow-x-auto">
              {[
                { key: "overview", label: "Overview" },
                { key: "qa", label: "Q&A" },
                { key: "notes", label: "Notes" },
                { key: "reviews", label: "Reviews" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`shrink-0 pb-3 text-sm font-medium border-b-2 transition ${
                    activeTab === tab.key
                      ? "border-[#0b148f] text-[#0b148f]"
                      : "border-transparent text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="px-4 sm:px-6 py-6 flex-1">
            {activeTab === "overview" && (
              <div className="space-y-6 max-w-3xl">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-amber-500 font-semibold">{avgRating}</span>
                  <StarRating rating={avgRating} />
                  <span className="text-slate-400 text-xs">({courseData?.studentsOpinion?.length || 0} ratings)</span>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed">{courseData?.magnetLine}</p>

                {isCourseAlreadyComplete && certificateId && (
                  <a
                    href={`/certificate?certId=${certificateId}`}
                    className="inline-flex items-center gap-2 bg-emerald-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-emerald-800 transition"
                  >
                    <FaDownload /> View Certificate
                  </a>
                )}

                <div className="prose prose-sm max-w-none text-slate-600">
                  {parse(courseData?.details || "")}
                </div>

                <div className="border-t pt-6">
                  <h3 className="font-semibold text-slate-900 mb-4">Leave a Review</h3>
                  <div className="flex items-center gap-1 mb-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button key={star} onClick={() => handleRatingClick(star)}>
                        {rating >= star ? <FaStar className="text-amber-400 text-xl" /> : <FaRegStar className="text-xl" />}
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    className="w-full border rounded-lg p-3 text-sm h-24 resize-none outline-none focus:border-[#0b148f]"
                    placeholder="Write your review..."
                  />
                  <button onClick={handleSubmitRating} className="mt-2 bg-[#0b148f] text-white text-sm font-semibold px-6 py-2 rounded-lg hover:bg-[#0b148f]/90 transition">
                    Submit
                  </button>
                </div>
              </div>
            )}

            {activeTab === "qa" && (
              <div className="max-w-3xl">
                <p className="text-sm text-slate-400">Ask questions about this lecture. (Coming soon)</p>
              </div>
            )}

            {activeTab === "notes" && (
              <div className="max-w-3xl">
                <p className="text-sm text-slate-400">Your personal notes for this lecture. (Coming soon)</p>
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="max-w-3xl">
                {courseData?.studentsOpinion?.length > 0 ? (
                  <div className="space-y-4">
                    {courseData.studentsOpinion.map((opinion, i) => {
                      const reviewer = allUsers.find((u) => u._id === opinion.reviewerId);
                      return (
                        <div key={i} className="border rounded-lg p-4 bg-white">
                          <div className="flex items-center gap-3 mb-2">
                            <img className="w-10 h-10 rounded-full object-cover" src={resolveMediaUrl(reviewer?.img)} alt="" />
                            <div>
                              <p className="font-semibold text-sm">{reviewer?.firstname} {reviewer?.lastname}</p>
                              <StarRating rating={parseInt(opinion.rating)} />
                            </div>
                          </div>
                          <p className="text-sm text-slate-600">{opinion.comments}</p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">No reviews yet.</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Sidebar - Desktop/Tablet */}
        <div className="hidden md:block w-72 lg:w-80 xl:w-96 shrink-0">
          <div className="h-full overflow-y-auto">
            {renderSidebar()}
          </div>
        </div>
      </div>

      {/* Mobile: Floating bottom bar + drawer */}
      <div className="md:hidden">
        {renderSidebar(true)}
      </div>
      {isCourseAlreadyComplete && certificateId ? (
        <div className="md:hidden fixed bottom-[52px] left-0 right-0 z-40 bg-white border-t border-slate-200 px-4 py-2.5">
          <a
            href={`/certificate?certId=${certificateId}`}
            className="block w-full bg-emerald-700 text-white font-semibold text-sm py-2.5 rounded-lg hover:bg-emerald-800 transition text-center"
          >
            <FaDownload className="inline mr-1.5" /> View Certificate
          </a>
        </div>
      ) : courseComplete && quizComplete ? (
        <div className="md:hidden fixed bottom-[52px] left-0 right-0 z-40 bg-white border-t border-slate-200 px-4 py-2.5">
          <button onClick={courseCompleteAction} className="w-full bg-emerald-600 text-white font-semibold text-sm py-2.5 rounded-lg hover:bg-emerald-700 transition">
            Complete Course
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default SingleCourse;
