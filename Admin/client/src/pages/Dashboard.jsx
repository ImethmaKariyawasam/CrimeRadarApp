import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import DashSideBar from "../components/DashSideBar";
import DashProfile from "../components/DashProfile";
import DashUserProfiles from "../components/DashUserProfiles";
import DashAppUser from "../components/DashAppUser";
import DashNotices from "../components/DashNotices";
import DashReports from "../components/DashReports";
import DashCriminalNoticeDashboard from "../components/DashCriminalNoticeBaord";
import DashAppArticles from "../components/DashAppArticles";
export default function Dashboard() {
  const location = useLocation();
  const [tab, setTab] = useState("");
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabFromUrl = urlParams.get("tab");
    if (tabFromUrl) {
      setTab(tabFromUrl);
    }
  }, [location.search]);
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* <DashSideBar /> */}
      <div className=" md:w-56">
        <DashSideBar />
      </div>
      {/* <DashProfile /> */}
      {tab === "profile" && <DashProfile />}
      {tab === "users" && <DashUserProfiles />}
      {/** <AppUsers/> */}
      {tab === "appUsers" && <DashAppUser />}
      {/** <AppNotices/> */}
      {tab === "appNotices" && <DashNotices />}
      {/** <AppReports/> */}
      {tab === "appReports" && <DashReports />}
      {/** <DashBoardCriminalNoticeBaord/> */}
      {tab === "dash" && <DashCriminalNoticeDashboard />}
      {/** <DashAppArticles/> */}
      {tab === "appArticles" && <DashAppArticles />}
    </div>
  );
}
