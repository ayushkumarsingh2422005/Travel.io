import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Loader } from '@googlemaps/js-api-loader';

declare global {
  interface Window {
    google: typeof google;
  }
}

interface RouteData {
  pickup: string;
  destination: string;
  stops: string[];
  tripType: string;
}

interface RouteDetails {
  distance: string;
  duration: string;
}

export default function Prices() {
  const location = useLocation();
  const routeData = location.state as RouteData;
  const mapRef = useRef<HTMLDivElement>(null);
  const [routeDetails, setRouteDetails] = useState<RouteDetails>({
    distance: '',
    duration: ''
  });

  useEffect(() => {
    const initMap = async () => {
      const loader = new Loader({
        apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
        version: "weekly",
        libraries: ["places", "geometry", "routes"]
      });

      try {
        const google = await loader.load();
        const map = new google.maps.Map(mapRef.current!, {
          center: { lat: 20.5937, lng: 78.9629 }, // Center of India
          zoom: 6
        });

        const directionsService = new google.maps.DirectionsService();
        const directionsRenderer = new google.maps.DirectionsRenderer({
          map,
          suppressMarkers: false
        });

        // Prepare waypoints including stops
        const waypoints = routeData.stops.map(stop => ({
          location: stop,
          stopover: true
        }));

        const request = {
          origin: routeData.pickup,
          destination: routeData.destination,
          waypoints: waypoints,
          travelMode: google.maps.TravelMode.DRIVING
        };

        directionsService.route(request, (result, status) => {
          if (status === 'OK' && result) {
            directionsRenderer.setDirections(result);
            
            // Calculate total distance and duration
            let totalDistance = 0;
            let totalDuration = 0;

            result.routes[0].legs.forEach(leg => {
              if (leg.distance?.value && leg.duration?.value) {
                totalDistance += leg.distance.value;
                totalDuration += leg.duration.value;
              }
            });

            // Adjust for round trip if needed
            if (routeData.tripType === 'Round Trip') {
              totalDistance *= 2;
              totalDuration *= 2;
            }

            setRouteDetails({
              distance: `${(totalDistance / 1000).toFixed(1)} km`,
              duration: `${Math.round(totalDuration / 60)} minutes`
            });
            
            // Adjust map bounds to show the entire route
            const bounds = new google.maps.LatLngBounds();
            result.routes[0].legs.forEach(leg => {
              bounds.extend(leg.start_location);
              bounds.extend(leg.end_location);
            });
            map.fitBounds(bounds);
          }
        });
      } catch (error) {
        console.error('Error loading Google Maps:', error);
      }
    };

    initMap();
  }, [routeData]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Map Section */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-xl font-bold mb-4">Route Map</h2>
            <div ref={mapRef} className="w-full h-[500px] rounded-lg"></div>
          </div>

          {/* Trip Details Section */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h1 className="text-2xl font-bold mb-6">Your Trip Details</h1>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded">
                  <span className="font-semibold">Trip Type:</span>
                  <span>{routeData.tripType}</span>
                </div>

                <div className="flex justify-between items-center p-4 bg-gray-50 rounded">
                  <span className="font-semibold">Total Distance:</span>
                  <span>{routeDetails.distance}</span>
                </div>

                <div className="flex justify-between items-center p-4 bg-gray-50 rounded">
                  <span className="font-semibold">Estimated Duration:</span>
                  <span>{routeDetails.duration}</span>
                </div>

                <div className="p-4 bg-gray-50 rounded">
                  <h2 className="font-semibold mb-2">Route Details:</h2>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
                      <span>{routeData.pickup}</span>
                    </div>
                    
                    {routeData.stops.map((stop, index) => (
                      <div key={index} className="flex items-center">
                        <div className="w-4 h-4 bg-yellow-500 rounded-full mr-2"></div>
                        <span>{stop}</span>
                      </div>
                    ))}
                    
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
                      <span>{routeData.destination}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
