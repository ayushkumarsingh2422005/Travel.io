import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

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

    return (
        <div className="p-8 text-black">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Add-Ons Management</h1>
                <button
                    onClick={() => {
                        resetForm();
                        setShowModal(true);
                    }}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                >
                    + Add New Add-On
                </button>
            </div>

            {/* Add-Ons Table */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-4 text-left text-sm font-semibold text-gray-600">Name</th>
                            <th className="p-4 text-left text-sm font-semibold text-gray-600">Category</th>
                            <th className="p-4 text-left text-sm font-semibold text-gray-600">Type</th>
                            <th className="p-4 text-left text-sm font-semibold text-gray-600">Price</th>
                            <th className="p-4 text-left text-sm font-semibold text-gray-600">Status</th>
                            <th className="p-4 text-left text-sm font-semibold text-gray-600">Order</th>
                            <th className="p-4 text-left text-sm font-semibold text-gray-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={7} className="p-4 text-center text-gray-500">
                                    Loading add-ons...
                                </td>
                            </tr>
                        ) : addOns.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="p-4 text-center text-gray-500">
                                    No add-ons found. Create your first add-on!
                                </td>
                            </tr>
                        ) : (
                            addOns.map(addon => (
                                <tr key={addon.id} className="border-b hover:bg-gray-50">
                                    <td className="p-4">
                                        <div className="font-medium">{addon.name}</div>
                                        <div className="text-sm text-gray-500">{addon.description}</div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryBadge(addon.category)}`}>
                                            {addon.category}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm">
                                        {addon.pricing_type === 'fixed' ? 'Fixed' : 'Percentage'}
                                    </td>
                                    <td className="p-4 text-sm font-semibold">
                                        {addon.pricing_type === 'fixed' 
                                            ? `₹${addon.price}` 
                                            : `${addon.percentage_value}%`}
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            addon.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                            {addon.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm">{addon.display_order}</td>
                                    <td className="p-4">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEdit(addon)}
                                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(addon.id)}
                                                className="text-red-600 hover:text-red-800 text-sm font-medium"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">
                                {editingAddOn ? 'Edit Add-On' : 'Create New Add-On'}
                            </h2>
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    resetForm();
                                }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

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
                                        className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
                                        className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
                                        className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
                                        className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
                                            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
                                            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
                                        className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
                                            className="w-4 h-4 text-green-600 rounded focus:ring-2 focus:ring-green-500"
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
                                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                                >
                                    {editingAddOn ? 'Update Add-On' : 'Create Add-On'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddOnsManagement;
