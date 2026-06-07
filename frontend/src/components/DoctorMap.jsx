import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// ── Custom Icons ──────────────────────────────────────────────
const userIcon = new L.DivIcon({
  className: "",
  html: `
    <div style="position:relative;width:36px;height:44px;">
      <svg viewBox="0 0 36 44" xmlns="http://www.w3.org/2000/svg" width="36" height="44">
        <defs>
          <filter id="shadow" x="-20%" y="-10%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#00000044"/>
          </filter>
        </defs>
        <path d="M18 0C8.06 0 0 8.06 0 18c0 13.5 18 26 18 26S36 31.5 36 18C36 8.06 27.94 0 18 0z"
              fill="#3B82F6" filter="url(#shadow)"/>
        <circle cx="18" cy="17" r="7" fill="white"/>
        <circle cx="18" cy="17" r="4" fill="#3B82F6"/>
      </svg>
    </div>`,
  iconSize: [36, 44],
  iconAnchor: [18, 44],
  popupAnchor: [0, -46],
});

const doctorIcon = new L.DivIcon({
  className: "",
  html: `
    <div style="position:relative;width:32px;height:32px;cursor:pointer;">
      <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" width="32" height="32">
        <defs>
          <filter id="dshadow">
            <feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-color="#00000055"/>
          </filter>
        </defs>
        <circle cx="16" cy="16" r="15" fill="#EF4444" filter="url(#dshadow)" stroke="white" stroke-width="2"/>
        <rect x="13" y="8" width="6" height="16" rx="1.5" fill="white"/>
        <rect x="8" y="13" width="16" height="6" rx="1.5" fill="white"/>
      </svg>
    </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -18],
});

// ── Tooltip on Hover ──────────────────────────────────────────
const DoctorMarker = ({ doc, index }) => {
  const markerRef = useRef(null);

  const handleMouseOver = () => {
    markerRef.current?.openPopup();
  };
  const handleMouseOut = () => {
    markerRef.current?.closePopup();
  };

  return (
    <Marker
      key={index}
      position={[doc.lat, doc.lng]}
      icon={doctorIcon}
      ref={markerRef}
      eventHandlers={{
        mouseover: handleMouseOver,
        mouseout: handleMouseOut,
      }}
    >
      <Popup
        closeButton={false}
        autoPan={false}
        className="doctor-hover-popup"
      >
        <div style={{
          fontFamily: "'DM Sans', sans-serif",
          minWidth: "180px",
          maxWidth: "220px",
          padding: "2px 0",
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "6px",
          }}>
            <div style={{
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              background: "#FEE2E2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" fill="#EF4444"/>
                <rect x="10" y="5" width="4" height="14" rx="1" fill="#EF4444"/>
                <rect x="5" y="10" width="14" height="4" rx="1" fill="#EF4444"/>
              </svg>
            </div>
            <span style={{
              fontWeight: "700",
              fontSize: "13px",
              color: "#111827",
              lineHeight: "1.2",
            }}>
              {doc.name}
            </span>
          </div>

          <div style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "5px",
            marginBottom: "4px",
          }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" style={{ marginTop: "2px", flexShrink: 0 }}>
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#6B7280"/>
            </svg>
            <span style={{ fontSize: "11px", color: "#6B7280", lineHeight: "1.4" }}>
              {doc.address}
            </span>
          </div>

          <div style={{
            display: "inline-flex",
            alignItems: "center",
            background: "#F0FDF4",
            border: "1px solid #BBF7D0",
            borderRadius: "20px",
            padding: "2px 8px",
            marginTop: "2px",
          }}>
            <span style={{ fontSize: "10px", color: "#16A34A", fontWeight: "600" }}>
              {doc.speciality || "Orthopedic / Bone Specialist"}
            </span>
          </div>
        </div>
      </Popup>
    </Marker>
  );
};

// ── Main Component ────────────────────────────────────────────
const DoctorMap = () => {
  const [position, setPosition] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [status, setStatus] = useState("locating"); // locating | fetching | ready | error
  const [error, setError] = useState("");

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setPosition(coords);
        setStatus("fetching");
        fetchDoctors(coords);
      },
      () => {
        setError("Location access denied. Please enable location permissions.");
        setStatus("error");
      }
    );
  }, []);

  const fetchDoctors = async (coords) => {
    try {
      const res = await axios.get(
        `http://127.0.0.1:8000/get-doctors?lat=${coords.lat}&lng=${coords.lng}`
      );
      setDoctors(res.data.doctors || []);
      console.log(res.data)
      setStatus("ready");
    } catch (err) {
      console.error(err);
      setError("Failed to fetch nearby doctors.");
      setStatus("error");
    }
  };

  // ── Loading / Error States ──
  if (status !== "ready") {
    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "200px",
        gap: "12px",
        color: status === "error" ? "#EF4444" : "#6B7280",
        fontFamily: "'DM Sans', sans-serif",
      }}>
        {status !== "error" && (
          <div style={{
            width: "36px", height: "36px",
            border: "3px solid #E5E7EB",
            borderTop: "3px solid #3B82F6",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }} />
        )}
        <span style={{ fontSize: "14px", fontWeight: "500" }}>
          {status === "locating" && "Getting your location..."}
          {status === "fetching" && "Finding nearby doctors..."}
          {status === "error" && error}
        </span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <>
      {/* Inject popup styles globally */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

        .doctor-hover-popup .leaflet-popup-content-wrapper {
          border-radius: 12px !important;
          padding: 12px 14px !important;
          box-shadow: 0 8px 24px rgba(0,0,0,0.12) !important;
          border: 1px solid #F3F4F6 !important;
          pointer-events: none;
        }
        .doctor-hover-popup .leaflet-popup-content {
          margin: 0 !important;
        }
        .doctor-hover-popup .leaflet-popup-tip {
          box-shadow: none !important;
        }
        .leaflet-popup-tip-container {
          pointer-events: none;
        }
      `}</style>

      <div style={{
        width: "100%",
        maxWidth: "1100px",
        margin: "0 auto",
        fontFamily: "'DM Sans', sans-serif",
      }}>
        <div style={{
          background: "white",
          borderRadius: "16px",
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
          border: "1px solid #E5E7EB",
          overflow: "hidden",
        }}>
          {/* Header */}
          <div style={{
            textAlign: "center",
            padding: "18px 20px 14px",
            borderBottom: "1px solid #F3F4F6",
            background: "linear-gradient(to bottom, #FAFAFA, white)",
          }}>
            <h1 style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: "#111827" }}>
              Nearby Orthopedic Doctors
            </h1>
            <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#9CA3AF" }}>
              Based on your current location • {doctors.length} found
            </p>
          </div>

          {/* Legend */}
          <div style={{
            display: "flex",
            gap: "20px",
            padding: "10px 20px",
            borderBottom: "1px solid #F3F4F6",
            background: "#FAFAFA",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#3B82F6", border: "2px solid white", boxShadow: "0 0 0 1px #3B82F6" }} />
              <span style={{ fontSize: "12px", color: "#6B7280" }}>Your location</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#EF4444", border: "2px solid white", boxShadow: "0 0 0 1px #EF4444" }} />
              <span style={{ fontSize: "12px", color: "#6B7280" }}>Orthopedic specialist</span>
            </div>
            <div style={{ marginLeft: "auto" }}>
              <span style={{ fontSize: "12px", color: "#9CA3AF" }}>Hover over a marker for details</span>
            </div>
          </div>

          {/* Map */}
          <div style={{ height: "480px", width: "100%" }}>
            <MapContainer
              center={[position.lat, position.lng]}
              zoom={13}
              scrollWheelZoom={true}
              style={{ height: "100%", width: "100%", zIndex: 0 }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* User location marker */}
              <Marker position={[position.lat, position.lng]} icon={userIcon}>
                <Popup closeButton={false}>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", fontWeight: "600", color: "#111827" }}>
                    📍 You are here
                  </div>
                </Popup>
              </Marker>

              {/* Doctor markers with hover cards */}
              {doctors.map((doc, index) => (
                doc.lat && doc.lng
                  ? <DoctorMarker key={index} doc={doc} index={index} />
                  : null
              ))}
            </MapContainer>
          </div>
        </div>
      </div>
    </>
  );
};

export default DoctorMap;
















// import { useEffect, useState } from "react";
// import axios from "axios";
// import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
// import "leaflet/dist/leaflet.css";

// const DoctorMap = () => {
//   const [position, setPosition] = useState(null);
//   const [doctors, setDoctors] = useState([]);
//   const [founddoc, setfounddoc] = useState(false);
//   const [error, setError] = useState("");

//   // Get user location
//   useEffect(() => {
//     navigator.geolocation.getCurrentPosition(
//       (pos) => {
//         const coords = {
//           lat: pos.coords.latitude,
//           lng: pos.coords.longitude,
//         };
//         setPosition(coords);
//         fetchDoctors(coords);
//       },
//       () => {
//         setError("Location access denied");
//       },
//     );
//   }, []);

//   // Fetch doctors
//   const fetchDoctors = async (coords) => {
//     try {
//       const res = await axios.get(
//         `http://127.0.0.1:8000/get-doctors?lat=${coords.lat}&lng=${coords.lng}`,
//       );
//       setDoctors(res.data.doctors || []);
//       setfounddoc(true);
//     } catch (err) {
//       console.error(err);
//       setError("Failed to fetch doctors");
//     }
//   };

//   // Loading state
//   if (!position) {
//     return (
//       <div className="flex justify-center items-center h-40 text-gray-600">
//         Getting your location...
//       </div>
//     );
//   }

//   if (!founddoc) {
//     return (
//       <div className="flex justify-center items-center h-40 text-gray-600">
//         Fetching Doctors...
//       </div>
//     );
//   }
//   return (
//     <div className="w-full max-w-6xl mx-auto">
//       {/* Card Container */}
//       <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
//         {/* Header */}
//         <div className="text-center py-4 border-b">
//           <h1 className="text-xl font-semibold text-gray-800">
//             Nearby Orthopedic Doctors
//           </h1>
//           <p className="text-sm text-gray-500">
//             Based on your current location
//           </p>
//         </div>

//         {/* Map */}
//         <div className="h-[450px] w-full">
//           <MapContainer
//             center={[position.lat, position.lng]}
//             zoom={13}
//             scrollWheelZoom={true}
//             className="h-full w-full z-0"
//           >
//             <TileLayer
//               attribution="&copy; OpenStreetMap contributors"
//               url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//             />

//             {/* User Marker */}
//             <Marker position={[position.lat, position.lng]}>
//               <Popup className="doctor-popup">
//                 <div className="text-sm font-medium">📍 You are here</div>
//               </Popup>
//             </Marker>

//             {/* Doctor Markers */}
//             {doctors.map((doc, index) => (
//               <Marker key={index} position={[doc.lat, doc.lng]}>
//                 <Popup className="doctor-popup">
//                   <div className="flex flex-col gap-1">
//                     <h2 className="font-semibold text-sm">Dr. {doc.name}</h2>
//                     <p className="text-xs opacity-80">{doc.address}</p>
//                   </div>
//                 </Popup>
//               </Marker>
//             ))}
//           </MapContainer>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DoctorMap;
