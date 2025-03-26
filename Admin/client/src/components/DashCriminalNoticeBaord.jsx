import React, { useCallback } from "react";
import { useState, useEffect } from "react";
import LoadingSpinner from "./LoadingSpinner";
import {
  Table,
  Button,
  TextInput,
  Badge,
  Modal,
  Spinner,
} from "flowbite-react";
import { HiEye, HiOutlineX } from "react-icons/hi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ReactPaginate from "react-paginate";
import {
  FaUsers,
  FaClipboardList,
  FaUserSecret,
  FaUserSlash,
  FaExclamationTriangle,
  FaExclamationCircle,
  FaShieldAlt,
  FaSkullCrossbones,
  FaCheckCircle,
  FaTimesCircle,
  FaSkull,
  FaInfoCircle,
  FaSearch,
} from "react-icons/fa";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

export default function DashCriminalNoticeDashboard() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalNotices, setTotalNotices] = useState(0);
  const [activeNotices, setActiveNotices] = useState(0);
  const [inactiveNotices, setInactiveNotices] = useState(0);
  const [totalReports, setTotalReports] = useState(0);
  const [verifiedReports, setVerifiedReports] = useState(0);
  const [unverifiedReports, setUnverifiedReports] = useState(0);
  const fetchNotices = async () => {
    try {
      const res = await fetch("/api/notice/getNotices");
      const data = await res.json();
      if (!res.ok) {
        setError(data.message);
      } else {
        setTotalNotices(data.totalNotices);
        setActiveNotices(data.activeNotices);
        setInactiveNotices(data.inactiveNotices);
      }
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const fetchReports = async () => {
    try {
      const res = await fetch("/api/report/getReports");
      const data = await res.json();
      if (res.ok) {
        const reports = data.reports;
        setTotalReports(reports.length);
        setVerifiedReports(data.activeReports);
        setUnverifiedReports(data.inactiveReports);
        setError(data.message);
      } else {
        setError(data.message);
      }
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
    fetchReports();
  });

  const noticeBarData = {
    labels: ["Total Notices", "Active Notices", "Inactive Notices"],
    datasets: [
      {
        label: "Notices",
        data: [totalNotices, activeNotices, inactiveNotices],
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
        hoverBackgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
      },
    ],
  };

  const reportBarData = {
    labels: ["Total Reports", "Verified Reports", "Unverified Reports"],
    datasets: [
      {
        label: "Reports",
        data: [totalReports, verifiedReports, unverifiedReports],
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
        hoverBackgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
      },
    ],
  };

  return (
    <div className="table-auto overflow-x-scroll md:mx-auto p-3 scrollbar scrollbar-track-slate-100 scrollbar-thumb-slate-300 dark:scrollbar-track-slate-700 dark:scrollbar-thumb-slate-500">
      <ToastContainer />
      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          <div className="p-3 md:mx-auto">
            <div className=" flex-wrap flex gap-4 justify-center">
              <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 w-full rounded-md shadow-md">
                <div className="flex justify-between">
                  <div className="">
                    <h3 className="text-gray-500 text-md uppercase">
                      Total Notices
                    </h3>
                    <p className="text-2xl">{totalNotices}</p>
                  </div>
                  <FaClipboardList className="bg-yellow-500 text-white rounded text-5xl p-3 shadow-lg" />
                </div>
              </div>
              <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 w-full rounded-md shadow-md">
                <div className="flex justify-between">
                  <div className="">
                    <h3 className="text-gray-500 text-md uppercase">
                      Verified Notices
                    </h3>
                    <p className="text-2xl">{activeNotices}</p>
                  </div>
                  <FaClipboardList className="bg-green-500 text-white rounded text-5xl p-3 shadow-lg" />
                </div>
              </div>
              <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 w-full rounded-md shadow-md">
                <div className="flex justify-between">
                  <div className="">
                    <h3 className="text-gray-500 text-md uppercase">
                      Unverified Notices
                    </h3>
                    <p className="text-2xl">{inactiveNotices}</p>
                  </div>
                  <FaClipboardList className="bg-red-500 text-white rounded text-5xl p-3 shadow-lg" />
                </div>
              </div>
            </div>
          </div>
          <div className="p-3 md:mx-auto">
            <div className=" flex-wrap flex gap-4 justify-center">
              <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 w-full rounded-md shadow-md">
                <div className="flex justify-between">
                  <div className="">
                    <h3 className="text-gray-500 text-md uppercase">
                      Total Reports
                    </h3>
                    <p className="text-2xl">{totalReports}</p>
                  </div>
                  <FaExclamationTriangle className="bg-yellow-500 text-white  text-5xl p-3 shadow-lg" />
                </div>
              </div>
              <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 w-full rounded-md shadow-md">
                <div className="flex justify-between">
                  <div className="">
                    <h3 className="text-gray-500 text-md uppercase">
                      Verified Reports
                    </h3>
                    <p className="text-2xl">{verifiedReports}</p>
                  </div>
                  <FaExclamationTriangle className="bg-green-500 text-white  text-5xl p-3 shadow-lg" />
                </div>
              </div>
              <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 w-full rounded-md shadow-md">
                <div className="flex justify-between">
                  <div className="">
                    <h3 className="text-gray-500 text-md uppercase">
                      Unverified Reports
                    </h3>
                    <p className="text-2xl">{unverifiedReports}</p>
                  </div>
                  <FaExclamationTriangle className="bg-red-500 text-white text-5xl p-3 shadow-lg" />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-2xl font-bold text-left text-gray-700 mb-6 dark:text-white uppercase">
              Analytics Charts
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Notice Bar  */}
              <div className="flex flex-col p-6 dark:bg-slate-800 rounded-lg shadow-md">
                <h3 className="text-xl font-bold text-gray-700 mb-4 dark:text-white uppercase">
                  Notice
                </h3>
                <div className="flex justify-center h-[300px]">
                  <Bar
                    data={noticeBarData}
                    options={{
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                        },
                      },
                    }}
                  />
                </div>
              </div>
              <div className="flex flex-col p-6 dark:bg-slate-800 rounded-lg shadow-md">
                <h3 className="text-xl font-bold text-gray-700 mb-4 dark:text-white uppercase">
                  Report
                </h3>
                <div className="flex justify-center h-[300px]">
                  <Bar
                    data={reportBarData}
                    options={{
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          <div></div>
          <div className="overflow-x-auto"></div>
        </>
      )}
    </div>
  );
}
