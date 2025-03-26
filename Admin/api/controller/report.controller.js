import Report from "../models/report.model.js";
import NoticeBoard from "../models/notice.model.js";
import { sendEmail } from "../utils/email.js";
import GoogleSendMail from "../utils/sendemail.js";
import generatePDFFromHtml from "../utils/PDFGenerator.js";
import axios from "axios";
export const getReports = async (req, res, next) => {
  try {
    const reports = await Report.find().populate("userId").populate("noticeId");
    const totalReports = reports.length;
    const activeReports = reports.filter(
      (report) => report.isVerified === true
    ).length;
    const inactiveReports = reports.filter(
      (report) => report.isVerified === false
    ).length;
    res
      .status(200)
      .json({ reports, totalReports, activeReports, inactiveReports });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteReport = async (req, res, next) => {
  try {
    const report = await Report.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Report deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyReport = async (req, res, next) => {
  try {
    const report = await Report.findByIdAndUpdate(req.params.id, {
      isVerified: true,
    })
      .populate("userId")
      .populate("noticeId");
    const notice = await NoticeBoard.findByIdAndUpdate(report.noticeId, {
      location: report.location,
    });
    try {
      await GoogleSendMail({
        email: report.userId.email,
        subject: "Report Verified",
        template: "report-confirmation.ejs",
        data: {
          name: report.userId.name,
          notice: notice.name,
        },
      }); // This line will throw an error
    } catch (error) {
      console.error(error);
    }
    res.status(200).json({ message: "Report verified successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const GOOGLE_MAPS_API_KEY = "AIzaSyCms2-r4afPJIKiStBZUNuRx_4BdU2p9ps";
export const generateNoticeReport = async (req, res) => {
  const { noticeId } = req.body;

  try {
    const reports = await Report.find({ noticeId })
      .populate("noticeId")
      .populate("userId", "name email");

    if (!reports || reports.length === 0) {
      return res.status(404).json({ message: "No reports found for this notice" });
    }

    const notice = reports[0].noticeId;
    const verifiedReports = reports.filter((report) => report.isVerified).length;
    const unverifiedReports = reports.length - verifiedReports;

    let htmlContent = generateHtmlHeader(notice, verifiedReports, unverifiedReports);

    for (const report of reports) {
      const locationInfo = await decodeLocation(report.location.coordinates);
      htmlContent += generateReportSection(report, locationInfo);
    }

    htmlContent += `
      <script>
        feather.replace()
      </script>
    </body></html>`;

    const pdfBuffer = await generatePDFFromHtml(htmlContent);

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=notice_report_${noticeId}.pdf`,
      "Content-Length": pdfBuffer.length,
    });
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating notice report:', error);
    res.status(500).json({ message: "An error occurred while generating the report" });
  }
};

const getDangerLevelColor = (dangerLevel) => {
  const colors = {
    Low: '#28a745',     // Green
    Medium: '#ffc107',  // Yellow
    High: '#fd7e14',    // Orange
    Critical: '#dc3545' // Red
  };
  return colors[dangerLevel] || '#6c757d';
};

const generateHtmlHeader = (notice, verifiedReports, unverifiedReports) => {
  const dangerColor = getDangerLevelColor(notice?.dangerLevel);
  const isMissing = notice.status === 'Missing';
  
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <title>${isMissing ? 'Missing Person' : 'Notice'} Report: ${notice.name}</title>
      <link href="https://cdnjs.cloudflare.com/ajax/libs/tailwindcss/2.2.19/tailwind.min.css" rel="stylesheet">
      <script src="https://cdnjs.cloudflare.com/ajax/libs/feather-icons/4.28.0/feather.min.js"></script>
      <style>
          body {
              font-family: 'Inter', sans-serif;
              margin: 0;
              padding: 20px;
              line-height: 1.6;
              background-color: #f3f4f6;
          }
          .container {
              max-width: 1200px;
              margin: 0 auto;
          }
          .header {
              background-color: ${dangerColor};
              color: white;
              padding: 20px;
              border-radius: 10px;
              margin-bottom: 20px;
              display: flex;
              align-items: center;
              justify-content: space-between;
          }
          .header h1 {
              margin: 0;
              display: flex;
              align-items: center;
              font-size: 1.8em;
          }
          .header i {
              margin-right: 10px;
          }
          .danger-badge {
              display: inline-flex;
              align-items: center;
              padding: 8px 16px;
              border-radius: 999px;
              background-color: rgba(255, 255, 255, 0.2);
              font-weight: bold;
          }
          .danger-badge i {
              margin-right: 8px;
          }
          .section {
              background-color: white;
              margin-bottom: 25px;
              padding: 20px;
              border-radius: 10px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .section h2, .section h3 {
              color: #1a202c;
              font-size: 1.5em;
              margin-bottom: 15px;
              display: flex;
              align-items: center;
          }
          .section h2 i, .section h3 i {
              margin-right: 10px;
              color: ${dangerColor};
          }
          .stats {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 20px;
              margin: 20px 0;
          }
          .stat-box {
              background-color: white;
              padding: 20px;
              border-radius: 10px;
              text-align: center;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .stat-box h3 {
              display: flex;
              align-items: center;
              justify-content: center;
              margin-bottom: 10px;
              color: #4a5568;
          }
          .stat-box h3 i {
              margin-right: 8px;
          }
          .stat-box p {
              font-size: 24px;
              font-weight: bold;
          }
          .info-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 15px;
          }
          .info-item {
              display: flex;
              align-items: center;
          }
          .info-item i {
              margin-right: 8px;
              color: #718096;
          }
          .location-info {
              background-color: #f8f9fa;
              padding: 15px;
              border-radius: 8px;
              margin-top: 15px;
          }
          .location-info h4 {
              display: flex;
              align-items: center;
              margin-bottom: 10px;
              color: #4a5568;
          }
          .location-info h4 i {
              margin-right: 8px;
          }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">
              <h1>
                  <i data-feather="${isMissing ? 'user-x' : 'alert-octagon'}"></i>
                  ${isMissing ? 'Missing Person' : 'Notice'} Report: ${notice.name}
              </h1>
              <div class="danger-badge">
                  <i data-feather="alert-triangle"></i>
                  Danger Level: ${notice.dangerLevel}
              </div>
          </div>
          <div class="section">
              <h2><i data-feather="file-text"></i>${isMissing ? 'Missing Person' : 'Notice'} Details</h2>
              <div class="info-grid">
                  <div class="info-item"><i data-feather="tag"></i><strong>Type:</strong> ${notice.type}</div>
                  <div class="info-item"><i data-feather="activity"></i><strong>Status:</strong> ${notice.status}</div>
                  <div class="info-item"><i data-feather="calendar"></i><strong>Age:</strong> ${notice.age}</div>
                  <div class="info-item"><i data-feather="arrow-up"></i><strong>Height:</strong> ${notice.height} cm</div>
                  <div class="info-item"><i data-feather="box"></i><strong>Weight:</strong> ${notice.weight} kg</div>
                  <div class="info-item"><i data-feather="eye"></i><strong>Eye Color:</strong> ${notice.eye_color}</div>
                  <div class="info-item"><i data-feather="scissors"></i><strong>Hair Color:</strong> ${notice.hair_color}</div>
                  ${isMissing ? `<div class="info-item"><i data-feather="clock"></i><strong>Missing Since:</strong> ${notice.missingDate ? new Date(notice.missingDate).toLocaleDateString() : "N/A"}</div>` : ''}
              </div>
              <div class="info-item" style="margin-top: 15px;">
                  <i data-feather="bookmark"></i><strong>Distinctive Marks:</strong> ${notice.distinctive_marks}
              </div>
              <div class="info-item" style="margin-top: 15px;">
                  <i data-feather="file-text"></i><strong>Description:</strong> ${notice.description}
              </div>
          </div>
          <div class="stats">
              <div class="stat-box">
                  <h3><i data-feather="check-circle"></i>Verified Reports</h3>
                  <p style="color: #28a745;">${verifiedReports}</p>
              </div>
              <div class="stat-box">
                  <h3><i data-feather="alert-circle"></i>Unverified Reports</h3>
                  <p style="color: #dc3545;">${unverifiedReports}</p>
              </div>
          </div>
  `;
};

const generateReportSection = (report, locationInfo) => `
  <div class="section">
      <h3><i data-feather="file-plus"></i>Report Details</h3>
      <div class="info-grid">
          <div class="info-item">
              <i data-feather="check-circle" style="color: ${report.isVerified ? '#28a745' : '#dc3545'}"></i>
              <strong>Verified:</strong> ${report.isVerified ? "Yes" : "No"}
          </div>
          <div class="info-item">
              <i data-feather="user"></i>
              <strong>Reported By:</strong> ${report.userId.name}
          </div>
          <div class="info-item">
              <i data-feather="mail"></i>
              <strong>Reporter Email:</strong> ${report.userId.email}
          </div>
          <div class="info-item">
              <i data-feather="clock"></i>
              <strong>Reported On:</strong> ${new Date(report.createdAt).toLocaleString()}
          </div>
      </div>
      <div class="info-item" style="margin-top: 15px;">
          <i data-feather="file-text"></i>
          <strong>Description:</strong> ${report.description}
      </div>
      <div class="location-info">
          <h4><i data-feather="map-pin"></i>Location Information</h4>
          ${locationInfo}
      </div>
  </div>
`;

const decodeLocation = async (coordinates) => {
  try {
    const [longitude, latitude] = coordinates;
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`
    );
    
    if (response.data.results && response.data.results.length > 0) {
      const address = response.data.results[0].formatted_address;
      return `
        <div style="margin-bottom: 10px;">${address}</div>
        <div style="color: #718096; font-size: 0.9em;">
          <i data-feather="map" style="width: 14px; height: 14px; display: inline; vertical-align: middle;"></i>
          Coordinates: ${latitude}, ${longitude}
        </div>
        <img src="https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=13&size=400x200&markers=color:red%7C${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}"
             alt="Location Map"
             style="max-width: 100%; border-radius: 8px; margin-top: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
      `;
    }
    
    return `Unable to decode address. Coordinates: ${latitude}, ${longitude}`;
  } catch (error) {
    console.error('Error decoding location:', error);
    return `Error decoding location. Coordinates: ${latitude}, ${longitude}`;
  }
};