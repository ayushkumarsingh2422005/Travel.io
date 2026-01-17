import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import Table from '../components/Table';
import Modal from '../components/Modal';

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

    const columns = [
        { id: 'offense_name', label: 'Offense Name', minWidth: 200 },
        {
            id: 'amount',
            label: 'Amount',
            minWidth: 150,
            format: (value: number) => <span className="text-red-600 font-medium">₹{value}</span>
        },
    ];

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Manage Penalties</h1>
                        <p className="mt-1 text-sm text-gray-600">
                            Configure penalty rules and amounts
                        </p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="w-full sm:w-auto px-6 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 active:bg-red-800 transition-colors duration-200 flex items-center justify-center space-x-2 shadow-sm hover:shadow"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span>Add Penalty Rule</span>
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm">
                <Table
                    columns={columns}
                    data={penalties}
                    isLoading={loading}
                    title="Penalties List"
                    pagination={{
                        current_page: 1,
                        per_page: penalties.length > 0 ? penalties.length : 10,
                        total: penalties.length,
                        total_pages: 1
                    }}
                />
            </div>

            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title="Add New Penalty Rule"
                size="md"
            >
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Offense Name</label>
                        <input
                            type="text"
                            required
                            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                            value={formData.offense_name}
                            onChange={(e) => setFormData({ ...formData, offense_name: e.target.value })}
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                        <input
                            type="number"
                            required
                            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        />
                    </div>
                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => setShowModal(false)}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Create Rule
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Penalties;
