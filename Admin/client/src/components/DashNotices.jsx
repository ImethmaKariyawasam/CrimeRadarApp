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
  Tooltip,
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
import { AiOutlineSearch } from "react-icons/ai";
import { format } from "date-fns"; // Optional, use if you want to format the date nicely
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { app } from "../firebase";
import GooglePlacesAutocomplete from "react-google-places-autocomplete";
import {
  MapPin,
  AlertTriangle,
  Calendar,
  User,
  Ruler,
  Scale,
  Eye,
  Scissors,
  X,
  AlertOctagon,
} from "lucide-react";
import { Loader } from "@googlemaps/js-api-loader";
import Select from "react-select";
export default function DashNotices() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [search, setSearch] = useState("");
  const [totalNotices, setTotalNotices] = useState(0);
  const [activeNotices, setActiveNotices] = useState(0);
  const [inactiveNotices, setInactiveNotices] = useState(0);
  const [addPostModel, setAddPostModel] = useState(false);
  const [address, setAddress] = useState("Loading...");
  const [googleApi, setGoogleApi] = useState(null);
  const [noticeToUpdate, setNoticeToUpdate] = useState(null);
  const [location, setLocation] = useState({
    type: "",
    coordinates: [],
  });
  const loader = new Loader({
    apiKey: "AIzaSyCms2-r4afPJIKiStBZUNuRx_4BdU2p9ps",
    version: "weekly",
    libraries: ["geocoding"],
  });
  const fetchNotices = async () => {
    try {
      const res = await fetch("/api/notice/getNotices");
      const data = await res.json();
      if (!res.ok) {
        setError(data.message);
      } else {
        const filteredNotices = data.notices.filter((notice) => {
          return notice.name.toLowerCase().includes(search.toLowerCase());
        });
        setNotices(filteredNotices);
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

  useEffect(() => {
    fetchNotices();
  }, [search]);

  const [pageNumber, setPageNumber] = useState(0);
  const noticesPerPage = 5;

  const pageCount = Math.ceil(notices.length / noticesPerPage);

  const handlePageChange = ({ selected }) => {
    setPageNumber(selected);
  };

  const getBadgeColor = (type) => {
    switch (type) {
      case "Criminal":
        return "red"; // Set color for 'Criminal'
      case "Missing":
        return "blue"; // Set color for 'Missing Person'
      default:
        return "gray"; // Default color
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "Criminal":
        return <FaUserSecret style={{ right: 5, width: 30, height: 30 }} />; // Icon for 'Criminal'
      case "Missing":
        return <FaUserSlash style={{ right: 5, width: 30, height: 30 }} />; // Icon for 'Missing Person'
      default:
        return null;
    }
  };

  const renderMissingDate = (notice) => {
    if (notice.missingDate) {
      return format(new Date(notice.missingDate), "MMMM dd, yyyy"); // Format the date as you prefer
    } else {
      return <span>N/A</span>; // You can replace "N/A" with an empty string if no date is needed for other types
    }
  };

  const [deleteModal, setDeleteModal] = useState(false);
  const [noticeToDelete, setNoticeToDelete] = useState(null);
  const handleNoticeDelete = (notice) => {
    setNoticeToDelete(notice);
    setDeleteModal(true);
  };

  const [viewModal, setViewModal] = useState(false);
  const [noticeToView, setNoticeToView] = useState(null);
  const handleViewMore = (notice) => {
    setNoticeToView(notice);
    setViewModal(true);
  };

  const [updateModal, setUpdateModal] = useState(false);
  const handleUpdateNotice = (notice) => {
    setNoticeToUpdate(notice);
    setLocation({
      type: "Point",
      coordinates: notice.location.coordinates,
    })
    setUpdateModal(true);
  };

  const DangerLevelIndicator = ({ dangerLevel, type }) => {
    if (type !== "Criminal" && type !== "Missing") return null;

    const getDangerLevelConfig = (level, type) => {
      if (type === "Missing") {
        return {
          icon: FaSearch,
          color: "text-blue-600",
          bgColor: "bg-blue-100",
          borderColor: "border-blue-500",
        };
      }

      const configs = {
        Critical: {
          icon: FaSkull,
          color: "text-purple-600",
          bgColor: "bg-purple-100",
          borderColor: "border-purple-500",
          pulseEffect: true,
        },
        High: {
          icon: FaExclamationTriangle,
          color: "text-red-600",
          bgColor: "bg-red-100",
          borderColor: "border-red-500",
        },
        Medium: {
          icon: FaExclamationCircle,
          color: "text-orange-600",
          bgColor: "bg-orange-100",
          borderColor: "border-orange-500",
        },
        Low: {
          icon: FaInfoCircle,
          color: "text-green-600",
          bgColor: "bg-green-100",
          borderColor: "border-green-500",
        },
      };
      return configs[level] || configs.Low;
    };

    const config = getDangerLevelConfig(dangerLevel, type);
    const Icon = config.icon;

    const tooltipContent =
      type === "Missing" ? "Missing Person" : `Danger Level: ${dangerLevel}`;

    return (
      <Tooltip content={tooltipContent}>
        <div
          className={`
          flex 
          justify-center 
          items-center 
          w-10 
          h-10 
          rounded-full 
          border-2
          ${config.bgColor} 
          ${config.borderColor}
          ${config.pulseEffect ? "animate-pulse" : ""}
        `}
        >
          <Icon className={`w-6 h-6 ${config.color}`} />
        </div>
      </Tooltip>
    );
  };

  const loadGoogleMapsApi = useCallback(async () => {
    try {
      const google = await loader.load();
      setGoogleApi(google);
      return google;
    } catch (error) {
      console.error("Failed to load Google Maps API:", error);
      setAddress("Unable to load Google Maps API");
      return null;
    }
  }, []);

  const geocodeCoordinates = useCallback(
    async (lat, lng) => {
      if (!googleApi) {
        const api = await loadGoogleMapsApi();
        if (!api) return "Unable to load Google Maps API";
      }

      return new Promise((resolve, reject) => {
        const geocoder = new googleApi.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
          if (status === "OK" && results[0]) {
            resolve(results[0].formatted_address);
          } else {
            reject(
              status === "OK"
                ? "No results found"
                : `Geocoder failed due to: ${status}`
            );
          }
        });
      });
    },
    [googleApi, loadGoogleMapsApi]
  );
  useEffect(() => {
    const fetchAddress = async () => {
      if (noticeToView?.location?.coordinates) {
        const [lng, lat] = noticeToView?.location?.coordinates;
        try {
          const result = await geocodeCoordinates(lat, lng);
          setAddress(result);
        } catch (error) {
          console.error("Error fetching address:", error);
          setAddress("Unable to retrieve address");
        }
      } else {
        setAddress("Unknown");
      }
    };

    fetchAddress();
  }, [noticeToView?.location, geocodeCoordinates]);

  const displayNotices = notices
    .slice(pageNumber * noticesPerPage, (pageNumber + 1) * noticesPerPage)
    .map((notice) => (
      <Table.Body className="divide-y">
        <Table.Row
          key={notice._id}
          className="bg-white dark:border-gray-700 dark:bg-gray-800"
        >
          <Table.Cell>
            {" "}
            <Badge color={getBadgeColor(notice.type)}>
              {getIcon(notice.type)}
            </Badge>
          </Table.Cell>
          <Table.Cell>{notice.name}</Table.Cell>
          <Table.Cell>{renderMissingDate(notice)}</Table.Cell>
          <Table.Cell className="flex justify-center">
            <DangerLevelIndicator
              dangerLevel={notice.dangerLevel}
              type={notice.type}
            />
          </Table.Cell>
          <Table.Cell>
            <Badge
              color={
                notice.isVerified === true
                  ? "success"
                  : notice.isVerified === false
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
              {notice.isVerified ? (
                <FaCheckCircle color="green" size={20} /> // Checkmark icon for verified
              ) : (
                <FaTimesCircle color="red" size={20} /> // Cross icon for not verified
              )}
            </Badge>
          </Table.Cell>
          <Table.Cell>
            <div className="flex items-center space-x-4">
              <Button
                size="sm"
                color="gray"
                onClick={() => handleViewMore(notice)}
              >
                <HiEye className="mr-2 h-5 w-5" />
                View
              </Button>
              <Button
                color="blue"
                type="submit"
                outline
                onClick={() => handleUpdateNotice(notice)}
              >
                <FaClipboardList className="mr-2 h-5 w-5" />
                Update
              </Button>
              <Button
                size="sm"
                color="failure"
                disabled={isDeleting}
                onClick={() => handleNoticeDelete(notice)}
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
      const res = await fetch(
        `/api/notice/deleteNotice/${noticeToDelete._id}`,
        {
          method: "DELETE",
        }
      );
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message);
      } else {
        toast.success(data.message);
        fetchNotices();
        setDeleteModal(false);
        setNoticeToDelete(null);
      }
      setIsDeleting(false);
    } catch (error) {
      toast.error(error.message);
      setIsDeleting(false);
    }
  };
  const mapContainerStyle = {
    width: "100%",
    height: "300px",
  };

  const options = {
    disableDefaultUI: true,
    zoomControl: true,
  };

  const [formData, setFormData] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const [imageFile, setImageFile] = useState(null);
  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };
  useEffect(() => {
    if (imageFile) {
      uploadProductImage();
    }
  }, [imageFile]);
  const [imageFileUploadingProgress, setImageFileUploadingProgress] =
    useState(null);
  const [imageFileUploadingError, setImageFileUploadingError] = useState(null);
  const [fileUploadSuccess, setFileUploadSuccess] = useState(false);
  const [imageFileUrl, setImageFileUrl] = useState(null);
  const uploadProductImage = async () => {
    const storage = getStorage(app);
    const filename = new Date().getTime() + imageFile.name;
    const storageRef = ref(storage, filename);
    const uploadTask = uploadBytesResumable(storageRef, imageFile);
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setImageFileUploadingProgress(progress.toFixed(0));
        setFileUploadSuccess("File Uploaded Successfully");
      },
      (error) => {
        imageFileUploadingError(
          "Could not upload image(File must be less than 2MB)"
        );
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setImageFileUrl(downloadURL);
          setFormData({ ...formData, image: downloadURL });
        });
      }
    );
  };
  const handleNoticeSubmit = async () => {
    setFormData({ ...formData, isVerified: true });
    try {
      const res = await fetch("/api/notice/createNotice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...formData, location }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error("Could not create notice");
        setImageFile(null);
        setImageFileUploadingError(false);
        setFileUploadSuccess(false);
        setFileUploadSuccess(false);
        setImageFileUploadingError(false);
        setImageFileUploadingProgress(false);
        setFormData({});
        setLocation({
          type: "Point",
          coordinates: [40.7128, -74.006],
        });
        setImageFileUrl(null);
      } else {
        toast.success("Notice Created Successfully");
        fetchNotices();
        setAddPostModel(false);
        setImageFile(null);
        setImageFileUploadingError(false);
        setFileUploadSuccess(false);
        setFileUploadSuccess(false);
        setImageFileUploadingError(false);
        setImageFileUploadingProgress(false);
        setFormData({});
        setLocation({
          type: "Point",
          coordinates: [40.7128, -74.006],
        });
        setImageFileUrl(null);
      }
    } catch (error) {
      setImageFile(null);
      setImageFileUploadingError(false);
      setFileUploadSuccess(false);
      setFileUploadSuccess(false);
      setImageFileUploadingError(false);
      setImageFileUploadingProgress(false);
      setFormData({});
      setLocation({
        type: "Point",
        coordinates: [40.7128, -74.006],
      });
      toast.error("Could not create notice");
    }
  };
  const [isUpdating, setIsUpdating] = useState(false);
  const handleUpdateNoticeSubmit = async () => {
    setIsUpdating(true);
    try {
      const res = await fetch(
        `/api/notice/updateNotice/${noticeToUpdate._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ...formData, location }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        toast.error("Could not update notice");
        setImageFile(null);
        setImageFileUploadingError(false);
        setFileUploadSuccess(false);
        setFileUploadSuccess(false);
        setImageFileUploadingError(false);
        setImageFileUploadingProgress(false);
        setFormData({});
        setImageFileUrl(null);
        setIsUpdating(false);
        setNoticeToUpdate(null);
      } else {
        setIsUpdating(false);
        toast.success("Notice Updated Successfully");
        fetchNotices();
        setUpdateModal(false);
        setImageFile(null);
        setImageFileUploadingError(false);
        setFileUploadSuccess(false);
        setFileUploadSuccess(false);
        setImageFileUploadingError(false);
        setImageFileUploadingProgress(false);
        setFormData({});
        setLocation([]);
        setNoticeToUpdate(null);
        setImageFileUrl(null);
      }
    } catch (error) {
      setIsUpdating(false);
      setImageFile(null);
      setImageFileUploadingError(false);
      setFileUploadSuccess(false);
      setFileUploadSuccess(false);
      setImageFileUploadingError(false);
      setImageFileUploadingProgress(false);
      setFormData({});
      setLocation({
        type: "Point",
        coordinates: [40.7128, -74.006],
      });
      toast.error("Could not update notice");
    }
  };

  console.log(location)



  const [value, setValue] = useState(null);

  const NoticeViewContent = ({ noticeToView }) => {
    if (!noticeToView) return null;

    const mapContainerStyle = {
      width: "100%",
      height: "400px",
    };

    const options = {
      disableDefaultUI: true,
      zoomControl: true,
    };

    const getDangerLevelColor = (level) => {
      const colors = {
        Critical: "text-purple-700",
        High: "text-red-600",
        Medium: "text-orange-600",
        Low: "text-green-600",
      };
      return colors[level] || "text-gray-600";
    };

    const getDangerLevelBg = (level) => {
      const colors = {
        Critical: "bg-purple-100 border-2 border-purple-500",
        High: "bg-red-100",
        Medium: "bg-orange-100",
        Low: "bg-green-100",
      };
      return colors[level] || "bg-gray-100";
    };

    const getTypeColor = (type) => {
      return type === "Criminal"
        ? "text-red-600"
        : type === "Missing"
        ? "text-blue-600"
        : "text-gray-600";
    };

    const DetailItem = ({ icon: Icon, label, value, customColor }) => (
      <div className="flex items-start gap-2 mb-4">
        <Icon className="w-5 h-5 mt-0.5 text-gray-500" />
        <div>
          <strong className="text-gray-700">{label}: </strong>
          <span className={customColor}>{value}</span>
        </div>
      </div>
    );

    const DangerLevelAlert = ({ level }) => {
      const DangerIcon = level === "Critical" ? AlertOctagon : AlertTriangle;
      const colorClass = getDangerLevelColor(level);
      const bgClass = getDangerLevelBg(level);
      const pulseClass = level === "Critical" ? "animate-pulse" : "";

      return (
        <div
          className={`p-3 rounded-lg flex items-center gap-2 ${bgClass} ${pulseClass} mb-4`}
        >
          <DangerIcon className={`h-5 w-5 ${colorClass}`} />
          <span className={`font-medium ${colorClass}`}>
            {level === "Critical"
              ? "CRITICAL THREAT LEVEL"
              : `Danger Level: ${level}`}
          </span>
        </div>
      );
    };

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <img
            src={noticeToView.image || "/api/placeholder/400/400"}
            alt={noticeToView.name}
            className="w-full h-64 object-cover rounded-lg mb-4"
          />

          {noticeToView.type === "Criminal" && noticeToView.dangerLevel && (
            <DangerLevelAlert level={noticeToView.dangerLevel} />
          )}
        </div>

        <div>
          <DetailItem
            icon={User}
            label="Type"
            value={noticeToView.type}
            customColor={getTypeColor(noticeToView.type)}
          />
          <DetailItem icon={User} label="Name" value={noticeToView.name} />
          <DetailItem
            icon={Calendar}
            label="Age"
            value={`${noticeToView.age} years`}
          />
          <DetailItem
            icon={Ruler}
            label="Height"
            value={`${noticeToView.height} cm`}
          />
          <DetailItem
            icon={Scale}
            label="Weight"
            value={`${noticeToView.weight} kg`}
          />
          <DetailItem
            icon={Eye}
            label="Eye Color"
            value={noticeToView.eye_color}
          />
          <DetailItem
            icon={Scissors}
            label="Hair Color"
            value={noticeToView.hair_color}
          />

          {noticeToView.distinctive_marks && (
            <DetailItem
              icon={AlertTriangle}
              label="Distinctive Marks"
              value={noticeToView.distinctive_marks}
            />
          )}

          {noticeToView.type === "Missing" && noticeToView.missingDate && (
            <DetailItem
              icon={Calendar}
              label="Missing Since"
              value={format(
                new Date(noticeToView.missingDate),
                "MMMM dd, yyyy"
              )}
            />
          )}

          {noticeToView.type === "Criminal" &&
            noticeToView.alias &&
            noticeToView.alias.length > 0 && (
              <DetailItem
                icon={User}
                label="Known Aliases"
                value={noticeToView.alias.join(", ")}
              />
            )}
        </div>

        <div className="col-span-1 md:col-span-2">
          <DetailItem
            icon={MapPin}
            label="Last Seen Location"
            value={
              noticeToView.location?.coordinates
                ? address
                : `Latitude: ${noticeToView.location.coordinates[1]}, Longitude: ${noticeToView.location.coordinates[0]}`
            }
          />

          {noticeToView.location?.coordinates && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Location Map</h3>
              <LoadScript
                googleMapsApiKey={import.meta.env.VITE_YOUR_GOOGLE_MAPS_API_KEY}
              >
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={{
                    lat: noticeToView.location.coordinates[1],
                    lng: noticeToView.location.coordinates[0],
                  }}
                  zoom={13}
                  options={options}
                >
                  <Marker
                    position={{
                      lat: noticeToView.location.coordinates[1],
                      lng: noticeToView.location.coordinates[0],
                    }}
                    title={noticeToView.name}
                  />
                </GoogleMap>
              </LoadScript>
            </div>
          )}

          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p className="text-gray-600">{noticeToView.description}</p>
          </div>
        </div>
      </div>
    );
  };

  const [downloadTypeCrtieria, setDownloadTypeCriteria] = useState(null);
  const handleSelectChange = (selectedOption) => {
    setDownloadTypeCriteria(selectedOption);
  };

  const [downaloadNoticeType, setDownloadNoticeType] = useState(null);
  const handleNoticeTypeChange = (selectedOption) => {
    setDownloadNoticeType(selectedOption);
  };

  const [isDownloading, setIsDownloading] = useState(false);
  const handleDownloadReport = async () => {
    setIsDownloading(true);
    if (downloadTypeCrtieria !== null) {
      try {
        const res = await fetch(`/api/notice/generateReport`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ criteria: downloadTypeCrtieria.value }),
        });
        if (!res.ok) {
          setIsDownloading(false);
          throw new Error("Failed to generate PDF");
        }
        const pdfBlob = await res.blob();

        const url = window.URL.createObjectURL(pdfBlob);

        const a = document.createElement("a");
        a.href = url;
        a.download = `${downloadTypeCrtieria.value}-Report`;
        document.body.appendChild(a);
        setDownloadTypeCriteria(null);
        a.click();
        document.body.removeChild(a);
        setIsDownloading(false);
      } catch (error) {
        setIsDownloading(false);
        console.error("Error downloading report:", error);
        toast.error("Error downloading report");
      }
    }
    if (downaloadNoticeType !== null) {
      try {
        const res = await fetch(`/api/notice/generateReport`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ type: downaloadNoticeType.value }),
        });
        if (!res.ok) {
          setIsDownloading(false);
          throw new Error("Failed to generate PDF");
        }
        const pdfBlob = await res.blob();

        const url = window.URL.createObjectURL(pdfBlob);

        const a = document.createElement("a");
        a.href = url;
        a.download = `${downaloadNoticeType.value}-Report`;
        document.body.appendChild(a);
        setDownloadNoticeType(null);
        a.click();
        document.body.removeChild(a);
        setIsDownloading(false);
      } catch (error) {
        setIsDownloading(false);
        console.error("Error downloading report:", error);
        toast.error("Error downloading report");
      }
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
          <div>
            <div className=" flex items-center mb-2">
              <Button
                outline
                gradientDuoTone="greenToBlue"
                className="ml-4 mr-5"
                onClick={() => setAddPostModel(true)}
              >
                Create Notice
              </Button>
              <TextInput
                type="text"
                placeholder="Search Notice by Name"
                onChange={(e) => setSearch(e.target.value)}
                rightIcon={AiOutlineSearch}
                className="ml-1 bg-gray-50 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-80 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 mb"
              />
              <Select
                id="filter"
                className="ml-4"
                placeholder="Select a Criminal Type"
                styles={{
                  control: (provided) => ({
                    ...provided,
                    width: "250px",
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
                isClearable
                options={[
                  { value: "Low", label: "Low" },
                  { value: "Medium", label: "Medium" },
                  { value: "High", label: "High" },
                  { value: "Critical", label: "Critical" },
                ]}
                onChange={handleSelectChange}
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
                isClearable
                options={[
                  { value: "Missing", label: "Missing" },
                  { value: "Criminal", label: "Criminal" },
                ]}
                onChange={handleNoticeTypeChange}
              />
              <Button
                outline
                gradientDuoTone="greenToBlue"
                className="ml-4"
                onClick={handleDownloadReport}
                disabled={
                  (!downloadTypeCrtieria && !downaloadNoticeType) ||
                  (downaloadNoticeType && downloadTypeCrtieria)
                }
              >
                {isDownloading ? (
                  <Spinner size="sm" aria-label="Loading spinner" />
                ) : (
                  "Download Report"
                )}
              </Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            {notices.length > 0 ? (
              <Table>
                <Table.Head>
                  <Table.HeadCell>Type</Table.HeadCell>
                  <Table.HeadCell>Person Name</Table.HeadCell>
                  <Table.HeadCell>Last Seen Date</Table.HeadCell>
                  <Table.HeadCell>Danger Level</Table.HeadCell>
                  <Table.HeadCell>Verified Status</Table.HeadCell>
                  <Table.HeadCell>Actions</Table.HeadCell>
                </Table.Head>
                {displayNotices}
              </Table>
            ) : (
              <p>No Notices Available</p>
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
        </>
      )}
      {/** View Modal */}
      <Modal
        show={viewModal}
        onClose={() => {
          setViewModal(false);
          setNoticeToView(null);
          setAddress("Loading...");
        }}
        size="xl"
      >
        <Modal.Header>Notice Details</Modal.Header>
        <Modal.Body>
          <NoticeViewContent noticeToView={noticeToView} />
        </Modal.Body>
        <Modal.Footer>
          <Button
            color="gray"
            onClick={() => {
              setViewModal(false);
              setNoticeToView(null);
              setAddress("Loading...");
            }}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/** Delete Modal */}
      <Modal
        show={deleteModal}
        onClose={() => {
          setDeleteModal(false), setNoticeToDelete(null);
        }}
      >
        <Modal.Header>
          <h3 className="text-xl font-semibold">
            Are you sure you want to delete this notice?
          </h3>
        </Modal.Header>
        <Modal.Footer>
          <Button
            color="gray"
            onClick={() => {
              setDeleteModal(false), setNoticeToDelete(null);
            }}
          >
            Close
          </Button>
          <Button
            color="failure"
            onClick={() => confirmDelete()}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Spinner size="sm" aria-label="Loading spinner" />
            ) : (
              "Delete Notice"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/** Add New Modal */}
      <Modal
        show={addPostModel}
        onClose={() => {
          setFormData({}),
            setAddPostModel(false),
            setImageFile(null),
            setImageFileUploadingError(false),
            setFileUploadSuccess(false),
            setFileUploadSuccess(false),
            setImageFileUploadingError(false),
            setImageFileUploadingProgress(false);
        }}
        popup
        size="xl"
      >
        <Modal.Header>Add New Notice</Modal.Header>
        <Modal.Body>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="type" className="block text-sm font-medium">
                Type
              </label>
              <select
                id="type"
                name="type"
                autoComplete="type"
                required
                className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                onChange={handleChange}
              >
                <option value="">Select type</option>
                <option value="Criminal">Criminal</option>
                <option value="Missing">Missing Person</option>
              </select>
            </div>
            <div>
              <label htmlFor="name" className="block text-sm font-medium">
                Name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                autoComplete="name"
                required
                className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="age" className="block text-sm font-medium">
                Age
              </label>
              <input
                type="number"
                name="age"
                id="age"
                autoComplete="age"
                required
                className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="height" className="block text-sm font-medium">
                Height (cm)
              </label>
              <input
                type="number"
                name="height"
                id="height"
                autoComplete="height"
                required
                className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="weight" className="block text-sm font-medium">
                Weight (kg)
              </label>
              <input
                type="number"
                name="weight"
                id="weight"
                autoComplete="weight"
                required
                className="mt-1 focus:ring-blue-500 focus:border
                -blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="eye_color" className="block text-sm font-medium">
                Eye Color
              </label>
              <input
                type="text"
                name="eye_color"
                id="eye_color"
                autoComplete="eye_color"
                required
                className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="hair_color" className="block text-sm font-medium">
                Hair Color
              </label>
              <input
                type="text"
                name="hair_color"
                id="hair_color"
                autoComplete="hair_color"
                required
                className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                onChange={handleChange}
              />
            </div>
            <div>
              <label
                htmlFor="distinctive_marks"
                className="block text-sm font-medium"
              >
                Distinctive Marks
              </label>
              <input
                type="text"
                name="distinctive_marks"
                id="distinctive_marks"
                autoComplete="distinctive_marks"
                required
                className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="alias" className="block text-sm font-medium">
                Aliases
              </label>
              <input
                type="text"
                name="alias"
                id="alias"
                autoComplete="alias"
                required
                className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                onChange={handleChange}
              />
            </div>
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium"
              >
                Description
              </label>
              <textarea
                name="description"
                id="description"
                autoComplete="description"
                required
                className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                onChange={handleChange}
              />
            </div>
            <div>
              <label
                htmlFor="missingDate"
                className="block text-sm font-medium"
              >
                Last Seen Date
              </label>
              <input
                type="date"
                name="missingDate"
                id="missingDate"
                autoComplete="missingDate"
                required
                className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                onChange={handleChange}
              />
            </div>
            <div>
              <label
                htmlFor="dangerLevel"
                className="block text-sm font-medium"
              >
                Danger Level
              </label>
              <select
                id="dangerLevel"
                name="dangerLevel"
                autoComplete="dangerLevel"
                required
                className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                onChange={handleChange}
              >
                <option value="">Select level</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
            <div>
              <label htmlFor="location" className="block text-sm font-medium">
                Last Seen Location
              </label>
              <LoadScript
                googleMapsApiKey="AIzaSyCms2-r4afPJIKiStBZUNuRx_4BdU2p9ps"
                libraries={["places"]}
              >
                <GooglePlacesAutocomplete
                  apiKey="AIzaSyCms2-r4afPJIKiStBZUNuRx_4BdU2p9ps"
                  selectProps={{
                    value,
                    onChange: async (place) => {
                      setValue(place);

                      // Fetching the lat/lng details
                      if (place && place.value && place.value.place_id) {
                        const geocoder = new window.google.maps.Geocoder();
                        geocoder.geocode(
                          { placeId: place.value.place_id },
                          (results, status) => {
                            if (status === "OK" && results[0]) {
                              const lat = results[0].geometry.location.lat();
                              const lng = results[0].geometry.location.lng();

                              // Setting the location with longitude first, then latitude
                              setLocation({
                                type: "Point",
                                coordinates: [lng, lat], // [longitude, latitude]
                              });
                              console.log("Location set: ", {
                                type: "Point",
                                coordinates: [lng, lat],
                              });
                            } else {
                              console.error("Geocode failed:", status);
                            }
                          }
                        );
                      }
                    },
                  }}
                  fetchDetails={true} // Required to get place details like lat/lng
                />
              </LoadScript>
            </div>
            <div>
              <label htmlFor="image" className="block text-sm font-medium">
                Image
              </label>
              <input
                type="file"
                name="image"
                id="image"
                autoComplete="image"
                required
                className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                onChange={handleImageChange}
              />
              {imageFileUploadingProgress && (
                <p>Uploading Image: {imageFileUploadingProgress}%</p>
              )}
              {fileUploadSuccess && <p>{fileUploadSuccess}</p>}
              {imageFileUploadingError && <p>{imageFileUploadingError}</p>}
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            color="gray"
            onClick={() => {
              setAddPostModel(false),
                setImageFile(null),
                setImageFileUploadingError(false),
                setFileUploadSuccess(false),
                setFileUploadSuccess(false),
                setImageFileUploadingError(false),
                setImageFileUploadingProgress(false),
                setFormData({});
            }}
          >
            Close
          </Button>
          <Button
            color="success"
            onClick={() => {
              handleNoticeSubmit();
              setAddPostModel(false);
            }}
            disabled={!imageFileUrl}
          >
            Add Notice
          </Button>
        </Modal.Footer>
      </Modal>

      {/** Update Modal */}
      <Modal
        show={updateModal}
        onClose={() => {
          setFormData({}),
            setUpdateModal(false),
            setImageFile(null),
            setImageFileUploadingError(false),
            setFileUploadSuccess(false),
            setFileUploadSuccess(false),
            setImageFileUploadingError(false),
            setImageFileUploadingProgress(false);
        }}
        popup
        size="xl"
      >
        <Modal.Header>Update Notice</Modal.Header>
        <Modal.Body>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="type" className="block text-sm font-medium">
                Type
              </label>
              <select
                id="type"
                name="type"
                placeholder={noticeToUpdate?.type}
                autoComplete="type"
                required
                className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                onChange={handleChange}
              >
                <option value="">Select type</option>
                <option value="Criminal">Criminal</option>
                <option value="Missing">Missing Person</option>
              </select>
            </div>
            <div>
              <label htmlFor="type" className="block text-sm font-medium">
                Verify Status
              </label>
              <select
                id="isVerified"
                name="type"
                autoComplete="type"
                required
                className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                onChange={handleChange}
              >
                <option value="">Select type</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
            <div>
              <label htmlFor="name" className="block text-sm font-medium">
                Name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                placeholder={noticeToUpdate?.name}
                autoComplete="name"
                required
                className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="age" className="block text-sm font-medium">
                Age
              </label>
              <input
                type="number"
                name="age"
                placeholder={noticeToUpdate?.age}
                id="age"
                autoComplete="age"
                required
                className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="height" className="block text-sm font-medium">
                Height (cm)
              </label>
              <input
                type="number"
                name="height"
                placeholder={noticeToUpdate?.height}
                id="height"
                autoComplete="height"
                required
                className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="weight" className="block text-sm font-medium">
                Weight (kg)
              </label>
              <input
                type="number"
                name="weight"
                placeholder={noticeToUpdate?.weight}
                id="weight"
                autoComplete="weight"
                required
                className="mt-1 focus:ring-blue-500 focus:border
                -blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="eye_color" className="block text-sm font-medium">
                Eye Color
              </label>
              <input
                type="text"
                name="eye_color"
                placeholder={noticeToUpdate?.eye_color}
                id="eye_color"
                autoComplete="eye_color"
                required
                className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="hair_color" className="block text-sm font-medium">
                Hair Color
              </label>
              <input
                type="text"
                name="hair_color"
                placeholder={noticeToUpdate?.hair_color}
                id="hair_color"
                autoComplete="hair_color"
                required
                className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                onChange={handleChange}
              />
            </div>
            <div>
              <label
                htmlFor="distinctive_marks"
                className="block text-sm font-medium"
              >
                Distinctive Marks
              </label>
              <input
                type="text"
                name="distinctive_marks"
                placeholder={noticeToUpdate?.distinctive_marks}
                id="distinctive_marks"
                autoComplete="distinctive_marks"
                required
                className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="alias" className="block text-sm font-medium">
                Aliases
              </label>
              <input
                type="text"
                name="alias"
                placeholder={noticeToUpdate?.alias}
                id="alias"
                autoComplete="alias"
                required
                className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                onChange={handleChange}
              />
            </div>
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium"
              >
                Description
              </label>
              <textarea
                name="description"
                placeholder={noticeToUpdate?.description}
                id="description"
                autoComplete="description"
                required
                className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                onChange={handleChange}
              />
            </div>
            <div>
              <label
                htmlFor="missingDate"
                className="block text-sm font-medium"
              >
                Last Seen Date
              </label>
              <input
                type="date"
                name="missingDate"
                placeholder={noticeToUpdate?.missingDate}
                id="missingDate"
                autoComplete="missingDate"
                required
                className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                onChange={handleChange}
              />
            </div>
            <div>
              <label
                htmlFor="dangerLevel"
                className="block text-sm font-medium"
              >
                Danger Level
              </label>
              <select
                id="dangerLevel"
                name="dangerLevel"
                placeholder={noticeToUpdate?.dangerLevel}
                autoComplete="dangerLevel"
                required
                className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                onChange={handleChange}
              >
                <option value="">Select level</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
            <div>
              <label htmlFor="location" className="block text-sm font-medium">
                Last Seen Location
              </label>
              <LoadScript
                googleMapsApiKey="AIzaSyCms2-r4afPJIKiStBZUNuRx_4BdU2p9ps"
                libraries={["places"]}
              >
                <GooglePlacesAutocomplete
                  apiKey="AIzaSyCms2-r4afPJIKiStBZUNuRx_4BdU2p9ps"
                  selectProps={{
                    value,
                    onChange: async (place) => {
                      setValue(place);

                      // Fetching the lat/lng details
                      if (place && place.value && place.value.place_id) {
                        const geocoder = new window.google.maps.Geocoder();
                        geocoder.geocode(
                          { placeId: place.value.place_id },
                          (results, status) => {
                            if (status === "OK" && results[0]) {
                              const lat = results[0].geometry.location.lat();
                              const lng = results[0].geometry.location.lng();

                              // Setting the location with longitude first, then latitude
                              setLocation({
                                type: "Point",
                                coordinates: [lng, lat], // [longitude, latitude]
                              });
                              console.log("Location set: ", {
                                type: "Point",
                                coordinates: [lng, lat],
                              });
                            } else {
                              console.error("Geocode failed:", status);
                            }
                          }
                        );
                      }
                    },
                  }}
                  fetchDetails={true} // Required to get place details like lat/lng
                />
              </LoadScript>
            </div>
            <div>
              <label htmlFor="image" className="block text-sm font-medium">
                Image
              </label>
              <input
                type="file"
                name="image"
                id="image"
                autoComplete="image"
                required
                className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                onChange={handleImageChange}
              />
              {imageFileUploadingProgress && (
                <p>Uploading Image: {imageFileUploadingProgress}%</p>
              )}
              {fileUploadSuccess && <p>{fileUploadSuccess}</p>}
              {imageFileUploadingError && <p>{imageFileUploadingError}</p>}
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            color="gray"
            onClick={() => {
              setUpdateModal(false),
                setImageFile(null),
                setImageFileUploadingError(false),
                setFileUploadSuccess(false),
                setFileUploadSuccess(false),
                setImageFileUploadingError(false),
                setImageFileUploadingProgress(false),
                setFormData({});
            }}
          >
            Close
          </Button>
          <Button
            color="success"
            onClick={() => {
              handleUpdateNoticeSubmit();
              setUpdateModal(false);
            }}
          >
            {isUpdating ? (
              <Spinner size="sm" aria-label="Loading spinner" />
            ) : (
              "Update Notice"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
