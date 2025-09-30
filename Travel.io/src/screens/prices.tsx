import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
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
  price: number;
}

export default function Prices() {
  const location = useLocation();
  const navigate = useNavigate();
  const routeData = location.state as RouteData;
  const mapRef = useRef<HTMLDivElement>(null);
  const [routeDetails, setRouteDetails] = useState<RouteDetails>({
    distance: '',
    duration: '',
    price: 0
  });
  const [isLoading, setIsLoading] = useState(true);

//    useEffect(() => {
//         const check = async () => {
//           const token = localStorage.getItem('marcocabs_customer_token');
//           const type = 'customer';
          
//           if (!token) {
//             console.log('No token found, redirecting to login');
//             navigate('/login', {
//   state: {
//     from: location.pathname,
//   },
// });
//           }
          
//           const result = await checkAuth(type, token);
  
//           if (!result) {
//            navigate('/login', {
//   state: {
//     from: location.pathname,
//   },
// });
//           }
//         };
    
//         check();
//       }, [navigate]);

  useEffect(() => {
    const initMap = async () => {
      setIsLoading(false);
      const loader = new Loader({
        apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
        version: "weekly",
        libraries: ["places", "geometry", "routes"]
      });

      try {
        const google = await loader.load();
        const map = new google.maps.Map(mapRef.current!, {
          center: { lat: 20.5937, lng: 78.9629 }, // Center of India
          zoom: 6,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          zoomControl: true,
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }]
            }
          ]
        });

        const directionsService = new google.maps.DirectionsService();
        const directionsRenderer = new google.maps.DirectionsRenderer({
          map,
          suppressMarkers: false,
          polylineOptions: {
            strokeColor: "#4F46E5",
            strokeWeight: 5,
            strokeOpacity: 0.7
          }
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

        directionsService.route(request, (result: google.maps.DirectionsResult | null, status: google.maps.DirectionsStatus) => {
          if (status === google.maps.DirectionsStatus.OK && result) {
            directionsRenderer.setDirections(result);
            
            // Calculate total distance and duration
            let totalDistance = 0;
            let totalDuration = 0;

            result.routes[0].legs.forEach((leg: google.maps.DirectionsLeg) => {
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

            // Calculate estimated price (₹15 per km)
            const estimatedPrice = Math.round((totalDistance / 1000) * 15);

            setRouteDetails({
              distance: `${(totalDistance / 1000).toFixed(1)} km`,
              duration: formatDuration(totalDuration),
              price: estimatedPrice
            });
            
            // Adjust map bounds to show the entire route
            const bounds = new google.maps.LatLngBounds();
            result.routes[0].legs.forEach(leg => {
              bounds.extend(leg.start_location);
              bounds.extend(leg.end_location);
            });
            map.fitBounds(bounds);
            setIsLoading(false);
          }
        });
      } catch (error) {
        console.error('Error loading Google Maps:', error);
        setIsLoading(false);
      }
    };

    if (routeData) {
      initMap();
    } else {
      navigate('/');
    }
  }, [routeData, navigate]);

  // Format duration from seconds to hours and minutes
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours} hr ${minutes} min`;
    }
    return `${minutes} min`;
  };

  const handleBookNow = () => {
    // Navigate to booking confirmation page with route details
    navigate('/booking', { 
      state: { 
        ...routeData, 
        ...routeDetails 
      } 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-800 to-green-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 12a9 9 0 01-9 9 9 9 0 01-9-9 9 9 0 019-9 9 9 0 019 9z" />
                <path d="M12 17l-5-5 1.41-1.41L12 14.17l4.59-4.58L18 11l-6 6z" fillRule="evenodd" clipRule="evenodd" fill="white" />
              </svg>
              <h1 className="text-2xl font-bold">Marco Cabs</h1>
            </div>
          
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Page title */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-800">Your Trip Estimate</h1>
            <p className="text-gray-600 mt-2">Review your route details and estimated costs</p>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              {/* Map Section - 3/5 width on large screens */}
              <div className="lg:col-span-3 bg-white rounded-xl overflow-hidden shadow-lg">
                <div className="p-5 bg-gradient-to-r from-green-700 to-green-600 text-white">
                  <h2 className="text-xl font-bold flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    Route Map
                  </h2>
                </div>
                <div ref={mapRef} className="w-full h-[500px]"></div>
              </div>

              {/* Trip Details Section - 2/5 width on large screens */}
              <div className="lg:col-span-2 space-y-6">
                {/* Trip Summary Card */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="p-5 bg-gradient-to-r from-green-700 to-green-600 text-white">
                    <h2 className="text-xl font-bold flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Trip Summary
                    </h2>
                  </div>
                  
                  <div className="p-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                        <div className="flex items-center">
                          <svg className="w-5 h-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="font-medium text-gray-700">Trip Type</span>
                        </div>
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                          {routeData.tripType}
                        </span>
                      </div>

                      <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                        <div className="flex items-center">
                          <svg className="w-5 h-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                          </svg>
                          <span className="font-medium text-gray-700">Distance</span>
                        </div>
                        <span className="font-semibold text-gray-800">{routeDetails.distance}</span>
                      </div>

                      <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                        <div className="flex items-center">
                          <svg className="w-5 h-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="font-medium text-gray-700">Duration</span>
                        </div>
                        <span className="font-semibold text-gray-800">{routeDetails.duration}</span>
                      </div>

                      <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                        <div className="flex items-center">
                          <svg className="w-5 h-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="font-medium text-gray-700">Estimated Price</span>
                        </div>
                        <span className="font-bold text-green-700">₹{routeDetails.price.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Route Details Card */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="p-5 bg-gradient-to-r from-green-700 to-green-600 text-white">
                    <h2 className="text-xl font-bold flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                      Route Details
                    </h2>
                  </div>
                  
                  <div className="p-6">
                    <div className="space-y-6">
                      <div className="relative pl-8 pb-6">
                        <div className="absolute top-0 left-3 -ml-px h-full w-0.5 bg-green-200"></div>
                        <div className="flex items-center mb-2">
                          <div className="absolute -left-1 mt-0.5 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-md">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                            </svg>
                          </div>
                          <span className="ml-10 font-medium text-gray-800">Starting Point</span>
                        </div>
                        <p className="ml-10 text-gray-600 break-words">{routeData?.pickup}</p>
                      </div>
                      
                      {routeData?.stops?.map((stop, index) => (
                        <div key={index} className="relative pl-8 pb-6">
                          <div className="absolute top-0 left-3 -ml-px h-full w-0.5 bg-green-200"></div>
                          <div className="flex items-center mb-2">
                            <div className="absolute -left-1 mt-0.5 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center shadow-md">
                              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                              </svg>
                            </div>
                            <span className="ml-10 font-medium text-gray-800">Stop {index + 1}</span>
                          </div>
                          <p className="ml-10 text-gray-600 break-words">{stop}</p>
                        </div>
                      ))}
                      
                      <div className="relative pl-8">
                        <div className="absolute top-0 left-3 -ml-px h-1/2 w-0.5 bg-green-200"></div>
                        <div className="flex items-center mb-2">
                          <div className="absolute -left-1 mt-0.5 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center shadow-md">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                            </svg>
                          </div>
                          <span className="ml-10 font-medium text-gray-800">Destination</span>
                        </div>
                        <p className="ml-10 text-gray-600 break-words">{routeData.destination}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 mt-6">
                  <button 
                    onClick={() => navigate('/cabs')} 
                    className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg flex items-center justify-center transition-all"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z" />
                    </svg>
                    Modify Trip
                  </button>
                  <button 
                    onClick={handleBookNow} 
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium rounded-lg flex items-center justify-center transition-all shadow-md"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Footer Section */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <div className="text-2xl font-bold">MARCO</div>
              <p className="text-gray-400 text-sm mt-1">Your reliable travel partner across India</p>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between">
            <div className="text-sm text-gray-400 mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} Marco Cab Services. All rights reserved.
            </div>
            <div className="flex space-x-6">
              <Link to="/privacy-policy" className="text-sm text-gray-400 hover:text-white transition-colors">Privacy Policy</Link>
              <Link to="/terms-of-use" className="text-sm text-gray-400 hover:text-white transition-colors">Terms of Service</Link>
              <Link to="/cancellation-policy" className="text-sm text-gray-400 hover:text-white transition-colors">Cancellation & Refund Policy</Link>
              <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">FAQ</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
