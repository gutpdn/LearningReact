import React, { useState, useContext, useEffect } from "react";
import MapContext from "./components/MapContext";

import {
  GoogleMap,
  useLoadScript,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";

import mapStyle from "./Style/mapStyle.js";
import "./Style/map.css";

// import { useLocation } from "react-router-dom";

//------------map style--------------------
const libraries = ["places"];
const mapContainerStyle = {
  width: "91.6vw",
  height: "70vh",
  maxWidth: "1024px",
  borderRadius: "0.5rem 0.5rem 0rem 0rem",
  boxShadow: "5px 10px 10px rgba(0,0,0,0.1)",
};
const options = {
  styles: mapStyle,
};
const defaultCenter = {
  lat: 14.19947,
  lng: 101.209671,
};
const demo = [
  {
    id: "12313",
    avatarUri: "https://api.pillplus.store/api/v1/picture/avatar.jpg",
    openingStatus: true,
    activated: true,
    status: true,
    name: "โรงพยาบาลลาดกระบัง",
    pharmacy: "โรงพยาบาล ลาดกระบัง",
    location: "2 Lat Krabang 15 Alley, Lat Krabang, Bangkok 10520",
    phone: "023269995",
    email: "ladkrabang@hospital.com",
    password: "$2b$10$/GCA3FMVPimaqqRt4CwcROgb7awTD.F0s9tm88Cm3u4ziXUYc0y42",
    ID: "PS1000",
    openingData: [],
    coordinate: { lat: 13.56321, lng: 100.616373 },
  },
];

export default function MapPage() {
  //--------------map load-------------------
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries: libraries,
  });

  //---------attibute------------
  const [selected, setSelected] = useState(null);
  const [pillStoreList, setPillStoreList] = useState([]);
  const [center, setCenter] = useState(defaultCenter);

  const mapRef = React.useRef();
  const onMapLoad = React.useCallback((map) => {
    mapRef.current = map;
  }, []);

  //---------fetch data----------

  //--------for function focus center---------
  const panTo = React.useCallback(({ lat, lng }) => {
    mapRef.current.panTo({ lat, lng });
    mapRef.current.setZoom(14);
  }, []);

  const onMapClick = React.useCallback((event) => {
    setCenter({
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
    });
    setSelected(null);
    setPillStoreList(demo);
  }, []);

  //-------check loading-----------
  if (loadError) return "Error loading maps";
  if (!isLoaded) return "Loading maps";

  return (
    <div>
      <GoogleMap
        id="map"
        mapContainerStyle={mapContainerStyle}
        zoom={14}
        center={center}
        options={options}
        onLoad={onMapLoad}
        onClick={onMapClick}
      >
        <MapContext.Provider value={{ setCenter }}>
          <Locate panTo={panTo} />
        </MapContext.Provider>

        {pillStoreList.map(
          (pillStore) =>
            true &&
            (pillStore.status ? (
              <Marker
                key={pillStore.id}
                position={pillStore.coordinate}
                icon={{
                  url: "https://i.imgur.com/Ei2X1hR.png", // green
                  scaledSize: new window.google.maps.Size(40, 40),
                  origin: new window.google.maps.Point(0, 0),
                  anchor: new window.google.maps.Point(15, 15),
                }}
                onClick={() => {
                  setSelected(pillStore);
                }}
              />
            ) : (
              <Marker
                key={pillStore.id}
                position={pillStore.coordinate}
                icon={{
                  url: "https://i.imgur.com/v4dw84y.png", //red
                  scaledSize: new window.google.maps.Size(40, 40),
                  origin: new window.google.maps.Point(0, 0),
                  anchor: new window.google.maps.Point(15, 15),
                }}
                onClick={() => {
                  setSelected(pillStore);
                }}
              />
            ))
        )}
        {selected ? (
          <InfoWindow
            position={selected.coordinate}
            onCloseClick={() => {
              setSelected(null);
            }}
          >
            <div>
              <h2>{selected.pharmacy}</h2>
              <p>{selected.location}</p>
            </div>
          </InfoWindow>
        ) : null}
      </GoogleMap>
    </div>
  );
}

function Locate({ panTo }) {
  const { setCenter } = useContext(MapContext);
  return (
    <div>
      <button
        className="locate"
        onClick={() => {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const latlng = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              };
              setCenter(latlng);
              panTo({
                lat: latlng.lat,
                lng: latlng.lng,
              });
            },
            () => null
          );
        }}
      >
        <img src="https://i.imgur.com/KOzXDzt.png" alt="locate me" />
      </button>
    </div>
  );
}
