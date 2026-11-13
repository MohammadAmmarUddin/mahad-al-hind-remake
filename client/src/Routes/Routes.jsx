/* eslint-disable react-refresh/only-export-components */
import { lazy } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import Main from "../Layout/Main";
import Home from "../Pages/Home";
import ErrorPage from "../Pages/ErrorPage";
import PrivateRoute from "../Components/PrivateRoute";
import AdminRoute from "../Components/AdminRoute";

const Signup = lazy(() => import("../Pages/Signup"));
const Login = lazy(() => import("../Pages/Login"));
const Dashboard = lazy(() => import("../Pages/Dashboard/Dashboard"));
const AdminHome = lazy(() => import("../Pages/Dashboard/AdminDashboard/AdminHome"));
const AllUsers = lazy(() => import("../Pages/Dashboard/AdminDashboard/AllUsers"));
const UserHome = lazy(() => import("../Pages/Dashboard/UserDashboard/UserHome"));
const AllCourses = lazy(() => import("../Components/AllCourses"));
const AddReview = lazy(() => import("../Pages/Dashboard/UserDashboard/AddReview"));
const PaymentHistory = lazy(() => import("../Pages/Dashboard/UserDashboard/PaymentHistory"));
const ForgetPassword = lazy(() => import("../Components/ForgetPassword"));
const ResetPassword = lazy(() => import("../Components/ResetPassword"));
const MyClasses = lazy(() => import("../Pages/Dashboard/UserDashboard/MyClasses"));
const ManageCourses = lazy(() => import("../Pages/Dashboard/AdminDashboard/ManageCourses"));
const AllTransactions = lazy(() => import("../Pages/Dashboard/AdminDashboard/AllTransactions"));
const AddCourses = lazy(() => import("../Pages/Dashboard/AdminDashboard/AddCourses"));
const SingleCourse = lazy(() => import("../Components/SingleCourse"));
const UpdateProfile = lazy(() => import("../Pages/Dashboard/UserDashboard/UpdateProfile"));
const Profile = lazy(() => import("../Pages/Profile"));
const Certificate = lazy(() => import("../Components/Certificate.jsx"));
const Settings = lazy(() => import("../Components/Settings"));
const ScheduleMeet = lazy(() => import("../Components/ScheduleMeet"));
const UpdateCourse = lazy(() => import("../Pages/Dashboard/AdminDashboard/UpdateCourse"));
const Others = lazy(() => import("../Components/Others"));
const CertificateChecker = lazy(() => import("../Components/CertificateChecker"));
const CertificateAdd = lazy(() => import("../Pages/Dashboard/AdminDashboard/CertificateAdd"));
const AdmissionHelp = lazy(() => import("../Components/AdmissionHelp"));
const ManageVideos = lazy(() => import("../Pages/Dashboard/AdminDashboard/ManageVideos"));
const HomeSectionManager = lazy(() => import("../Pages/Dashboard/AdminDashboard/HomeSectionManager"));
const ManageGallery = lazy(() => import("../Pages/Dashboard/AdminDashboard/ManageGallery"));
const EnrollmentSettings = lazy(() => import("../Pages/Dashboard/AdminDashboard/EnrollmentSettings"));
const ManageBreakingNews = lazy(() => import("../Pages/Dashboard/AdminDashboard/ManageBreakingNews"));
const ManageNotices = lazy(() => import("../Pages/Dashboard/AdminDashboard/ManageNotices"));
const ManageNoticeCategories = lazy(() => import("../Pages/Dashboard/AdminDashboard/ManageNoticeCategories"));
const ManageNews = lazy(() => import("../Pages/Dashboard/AdminDashboard/ManageNews"));
const ManageCareers = lazy(() => import("../Pages/Dashboard/AdminDashboard/ManageCareers"));
const ManageFAQ = lazy(() => import("../Pages/Dashboard/AdminDashboard/ManageFAQ"));
const NewsPage = lazy(() => import("../Pages/NewsPage"));
const NewsDetailPage = lazy(() => import("../Pages/NewsDetailPage"));
const CareerPage = lazy(() => import("../Pages/CareerPage"));
const CareerDetailPage = lazy(() => import("../Pages/CareerDetailPage"));
const FaqPage = lazy(() => import("../Pages/FaqPage"));
const AppUpdate = lazy(() => import("../Pages/Dashboard/AdminDashboard/AppUpdate"));
const AudioLibraryAdmin = lazy(() => import("../Pages/Dashboard/AdminDashboard/AudioLibraryAdmin"));
const FinanceOverview = lazy(() => import("../Pages/Dashboard/AdminDashboard/FinanceOverview"));
const ManageStudentReviews = lazy(() => import("../Pages/Dashboard/AdminDashboard/ManageStudentReviews"));
const ManageHeroBanners = lazy(() => import("../Pages/Dashboard/AdminDashboard/ManageHeroBanners"));

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Main />,
    errorElement: <ErrorPage />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/signup", element: <Signup /> },
      { path: "/login", element: <Login /> },
      { path: "/others", element: <Others /> },
      { path: "/forgetPassword", element: <ForgetPassword /> },
      { path: "/resetPassword/:token", element: <ResetPassword /> },
      { path: "/allCourses", element: <AllCourses /> },
      { path: "/singleCourse/:id", element: <SingleCourse /> },
      { path: "/profile", element: <Profile /> },
      { path: "/settings", element: <Settings /> },
      { path: "/certificate", element: <Certificate /> },
      { path: "/certificate-checker", element: <CertificateChecker /> },
      { path: "/updateProfile", element: <UpdateProfile /> },
      { path: "/Admission-help", element: <AdmissionHelp /> },
      { path: "/apply", element: <AdmissionHelp /> },
      { path: "/notice", element: <Home /> },
      { path: "/news", element: <NewsPage /> },
      { path: "/news/:id", element: <NewsDetailPage /> },
      { path: "/career", element: <CareerPage /> },
      { path: "/career/:id", element: <CareerDetailPage /> },
      { path: "/faq", element: <FaqPage /> },
    ],
  },
  {
    path: "/dashboard/admin",
    element: (
      <AdminRoute>
        <Dashboard />
      </AdminRoute>
    ),
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Navigate to="/dashboard/admin/adminHome" replace /> },
      { path: "/dashboard/admin/adminHome", element: <AdminHome /> },
      { path: "/dashboard/admin/addCourses", element: <AddCourses /> },
      { path: "/dashboard/admin/updateCourse/:id", element: <UpdateCourse /> },
      { path: "/dashboard/admin/manageCourses", element: <ManageCourses /> },
      { path: "/dashboard/admin/schedulemeet", element: <ScheduleMeet /> },
      { path: "/dashboard/admin/transactionHistory", element: <AllTransactions /> },
      { path: "/dashboard/admin/allUsers", element: <AllUsers /> },
      { path: "/dashboard/admin/addCertificate", element: <CertificateAdd /> },
      { path: "/dashboard/admin/manageVideos", element: <ManageVideos /> },
      { path: "/dashboard/admin/homeSections", element: <HomeSectionManager /> },
      { path: "/dashboard/admin/gallery", element: <ManageGallery /> },
      { path: "/dashboard/admin/enrollmentSettings", element: <EnrollmentSettings /> },
      { path: "/dashboard/admin/breakingNews", element: <ManageBreakingNews /> },
      { path: "/dashboard/admin/manageNotices", element: <ManageNotices /> },
      { path: "/dashboard/admin/manageNoticeCategories", element: <ManageNoticeCategories /> },
      { path: "/dashboard/admin/manageNews", element: <ManageNews /> },
      { path: "/dashboard/admin/manageCareers", element: <ManageCareers /> },
      { path: "/dashboard/admin/manageFAQ", element: <ManageFAQ /> },
      { path: "/dashboard/admin/appUpdate", element: <AppUpdate /> },
      { path: "/dashboard/admin/audioLibrary", element: <AudioLibraryAdmin /> },
      { path: "/dashboard/admin/finance", element: <FinanceOverview /> },
      { path: "/dashboard/admin/manageStudentReviews", element: <ManageStudentReviews /> },
      { path: "/dashboard/admin/heroBanners", element: <ManageHeroBanners /> },
    ],
  },
  {
    path: "/dashboard/user",
    element: (
      <PrivateRoute>
        <Dashboard />
      </PrivateRoute>
    ),
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Navigate to="/dashboard/user/userHome" replace /> },
      { path: "/dashboard/user/userHome", element: <UserHome /> },
      { path: "/dashboard/user/userPaymentHistory", element: <PaymentHistory /> },
      { path: "/dashboard/user/userCourses", element: <MyClasses /> },
      { path: "/dashboard/user/userReview", element: <AddReview /> },
      { path: "/dashboard/user/userCertificate", element: <Certificate /> },
    ],
  },
  {
    path: "*",
    element: <ErrorPage />,
  },
]);
