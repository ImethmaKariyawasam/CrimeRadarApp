import { Sidebar } from "flowbite-react";
import {
  HiUser,
  HiArrowSmRight,
  HiDocument,
  HiDocumentText,
  HiOutlineUserGroup,
  HiAnnotation,
  HiChartPie,
} from "react-icons/hi";
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { signOutSuccess } from "../redux/user/userSlice";
import { useDispatch, useSelector } from "react-redux";
import {
  FaUsers,
  FaUserShield,
  FaClipboardList,
  FaExclamationTriangle,
  FaFileAlt,
} from "react-icons/fa";
export default function DashSideBar() {
  const dispatch = useDispatch();
  const location = useLocation();
  const [tab, setTab] = useState("");
  const { currentUser } = useSelector((state) => state.user);
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabFromUrl = urlParams.get("tab");
    if (tabFromUrl) {
      setTab(tabFromUrl);
    }
  }, [location.search]);

  const handleSignout = async () => {
    try {
      const res = await fetch("/api/user/signout", {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        console.log(data.message);
      } else {
        dispatch(signOutSuccess());
      }
    } catch (error) {
      console.log(error.message);
    }
  };
  return (
    <Sidebar className="w-full md:w-56">
      <Sidebar.Items>
        <Sidebar.ItemGroup className="flex flex-col gap-1">
          {currentUser && currentUser.isAdmin && (
            <Link to="/dashboard?tab=dash">
              <Sidebar.Item
                active={tab === "dash" || !tab}
                icon={HiChartPie}
                labelColor="dark"
                as="div"
              >
                Dashboard
              </Sidebar.Item>
            </Link>
          )}
          <Link to="/dashboard?tab=profile">
            <Sidebar.Item
              active={tab === "profile"}
              icon={HiUser}
              label={currentUser.isAdmin ? "Admin" : "User"}
              labelColor="dark"
              as="div"
            >
              Profile
            </Sidebar.Item>
          </Link>
          {currentUser.isAdmin && (
            <>
              <Link to="/dashboard?tab=users">
                <Sidebar.Item
                  active={tab === "users"}
                  icon={FaUserShield}
                  as="div"
                >
                  Admin Users
                </Sidebar.Item>
              </Link>
              <Link to="/dashboard?tab=appUsers">
                <Sidebar.Item
                  active={tab === "appUsers"}
                  icon={FaUsers}
                  as="div"
                >
                  App Users
                </Sidebar.Item>
              </Link>
              <Link to="/dashboard?tab=appNotices">
                <Sidebar.Item
                  active={tab === "appNotices"}
                  icon={FaClipboardList}
                  as="div"
                >
                  Notices
                </Sidebar.Item>
              </Link>
              <Link to="/dashboard?tab=appReports">
                <Sidebar.Item
                  active={tab === "appReports"}
                  icon={FaExclamationTriangle}
                  as="div"
                >
                  Reports
                </Sidebar.Item>
              </Link>
              <Link to="/dashboard?tab=appArticles">
                <Sidebar.Item
                  active={tab === "appArticles"}
                  icon={FaFileAlt}
                  as="div"
                >
                  Articles
                </Sidebar.Item>
              </Link>
            </>
          )}
          <Sidebar.Item
            icon={HiArrowSmRight}
            className="cursor-pointer"
            onClick={handleSignout}
          >
            Sign Out
          </Sidebar.Item>
        </Sidebar.ItemGroup>
      </Sidebar.Items>
    </Sidebar>
  );
}
