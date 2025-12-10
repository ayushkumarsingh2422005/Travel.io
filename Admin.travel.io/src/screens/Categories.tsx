
import React, { useEffect, useState } from 'react';
import Table from '../components/Table';
import { useSearch } from '../context/SearchContext';
import Modal from '../components/Modal';
import { toast } from 'react-toastify';
import {
    getCabCategories,
    addCabCategory,
    updateCabCategory,
    deleteCabCategory
} from '../api/adminService';

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
}

const Categories: React.FC = () => {
    const { query } = useSearch();
    const [data, setData] = useState<CabCategory[]>([]);
    const [filtered, setFiltered] = useState<CabCategory[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<CabCategory | null>(null);

    // Form State
    const [formData, setFormData] = useState<Partial<CabCategory>>({
        category: '',
        price_per_km: 0,
        min_no_of_seats: 4,
        max_no_of_seats: 4,
        fuel_charges: 0,
        driver_charges: 0,
        night_charges: 0,
        base_discount: 0,
        is_active: 1,
    });

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('marcocabs_admin_token') || '';
            const result = await getCabCategories(token);
            // Ensure result is an array before setting state
            if (Array.isArray(result)) {
                setData(result);
            } else {
                console.error("Unexpected API response format:", result);
                setData([]); // Fallback to empty array
            }
        } catch (error) {
            console.error('Failed to fetch categories', error);
            // Optional: Show toast error
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        const lower = query.toLowerCase();
        setFiltered(
            data.filter(
                (c) =>
                    c.category.toLowerCase().includes(lower) ||
                    (c.notes && c.notes.toLowerCase().includes(lower))
            )
        );
    }, [query, data]);

    const handleSave = async () => {
        try {
            const token = localStorage.getItem('marcocabs_admin_token') || '';
            if (editingCategory) {
                await updateCabCategory(token, editingCategory.id, formData);
            } else {
                await addCabCategory(token, formData);
            }
            setIsModalOpen(false);
            setEditingCategory(null);
            setFormData({
                category: '',
                price_per_km: 0,
                min_no_of_seats: 4,
                max_no_of_seats: 4,
                fuel_charges: 0,
                driver_charges: 0,
                night_charges: 0,
                base_discount: 0,
                is_active: 1,
            });
            toast.success('Category saved successfully');
            fetchData();
        } catch (error) {
            console.error('Failed to save category', error);
            toast.error('Failed to save category');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this category?')) return;
        try {
            const token = localStorage.getItem('marcocabs_admin_token') || '';
            await deleteCabCategory(token, id);
            toast.success('Category deleted successfully');
            fetchData();
        } catch (error) {
            console.error('Failed to delete category', error);
            toast.error('Failed to delete category');
        }
    };

    const openEditModal = (cat: CabCategory) => {
        setEditingCategory(cat);
        setFormData(cat);
        setIsModalOpen(true);
    };

    const openAddModal = () => {
        setEditingCategory(null);
        setFormData({
            category: '',
            price_per_km: 0,
            min_no_of_seats: 4,
            max_no_of_seats: 4,
            fuel_charges: 0,
            driver_charges: 0,
            night_charges: 0,
            base_discount: 0,
            is_active: 1,
        });
        setIsModalOpen(true);
    }

    const columns = [
        { id: 'category', label: 'Category', minWidth: 150 },
        {
            id: 'price_per_km',
            label: 'Price/KM',
            minWidth: 100,
            format: (value: number) => `₹${value}`,
        },
        {
            id: 'seats',
            label: 'Seats',
            minWidth: 100,
            format: (_: any, row: CabCategory) => `${row.min_no_of_seats}-${row.max_no_of_seats}`,
        },
        {
            id: 'is_active',
            label: 'Status',
            minWidth: 100,
            format: (value: number) => (
                <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}
                >
                    {value ? 'Active' : 'Inactive'}
                </span>
            ),
        },
        {
            id: 'actions',
            label: 'Actions',
            minWidth: 100,
            format: (_: any, row: CabCategory) => (
                <div className="flex space-x-2">
                    <button
                        onClick={() => openEditModal(row)}
                        className="text-blue-600 hover:text-blue-800"
                    >
                        Edit
                    </button>
                    <button
                        onClick={() => handleDelete(row.id)}
                        className="text-red-600 hover:text-red-800"
                    >
                        Delete
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Cab Categories</h1>
                        <p className="mt-1 text-sm text-gray-600">
                            Manage cab categories and pricing
                        </p>
                    </div>
                    <button
                        onClick={openAddModal}
                        className="w-full sm:w-auto px-6 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 active:bg-red-800 transition-colors duration-200 flex items-center justify-center space-x-2 shadow-sm hover:shadow"
                    >
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                            />
                        </svg>
                        <span>Add Category</span>
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
                <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-sm p-6 text-white">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 bg-white/20 rounded-xl p-3">
                            🚖
                        </div>
                        <div className="ml-5">
                            <p className="text-sm font-medium text-white/80">Total Categories</p>
                            <p className="text-2xl font-bold mt-1">{filtered.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm">
                <Table
                    columns={columns}
                    data={filtered}
                    isLoading={isLoading}
                    title="Categories List"
                />
            </div>

            {/* Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingCategory ? 'Edit Category' : 'Add New Category'}
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Category Name</label>
                        <input
                            type="text"
                            value={formData.category || ''}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 border p-2"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Price Per KM</label>
                            <input
                                type="number"
                                value={formData.price_per_km || 0}
                                onChange={(e) => setFormData({ ...formData, price_per_km: Number(e.target.value) })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 border p-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Base Discount</label>
                            <input
                                type="number"
                                value={formData.base_discount || 0}
                                onChange={(e) => setFormData({ ...formData, base_discount: Number(e.target.value) })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 border p-2"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Min Seats</label>
                            <input
                                type="number"
                                value={formData.min_no_of_seats || 0}
                                onChange={(e) => setFormData({ ...formData, min_no_of_seats: Number(e.target.value) })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 border p-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Max Seats</label>
                            <input
                                type="number"
                                value={formData.max_no_of_seats || 0}
                                onChange={(e) => setFormData({ ...formData, max_no_of_seats: Number(e.target.value) })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 border p-2"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Fuel Charges</label>
                            <input
                                type="number"
                                value={formData.fuel_charges || 0}
                                onChange={(e) => setFormData({ ...formData, fuel_charges: Number(e.target.value) })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 border p-2 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Driver Charges</label>
                            <input
                                type="number"
                                value={formData.driver_charges || 0}
                                onChange={(e) => setFormData({ ...formData, driver_charges: Number(e.target.value) })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 border p-2 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Night Charges</label>
                            <input
                                type="number"
                                value={formData.night_charges || 0}
                                onChange={(e) => setFormData({ ...formData, night_charges: Number(e.target.value) })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 border p-2 text-sm"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={formData.is_active === 1}
                                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked ? 1 : 0 })}
                                className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                            />
                            <span className="text-sm text-gray-700">Active</span>
                        </label>
                    </div>

                    <div className="flex justify-end space-x-3 mt-6">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                        >
                            Save
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Categories;
