import React from "react";
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
import { FaUsers, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { AiOutlineSearch } from "react-icons/ai";

export default function DashAppUser() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [totalUsers, setTotalUsers] = useState(0);
  const [verifiedUsers, setVerifiedUsers] = useState(0);
  const [unverifiedUsers, setUnverifiedUsers] = useState(0);
  const [search, setSearch] = useState("");
  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/app/getAppUsers");
      const data = await res.json();
      if (!res.ok) {
        setError(data.message);
      } else {
        const filteredUsers = data.users.filter((user) => {
          return user.name.toLowerCase().includes(search.toLowerCase());
        });
        setUsers(filteredUsers);
        setTotalUsers(data.totalUsers);
        setVerifiedUsers(data.verifiedUsers);
        setUnverifiedUsers(data.unverifiedUsers);
      }
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search]);

  const [viewUser, setViewUser] = useState({});
  const [viewModal, setViewModal] = useState(false);
  const handleViewMore = (user) => {
    setViewUser(user);
    setViewModal(true);
  };

  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const handleDelete = (user) => {
    setSelectedUser(user);
    setDeleteModal(true);
  };

  console.log(selectedUser);

  const [pageNumber, setPageNumber] = useState(0);
  const usersPerPage = 5;

  const pageCount = Math.ceil(users.length / usersPerPage);

  const handlePageChange = ({ selected }) => {
    setPageNumber(selected);
  };

  const displayUsers = users
    .slice(pageNumber * usersPerPage, (pageNumber + 1) * usersPerPage)
    .map((user) => (
      <Table.Body className="divide-y">
        <Table.Row
          key={user._id}
          className="bg-white dark:border-gray-700 dark:bg-gray-800"
        >
          <Table.Cell>{user.name}</Table.Cell>
          <Table.Cell>{user.email}</Table.Cell>
          <Table.Cell>{user.phoneNo}</Table.Cell>
          <Table.Cell>{user.NIC}</Table.Cell>
          <Table.Cell>
            {
              <Badge
                color={
                  user.isVerified === true
                    ? "success"
                    : user.isVerified === false
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
                {user.isVerified ? (
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
                onClick={() => handleViewMore(user)}
              >
                <HiEye className="mr-2 h-5 w-5" />
                View
              </Button>
              <Button
                size="sm"
                color="failure"
                disabled={isDeleting}
                onClick={() => handleDelete(user)}
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
      const res = await fetch(`/api/app/deleteUser/${selectedUser._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message);
      } else {
        toast.success(data.message);
        fetchUsers();
        setDeleteModal(false);
        setSelectedUser(null);
      }
      setIsDeleting(false);
    } catch (error) {
      toast.error(error.message);
      setIsDeleting(false);
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
                      Total Users
                    </h3>
                    <p className="text-2xl">{totalUsers}</p>
                  </div>
                  <FaUsers className="bg-yellow-500 text-white rounded-full text-5xl p-3 shadow-lg" />
                </div>
              </div>
              <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 w-full rounded-md shadow-md">
                <div className="flex justify-between">
                  <div className="">
                    <h3 className="text-gray-500 text-md uppercase">
                      Active Users
                    </h3>
                    <p className="text-2xl">{verifiedUsers}</p>
                  </div>
                  <FaUsers className="bg-green-500 text-white rounded-full text-5xl p-3 shadow-lg" />
                </div>
              </div>
              <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 w-full rounded-md shadow-md">
                <div className="flex justify-between">
                  <div className="">
                    <h3 className="text-gray-500 text-md uppercase">
                      Deactive Users
                    </h3>
                    <p className="text-2xl">{unverifiedUsers}</p>
                  </div>
                  <FaUsers className="bg-red-500 text-white rounded-full text-5xl p-3 shadow-lg" />
                </div>
              </div>
            </div>
          </div>
          <div>
            <div className=" flex items-center mb-2">
              <TextInput
                type="text"
                placeholder="Search by User Name"
                onChange={(e) => setSearch(e.target.value)}
                rightIcon={AiOutlineSearch}
                className="ml-1 bg-gray-50 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-80 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 mb"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            {users.length > 0 ? (
              <Table>
                <Table.Head>
                  <Table.HeadCell>User Name</Table.HeadCell>
                  <Table.HeadCell>Email</Table.HeadCell>
                  <Table.HeadCell>Phone Number</Table.HeadCell>
                  <Table.HeadCell>NIC</Table.HeadCell>
                  <Table.HeadCell>Verified Status</Table.HeadCell>
                  <Table.HeadCell>Actions</Table.HeadCell>
                </Table.Head>
                {displayUsers}
              </Table>
            ) : (
              <p>No App Users Available</p>
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
          {/** View More User */}
          <Modal
            show={viewModal}
            onClose={() => {
              setViewModal(false);
              setViewUser(null);
            }}
            size="xl"
          >
            <Modal.Header>
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 mr-2 text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <h3 className="text-xl font-semibold text-gray-900">
                  User Details
                </h3>
              </div>
            </Modal.Header>
            <Modal.Body>
              {viewUser && (
                <div className="space-y-6">
                  <div className="flex justify-center mb-6">
                    <div className="relative">
                      <img
                        src={
                          viewUser.avatar?.url ||
                          "https://www.shutterstock.com/image-vector/vector-flat-illustration-grayscale-avatar-600nw-2281862025.jpg"
                        }
                        alt="Profile Image"
                        className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                      />
                      <span
                        className={`absolute bottom-0 right-0 h-4 w-4 rounded-full ring-2 ring-white ${
                          viewUser.isVerified ? "bg-green-500" : "bg-red-500"
                        }`}
                      ></span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center text-gray-600 mb-1">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-2 flex-shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        <span className="text-sm font-medium">Name</span>
                      </div>
                      <p className="text-gray-900 font-semibold truncate">
                        {viewUser.name}
                      </p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center text-gray-600 mb-1">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-2 flex-shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                        <span className="text-sm font-medium">
                          Phone Number
                        </span>
                      </div>
                      <p className="text-gray-900 font-semibold truncate">
                        {viewUser.phoneNo}
                      </p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center text-gray-600 mb-1">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-2 flex-shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
                          />
                        </svg>
                        <span className="text-sm font-medium">
                          Identification
                        </span>
                      </div>
                      <p className="text-gray-900 font-semibold truncate">
                        {viewUser.NIC}
                      </p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center text-gray-600 mb-1">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-2 flex-shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                        <span className="text-sm font-medium">Email</span>
                      </div>
                      <p className="text-gray-900 font-semibold truncate">
                        {viewUser.email}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-2 text-gray-600 flex-shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span className="text-sm font-medium text-gray-600">
                          Verification Status
                        </span>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          viewUser.isVerified
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {viewUser.isVerified ? "Verified" : "Not Verified"}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button
                color="gray"
                onClick={() => {
                  setViewModal(false);
                  setViewUser(null);
                }}
                className="flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                Close
              </Button>
            </Modal.Footer>
          </Modal>
          {/** Delete User Modal */}
          <Modal
            show={deleteModal}
            onClose={() => {
              setDeleteModal(false), setSelectedUser(null);
            }}
          >
            <Modal.Header>
              <h3 className="text-xl font-semibold">
                Are you sure you want to delete this user?
              </h3>
            </Modal.Header>
            <Modal.Footer>
              <Button
                color="gray"
                onClose={() => {
                  setDeleteModal(false), setSelectedUser(null);
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
                  "Delete User"
                )}
              </Button>
            </Modal.Footer>
          </Modal>
        </>
      )}
    </div>
  );
}
