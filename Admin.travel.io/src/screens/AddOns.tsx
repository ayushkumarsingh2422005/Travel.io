import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

interface AddOn {
    id: string;
    name: string;
    price: number;
    price_type: 'fixed' | 'percentage';
    is_active: number;
}

const AddOns = () => {
    const [addOns, setAddOns] = useState<AddOn[]>([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        price_type: 'fixed',
    });

    const fetchAddOns = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:5000/api/admin/add-ons/all');
            if (response.data.success) {
                setAddOns(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching add-ons:', error);
            toast.error('Failed to fetch add-ons');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAddOns();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/api/admin/add-ons/add', formData);
            if (response.data.success) {
                toast.success('Add-on created successfully');
                setShowModal(false);
                setFormData({ name: '', price: '', price_type: 'fixed' });
                fetchAddOns();
            }
        } catch (error) {
            console.error('Error creating add-on:', error);
            toast.error('Failed to create add-on');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this add-on?')) return;
        try {
            // Assuming delete endpoint exists, if not this might require adjustment
            await axios.delete(`http://localhost:5000/api/admin/add-ons/${id}`);
            toast.success('Add-on deleted successfully');
            fetchAddOns();
        } catch (error) {
            console.error('Error deleting add-on:', error);
            toast.error('Failed to delete add-on');
        }
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Manage Add-Ons</h1>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    Add New Add-On
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                {/* <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th> */}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                <tr><td colSpan={4} className="px-6 py-4 text-center">Loading...</td></tr>
                            ) : addOns.length === 0 ? (
                                <tr><td colSpan={4} className="px-6 py-4 text-center">No add-ons found</td></tr>
                            ) : (
                                addOns.map((addon) => (
                                    <tr key={addon.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{addon.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{addon.price}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{addon.price_type}</td>
                                        {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button onClick={() => handleDelete(addon.id)} className="text-red-600 hover:text-red-900">Delete</button>
                    </td> */}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <h2 className="text-xl font-bold mb-4">Add New Add-On</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-green-500 focus:border-green-500"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                                <input
                                    type="number"
                                    required
                                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-green-500 focus:border-green-500"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                />
                            </div>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Price Type</label>
                                <select
                                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-green-500 focus:border-green-500"
                                    value={formData.price_type}
                                    onChange={(e) => setFormData({ ...formData, price_type: e.target.value as 'fixed' | 'percentage' })}
                                >
                                    <option value="fixed">Fixed</option>
                                    <option value="percentage">Percentage</option>
                                </select>
                            </div>
                            <div className="flex justify-end gap-3">
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
                                    Create Add-On
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddOns;
