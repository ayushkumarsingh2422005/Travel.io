import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

interface CabCategory {
    id: string;
    category: string;
    price_per_km: number;
    min_no_of_seats: number;
    max_no_of_seats: number;
    fuel_charges: number;
    driver_charges: number;
    night_charges: number;
    included_vehicle_types: string[] | null;
    base_discount: number;
    category_image: string | null;
    notes: string | null;
    is_active: number;
    // New Fields
    service_type: 'outstation' | 'hourly';
    sub_category?: string; // e.g. one_way, round_trip
    micro_category?: string; // e.g. same_day, multi_day
    segment?: string; // e.g. Hatchback, Sedan
    base_price?: number;
    package_hours?: number;
    package_km?: number;
    extra_hour_rate?: number;
    extra_km_rate?: number;
    driver_allowance?: number;
}

const Categories = () => {
    const [categories, setCategories] = useState<CabCategory[]>([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);

    // Updated Initial State
    const initialFormState = {
        category: '', // This might double as 'segment' or display name
        price_per_km: '',
        min_no_of_seats: '',
        max_no_of_seats: '',
        fuel_charges: '',
        driver_charges: '',
        night_charges: '',
        base_discount: '',
        notes: '',
        image: null as File | null,
        // New Fields
        service_type: 'outstation',
        sub_category: '',
        micro_category: '',
        segment: '',
        base_price: '',
        package_hours: '',
        package_km: '',
        extra_hour_rate: '',
        extra_km_rate: '',
        driver_allowance: '',
    };

    const [formData, setFormData] = useState(initialFormState);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('marcocabs_admin_token');
            const response = await axios.get('http://localhost:5000/admin/cab-category/all', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (response.data.success) {
                setCategories(response.data.cab_categories);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            toast.error('Failed to fetch categories');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFormData(prev => ({ ...prev, image: e.target.files![0] }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const form = new FormData();
            // Append all fields
            Object.keys(formData).forEach(key => {
                const value = (formData as any)[key];
                if (value !== null && value !== '') {
                    form.append(key, value);
                }
            });

            const token = localStorage.getItem('marcocabs_admin_token'); // Assuming standard token name

            const response = await axios.post('http://localhost:5000/admin/cab-category/add', form, {
                headers: { 
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data.success) {
                toast.success('Category added successfully');
                setShowModal(false);
                setFormData(initialFormState);
                fetchCategories();
            }
        } catch (error: any) {
            console.error('Error adding category:', error);
            toast.error(error.response?.data?.message || 'Failed to add category');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Manage Cab Categories</h1>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    Add New Category
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Image</th>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Category</th>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Service Type</th>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Rate Details</th>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Seats</th>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                <tr><td colSpan={6} className="px-6 py-4 text-center">Loading...</td></tr>
                            ) : categories.length === 0 ? (
                                <tr><td colSpan={6} className="px-6 py-4 text-center">No categories found</td></tr>
                            ) : (
                                categories.map((cat) => (
                                    <tr key={cat.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            {cat.category_image ? (
                                                <img src={`http://localhost:5000${cat.category_image}`} alt={cat.category} className="h-10 w-10 object-cover rounded" />
                                            ) : (
                                                <div className="h-10 w-10 bg-gray-200 rounded flex items-center justify-center text-gray-500 text-xs">No Img</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {cat.category}
                                            <div className="text-xs text-gray-500">{cat.segment}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{cat.service_type}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {cat.service_type === 'hourly' ? (
                                                <div>
                                                    <div>₹{cat.base_price} ({cat.package_hours}h / {cat.package_km}km)</div>
                                                    <div className='text-xs'>+₹{cat.extra_km_rate}/km, +₹{cat.extra_hour_rate}/hr</div>
                                                </div>
                                            ) : (
                                                <div>₹{cat.price_per_km}/km</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {cat.min_no_of_seats}-{cat.max_no_of_seats}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs rounded-full ${cat.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {cat.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
                    <div className="bg-white rounded-lg max-w-2xl w-full p-6 my-8">
                        <h2 className="text-xl font-bold mb-4">Add New Cab Category</h2>
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
                                <select
                                    name="service_type"
                                    className="w-full border border-gray-300 rounded-lg p-2"
                                    value={formData.service_type}
                                    onChange={handleInputChange}
                                >
                                    <option value="outstation">Outstation Ride</option>
                                    <option value="hourly">Hourly Rental</option>
                                </select>
                            </div>

                            <div className="md:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                                <input type="text" name="category" required className="w-full border border-gray-300 rounded-lg p-2" value={formData.category} onChange={handleInputChange} placeholder="e.g. Sedan, SUV" />
                            </div>

                            <div className="md:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Segment</label>
                                <select name="segment" className="w-full border border-gray-300 rounded-lg p-2" value={formData.segment} onChange={handleInputChange}>
                                    <option value="">Select Segment</option>
                                    <option value="Hatchback">Hatchback</option>
                                    <option value="Sedan">Sedan</option>
                                    <option value="SUV">SUV</option>
                                    <option value="Premium SUV">Premium SUV</option>
                                </select>
                            </div>

                            {/* Conditional Fields based on Service Type */}
                            {formData.service_type === 'hourly' ? (
                                <>
                                    <div className="md:col-span-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Base Price (₹)</label>
                                        <input type="number" name="base_price" required className="w-full border border-gray-300 rounded-lg p-2" value={formData.base_price} onChange={handleInputChange} />
                                    </div>
                                    <div className="md:col-span-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Package Hours</label>
                                        <select name="package_hours" className="w-full border border-gray-300 rounded-lg p-2" value={formData.package_hours} onChange={handleInputChange}>
                                            <option value="">Select Hours</option>
                                            <option value="2">2 Hours</option>
                                            <option value="4">4 Hours</option>
                                            <option value="6">6 Hours</option>
                                            <option value="8">8 Hours</option>
                                            <option value="12">12 Hours</option>
                                        </select>
                                    </div>
                                    <div className="md:col-span-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Package KM</label>
                                        <select name="package_km" className="w-full border border-gray-300 rounded-lg p-2" value={formData.package_km} onChange={handleInputChange}>
                                            <option value="">Select KM</option>
                                            <option value="20">20 KM</option>
                                            <option value="40">40 KM</option>
                                            <option value="60">60 KM</option>
                                            <option value="80">80 KM</option>
                                            <option value="120">120 KM</option>
                                        </select>
                                    </div>
                                    <div className="md:col-span-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Extra Hour Rate (₹/hr)</label>
                                        <input type="number" name="extra_hour_rate" className="w-full border border-gray-300 rounded-lg p-2" value={formData.extra_hour_rate} onChange={handleInputChange} />
                                    </div>
                                    <div className="md:col-span-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Extra KM Rate (₹/km)</label>
                                        <input type="number" name="extra_km_rate" className="w-full border border-gray-300 rounded-lg p-2" value={formData.extra_km_rate} onChange={handleInputChange} />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="md:col-span-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Price per KM (₹)</label>
                                        <input type="number" name="price_per_km" required className="w-full border border-gray-300 rounded-lg p-2" value={formData.price_per_km} onChange={handleInputChange} />
                                    </div>
                                    <div className="md:col-span-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Driver Charges (₹)</label>
                                        <input type="number" name="driver_charges" className="w-full border border-gray-300 rounded-lg p-2" value={formData.driver_charges} onChange={handleInputChange} />
                                    </div>
                                </>
                            )}


                            <div className="md:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Min Seats</label>
                                <input type="number" name="min_no_of_seats" required className="w-full border border-gray-300 rounded-lg p-2" value={formData.min_no_of_seats} onChange={handleInputChange} />
                            </div>

                            <div className="md:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Max Seats</label>
                                <input type="number" name="max_no_of_seats" required className="w-full border border-gray-300 rounded-lg p-2" value={formData.max_no_of_seats} onChange={handleInputChange} />
                            </div>

                            <div className="md:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Night Charges (₹)</label>
                                <input type="number" name="night_charges" className="w-full border border-gray-300 rounded-lg p-2" value={formData.night_charges} onChange={handleInputChange} />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                                <input type="file" accept="image/*" className="w-full p-2" onChange={handleFileChange} />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                                <textarea name="notes" className="w-full border border-gray-300 rounded-lg p-2" value={formData.notes} onChange={handleInputChange} rows={3}></textarea>
                            </div>

                            <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700"
                                >
                                    {loading ? 'Saving...' : 'Save Category'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Categories;
