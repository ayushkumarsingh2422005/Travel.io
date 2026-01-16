import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Loader } from '@googlemaps/js-api-loader';
import toast from 'react-hot-toast';
import axios from '../api/axios';
import { getUserDetailsFromToken } from '../utils/verifytoken';
import { createPaymentOrder, verifyPayment, CreateOrderRequest, VerifyPaymentRequest } from '../api/paymentService';
import { getUserProfile, updateProfile, sendPhoneOtp, verifyPhoneOtp, addPhoneNumber, UserProfile } from '../api/userService';

declare global {
  interface Window {
    google: typeof google;
    Razorpay: any;
  }
}

interface CabCategory {
  id: string;
  category: string;
  price_per_km: number;
  min_no_of_seats: number;
  max_no_of_seats: number;
  fuel_charges: number;
  driver_charges: number;
  night_charges: number;
  included_vehicle_types: any; // Adjust type if schema is known
  base_discount: number;
  category_image: string;
  notes: string;
  is_active: boolean;
  package_hours?: number;
  package_km?: number;
  base_price?: number;
  extra_hour_rate?: number;
  extra_km_rate?: number;
  driver_allowance?: number;
}

interface AddOn {
  id: string;
  name: string;
  price: number;
  price_type: 'fixed' | 'percentage';
  percentage_value?: number;
}

interface RouteData {
  pickup: string;
  destination: string;
  stops: string[];
  tripType: string;
  cabCategory: CabCategory; // Add cabCategory object
  pickupDate: string;
  dropDate: string;
}

interface RouteDetails {
  distance: string;
  duration: string;
  price: number;
  path: string;
  oneWayDistance?: string; // Optional for one-way trips
  oneWayDuration?: string; // Optional for one-way trips
  distance_km?: number; // Add numeric distance
}

interface UserDetails {
  id: string;
  name?: string;
  email: string;
  phone?: string;
}

