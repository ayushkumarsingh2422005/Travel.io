import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import Table from '../components/Table';
import Modal from '../components/Modal';

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
    sub_category?: string;
    micro_category?: string;
    segment?: string;
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
    const [editMode, setEditMode] = useState(false);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

    // Initial Form State
    const initialFormState = {
        category: '',
        price_per_km: '',
        min_no_of_seats: '',
        max_no_of_seats: '',
        fuel_charges: '',
        driver_charges: '',
        night_charges: '',
        base_discount: '',
        notes: '',
        image: null as File | null,
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

    const fetchCategories = useCallback(async () => {
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
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFormData(prev => ({ ...prev, image: e.target.files![0] }));
        }
    };

    const handleEditCategory = (category: CabCategory) => {
        setEditMode(true);
        setSelectedCategoryId(category.id);
        setFormData({
            category: category.category,
            price_per_km: category.price_per_km?.toString() || '',
            min_no_of_seats: category.min_no_of_seats?.toString() || '',
            max_no_of_seats: category.max_no_of_seats?.toString() || '',
            fuel_charges: category.fuel_charges?.toString() || '',
            driver_charges: category.driver_charges?.toString() || '',
            night_charges: category.night_charges?.toString() || '',
            base_discount: category.base_discount?.toString() || '',
            notes: category.notes || '',
            image: null, // Don't prepopulate file input
            service_type: category.service_type || 'outstation',
            sub_category: category.sub_category || '',
            micro_category: category.micro_category || '',
            segment: category.segment || '',
            base_price: category.base_price?.toString() || '',
            package_hours: category.package_hours?.toString() || '',
            package_km: category.package_km?.toString() || '',
            extra_hour_rate: category.extra_hour_rate?.toString() || '',
            extra_km_rate: category.extra_km_rate?.toString() || '',
            driver_allowance: category.driver_allowance?.toString() || '',
        });
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const form = new FormData();
            Object.keys(formData).forEach(key => {
                const value = (formData as any)[key];
                if (value !== null && value !== '') {
                    form.append(key, value);
                }
            });

            const token = localStorage.getItem('marcocabs_admin_token');
            const url = editMode && selectedCategoryId
                ? `http://localhost:5000/admin/cab-category/${selectedCategoryId}`
                : 'http://localhost:5000/admin/cab-category/add';

            const method = editMode ? 'put' : 'post';

            const response = await axios({
                method,
                url,
                data: form,
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data.success) {
                toast.success(editMode ? 'Category updated successfully' : 'Category added successfully');
                setShowModal(false);
                setFormData(initialFormState);
                setEditMode(false);
                setSelectedCategoryId(null);
                fetchCategories();
            }
        } catch (error: any) {
            console.error('Error saving category:', error);
            toast.error(error.response?.data?.message || 'Failed to save category');
        } finally {
            setLoading(false);
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditMode(false);
        setSelectedCategoryId(null);
        setFormData(initialFormState);
    };

    const columns = [
        {
            id: 'image',
            label: 'Image',
            minWidth: 100,
            format: (_: any, row: CabCategory) => (
                row.category_image ? (
                    <img src={`http://localhost:5000${row.category_image}`} alt={row.category} className="h-10 w-10 object-cover rounded" />
                ) : (
                    <div className="h-10 w-10 bg-gray-200 rounded flex items-center justify-center text-gray-500 text-xs">No Img</div>
                )
            )
        },
        {
            id: 'category',
            label: 'Category',
            minWidth: 150,
            format: (value: string, row: CabCategory) => (
                <div>
                    <div className="font-medium text-gray-900">{value}</div>
                    <div className="text-xs text-gray-500">{row.segment}</div>
                </div>
            )
        },
        {
            id: 'service_type',
            label: 'Service Type',
            minWidth: 120,
            format: (value: string) => <span className="capitalize text-gray-700">{value}</span>
        },
        {
            id: 'rate_details',
            label: 'Rate Details',
            minWidth: 200,
            format: (_: any, row: CabCategory) => (
                <div className="text-sm text-gray-500">
                    {row.service_type === 'hourly' ? (
                        <div>
                            <div>₹{row.base_price} ({row.package_hours}h / {row.package_km}km)</div>
                            <div className='text-xs'>+₹{row.extra_km_rate}/km, +₹{row.extra_hour_rate}/hr</div>
                        </div>
                    ) : (
                        <div>₹{row.price_per_km}/km</div>
                    )}
                </div>
            )
        },
        {
            id: 'seats',
            label: 'Seats',
            minWidth: 100,
            format: (_: any, row: CabCategory) => (
                <span className="text-gray-600">{row.min_no_of_seats}-{row.max_no_of_seats}</span>
            )
        },
        {
            id: 'is_active',
            label: 'Status',
            minWidth: 100,
            format: (value: number) => (
                <span className={`px-2 py-1 text-xs rounded-full ${value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {value ? 'Active' : 'Inactive'}
                </span>
            )
        },
        {
            id: 'actions',
            label: 'Actions',
            minWidth: 100,
            format: (_: any, row: CabCategory) => (
                <div className="flex space-x-2">
                    <button
                        className="p-1.5 text-blue-600 hover:text-white hover:bg-blue-600 rounded-lg transition-colors duration-200"
                        onClick={() => handleEditCategory(row)}
                        title="Edit Category"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </button>
                    {/* Placeholder for Delete if needed later */}
                </div>
            )
        }
    ];

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Manage Cab Categories</h1>
                        <p className="mt-1 text-sm text-gray-600">
                            Create and update vehicle categories and pricing
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            setEditMode(false);
                            setFormData(initialFormState);
                            setShowModal(true);
                        }}
                        className="w-full sm:w-auto px-6 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 active:bg-red-800 transition-colors duration-200 flex items-center justify-center space-x-2 shadow-sm hover:shadow"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span>Add Category</span>
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm">
                <Table
                    columns={columns}
                    data={categories}
                    isLoading={loading}
                    title="Categories List"
                    pagination={{
                        current_page: 1,
                        per_page: 100, // Client side pagination for now as API returns all
                        total: categories.length,
                        total_pages: 1
                    }}
                />
            </div>

            <Modal isOpen={showModal} onClose={handleCloseModal} title={editMode ? 'Edit Category' : 'Add New Cab Category'} size="lg">
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
                        <select
                            name="service_type"
                            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-red-500 focus:border-red-500"
                            value={formData.service_type}
                            onChange={handleInputChange}
                        >
                            <option value="outstation">Outstation Ride</option>
                            <option value="hourly">Hourly Rental</option>
                        </select>
                    </div>

                    <div className="md:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                        <input type="text" name="category" required className="w-full border border-gray-300 rounded-lg p-2 focus:ring-red-500 focus:border-red-500" value={formData.category} onChange={handleInputChange} placeholder="e.g. Sedan, SUV" />
                    </div>

                    <div className="md:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Segment</label>
                        <select name="segment" className="w-full border border-gray-300 rounded-lg p-2 focus:ring-red-500 focus:border-red-500" value={formData.segment} onChange={handleInputChange}>
                            <option value="">Select Segment</option>
                            <option value="Hatchback">Hatchback</option>
                            <option value="Sedan">Sedan</option>
                            <option value="SUV">SUV</option>
                            <option value="Premium SUV">Premium SUV</option>
                        </select>
                    </div>

                    {formData.service_type === 'hourly' ? (
                        <>
                            <div className="md:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Base Price (₹)</label>
                                <input type="number" name="base_price" required className="w-full border border-gray-300 rounded-lg p-2 focus:ring-red-500 focus:border-red-500" value={formData.base_price} onChange={handleInputChange} />
                            </div>
                            <div className="md:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Package Hours</label>
                                <select name="package_hours" className="w-full border border-gray-300 rounded-lg p-2 focus:ring-red-500 focus:border-red-500" value={formData.package_hours} onChange={handleInputChange}>
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
                                <select name="package_km" className="w-full border border-gray-300 rounded-lg p-2 focus:ring-red-500 focus:border-red-500" value={formData.package_km} onChange={handleInputChange}>
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
                                <input type="number" name="extra_hour_rate" className="w-full border border-gray-300 rounded-lg p-2 focus:ring-red-500 focus:border-red-500" value={formData.extra_hour_rate} onChange={handleInputChange} />
                            </div>
                            <div className="md:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Extra KM Rate (₹/km)</label>
                                <input type="number" name="extra_km_rate" className="w-full border border-gray-300 rounded-lg p-2 focus:ring-red-500 focus:border-red-500" value={formData.extra_km_rate} onChange={handleInputChange} />
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="md:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Price per KM (₹)</label>
                                <input type="number" name="price_per_km" required className="w-full border border-gray-300 rounded-lg p-2 focus:ring-red-500 focus:border-red-500" value={formData.price_per_km} onChange={handleInputChange} />
                            </div>
                            <div className="md:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Driver Charges (₹)</label>
                                <input type="number" name="driver_charges" className="w-full border border-gray-300 rounded-lg p-2 focus:ring-red-500 focus:border-red-500" value={formData.driver_charges} onChange={handleInputChange} />
                            </div>
                        </>
                    )}

                    <div className="md:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Min Seats</label>
                        <input type="number" name="min_no_of_seats" required className="w-full border border-gray-300 rounded-lg p-2 focus:ring-red-500 focus:border-red-500" value={formData.min_no_of_seats} onChange={handleInputChange} />
                    </div>

                    <div className="md:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Max Seats</label>
                        <input type="number" name="max_no_of_seats" required className="w-full border border-gray-300 rounded-lg p-2 focus:ring-red-500 focus:border-red-500" value={formData.max_no_of_seats} onChange={handleInputChange} />
                    </div>

                    <div className="md:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Night Charges (₹)</label>
                        <input type="number" name="night_charges" className="w-full border border-gray-300 rounded-lg p-2 focus:ring-red-500 focus:border-red-500" value={formData.night_charges} onChange={handleInputChange} />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                        <input type="file" accept="image/*" className="w-full p-2" onChange={handleFileChange} />
                        {editMode && selectedCategoryId && !formData.image && (
                            <p className="text-xs text-gray-500 mt-1">Leave empty to keep existing image</p>
                        )}
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                        <textarea name="notes" className="w-full border border-gray-300 rounded-lg p-2 focus:ring-red-500 focus:border-red-500" value={formData.notes} onChange={handleInputChange} rows={3}></textarea>
                    </div>

                    <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                        <button
                            type="button"
                            onClick={handleCloseModal}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors shadow-sm"
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : (editMode ? 'Update Category' : 'Save Category')}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Categories;
