import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function LocationPicker({ setLocation, setCity }) {
  const [position, setPosition] = useState({ lat: 33.5731, lng: -7.5898 }); // Casablanca
  const { t } = useTranslation();

  function LocationMarker() {
    useMapEvents({
      click(e) {
        const pos = { lat: e.latlng.lat, lng: e.latlng.lng };
        const { lat, lng } = e.latlng;
        getCityFromCoords(lat, lng, setCity);
        setPosition(pos);
        setLocation(pos);
      },
    });
    return <Marker position={position} />;
  }

  async function getCityFromCoords(lat, lng, setCity) {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
    );

    const data = await res.json();

    const city =
      data.address.city ||
      data.address.town ||
      data.address.village ||
      data.address.state;

    setCity(city);
  }

  return (
    <>
      <label htmlFor="location">{t("locationPicker")}</label>
      <MapContainer
        id="location"
        center={position}
        zoom={13}
        style={{ height: 300, width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <LocationMarker />
      </MapContainer>
    </>
  );
}
