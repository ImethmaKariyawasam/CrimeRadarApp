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
  Avatar,
} from "flowbite-react";
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
import { AiOutlineSearch } from "react-icons/ai";
import ReactQuill from "react-quill";
import { HiEye, HiOutlineX, HiCalendar, HiTag, HiUser } from "react-icons/hi";
import "react-quill/dist/quill.snow.css";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { app } from "../firebase";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { set } from "mongoose";
export default function DashAppArticles() {
  const [selectedMarker, setSelectedMarker] = useState(null); // State for selected marker
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteModal, setDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [articles, setArticles] = useState([]);
  const [totalArticles, setTotalArticles] = useState(0);
  const [totalVerifiedArticles, setVerifiedArticles] = useState(0);
  const [totalUnverifiedArticles, setUnverifiedArticles] = useState(0);
  const [search, setSearch] = useState("");
  const [selectNames, setSelectNames] = useState([]);

  // CreatePost state
  const [file, setFile] = useState(null);
  const [imageUploadProgress, setImageUploadProgress] = useState(null);
  const [imageUploadError, setImageUploadError] = useState(null);
  const [formData, setFormData] = useState({});
  const [publishError, setPublishError] = useState(null);

  const fetchArticles = async () => {
    try {
      const res = await fetch("/api/article/getPosts");
      const data = await res.json();
      if (res.ok) {
        const articles = data;
        const filteredArticles = articles.posts.filter((article) => {
          return (
            article.title.toLowerCase().includes(search.toLowerCase()) ||
            article.content.toLowerCase().includes(search.toLowerCase())
          );
        });
        setArticles(filteredArticles);
        setTotalArticles(articles.totalArticles);
        setVerifiedArticles(articles.verifiedArticles);
        setUnverifiedArticles(articles.unverifiedArticles);
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
    fetchArticles();
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
  const articlesPerPage = 5;

  const pageCount = Math.ceil(articles.length / articlesPerPage);

  const handlePageChange = ({ selected }) => {
    setPageNumber(selected);
  };

  const [viewArticleModal, setViewArticleModal] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const handleViewArticle = (article) => {
    setSelectedArticle(article);
    setViewArticleModal(true);
  };

  const [updateArticleModal, setupdateArticleModal] = useState(false);
  const [updatedArticle, setUpdatedArticle] = useState(null);
  const handleUpdateArticle = (article) => {
    setupdateArticleModal(true);
    setUpdatedArticle(article);
  };

  const displayArticles = articles
    .slice(pageNumber * articlesPerPage, (pageNumber + 1) * articlesPerPage)
    .map((article) => (
      <Table.Body className="divide-y">
        <Table.Row
          key={article._id}
          className="bg-white dark:border-gray-700 dark:bg-gray-800"
        >
          <Table.Cell>{article.category}</Table.Cell>
          <Table.Cell>{article.title}</Table.Cell>
          <Table.Cell>
            {" "}
            {new Date(article.createdAt).toLocaleDateString("en-US", {
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
                  article.isVerified === true
                    ? "success"
                    : article.isVerified === false
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
                {article.isVerified ? (
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
                onClick={() => handleViewArticle(article)}
              >
                <HiEye className="mr-2 h-5 w-5" />
                View
              </Button>
              <Button
                color="green"
                type="submit"
                outline
                onClick={() => handleUpdateArticle(article)}
              >
                <FaClipboardList className="mr-2 h-5 w-5" />
                Update
              </Button>
              <Button size="sm" color="failure" outline>
                <HiOutlineX className="mr-2 h-5 w-5" />
                Delete
              </Button>
            </div>
          </Table.Cell>
        </Table.Row>
      </Table.Body>
    ));

  const [addPostModel, setAddPostModel] = useState(false);

  const handleUploadImage = async () => {
    try {
      if (!file) {
        setImageUploadError("Please select an image");
        return;
      }
      setImageUploadError(null);
      const storage = getStorage(app);
      const fileName = new Date().getTime() + "-" + file.name;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setImageUploadProgress(progress.toFixed(0));
        },
        (error) => {
          setImageUploadError("Image upload failed");
          setImageUploadProgress(null);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            setImageUploadProgress(null);
            setImageUploadError(null);
            setFormData({ ...formData, image: downloadURL });
          });
        }
      );
    } catch (error) {
      setImageUploadError("Image upload failed");
      setImageUploadProgress(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/article/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        setPublishError(data.message);
        return;
      }
      if (res.ok) {
        setPublishError(null);
        setAddPostModel(false);
        toast.success("Article created successfully");
        fetchArticles();
      }
    } catch (error) {
      setPublishError("An error occurred while publishing");
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
                      Total Articles
                    </h3>
                    <p className="text-2xl">{totalArticles}</p>
                  </div>
                  <FaExclamationTriangle className="bg-yellow-500 text-white  text-5xl p-3 shadow-lg" />
                </div>
              </div>
              <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 w-full rounded-md shadow-md">
                <div className="flex justify-between">
                  <div className="">
                    <h3 className="text-gray-500 text-md uppercase">
                      Verified Articles
                    </h3>
                    <p className="text-2xl">{totalVerifiedArticles}</p>
                  </div>
                  <FaExclamationTriangle className="bg-green-500 text-white  text-5xl p-3 shadow-lg" />
                </div>
              </div>
              <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 w-full rounded-md shadow-md">
                <div className="flex justify-between">
                  <div className="">
                    <h3 className="text-gray-500 text-md uppercase">
                      Unverified Articles
                    </h3>
                    <p className="text-2xl">{totalUnverifiedArticles}</p>
                  </div>
                  <FaExclamationTriangle className="bg-red-500 text-white text-5xl p-3 shadow-lg" />
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
                Create Article
              </Button>
              <TextInput
                type="text"
                placeholder="Search by Article Name"
                onChange={(e) => setSearch(e.target.value)}
                rightIcon={AiOutlineSearch}
                className="ml-1 bg-gray-50 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-80 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 mb"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            {articles.length > 0 ? (
              <Table>
                <Table.Head>
                  <Table.HeadCell>Article Category</Table.HeadCell>
                  <Table.HeadCell>Article Title</Table.HeadCell>
                  <Table.HeadCell>Submitted Date</Table.HeadCell>
                  <Table.HeadCell>Verify Status</Table.HeadCell>
                  <Table.HeadCell>Actions</Table.HeadCell>
                </Table.Head>
                {displayArticles}
              </Table>
            ) : (
              <p>No Articles Available</p>
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
          {/** Add Artcile */}
          <Modal
            show={addPostModel}
            onClose={() => setAddPostModel(false)}
            size="xl"
          >
            <Modal.Header>Create a new article</Modal.Header>
            <Modal.Body>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <TextInput
                    type="text"
                    placeholder="Title"
                    required
                    id="title"
                    className="flex-1"
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                  />
                  <select
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="flex-1 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  >
                    <option value="">Select a category</option>
                    <option value="Crime Prevention">Crime Prevention</option>
                    <option value="Cybercrime">Cybercrime</option>
                    <option value="Crime Reports">Crime Reports</option>
                  </select>
                </div>
                <div className="flex gap-4 items-center justify-between border-4 border-teal-500 border-dotted p-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFile(e.target.files[0])}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    gradientDuoTone="purpleToBlue"
                    size="sm"
                    outline
                    onClick={handleUploadImage}
                    disabled={imageUploadProgress !== null}
                  >
                    {imageUploadProgress ? (
                      <div className="w-16 h-16">
                        <CircularProgressbar
                          value={imageUploadProgress}
                          text={`${imageUploadProgress || 0}%`}
                        />
                      </div>
                    ) : (
                      "Upload image"
                    )}
                  </Button>
                </div>
                {imageUploadError && (
                  <p className="text-red-500 text-sm">{imageUploadError}</p>
                )}
                {formData.image && (
                  <img
                    src={formData.image}
                    alt="upload preview"
                    className="w-full h-72 object-cover"
                  />
                )}
                <ReactQuill
                  theme="snow"
                  placeholder="Write something.."
                  className="h-72 mb-12"
                  required
                  onChange={(value) =>
                    setFormData({ ...formData, content: value })
                  }
                />
                <Button type="submit" gradientDuoTone="purpleToPink">
                  Publish
                </Button>
              </form>
              {publishError && (
                <p className="text-red-500 mt-5">{publishError}</p>
              )}
            </Modal.Body>
          </Modal>
          {/** View Article */}
          <Modal
            show={viewArticleModal}
            onClose={() => {
              setViewArticleModal(false), setSelectedArticle(null);
            }}
            size="7xl"
          >
            {selectedArticle && (
              <>
                <Modal.Header>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {selectedArticle.title}
                  </h3>
                </Modal.Header>
                <Modal.Body>
                  <div className="space-y-6">
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className="text-lg font-semibold">Author</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          <HiUser className="inline mr-1" />
                          Anonymous
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      <span>
                        <HiCalendar className="inline mr-1" />{" "}
                        {new Date(
                          selectedArticle.createdAt
                        ).toLocaleDateString()}
                      </span>
                      <span>
                        <HiTag className="inline mr-1" />{" "}
                        {selectedArticle.category}
                      </span>
                      <Badge
                        color={
                          selectedArticle.isVerified ? "success" : "warning"
                        }
                      >
                        {selectedArticle.isVerified
                          ? "Verified"
                          : "Pending Verification"}
                      </Badge>
                    </div>
                    {selectedArticle.image && (
                      <img
                        src={selectedArticle.image}
                        alt={selectedArticle.title}
                        className="w-full h-64 object-cover rounded-lg shadow-md"
                      />
                    )}
                    <div className="prose max-w-none dark:prose-invert">
                      <div
                        dangerouslySetInnerHTML={{
                          __html: selectedArticle.content,
                        }}
                      />
                    </div>
                  </div>
                </Modal.Body>
                <Modal.Footer>
                  <Button
                    color="gray"
                    onClick={() => {
                      setViewArticleModal(false), setSelectedArticle(null);
                    }}
                  >
                    Close
                  </Button>
                </Modal.Footer>
              </>
            )}
          </Modal>
          {/** Update Article */}
        </>
      )}
    </div>
  );
}
