import { useEffect, useRef, useContext, useState } from "react";
import Context from "../context";
import AddRestaurant from "./AddRestaurant";

function Map() {
  const mapRef = useRef();
  const [restaurant, setRestaurant] = useState({});
  const [mapElm, setMapElm] = useState(null);
  const [markers, setMarkers] = useState([]);

  const { dispatch, state } = useContext(Context);

  useEffect(() => {
    if (window.google) {
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: -34.397, lng: 150.644 },
        zoom: 15,
      });

      map.addListener("click", (e) => {
        console.log({ e });
      });

      setMapElm(map);

      map.addListener("rightclick", (e) => {
        setRestaurant({
          geometry: {
            location: {
              lat: e.latLng.lat,
              lng: e.latLng.lng,
            },
          },
        });
      });

      navigator.geolocation.getCurrentPosition(({ coords }) => {
        const position = {
          lat: coords.latitude,
          lng: coords.longitude,
        };
        map.setCenter(position);
        const marker = new window.google.maps.Marker({
          position,
          map,
        });

        const service = new window.google.maps.places.PlacesService(map);
        service.nearbySearch(
          {
            location: position,
            radius: "5000",
            type: ["restaurant"],
          },
          (results, status) => {
            if (status === "OK") {
              dispatch({ action: "UPDATE_RESTAURANTS", payload: results });
            }
          }
        );
      });
    }
  }, [window.google]);

  useEffect(() => {
    markers.map((marker) => {
      marker.setMap(null);
    });

    if (state.filtered.length === 0 && state.filter > 0) {
    } else {
      createMarkers();
    }
  }, [state.restaurants, state.filtered]);
  console.log({ markers, mapElm });

  const addRestaurant = (data) => {
    const newRestaurant = { ...restaurant, ...data };

    dispatch({
      action: "UPDATE_RESTAURANTS",
      payload: [newRestaurant, ...state.restaurants],
    });

    setRestaurant({});
  };

  //PLACING MARKERS ON ALL THE NEARBY RESTAURANTS
  const createMarkers = () => {
    const restaurants =
      state.filtered.length > 0 ? state.filtered : state.restaurants;

    let markersArr = [];
    restaurants.map((p) => {
      const icon = {
        url: p.icon,
        size: new window.google.maps.Size(70, 70),
        origin: new window.google.maps.Point(0, 0),
        anchor: new window.google.maps.Point(17, 34),
        scaledSize: new window.google.maps.Size(25, 25),
      };

      // CREATING MARKERS FOR RESTAURANT LOCATIONS
      const marker = new window.google.maps.Marker({
        position: {
          lat: p.geometry.location.lat(),
          lng: p.geometry.location.lng(),
        },
        icon,
        map: mapElm,
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <h3>${p.name}</h3>
          <p>${p.vicinity}</p>
        `,
      });

      marker.addListener("click", (e) => {
        console.log({ e });
        infoWindow.open(mapElm, marker);
      });

      markersArr = [marker, ...markersArr];
    });

    setMarkers(markersArr);
  };

  return (
    <>
      {restaurant.geometry && (
        <AddRestaurant submit={addRestaurant} close={setRestaurant} />
      )}
      <div ref={mapRef} style={{ height: "calc(100vh - 56px)" }} />
    </>
  );
}
export default Map;