export default function Prices() {
  const location = useLocation();
  const navigate = useNavigate();
  const routeData = location.state as RouteData;
  const mapRef = useRef<HTMLDivElement>(null);
  const [routeDetails, setRouteDetails] = useState<RouteDetails>({
    distance: '',
    duration: '',
    price: 0,
    path: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [platformCharges, setPlatformCharges] = useState<number>(0);
  const [gstAmount, setGstAmount] = useState<number>(0);
  const [totalUpfrontPayment, setTotalUpfrontPayment] = useState<number>(0);
  const [remainingAmount, setRemainingAmount] = useState<number>(0);
  const [calculatedNightCharges, setCalculatedNightCharges] = useState<number>(0);
  const [calculatedBaseFare, setCalculatedBaseFare] = useState<number>(0); // New state for base fare
  const [calculatedDiscountAmount, setCalculatedDiscountAmount] = useState<number>(0); // New state for discount amount

  // Booking & User State (Merged from BookingPage)
  const [partnerId, setPartnerId] = useState('');
  const [userToken, setUserToken] = useState<string | null>(null);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  // const [profileLoading, setProfileLoading] = useState(false); // Removed unused state
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [otp, setOtp] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [formData, setFormData] = useState({
    phone: '',
    gender: 'Select Gender' as 'Male' | 'Female' | 'Other' | 'Select Gender',
    age: '',
    current_address: '',
  });


  // Add-ons State
  const [availableAddOns, setAvailableAddOns] = useState<AddOn[]>([]);
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [addOnsTotal, setAddOnsTotal] = useState<number>(0);

  // Fetch Add-ons
  useEffect(() => {
    const fetchAddOns = async () => {
      try {
        const response = await axios.get('http://localhost:5000/user/add-ons');
        if (response.data.success) {
          // Transform backend data to match our interface and ensure numbers
          const mappedAddOns: AddOn[] = response.data.data.map((item: any) => ({
            id: item.id,
            name: item.name,
            price: parseFloat(item.price || '0'), // Parse string decimal
            price_type: item.pricing_type, // Map pricing_type to price_type
            percentage_value: parseFloat(item.percentage_value || '0') // Parse percentage
          }));
          setAvailableAddOns(mappedAddOns);
        }
      } catch (error) {
        console.error('Error fetching add-ons:', error);
      }
    };
    fetchAddOns();

    // Load Razorpay Script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    // Check Auth on Mount
    const checkUserAuth = async () => {
      const token = localStorage.getItem('marcocabs_customer_token');
      if (token) {
        setUserToken(token);
        const details = await getUserDetailsFromToken(token);
        if (details) setUserDetails(details);

        try {
          const profileResponse = await getUserProfile();
          setUserProfile(profileResponse.user);
          setFormData({
            phone: profileResponse.user.phone || '',
            gender: profileResponse.user.gender || 'Select Gender',
            age: profileResponse.user.age > 0 ? profileResponse.user.age.toString() : '',
            current_address: profileResponse.user.current_address || '',
          });
        } catch (err) {
          console.error("Error fetching profile", err);
        }
      }
    }
    checkUserAuth();

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Calculate Add-ons Total
  useEffect(() => {
    let total = 0;
    const baseVal = calculatedBaseFare; // Use base fare for percentage calculation

    selectedAddOns.forEach(id => {
      const addon = availableAddOns.find(a => a.id === id);
      if (addon) {
        if (addon.price_type === 'fixed') {
          total += addon.price;
        } else if (addon.price_type === 'percentage') {
          // Calculate percentage based on base fare
          // Ensure percentage_value exists, otherwise use price or 0
          const pct = addon.percentage_value || 0;
          total += (baseVal * pct) / 100;
        }
      }
    });
    setAddOnsTotal(Math.round(total));
  }, [selectedAddOns, availableAddOns, calculatedBaseFare]);

  useEffect(() => {
    const initMap = async () => {
      if (!mapRef.current) {
        // If mapRef.current is null, the div is not yet available.
        // We can return and let the effect re-run when it is.
        return;
      }

      const loader = new Loader({
        apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
        version: "weekly",
        libraries: ["places", "geometry", "routes"]
      });

      try {
        const google = await loader.load();
        const map = new google.maps.Map(mapRef.current, { // Removed '!' as we've checked for null
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
          suppressMarkers: true, // Suppress default markers to use custom ones
          polylineOptions: {
            strokeColor: "#4F46E5",
            strokeWeight: 5,
            strokeOpacity: 0.7
          }
        });

        // Custom markers array
        const markers: google.maps.Marker[] = [];

        // Function to create a custom marker
        const createMarker = (position: google.maps.LatLngLiteral, label: string, iconColor: string) => {
          const marker = new google.maps.Marker({
            position: position,
            map: map,
            label: {
              text: label,
              color: '#FFFFFF',
              fontWeight: 'bold',
            },
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              fillColor: iconColor,
              fillOpacity: 1,
              strokeColor: '#FFFFFF',
              strokeWeight: 2,
              scale: 10,
            },
          });
          markers.push(marker);
          return marker;
        };
        // Prepare waypoints including stops
        const waypoints = routeData.stops.map(stop => ({
          location: stop,
          stopover: true
        }));

        const request = {
          origin: routeData.pickup,
          destination: routeData?.destination,
          waypoints: waypoints,
          travelMode: google.maps.TravelMode.DRIVING
        };

        // For Hourly Rental, if destination is missing/same-as-pickup, we still want to show map ?
        // Maybe just show pickup point marker if no destination?
        // But DirectionsService needs origin/dest.
        if (routeData?.tripType === 'Hourly Rental' && !routeData?.destination) {
          request.destination = routeData.pickup;
        }

        directionsService.route(request, (result: google.maps.DirectionsResult | null, status: google.maps.DirectionsStatus) => {
          if (status === google.maps.DirectionsStatus.OK && result) {
            directionsRenderer.setDirections(result);

            // Clear existing markers before adding new ones
            markers.forEach(marker => marker.setMap(null));
            markers.length = 0; // Clear the array

            // Add custom markers for origin, destination, and waypoints
            createMarker(result.routes[0].legs[0].start_location.toJSON(), 'A', '#34D399'); // Pickup (Green)
            result.routes[0].legs.forEach((leg, index) => {
              if (index < result.routes[0].legs.length - 1) {
                createMarker(leg.end_location.toJSON(), (String.fromCharCode(66 + index)), '#FBBF24'); // Stops (Yellow)
              } else {
                createMarker(leg.end_location.toJSON(), (String.fromCharCode(66 + index)), '#EF4444'); // Destination (Red)
              }
            });

            // Calculate total distance and duration
            let totalDistance = 0;
            let totalDuration = 0;

            result.routes[0].legs.forEach((leg: google.maps.DirectionsLeg) => {
              if (leg.distance?.value && leg.duration?.value) {
                totalDistance += leg.distance.value;
                totalDuration += leg.duration.value;
              }
            });

            const oneWayDistance = totalDistance; // Store one-way distance
            const oneWayDuration = totalDuration; // Store one-way duration

            // Adjust for round trip if needed
            if (routeData?.tripType === 'Round Trip') {
              totalDistance *= 2;
              totalDuration *= 2;
            }

            // Calculate estimated price using cab category details
            let baseFare = 0;
            let distanceInKm = totalDistance / 1000;

            if (routeData?.tripType === 'Hourly Rental') {
              baseFare = routeData?.cabCategory.base_price || 0;
            } else {
              baseFare = distanceInKm * routeData?.cabCategory.price_per_km;
            }

            setCalculatedBaseFare(Math.round(baseFare)); // Set calculated base fare

            let currentCalculatedPrice = baseFare;

            if (routeData?.cabCategory.fuel_charges) {
              currentCalculatedPrice += parseFloat(routeData?.cabCategory.fuel_charges.toString());
            }
            if (routeData?.cabCategory.driver_charges) {
              currentCalculatedPrice += parseFloat(routeData?.cabCategory.driver_charges.toString());
            }

            // Add night charges if applicable (for every night in the trip)
            const pickupDateTime = new Date(routeData.pickupDate);
            const dropDateTime = new Date(routeData.dropDate);

            console.log('Pickup DateTime:', pickupDateTime);
            console.log('Drop DateTime:', dropDateTime);

            const nightChargeStartTime = 22; // 10 PM
            const nightChargeEndTime = 6; // 6 AM

            let nightChargesApplicable = false;
            let numberOfNights = 0;

            // Calculate the number of calendar days the trip spans
            const pickupDate = new Date(pickupDateTime.getFullYear(), pickupDateTime.getMonth(), pickupDateTime.getDate());
            const dropDate = new Date(dropDateTime.getFullYear(), dropDateTime.getMonth(), dropDateTime.getDate());

            console.log('Pickup Date (normalized):', pickupDate);
            console.log('Drop Date (normalized):', dropDate);

            const daysDifference = Math.floor((dropDate.getTime() - pickupDate.getTime()) / (1000 * 60 * 60 * 24));

            console.log('Days Difference:', daysDifference);

            if (daysDifference === 0) {
              // Same day trip - check if it crosses night hours
              const pickupHour = pickupDateTime.getHours();
              const dropHour = dropDateTime.getHours();

              if (pickupHour >= nightChargeStartTime || pickupHour < nightChargeEndTime ||
                dropHour >= nightChargeStartTime || dropHour < nightChargeEndTime) {
                numberOfNights = 1;
                nightChargesApplicable = true;
              }
            } else {
              // Multi-day trip
              numberOfNights = daysDifference;
              nightChargesApplicable = true;
            }

            console.log('Number of Nights:', numberOfNights);
            console.log('Night Charges Applicable:', nightChargesApplicable);

            let nightChargeValue = 0;
            if (nightChargesApplicable && routeData?.cabCategory.night_charges) {
              const perNightCharge = parseFloat(routeData?.cabCategory.night_charges.toString());
              console.log('Per Night Charge:', perNightCharge);
              nightChargeValue = perNightCharge * numberOfNights;
              console.log('Total Night Charge Value:', nightChargeValue);
              currentCalculatedPrice += nightChargeValue;
            }

            setCalculatedNightCharges(nightChargeValue);
            console.log('Final Calculated Night Charges:', nightChargeValue); // Set the calculated night charges

            let discountAmount = 0;
            if (routeData?.cabCategory.base_discount) {
              discountAmount = (currentCalculatedPrice * parseFloat(routeData?.cabCategory.base_discount.toString())) / 100;
              currentCalculatedPrice -= discountAmount;
            }
            setCalculatedDiscountAmount(Math.round(discountAmount)); // Set calculated discount amount

            const estimatedPrice = Math.round(currentCalculatedPrice);

            // Adjust drop-off date if less than minimum duration
            const minDurationInMs = oneWayDuration * 1000; // Convert seconds to milliseconds
            const actualDurationInMs = dropDateTime.getTime() - pickupDateTime.getTime();

            if (actualDurationInMs < minDurationInMs) {
              const newDropOffDate = new Date(pickupDateTime.getTime() + minDurationInMs);
              toast.error(`Drop-off date adjusted to ${newDropOffDate.toLocaleString()} to meet minimum trip duration.`);
              // You might want to update routeData.dropDate here or pass it to the booking page
              // For now, we'll just show a toast.
            }

            // Extract encoded polyline from the route
            const encodedPolyline = result.routes[0].overview_polyline || '';

            setRouteDetails({
              distance: `${(totalDistance / 1000).toFixed(1)} km`,
              duration: formatDuration(totalDuration),
              price: estimatedPrice,
              path: encodedPolyline,
              oneWayDistance: `${(oneWayDistance / 1000).toFixed(1)} km`, // Add one-way distance
              oneWayDuration: formatDuration(oneWayDuration), // Add one-way duration
              distance_km: totalDistance / 1000 // Store numeric distance
            });

            // Calculate platform charges, GST, and total upfront payment
            const calculatedPlatformCharges = estimatedPrice * 0.10; // 10% of booking amount
            const calculatedGstAmount = calculatedPlatformCharges * 0.05; // 5% GST on platform charges
            const calculatedTotalUpfrontPayment = calculatedPlatformCharges + calculatedGstAmount;
            const calculatedRemainingAmount = estimatedPrice - calculatedPlatformCharges;

            setPlatformCharges(Math.round(calculatedPlatformCharges));
            setGstAmount(Math.round(calculatedGstAmount));
            setTotalUpfrontPayment(Math.round(calculatedTotalUpfrontPayment));
            setRemainingAmount(Math.round(calculatedRemainingAmount));

            // Adjust map bounds to show the entire route
            const bounds = new google.maps.LatLngBounds();
            result.routes[0].legs.forEach(leg => {
              bounds.extend(leg.start_location);
              bounds.extend(leg.end_location);
            });
            map.fitBounds(bounds);
            setIsLoading(false); // Set loading to false after map is fully initialized and rendered
          } else {
            console.error('Directions request failed:', status);
            toast.error(`Failed to get route directions: ${status}. Please check your pickup/destination/stops.`);
            setIsLoading(false);
          }
        });
      } catch (error: any) {
        console.error('Error loading Google Maps:', error);
        toast.error(`Error loading Google Maps: ${error.message || 'Unknown error'}. Please check your API key and network connection.`);
        setIsLoading(false);
      }
    };

    if (routeData) {
      if (routeData?.tripType === 'Hourly Rental') {
        // Initialize logic for Hourly Rental
        const baseFare = routeData?.cabCategory.base_price || 0;
        setCalculatedBaseFare(Math.round(baseFare));

        let currentCalculatedPrice = baseFare;
        if (routeData?.cabCategory.fuel_charges) {
          currentCalculatedPrice += parseFloat(routeData?.cabCategory.fuel_charges.toString());
        }
        if (routeData?.cabCategory.driver_charges) {
          currentCalculatedPrice += parseFloat(routeData?.cabCategory.driver_charges.toString());
        }

        let discountAmount = 0;
        if (routeData?.cabCategory.base_discount) {
          discountAmount = (currentCalculatedPrice * parseFloat(routeData?.cabCategory.base_discount.toString())) / 100;
          currentCalculatedPrice -= discountAmount;
        }
        setCalculatedDiscountAmount(Math.round(discountAmount));

        const estimatedPrice = Math.round(currentCalculatedPrice);

        // Set route details with dummy valid data for backend
        setRouteDetails({
          distance: `${routeData?.cabCategory.package_km || 0} km`,
          duration: `${routeData?.cabCategory.package_hours || 0} hr`,
          price: estimatedPrice,
          path: 'HOURLY_RENTAL_PATH', // Dummy path for backend validation
          oneWayDistance: '',
          oneWayDuration: '',
          distance_km: routeData?.cabCategory.package_km || 0
        });

        // Calculate charges
        const calculatedPlatformCharges = estimatedPrice * 0.10;
        const calculatedGstAmount = calculatedPlatformCharges * 0.05;
        const calculatedTotalUpfrontPayment = calculatedPlatformCharges + calculatedGstAmount;
        const calculatedRemainingAmount = estimatedPrice - calculatedPlatformCharges;

        setPlatformCharges(Math.round(calculatedPlatformCharges));
        setGstAmount(Math.round(calculatedGstAmount));
        setTotalUpfrontPayment(Math.round(calculatedTotalUpfrontPayment));
        setRemainingAmount(Math.round(calculatedRemainingAmount));

        setIsLoading(false);
      } else if (mapRef.current) {
        initMap();
      }
    } else {
      navigate('/');
    }
  }, [routeData, navigate]);

  // Recalculate payment totals when add-ons change
  useEffect(() => {
    if (routeDetails.price > 0) {
      // Total booking amount = base price + add-ons
      const totalBookingAmount = routeDetails.price + addOnsTotal;
      
      // Platform charges: 10% of total booking amount
      const calculatedPlatformCharges = totalBookingAmount * 0.10;
      
      // GST: 5% on platform charges
      const calculatedGstAmount = calculatedPlatformCharges * 0.05;
      
      // Total upfront payment: platform charges + GST
      const calculatedTotalUpfrontPayment = calculatedPlatformCharges + calculatedGstAmount;
      
      // Remaining amount: total booking - platform charges
      const calculatedRemainingAmount = totalBookingAmount - calculatedPlatformCharges;

      setPlatformCharges(Math.round(calculatedPlatformCharges));
      setGstAmount(Math.round(calculatedGstAmount));
      setTotalUpfrontPayment(Math.round(calculatedTotalUpfrontPayment));
      setRemainingAmount(Math.round(calculatedRemainingAmount));
    }
  }, [addOnsTotal, routeDetails.price]);

  // Format duration from seconds to hours and minutes
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours} hr ${minutes} min`;
    }
    return `${minutes} min`;
  };

  // Merged User Profile Logic
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleProfileFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBookingLoading(true);
    try {
      if (formData.phone && formData.phone !== userProfile?.phone) {
        await addPhoneNumber(formData.phone);
        toast('Phone number updated. Please verify it.');
      }
      const updatedProfileData = {
        phone: formData.phone,
        gender: formData.gender,
        age: parseInt(formData.age),
        current_address: formData.current_address,
        is_profile_completed: true,
      };
      const response = await updateProfile(updatedProfileData);
      setUserProfile(response.user);
      toast.success('Profile updated successfully!');
      if (!response.user.is_phone_verified) {
        toast.error('Please verify your phone number.');
        setIsOtpModalOpen(true);
      } else {
        setShowProfileForm(false);
        // Retry booking automatically after profile complete? or let user click again?
        // Let's retry if everything is good
        handleBookNow();
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleSendOtp = async () => {
    setBookingLoading(true);
    try {
      await sendPhoneOtp();
      toast.success('OTP sent to your phone!');
      setIsOtpModalOpen(true);
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBookingLoading(true);
    try {
      await verifyPhoneOtp(otp);
      toast.success('Phone verified successfully!');
      setIsOtpModalOpen(false);
      const profileResponse = await getUserProfile();
      setUserProfile(profileResponse.user);
      if (profileResponse.user.is_profile_completed && profileResponse.user.is_phone_verified) {
        setShowProfileForm(false);
        handleBookNow(); // Retry booking
      }
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      toast.error(error.response?.data?.message || 'Invalid or expired OTP');
    } finally {
      setBookingLoading(false);
    }
  };


  // Main Booking Logic
  const handleBookNow = async () => {
    // 1. Check Authentication
    if (!userToken || !userDetails) {
      toast.error("Please login to book a cab");
      navigate('/login', { state: { from: location.pathname, routeData: routeData } }); // Pass routeData to preserve state
      return;
    }

    // 2. Check Profile Completeness
    if (!userProfile?.is_profile_completed || !userProfile?.is_phone_verified) {
      toast.error('Please complete your profile and verify your phone number to proceed.');
      setShowProfileForm(true);
      return;
    }

    setBookingLoading(true);

    // 3. Prepare Order Request
    const selectedAddOnsDetails = selectedAddOns.map(id => availableAddOns.find(a => a.id === id)).filter(Boolean);

    // Ensure we have a numeric distance. If routeDetails.distance_km is not set (e.g. hourly rental might not have it), handle it.
    // For Hourly Rental, distance_km might be 0 or package distance.
    const distanceVal = routeDetails.distance_km || (routeData?.tripType === 'Hourly Rental' ? (routeData?.cabCategory.package_km || 0) : 0);
    const pathVal = routeDetails.path || (routeData?.tripType === 'Hourly Rental' ? 'HOURLY_RENTAL_PATH' : '');

    try {
      const orderRequest: CreateOrderRequest = {
        cab_category_id: routeData?.cabCategory.id,
        partner_id: partnerId || undefined,
        pickup_location: routeData.pickup,
        dropoff_location: routeData?.destination || routeData.pickup || 'Hourly Rental Area', // Fallback for hourly
        pickup_date: routeData.pickupDate,
        drop_date: routeData.dropDate || new Date(new Date(routeData.pickupDate).getTime() + (routeData?.cabCategory.package_hours || 1) * 60 * 60 * 1000).toISOString(), // Fallback drop date
        path: pathVal,
        distance: distanceVal,
        amount: totalUpfrontPayment, // Use totalUpfrontPayment
        add_ons: selectedAddOnsDetails.map((addon: any) => ({
          id: addon.id,
          name: addon.name,
          price: addon.price,
          price_type: addon.price_type
        })),
      };

      const orderResponse = await createPaymentOrder(orderRequest, userToken);
      if (orderResponse.success) {
        initializeRazorpay(orderResponse.data);
      } else {
        toast.error(orderResponse.message || 'Failed to create payment order');
      }
    } catch (error: any) {
      console.error('Error creating booking:', error);
      toast.error(error.response?.data?.message || 'Failed to create booking');
    } finally {
      setBookingLoading(false);
    }
  };

  const initializeRazorpay = (orderData: any) => {
    if (!userDetails || !userToken) return;

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: orderData.amount * 100,
      currency: 'INR',
      name: 'Travel.io',
      description: `Booking for ${routeData?.cabCategory.category}`,
      order_id: orderData.order_id,
      handler: async function (response: any) {
        const paymentVerificationRequest: VerifyPaymentRequest = {
          payment_id: orderData.payment_id,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        };
        const verificationResponse = await verifyPayment(paymentVerificationRequest, userToken);

        if (verificationResponse.success) {
          toast.success('Booking confirmed! Booking ID: ' + verificationResponse.data.booking.id);
          navigate('/dashboard', {
            state: {
              message: 'Your booking has been created successfully. You will receive driver details shortly.',
              booking_otp: verificationResponse.data.booking.booking_otp,
            },
          });
        } else {
          toast.error(verificationResponse.message || 'Payment verification failed. Please try again.');
        }
      },
      prefill: {
        name: userDetails.name,
        email: userDetails.email,
        contact: userDetails.phone,
      },
      theme: {
        color: '#3399cc',
      },
      modal: {
        ondismiss: function () {
          toast.error('Payment cancelled by user');
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  }


  const toggleAddOn = (id: string) => {
    setSelectedAddOns(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
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

          <div className={`grid grid-cols-1 ${routeData?.tripType === 'Hourly Rental' ? 'justify-center' : 'lg:grid-cols-5'} gap-8`}>
            {/* Map Section - 3/5 width on large screens */}
            {/* Map Section - Only show for non-Hourly Rental */}
            {routeData?.tripType !== 'Hourly Rental' && (
              <div className="lg:col-span-3 bg-white rounded-xl overflow-hidden shadow-lg relative">
                <div className="p-5 bg-gradient-to-r from-green-700 to-green-600 text-white">
                  <h2 className="text-xl font-bold flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    Route Map
                  </h2>
                </div>
                <div ref={mapRef} className="w-full h-[500px] lg:h-full"></div>
                {isLoading && (
                  <div className="absolute inset-0 flex justify-center items-center bg-white bg-opacity-75 z-10">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
                  </div>
                )}
              </div>
            )}

            {/* Trip Details Section - 2/5 width on large screens */}
            {/* Trip Details Section */}
            <div className={`${routeData?.tripType === 'Hourly Rental' ? 'w-full max-w-2xl mx-auto' : 'lg:col-span-2'} space-y-6`}>
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
                    <div className="flex justify-between items-center p-4 bg-green-100 rounded-lg border border-green-200">
                      <div className="flex items-center">
                        {routeData?.tripType === 'Round Trip' ? (
                          <svg className="w-6 h-6 text-green-700 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356-2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m0 0H15" />
                          </svg>
                        ) : (
                          <svg className="w-6 h-6 text-green-700 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        )}
                        <span className="font-bold text-green-800 text-lg">Trip Type</span>
                      </div>
                      <span className="text-green-900 text-lg font-semibold">
                        {routeData?.tripType}
                      </span>
                    </div>


                    {routeData?.tripType !== 'Hourly Rental' && (
                      <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                        <div className="flex items-center">
                          <svg className="w-5 h-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                          </svg>
                          <span className="font-medium text-gray-700">Total Distance</span>
                        </div>
                        <span className="font-semibold text-gray-800">{routeDetails.distance}</span>
                      </div>
                    )}

                    {routeData?.tripType === 'Hourly Rental' && (
                      <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                        <div className="flex items-center">
                          <svg className="w-5 h-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="font-medium text-gray-700">Package</span>
                        </div>
                        <span className="font-semibold text-gray-800">
                          {routeData?.cabCategory.package_hours ? `${routeData?.cabCategory.package_hours} Hr / ${routeData?.cabCategory.package_km} Km` : 'Hourly Package'}
                        </span>
                      </div>
                    )}

                    {routeData?.tripType === 'Round Trip' && routeDetails.oneWayDistance && (
                      <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                        <div className="flex items-center">
                          <svg className="w-5 h-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                          </svg>
                          <span className="font-medium text-gray-700">One-Way Distance</span>
                        </div>
                        <span className="font-semibold text-gray-800">{routeDetails.oneWayDistance}</span>
                      </div>
                    )}

                    {routeData?.tripType !== 'Hourly Rental' && (
                      <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                        <div className="flex items-center">
                          <svg className="w-5 h-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="font-medium text-gray-700">Total Duration</span>
                        </div>
                        <span className="font-semibold text-gray-800">{routeDetails.duration}</span>
                      </div>
                    )}

                    {routeData?.tripType === 'Round Trip' && routeDetails.oneWayDuration && (
                      <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                        <div className="flex items-center">
                          <svg className="w-5 h-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="font-medium text-gray-700">One-Way Duration</span>
                        </div>
                        <span className="font-semibold text-gray-800">{routeDetails.oneWayDuration}</span>
                      </div>
                    )}


                    {/* New card for Cab Category Details */}
                    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
                      <div className="p-4 bg-green-100 border-b border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-800">Selected Cab: {routeData?.cabCategory.category}</h3>
                      </div>
                      <div className="p-4 text-sm text-gray-700 space-y-2">
                        <div className="flex justify-between">
                          <span>{routeData?.tripType === 'Hourly Rental' ? 'Base Package Price:' : 'Price (dist*perkm):'}</span>
                          <span className="font-medium">₹{calculatedBaseFare}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Seats:</span>
                          <span className="font-medium">{routeData?.cabCategory.min_no_of_seats}-{routeData?.cabCategory.max_no_of_seats}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Fuel Charges:</span>
                          <span className="font-medium">{routeData?.cabCategory.fuel_charges > 0 ? `₹${routeData?.cabCategory.fuel_charges}` : 'Included'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Driver Charges:</span>
                          <span className="font-medium">{routeData?.cabCategory.driver_charges > 0 ? `₹${routeData?.cabCategory.driver_charges}` : 'Included'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Night Charges:</span>
                          <span className="font-medium">{calculatedNightCharges > 0 ? `₹${calculatedNightCharges}` : 'Included'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Add-Ons:</span>
                          <span className="font-medium">{addOnsTotal > 0 ? `₹${addOnsTotal}` : '₹0'}</span>
                        </div>
                        {routeData?.cabCategory.base_discount > 0 && (
                          <div className="flex justify-between text-red-600 font-semibold">
                            <span>Discount:</span>
                            <span>{routeData?.cabCategory.base_discount}% OFF</span>
                            <span className="font-medium">-₹{calculatedDiscountAmount.toLocaleString()}</span>
                          </div>
                        )}
                        <div className="border-t pt-2 mt-2">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600 font-medium">Platform Charges (10%)</span>
                            <span className="font-semibold">₹{platformCharges.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-gray-600 font-medium">GST (5% on Platform)</span>
                            <span className="font-semibold">₹{gstAmount.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center mt-2 pt-2 border-t border-dashed border-gray-300">
                            <span className="text-lg font-bold text-green-700">Total Upfront Payment</span>
                            <span className="text-xl font-bold text-green-700">₹{totalUpfrontPayment.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-gray-500 font-medium text-sm">Remaining Amount (to Driver)</span>
                            <span className="font-semibold text-gray-700">₹{remainingAmount.toLocaleString()}</span>
                          </div>
                        </div>
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

                {/* Add-Ons Section */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden mt-6">
                  <div className="p-5 bg-gradient-to-r from-green-700 to-green-600 text-white">
                    <h2 className="text-xl font-bold flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Add-Ons
                    </h2>
                  </div>
                  <div className="p-6">
                    {availableAddOns.length === 0 ? (
                      <p className="text-gray-500">No add-ons available.</p>
                    ) : (
                      <div className="space-y-3">
                        {availableAddOns.map(addon => {
                          // Calculate display price
                          let displayPrice = 0;
                          if (addon.price_type === 'fixed') {
                            displayPrice = addon.price;
                          } else {
                             // Percentage
                             const pct = addon.percentage_value || 0;
                             displayPrice = Math.round((calculatedBaseFare * pct) / 100);
                          }

                          return (
                            <div key={addon.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer" onClick={() => toggleAddOn(addon.id)}>
                              <div className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={selectedAddOns.includes(addon.id)}
                                  onChange={() => toggleAddOn(addon.id)}
                                  className="h-5 w-5 text-green-600 rounded focus:ring-green-500"
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <div className="ml-3">
                                  <div className="font-medium text-gray-900">{addon.name}</div>
                                  {addon.price_type === 'percentage' && (
                                    <div className="text-xs text-gray-500">{addon.percentage_value}% of base fare</div>
                                  )}
                                </div>
                              </div>
                              <div className="font-semibold text-gray-700">
                                ₹{displayPrice}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
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

                      {routeData?.tripType !== 'Hourly Rental' && (
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
                          <p className="ml-10 text-gray-600 break-words">{routeData?.destination}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Partner ID Input */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden mt-6">
                  <div className="p-4 bg-green-100 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800">Partner Referral (Optional)</h3>
                  </div>
                  <div className="p-4">
                    <input
                      type="text"
                      value={partnerId}
                      onChange={(e) => setPartnerId(e.target.value)}
                      placeholder="Enter partner ID if referred"
                      className="w-full p-3 rounded-lg border border-gray-300 focus:ring focus:ring-green-200 focus:border-green-500"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 mt-6">
                  <button
                    onClick={() => navigate('/cabs', { state: routeData })}
                    className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg flex items-center justify-center transition-all"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z" />
                    </svg>
                    Modify Trip
                  </button>
                  <button
                    onClick={handleBookNow}
                    disabled={isLoading || bookingLoading} // Disable if map loading or booking in progress
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium rounded-lg flex items-center justify-center transition-all shadow-md"
                  >
                    {bookingLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Confirm & Pay
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Modals for Profile Completion and OTP */}
              {showProfileForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-bold text-gray-800">Complete Your Profile</h2>
                      <button onClick={() => setShowProfileForm(false)} className="text-gray-500 hover:text-gray-700" type="button">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>

                    <form onSubmit={handleProfileFormSubmit} className="space-y-4">
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                        <input type="text" name="phone" value={formData.phone} onChange={handleFormChange} placeholder="e.g., 9876543210" className="w-full p-3 border border-gray-300 rounded-lg" required />
                        {!userProfile?.is_phone_verified && formData.phone && (
                          <button
                            type="button"
                            onClick={handleSendOtp}
                            disabled={bookingLoading}
                            className="mt-2 w-full py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400"
                          >
                            {bookingLoading ? 'Sending OTP...' : 'Send OTP for Verification'}
                          </button>
                        )}
                      </div>
                      <div>
                        <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                        <select name="gender" value={formData.gender} onChange={handleFormChange} className="w-full p-3 border border-gray-300 rounded-lg" required>
                          <option value="Select Gender">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                        <input type="number" name="age" value={formData.age} onChange={handleFormChange} placeholder="Age" className="w-full p-3 border border-gray-300 rounded-lg" required />
                      </div>
                      <div>
                        <label htmlFor="current_address" className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                        <textarea name="current_address" value={formData.current_address} onChange={handleFormChange} rows={3} className="w-full p-3 border border-gray-300 rounded-lg" required></textarea>
                      </div>
                      <button type="submit" disabled={bookingLoading} className="w-full py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:bg-gray-400">Save & Continue</button>
                    </form>
                  </div>
                </div>
              )}

              {isOtpModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-lg p-8 w-full max-w-sm">
                    <h3 className="text-xl font-bold mb-4">Verify OTP</h3>
                    <form onSubmit={handleVerifyOtp} className="space-y-4">
                      <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="Enter 6-digit OTP" maxLength={6} className="w-full p-3 border border-gray-300 rounded-lg text-center tracking-widest" required />
                      <div className="flex gap-3">
                        <button type="button" onClick={() => setIsOtpModalOpen(false)} className="flex-1 py-2 bg-gray-300 rounded-lg">Cancel</button>
                        <button type="submit" disabled={bookingLoading} className="flex-1 py-2 bg-green-600 text-white rounded-lg">Verify</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
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
    </div>
  );
}
