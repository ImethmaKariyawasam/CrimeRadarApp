import React, { useMemo } from "react";
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
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
  FaClipboardList,
  FaThumbsUp,
} from "react-icons/fa";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AiOutlineSearch } from "react-icons/ai";
import {
  LoadScript,
  GoogleMap,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";
import { set } from "mongoose";
import {
  MapPin,
  AlertTriangle,
  User,
  Mail,
  Phone,
  FileText,
} from "lucide-react";
import Select from "react-select";
export default function DashReports() {
  const [selectedMarker, setSelectedMarker] = useState(null); // State for selected marker
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteModal, setDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [totalReports, setTotalReports] = useState(0);
  const [verifiedReports, setVerifiedReports] = useState(0);
  const [unverifiedReports, setUnverifiedReports] = useState(0);
  const [search, setSearch] = useState("");
  const [selectNames, setSelectNames] = useState([]);
  const fetchReports = async () => {
    try {
      const res = await fetch("/api/report/getReports");
      const data = await res.json();
      if (res.ok) {
        const reports = data.reports;
        setTotalReports(reports.length);
        setVerifiedReports(data.activeReports);
        setUnverifiedReports(data.inactiveReports);
        setReports(reports);
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
    const fetchReports = async () => {
      try {
        const res = await fetch("/api/report/getReports");
        const data = await res.json();
        if (res.ok) {
          const filteredReports = data.reports.filter((report) => {
            return (
              report.userId.name.toLowerCase().includes(search.toLowerCase()) ||
              report.noticeId.name.toLowerCase().includes(search.toLowerCase())
            );
          });
          const uniqueNotice = [
            ...new Set(
              filteredReports.map((report) => ({
                label: report.noticeId.name,
                value: report.noticeId._id,
              }))
            ),
          ];
          const reports = data.reports;
          setSelectNames(uniqueNotice);
          setTotalReports(reports.length);
          setVerifiedReports(data.activeReports);
          setUnverifiedReports(data.inactiveReports);
          setReports(filteredReports);
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
    fetchReports();
  }, [search]);

  const [viewMoreModal, setViewMoreModal] = useState(false);
  const [viewReport, setViewReport] = useState(null);
  const handleViewMore = (notice) => {
    setViewMoreModal(true);
    setViewReport(notice);
  };

  const [deleteReport, setDeleteReport] = useState(null);
  const handleDeleteModal = (report) => {
    setDeleteModal(true);
    setDeleteReport(report);
  };

  const [verifiedReport, setIsVeririeidReport] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiyModal, setVerifyModal] = useState(false);
  const handleVerify = (report) => {
    setVerifyModal(true);
    setIsVeririeidReport(report);
  };

  const [pageNumber, setPageNumber] = useState(0);
  const reportsPerPage = 5;

  const pageCount = Math.ceil(reports.length / reportsPerPage);

  const handlePageChange = ({ selected }) => {
    setPageNumber(selected);
  };

  const displayReports = reports
    .slice(pageNumber * reportsPerPage, (pageNumber + 1) * reportsPerPage)
    .map((report) => (
      <Table.Body className="divide-y">
        <Table.Row
          key={report._id}
          className="bg-white dark:border-gray-700 dark:bg-gray-800"
        >
          <Table.Cell>
            {" "}
            {new Date(report.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long", // e.g., "September"
              day: "numeric", // e.g., "27"
              hour: "2-digit", // e.g., "09" or "10"
              minute: "2-digit", // e.g., "05"
              hour12: true, // Use 12-hour format (AM/PM)
            })}
          </Table.Cell>
          <Table.Cell>
            {
              <Badge
                color={
                  report.userId.isVerified === true
                    ? "success"
                    : report.userId.isVerified === false
                    ? "failure"
                    : "yellow"
                }
                style={{
                  fontSize: "1.2rem",
                  padding: "0.5rem 1rem",
                  borderRadius: "8px",
                  display: "flex", // Use flexbox
                  alignItems: "center", // Center vertically
                  justifyContent: "center", // Center horizontally
                }}
              >
                {report.userId.isVerified ? (
                  <FaCheckCircle color="green" size={20} /> // Checkmark icon for verified
                ) : (
                  <FaTimesCircle color="red" size={20} /> // Cross icon for not verified
                )}
              </Badge>
            }
          </Table.Cell>
          <Table.Cell>
            {" "}
            {
              <Badge
                color={
                  report.noticeId?.isVerified === true
                    ? "success"
                    : report.noticeId?.isVerified === false
                    ? "failure"
                    : "yellow"
                }
                style={{
                  fontSize: "1.2rem",
                  padding: "0.5rem 1rem",
                  borderRadius: "8px",
                  display: "flex", // Use flexbox
                  alignItems: "center", // Center vertically
                  justifyContent: "center", // Center horizontally
                }}
              >
                {report.noticeId?.isVerified ? (
                  <FaCheckCircle color="green" size={20} /> // Checkmark icon for verified
                ) : (
                  <FaTimesCircle color="red" size={20} /> // Cross icon for not verified
                )}
              </Badge>
            }
          </Table.Cell>
          <Table.Cell>
            {" "}
            {
              <Badge
                color={
                  report.isVerified === true
                    ? "success"
                    : report.isVerified === false
                    ? "failure"
                    : "yellow"
                }
                style={{
                  fontSize: "1.2rem",
                  padding: "0.5rem 1rem",
                  borderRadius: "8px",
                  display: "flex", // Use flexbox
                  alignItems: "center", // Center vertically
                  justifyContent: "center", // Center horizontally
                }}
              >
                {report.isVerified ? (
                  <FaCheckCircle color="green" size={20} /> // Checkmark icon for verified
                ) : (
                  <FaTimesCircle color="red" size={20} /> // Cross icon for not verified
                )}
              </Badge>
            }
          </Table.Cell>
          <Table.Cell>
            <div className="flex items-center space-x-4">
              <Button
                size="sm"
                color="gray"
                disabled={report.isVerified}
                onClick={() => handleViewMore(report)}
              >
                <HiEye className="mr-2 h-5 w-5" />
                View
              </Button>
              <Button
                color="green"
                type="submit"
                outline
                disabled={report.isVerified}
                onClick={() => handleVerify(report)}
              >
                <FaThumbsUp className="mr-2 h-5 w-5" />
                Verify
              </Button>
              <Button
                size="sm"
                color="failure"
                disabled={isDeleting}
                onClick={() => handleDeleteModal(report)}
                outline
              >
                <HiOutlineX className="mr-2 h-5 w-5" />
                Delete
              </Button>
            </div>
          </Table.Cell>
        </Table.Row>
      </Table.Body>
    ));
  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/report/deleteReport/${deleteReport._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message);
      } else {
        toast.success(data.message);
        setDeleteModal(false);
        fetchReports();
      }
      setIsDeleting(false);
    } catch (error) {
      toast.error(error.message);
      setIsDeleting(false);
    }
  };
  // Define your map container style
  const mapContainerStyle = useMemo(
    () => ({ width: "100%", height: "400px" }),
    []
  );
  const getMarkerIcon = (type, dangerLevel) => {
    if (type === "Criminal") {
      return {
        url: "https://cdn-icons-png.flaticon.com/512/5945/5945472.png", // Replace with the actual URL for a criminal icon
        scaledSize: { width: 40, height: 40 },
        fillColor:
          dangerLevel === "High"
            ? "red"
            : dangerLevel === "Medium"
            ? "orange"
            : "green",
      };
    } else if (type === "Missing") {
      return {
        url: "https://cdn.vectorstock.com/i/preview-1x/67/73/missing-person-glyph-icon-for-personal-vector-47736773.jpg", // Replace with the actual URL for a missing person icon
        scaledSize: { width: 40, height: 40 },
      };
    }
    return null;
  };
  const verifySubmit = async () => {
    setIsVerifying(true);
    try {
      const res = await fetch(
        `/api/report/verifyReport/${verifiedReport._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ isVerified: true }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message);
        setVerifiedReports(null);
        setVerifyModal(false);
      } else {
        toast.success(data.message);
        setVerifyModal(false);
        setVerifiedReports(null);
        fetchReports();
      }
      setIsVerifying(false);
    } catch (error) {
      toast.error(error.message);
      setIsVerifying(false);
    }
  };

  const [downloadNoticeReport, setDownloadNoticeReport] = useState(null);
  const handleDownloadNoticeReport = (report) => {
    setDownloadNoticeReport(report);
  };
  const [isDownloading, setIsDownloading] = useState(false);
  const handleDownloadReport = async () => {
    setIsDownloading(true);
    try {
      const res = await fetch(`/api/report/generateReport`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ noticeId: downloadNoticeReport.value }),
      });
      if (!res.ok) {
        setIsDownloading(false);
        throw new Error("Failed to generate PDF");
      }
      const pdfBlob = await res.blob();

      const url = window.URL.createObjectURL(pdfBlob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `${downloadNoticeReport.label}-Report`;
      document.body.appendChild(a);
      setDownloadNoticeReport(null);
      a.click();
      document.body.removeChild(a);
      setIsDownloading(false);
    } catch (error) {
      setDownloadNoticeReport(null);
      setIsDownloading(false);
      toast.error(error.message);
    }
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
          <div>
            <div className=" flex items-center mb-2">
              <TextInput
                type="text"
                placeholder="Search by Reported User Name or Notice Name"
                onChange={(e) => setSearch(e.target.value)}
                rightIcon={AiOutlineSearch}
                className="ml-1 bg-gray-50 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-80 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 mb"
              />
              <Select
                id="filter"
                className="ml-4"
                placeholder="Select a Notice"
                styles={{
                  control: (provided) => ({
                    ...provided,
                    width: "200px",
                  }),
                  option: (provided) => ({
                    ...provided,
                    color: "black",
                  }),
                  singleValue: (provided) => ({
                    ...provided,
                    color: "black",
                  }),
                }}
                onChange={handleDownloadNoticeReport}
                options={selectNames}
                isClearable
              />
              <Button
                outline
                gradientDuoTone="greenToBlue"
                className="ml-4"
                disabled={!downloadNoticeReport}
                onClick={handleDownloadReport}
              >
                {
                  isDownloading ? (
                    <Spinner size="sm" aria-label="Loading spinner" />
                  ):(
                    "Download Report"
                  )
                }
              </Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            {reports.length > 0 ? (
              <Table>
                <Table.Head>
                  <Table.HeadCell>Report Date</Table.HeadCell>
                  <Table.HeadCell>User Verified Status</Table.HeadCell>
                  <Table.HeadCell>Post Verified Status</Table.HeadCell>
                  <Table.HeadCell>Report Verified Status</Table.HeadCell>
                  <Table.HeadCell>Actions</Table.HeadCell>
                </Table.Head>
                {displayReports}
              </Table>
            ) : (
              <p>No Reports Available</p>
            )}
            <div className="mt-9 center">
              <ReactPaginate
                previousLabel={"Previous"}
                nextLabel={"Next"}
                pageCount={pageCount}
                onPageChange={handlePageChange}
                containerClassName={"pagination flex justify-center"}
                previousLinkClassName={
                  "inline-flex items-center px-4 py-2 border border-gray-300 rounded-l-md bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                }
                nextLinkClassName={
                  "inline-flex items-center px-4 py-2 border border-gray-300 rounded-r-md bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                }
                disabledClassName={"opacity-50 cursor-not-allowed"}
                activeClassName={"bg-indigo-500 text-white"}
              />
            </div>
          </div>

          {/** View More Modal */}
          <Modal
            show={viewMoreModal}
            onClose={() => {
              setViewMoreModal(false);
              setViewReport(null);
            }}
          >
            <Modal.Header>
              <h3 className="text-xl font-semibold">Report Details</h3>
            </Modal.Header>
            <Modal.Body>
              <div className="space-y-4">
                <h4 className="text-lg font-medium">Notice Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <p className="flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-gray-500" />
                    <span>
                      <strong>Name:</strong> {viewReport?.noticeId?.name}
                    </span>
                  </p>
                  <p className="flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5 text-gray-500" />
                    <span>
                      <strong>Description:</strong>{" "}
                      {viewReport?.noticeId?.description}
                    </span>
                  </p>
                  <p className="flex items-center space-x-2">
                    <User className="w-5 h-5 text-gray-500" />
                    <span>
                      <strong>Reported By:</strong> {viewReport?.userId?.name}
                    </span>
                  </p>
                  <p className="flex items-center space-x-2">
                    <Mail className="w-5 h-5 text-gray-500" />
                    <span>
                      <strong>Reportee's Email:</strong>{" "}
                      {viewReport?.userId?.email}
                    </span>
                  </p>
                  <p className="flex items-center space-x-2">
                    <Phone className="w-5 h-5 text-gray-500" />
                    <span>
                      <strong>Reportee's Phone:</strong>{" "}
                      {viewReport?.userId?.phoneNo}
                    </span>
                  </p>
                  <p className="flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-gray-500" />
                    <span>
                      <strong>Report Description:</strong>{" "}
                      {viewReport?.description}
                    </span>
                  </p>
                </div>

                <LoadScript
                  googleMapsApiKey={
                    import.meta.env.VITE_YOUR_GOOGLE_MAPS_API_KEY
                  }
                >
                  <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={{
                      lat:
                        (viewReport?.noticeId?.location.coordinates[1] +
                          viewReport?.location?.coordinates[1]) /
                        2,
                      lng:
                        (viewReport?.noticeId?.location.coordinates[0] +
                          viewReport?.location?.coordinates[0]) /
                        2,
                    }}
                    zoom={7}
                  >
                    <Marker
                      position={{
                        lat: viewReport?.noticeId?.location.coordinates[1],
                        lng: viewReport?.noticeId?.location.coordinates[0],
                      }}
                      title={viewReport?.noticeId?.name}
                      onClick={() => setSelectedMarker("notice")}
                      icon={getMarkerIcon(
                        viewReport?.noticeId?.type,
                        viewReport?.noticeId?.dangerLevel
                      )}
                    />
                    <Marker
                      position={{
                        lat: viewReport?.location.coordinates[1],
                        lng: viewReport?.location.coordinates[0],
                      }}
                      title="Reported Location"
                      onClick={() => setSelectedMarker("report")}
                      icon={{
                        url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
                        scaledSize: { width: 40, height: 40 },
                      }}
                    />
                    {selectedMarker === "notice" && (
                      <InfoWindow
                        position={{
                          lat: viewReport?.noticeId?.location.coordinates[1],
                          lng: viewReport?.noticeId?.location.coordinates[0],
                        }}
                        onCloseClick={() => setSelectedMarker(null)}
                      >
                        <div className="p-2 max-w-xs">
                          <h4 className="font-bold">
                            {viewReport?.noticeId?.name}
                          </h4>
                          <p className="text-sm">
                            {viewReport?.noticeId?.description}
                          </p>
                          {viewReport?.noticeId?.type === "Criminal" && (
                            <p
                              className={`font-semibold text-sm ${
                                viewReport.noticeId.dangerLevel === "High"
                                  ? "text-red-600"
                                  : "text-orange-500"
                              }`}
                            >
                              Danger Level: {viewReport?.noticeId?.dangerLevel}
                            </p>
                          )}
                          <a
                            href={`https://www.google.com/maps?q=${viewReport?.noticeId?.location.coordinates[1]},${viewReport?.noticeId?.location.coordinates[0]}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block mt-2 px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                          >
                            Open in Google Maps
                          </a>
                        </div>
                      </InfoWindow>
                    )}
                    {selectedMarker === "report" && (
                      <InfoWindow
                        position={{
                          lat: viewReport?.location.coordinates[1],
                          lng: viewReport?.location.coordinates[0],
                        }}
                        onCloseClick={() => setSelectedMarker(null)}
                      >
                        <div className="p-2 max-w-xs">
                          <h4 className="font-bold">Reported Location</h4>
                          <p className="text-sm">{viewReport?.description}</p>
                          <a
                            href={`https://www.google.com/maps?q=${viewReport?.location.coordinates[1]},${viewReport?.location.coordinates[0]}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block mt-2 px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                          >
                            Open in Google Maps
                          </a>
                        </div>
                      </InfoWindow>
                    )}
                  </GoogleMap>
                </LoadScript>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <button
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition duration-200"
                onClick={() => {
                  setViewMoreModal(false);
                  setViewReport(null);
                }}
              >
                Close
              </button>
            </Modal.Footer>
          </Modal>

          {/** Delete Report Modal */}
          <Modal
            show={deleteModal}
            onClose={() => {
              setDeleteModal(false), setDeleteReport(null);
            }}
          >
            <Modal.Header>
              <h3 className="text-xl font-semibold">
                Are you sure you want to delete this Report?
              </h3>
            </Modal.Header>
            <Modal.Footer>
              <Button
                color="gray"
                onClick={() => {
                  setDeleteModal(false), setDeleteReport(null);
                }}
              >
                Close
              </Button>
              <Button
                color="failure"
                disabled={isDeleting}
                onClick={() => confirmDelete()}
              >
                {isDeleting ? (
                  <Spinner size="sm" aria-label="Loading spinner" />
                ) : (
                  "Delete Report"
                )}
              </Button>
            </Modal.Footer>
          </Modal>

          {/** Verify Modal */}
          <Modal
            show={verifiyModal}
            onClose={() => {
              setVerifyModal(false), setVerifiedReports(null);
            }}
          >
            <Modal.Header>
              <h3 className="text-xl font-semibold">
                Are you sure you want to verfiy this report?
              </h3>
              <p>
                {" "}
                If this report is verified the notice last scene location will
                be to set to this reported location. The user will be made aware
                of their report being verified.
              </p>
            </Modal.Header>
            <Modal.Footer>
              <Button
                color="gray"
                onClick={() => {
                  setVerifyModal(false), setVerifiedReports(null);
                }}
              >
                Close
              </Button>
              <Button
                color="failure"
                disabled={isVerifying}
                onClick={() => verifySubmit()}
              >
                {isVerifying ? (
                  <Spinner size="sm" aria-label="Loading spinner" />
                ) : (
                  "Verify Report"
                )}
              </Button>
            </Modal.Footer>
          </Modal>
        </>
      )}
    </div>
  );
}
