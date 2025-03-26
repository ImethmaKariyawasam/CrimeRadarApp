import NoticeBoard from "../models/notice.model.js";
import generatePDFFromHtml from "../utils/PDFGenerator.js";
import axios from "axios";
const GOOGLE_MAPS_API_KEY="AIzaSyCms2-r4afPJIKiStBZUNuRx_4BdU2p9ps";
export const getNotices = async (req, res, next) => {
  try {
    const notices = await NoticeBoard.find();
    const totalNotices = notices.length;
    const activeNotices = notices.filter(
      (notice) => notice.isVerified === true
    ).length;
    const inactiveNotices = notices.filter(
      (notice) => notice.isVerified === false
    ).length;
    res
      .status(200)
      .json({ notices, totalNotices, activeNotices, inactiveNotices });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addNotice = async (req, res, next) => {
  try {
    const notice = await NoticeBoard.create(req.body);
    res.status(201).json(notice);
  } catch (error) {
    next(error);
  }
};

export const updateNotice = async (req, res, next) => {
  try {
    const { noticeId } = req.params;
    const updatedNotice = req.body;

    // Check for name length validation
    if (updatedNotice.name && updatedNotice.name.length > 50) {
      return res
        .status(400)
        .json({ message: "Name should be less than 50 characters" });
    }

    // Check for description length validation
    if (updatedNotice.description && updatedNotice.description.length > 500) {
      return res
        .status(400)
        .json({ message: "Description should be less than 500 characters" });
    }

    // Convert isVerified string to boolean
    if (updatedNotice.isVerified === "true") {
      updatedNotice.isVerified = true;
    } else if (updatedNotice.isVerified === "false") {
      updatedNotice.isVerified = false;
    }

    await NoticeBoard.findByIdAndUpdate(noticeId, updatedNotice);
    res.status(200).json({ message: "Notice updated successfully" });
  } catch (error) {
    next(error);
  }
};

export const deleteNotice = async (req, res, next) => {
  try {
    await NoticeBoard.findByIdAndDelete(req.params.noticeId);
    res.status(200).json({ message: "Notice deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const generateNoticeReport = async (req, res) => {
  const { criteria, type } = req.body;

  try {
    let query = {};
    if (criteria && (criteria === "Low" || criteria === "Medium" || criteria === "High" || criteria === "Critical")) {
      query.dangerLevel = criteria;
    }
    if (type) {
      query.type = type;
    }

    const notices = await NoticeBoard.find(query).exec();
    const noticeCount = notices.length;

    let htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <title>Criminal Notice Report</title>
          <link href="https://cdnjs.cloudflare.com/ajax/libs/tailwindcss/2.2.19/tailwind.min.css" rel="stylesheet">
          <script src="https://cdnjs.cloudflare.com/ajax/libs/feather-icons/4.28.0/feather.min.js"></script>
          <style>
              body {
                  font-family: 'Inter', sans-serif;
                  margin: 0;
                  padding: 20px;
                  background-color: #f3f4f6;
              }
              .container {
                  max-width: 1200px;
                  margin: 0 auto;
              }
              .header {
                  background-color: #1e40af;
                  color: white;
                  padding: 20px;
                  border-radius: 10px;
                  margin-bottom: 20px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
              }
              .header h1 {
                  margin: 0;
                  font-size: 2em;
                  font-weight: 700;
              }
              .header i {
                  margin-right: 10px;
                  font-size: 1.5em;
              }
              .section {
                  background-color: white;
                  border-radius: 10px;
                  padding: 20px;
                  margin-bottom: 20px;
                  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              }
              .section h2 {
                  color: #1e40af;
                  font-size: 1.5em;
                  margin-bottom: 15px;
                  display: flex;
                  align-items: center;
              }
              .section h2 i {
                  margin-right: 10px;
              }
              .danger-level {
                  font-weight: 600;
                  padding: 6px 12px;
                  border-radius: 999px;
                  display: inline-flex;
                  align-items: center;
              }
              .danger-level i {
                  margin-right: 5px;
              }
              .low {
                  background-color: #d1fae5;
                  color: #065f46;
              }
              .medium {
                  background-color: #fef3c7;
                  color: #92400e;
              }
              .high {
                  background-color: #fee2e2;
                  color: #991b1b;
              }
              .critical {
                  background-color: #7f1d1d;
                  color: #ffffff;
              }
              .location-info {
                  background-color: #f3f4f6;
                  padding: 15px;
                  border-radius: 8px;
                  margin-top: 15px;
              }
              .notice-count {
                  font-size: 1.2em;
                  font-weight: 600;
                  color: #1e40af;
                  margin-bottom: 20px;
                  display: flex;
                  align-items: center;
              }
              .notice-count i {
                  margin-right: 10px;
              }
              .info-grid {
                  display: grid;
                  grid-template-columns: repeat(2, 1fr);
                  gap: 10px;
              }
              .info-item {
                  display: flex;
                  align-items: center;
              }
              .info-item i {
                  margin-right: 8px;
                  color: #6b7280;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <i data-feather="alert-octagon"></i>
                  <h1>Criminal Notice Report</h1>
              </div>
              <div class="notice-count">
                  <i data-feather="file-text"></i>
                  Number of Notices: ${noticeCount}
              </div>
              <div class="section">
                  <h2>
                      <i data-feather="alert-triangle"></i>
                      Danger Level: ${criteria ? criteria : "All"}
                  </h2>
              </div>
    `;

    if (noticeCount === 0) {
      htmlContent += `
        <div class="section">
            <h2><i data-feather="alert-circle"></i>No Notices Found</h2>
            <p>There are no notices available for the selected criteria.</p>
        </div>
      `;
    } else {
      for (const notice of notices) {
        const dangerClass = notice.dangerLevel?.toLowerCase();
        const locationInfo = await decodeLocation(notice.location.coordinates);

        htmlContent += `
          <div class="section">
              <h2><i data-feather="user"></i>${notice.name}</h2>
              <div class="info-grid">
                  <div class="info-item"><i data-feather="calendar"></i><strong>Age:</strong> ${notice.age}</div>
                  <div class="info-item"><i data-feather="arrow-up"></i><strong>Height:</strong> ${notice.height} cm</div>
                  <div class="info-item"><i data-feather="box"></i><strong>Weight:</strong> ${notice.weight} kg</div>
                  <div class="info-item"><i data-feather="eye"></i><strong>Eye Color:</strong> ${notice.eye_color}</div>
                  <div class="info-item"><i data-feather="scissors"></i><strong>Hair Color:</strong> ${notice.hair_color}</div>
                  <div class="info-item"><i data-feather="tag"></i><strong>Alias:</strong> ${notice.alias.join(", ")}</div>
              </div>
              <div class="info-item" style="margin-top: 10px;">
                  <i data-feather="file-text"></i><strong>Description:</strong> ${notice.description}
              </div>
              <div class="info-item" style="margin-top: 10px;">
                  <i data-feather="bookmark"></i><strong>Distinctive Marks:</strong> ${notice.distinctive_marks}
              </div>
              <div class="info-item" style="margin-top: 10px;">
                  <i data-feather="calendar"></i><strong>Missing Date:</strong> ${notice.missingDate ? new Date(notice.missingDate).toLocaleDateString() : "N/A"}
              </div>
              <div class="location-info">
                <h3 style="display: flex; align-items: center; margin-bottom: 10px;">
                  <i data-feather="map-pin" style="margin-right: 8px;"></i>
                  <strong>Last Seen Location</strong>
                </h3>
                ${locationInfo}
              </div>
              ${notice.dangerLevel ? `
                <div style="margin-top: 15px;">
                  <span class="danger-level ${dangerClass}">
                    <i data-feather="${getDangerIcon(notice.dangerLevel)}"></i>
                    ${notice.dangerLevel.toUpperCase()}
                  </span>
                </div>` : ""}
          </div>`;
      }
    }

    htmlContent += `
          </div>
          <script>
            feather.replace()
          </script>
        </body>
        </html>`;

    const pdfBuffer = await generatePDFFromHtml(htmlContent);
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=criminal_notice_report_${criteria || "all"}_${noticeCount}_notices.pdf`,
      "Content-Length": pdfBuffer.length,
    });

    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating criminal notice report:', error);
    res.status(500).json({ error: error.message });
  }
};

const getDangerIcon = (dangerLevel) => {
  switch (dangerLevel.toLowerCase()) {
    case 'low': return 'info';
    case 'medium': return 'alert-triangle';
    case 'high': return 'alert-octagon';
    case 'critical': return 'alert-circle';
    default: return 'help-circle';
  }
};

const decodeLocation = async (coordinates) => {
  try {
    const [longitude, latitude] = coordinates;
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`
    );
    
    if (response.data.results && response.data.results.length > 0) {
      const address = response.data.results[0].formatted_address;
      return `
        <p style="margin-bottom: 10px;">${address}</p>
        <p style="color: #6b7280; font-size: 0.9em;"><small>Coordinates: ${latitude}, ${longitude}</small></p>
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