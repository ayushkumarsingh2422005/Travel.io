import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

interface Penalty {
    id: string;
    offense_name: string;
    amount: number;
}

const Penalties = () => {
    const [penalties, setPenalties] = useState<Penalty[]>([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        offense_name: '',
        amount: '',
    });

    const fetchPenalties = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:5000/api/admin/penalties/all');
            if (response.data.success) {
                setPenalties(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching penalties:', error);
            toast.error('Failed to fetch penalties');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPenalties();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/api/admin/penalties/add', formData);
            if (response.data.success) {
                toast.success('Penalty rule created successfully');
                setShowModal(false);
                setFormData({ offense_name: '', amount: '' });
                fetchPenalties();
            }
        } catch (error) {
            console.error('Error creating penalty:', error);
            toast.error('Failed to create penalty rule');
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Manage Penalties</h1>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    Add Penalty Rule
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Offense Name</th>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                <tr><td colSpan={2} className="px-6 py-4 text-center">Loading...</td></tr>
                            ) : penalties.length === 0 ? (
                                <tr><td colSpan={2} className="px-6 py-4 text-center">No penalty rules found</td></tr>
                            ) : (
                                penalties.map((penalty) => (
                                    <tr key={penalty.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{penalty.offense_name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">₹{penalty.amount}</td>
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
                        <h2 className="text-xl font-bold mb-4">Add New Penalty Rule</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Offense Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-red-500 focus:border-red-500"
                                    value={formData.offense_name}
                                    onChange={(e) => setFormData({ ...formData, offense_name: e.target.value })}
                                />
                            </div>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                                <input
                                    type="number"
                                    required
                                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-red-500 focus:border-red-500"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                />
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
                                    className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700"
                                >
                                    Create Rule
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Penalties;
