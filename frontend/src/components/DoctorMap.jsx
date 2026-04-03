import { useEffect, useState } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const DoctorMap = () => {
  const [position, setPosition] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [founddoc, setfounddoc] = useState(false);
  const [error, setError] = useState("");

  // Get user location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setPosition(coords);
        fetchDoctors(coords);
      },
      () => {
        setError("Location access denied");
      },
    );
  }, []);

  // Fetch doctors
  const fetchDoctors = async (coords) => {
    try {
      const res = await axios.get(
        `http://127.0.0.1:8000/get-doctors?lat=${coords.lat}&lng=${coords.lng}`,
      );
      setDoctors(res.data.doctors || []);
      setfounddoc(true);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch doctors");
    }
  };

  // Loading state
  if (!position) {
    return (
      <div className="flex justify-center items-center h-40 text-gray-600">
        Getting your location...
      </div>
    );
  }

  if (!founddoc) {
    return (
      <div className="flex justify-center items-center h-40 text-gray-600">
        Fetching Doctors...
      </div>
    );
  }
  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Card Container */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="text-center py-4 border-b">
          <h1 className="text-xl font-semibold text-gray-800">
            Nearby Orthopedic Doctors
          </h1>
          <p className="text-sm text-gray-500">
            Based on your current location
          </p>
        </div>

        {/* Map */}
        <div className="h-[450px] w-full">
          <MapContainer
            center={[position.lat, position.lng]}
            zoom={13}
            scrollWheelZoom={true}
            className="h-full w-full z-0"
          >
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* User Marker */}
            <Marker position={[position.lat, position.lng]}>
              <Popup className="doctor-popup">
                <div className="text-sm font-medium">📍 You are here</div>
              </Popup>
            </Marker>

            {/* Doctor Markers */}
            {doctors.map((doc, index) => (
              <Marker key={index} position={[doc.lat, doc.lng]}>
                <Popup className="doctor-popup">
                  <div className="flex flex-col gap-1">
                    <h2 className="font-semibold text-sm">Dr. {doc.name}</h2>
                    <p className="text-xs opacity-80">{doc.address}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default DoctorMap;
