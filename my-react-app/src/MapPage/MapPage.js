import React, { useState, useContext, useEffect } from "react";
import MapContext from "../components/MapContext";

import { GoogleMap, useLoadScript, Marker } from "@react-google-maps/api";

import mapStyle from "./Style/mapStyle.js";
import "./Style/map.css";

import { useLocation } from "react-router-dom";

//------------map style--------------------
const libraries = ["places"];
const mapContainerStyle_Home = {
  width: "91.6vw",
  height: "52vh",
  maxWidth: "1024px",
  borderRadius: "0.5rem 0.5rem 0rem 0rem",
  boxShadow: "5px 10px 10px rgba(0,0,0,0.1)",
};
const mapContainerStyle_PillStore = {
  width: "91.6vw",
  height: "70vh",
  maxWidth: "1024px",
  borderRadius: "0.5rem 0.5rem 0rem 0rem",
  boxShadow: "5px 10px 10px rgba(0,0,0,0.1)",
};
const options = {
  styles: mapStyle,
};
const center = {
  lat: 14.19947,
  lng: 101.209671,
};

export default function MapPage() {
  //--------------map load-------------------
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries,
  });
  const mapRef = React.useRef();
  const onMapLoad = React.useCallback((map) => {
    mapRef.current = map;
  }, []);

  //--------for function focus center---------
  const panTo = React.useCallback(({ lat, lng }) => {
    mapRef.current.panTo({ lat, lng });
    mapRef.current.setZoom(14);
  }, []);

  //---------attibute------------
  const [myLocation, setMyLocation] = useState(center);
  const [markers, setMarkers] = useState(center);
  const onMapClick = React.useCallback((event) => {
    setMarkers({
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
    });
  });

  //---------fetch data----------
  useEffect(() => {
    const fetchLocations = async () => {
      const myL = await navigator.geolocation.getCurrentPosition(
        (pos) => {
          const latlng = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          setMyLocation(latlng);
          setMarkers(latlng);
        },
        () => null
      );
    };

    fetchLocations();
  }, []);

  //----------check path------------
  const location = useLocation();
  const isHomePath = location.pathname === "/home";

  //-------check loading-----------
  if (loadError) return "Error loading maps";
  if (!isLoaded) return "Loading maps";

  return (
    <div>
      <GoogleMap
        id="map"
        mapContainerStyle={
          isHomePath ? mapContainerStyle_Home : mapContainerStyle_PillStore
        }
        zoom={14}
        center={myLocation}
        options={options}
        onLoad={onMapLoad}
        onClick={onMapClick}
      >
        <MapContext.Provider value={{ setMyLocation, setMarkers, myLocation }}>
          <Locate panTo={panTo} />
        </MapContext.Provider>

        <Marker
          key="123"
          position={markers}
          icon={{
            url: "https://i.imgur.com/Ei2X1hR.png", //green
            scaledSize: new window.google.maps.Size(40, 40),
            origin: new window.google.maps.Point(0, 0),
            anchor: new window.google.maps.Point(15, 15),
          }}
        />
      </GoogleMap>
    </div>
  );
}

function Locate({ panTo }) {
  const { setMyLocation, setMarkers } = useContext(MapContext);
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
              setMyLocation(latlng);
              setMarkers(latlng);
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
