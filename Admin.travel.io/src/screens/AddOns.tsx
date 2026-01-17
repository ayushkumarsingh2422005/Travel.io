import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import Table from '../components/Table';
import Modal from '../components/Modal';

interface AddOn {
    id: string;
    name: string;
    description: string;
    price: number;
    pricing_type: 'fixed' | 'percentage';
    percentage_value: number | null;
    category: 'luggage' | 'car_model' | 'cancellation' | 'pet' | 'other';
    icon_url: string | null;
    is_active: boolean;
    display_order: number;
    created_at: string;
}

const AddOnsManagement: React.FC = () => {
    const [addOns, setAddOns] = useState<AddOn[]>([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingAddOn, setEditingAddOn] = useState<AddOn | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        pricing_type: 'fixed' as 'fixed' | 'percentage',
        percentage_value: '',
        category: 'other' as 'luggage' | 'car_model' | 'cancellation' | 'pet' | 'other',
        icon_url: '',
        is_active: true,
        display_order: 0
    });

    useEffect(() => {
        fetchAddOns();
    }, []);

    const fetchAddOns = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('marcocabs_admin_token');
            const response = await axios.get('http://localhost:5000/admin/add-ons/all', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setAddOns(response.data.data);
            }
        } catch (error: any) {
            console.error('Error fetching add-ons:', error);
            toast.error('Failed to fetch add-ons');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem('marcocabs_admin_token');
            const endpoint = editingAddOn
                ? `http://localhost:5000/admin/add-ons/${editingAddOn.id}`
                : 'http://localhost:5000/admin/add-ons/add';

            const method = editingAddOn ? 'put' : 'post';

            const payload = {
                ...formData,
                price: parseFloat(formData.price) || 0,
                percentage_value: formData.percentage_value ? parseFloat(formData.percentage_value) : null,
                display_order: parseInt(formData.display_order.toString()) || 0
            };

            const response = await axios[method](endpoint, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                toast.success(editingAddOn ? 'Add-on updated successfully' : 'Add-on created successfully');
                setShowModal(false);
                resetForm();
                fetchAddOns();
            }
        } catch (error: any) {
            console.error('Error saving add-on:', error);
            toast.error(error.response?.data?.message || 'Failed to save add-on');
        }
    };

    const handleEdit = (addon: AddOn) => {
        setEditingAddOn(addon);
        setFormData({
            name: addon.name,
            description: addon.description || '',
            price: addon.price.toString(),
            pricing_type: addon.pricing_type,
            percentage_value: addon.percentage_value?.toString() || '',
            category: addon.category,
            icon_url: addon.icon_url || '',
            is_active: addon.is_active,
            display_order: addon.display_order
        });
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this add-on?')) {
            return;
        }

        try {
            const token = localStorage.getItem('marcocabs_admin_token');
            const response = await axios.delete(`http://localhost:5000/admin/add-ons/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                toast.success('Add-on deleted successfully');
                fetchAddOns();
            }
        } catch (error: any) {
            console.error('Error deleting add-on:', error);
            toast.error(error.response?.data?.message || 'Failed to delete add-on');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            price: '',
            pricing_type: 'fixed',
            percentage_value: '',
            category: 'other',
            icon_url: '',
            is_active: true,
            display_order: 0
        });
        setEditingAddOn(null);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    const getCategoryBadge = (category: string) => {
        const colors = {
            luggage: 'bg-blue-100 text-blue-800',
            car_model: 'bg-green-100 text-green-800',
            cancellation: 'bg-yellow-100 text-yellow-800',
            pet: 'bg-purple-100 text-purple-800',
            other: 'bg-gray-100 text-gray-800'
        };
        return colors[category as keyof typeof colors] || colors.other;
    };

    const columns = [
        {
            id: 'name',
            label: 'Name',
            minWidth: 200,
            format: (value: string, row: AddOn) => (
                <div>
                    <div className="font-medium text-gray-900">{value}</div>
                    <div className="text-sm text-gray-500">{row.description}</div>
                </div>
            )
        },
        {
            id: 'category',
            label: 'Category',
            minWidth: 120,
            format: (value: string) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryBadge(value)}`}>
                    {value}
                </span>
            )
        },
        {
            id: 'pricing_type',
            label: 'Type',
            minWidth: 100,
            format: (value: string) => value === 'fixed' ? 'Fixed' : 'Percentage'
        },
        {
            id: 'price',
            label: 'Price',
            minWidth: 100,
            format: (value: number, row: AddOn) => (
                <span className="font-semibold text-gray-900">
                    {row.pricing_type === 'fixed' ? `₹${value}` : `${row.percentage_value}%`}
                </span>
            )
        },
        {
            id: 'is_active',
            label: 'Status',
            minWidth: 100,
            format: (value: boolean) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                    {value ? 'Active' : 'Inactive'}
                </span>
            )
        },
        { id: 'display_order', label: 'Order', minWidth: 80 },
        {
            id: 'actions',
            label: 'Actions',
            minWidth: 150,
            format: (_: any, row: AddOn) => (
                <div className="flex gap-2">
                    <button
                        onClick={() => handleEdit(row)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                    >
                        Edit
                    </button>
                    <button
                        onClick={() => handleDelete(row.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors"
                    >
                        Delete
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Manage Add-Ons</h1>
                        <p className="mt-1 text-sm text-gray-600">
                            Create and update booking add-ons and pricing
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            resetForm();
                            setShowModal(true);
                        }}
                        className="w-full sm:w-auto px-6 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 active:bg-red-800 transition-colors duration-200 flex items-center justify-center space-x-2 shadow-sm hover:shadow"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span>Add New Add-On</span>
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm">
                <Table
                    columns={columns}
                    data={addOns}
                    isLoading={loading}
                    title="Add-Ons List"
                    pagination={{
                        current_page: 1,
                        per_page: addOns.length > 0 ? addOns.length : 10,
                        total: addOns.length,
                        total_pages: 1
                    }}
                />
            </div>

            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingAddOn ? 'Edit Add-On' : 'Create New Add-On'}
                size="lg"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Add-On Name *
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                                placeholder="e.g., Pet Allowance"
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={2}
                                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                                placeholder="Brief description"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Category *
                            </label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                required
                                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                            >
                                <option value="luggage">Luggage</option>
                                <option value="car_model">Car Model</option>
                                <option value="cancellation">Cancellation</option>
                                <option value="pet">Pet</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Pricing Type *
                            </label>
                            <select
                                name="pricing_type"
                                value={formData.pricing_type}
                                onChange={handleChange}
                                required
                                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                            >
                                <option value="fixed">Fixed Price</option>
                                <option value="percentage">Percentage of Base Fare</option>
                            </select>
                        </div>

                        {formData.pricing_type === 'fixed' ? (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Price (₹) *
                                </label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    required
                                    min="0"
                                    step="0.01"
                                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                                    placeholder="e.g., 300"
                                />
                            </div>
                        ) : (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Percentage (%) *
                                </label>
                                <input
                                    type="number"
                                    name="percentage_value"
                                    value={formData.percentage_value}
                                    onChange={handleChange}
                                    required
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                                    placeholder="e.g., 5"
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Display Order
                            </label>
                            <input
                                type="number"
                                name="display_order"
                                value={formData.display_order}
                                onChange={handleChange}
                                min="0"
                                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                                placeholder="0"
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="is_active"
                                    checked={formData.is_active}
                                    onChange={handleChange}
                                    className="w-4 h-4 text-red-600 rounded focus:ring-2 focus:ring-red-500"
                                />
                                <span className="ml-2 text-sm text-gray-700">Active (visible to customers)</span>
                            </label>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4 border-t">
                        <button
                            type="button"
                            onClick={() => {
                                setShowModal(false);
                                resetForm();
                            }}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                        >
                            {editingAddOn ? 'Update Add-On' : 'Create Add-On'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default AddOnsManagement;
