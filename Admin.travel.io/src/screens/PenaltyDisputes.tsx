import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import Table from '../components/Table';
import Modal from '../components/Modal';

interface Dispute {
    id: string;
    payment_id: string;
    vendor_id: string;
    vendor_name: string;
    penalty_amount: number;
    penalty_description: string;
    reason: string;
    status: 'pending' | 'resolved' | 'rejected';
    admin_comment: string | null;
    created_at: string;
}

const PenaltyDisputes: React.FC = () => {
    const [disputes, setDisputes] = useState<Dispute[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
    const [adminComment, setAdminComment] = useState('');
    const [processing, setProcessing] = useState(false);



    const fetchDisputes = React.useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('marcocabs_admin_token');
            const response = await axios.get('http://localhost:5000/admin/penalty-disputes', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setDisputes(response.data.disputes);
            }
        } catch (error: any) {
            console.error('Error fetching disputes:', error);
            toast.error(error.response?.data?.message || 'Failed to load disputes');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDisputes();
    }, [fetchDisputes]);

    const handleOpenReview = (dispute: Dispute) => {
        setSelectedDispute(dispute);
        setAdminComment('');
        setShowModal(true);
    };

    const handleResolution = async (action: 'resolved' | 'rejected') => {
        if (!selectedDispute) return;

        if (!window.confirm(`Are you sure you want to ${action === 'resolved' ? 'uphold the penalty' : 'cancel the penalty'}?`)) {
            return;
        }

        setProcessing(true);
        try {
            const token = localStorage.getItem('marcocabs_admin_token');
            const response = await axios.post('http://localhost:5000/admin/penalty-disputes/resolve', {
                disputeId: selectedDispute.id,
                action,
                adminComment
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                toast.success(`Dispute ${action} successfully`);
                setShowModal(false);
                setSelectedDispute(null);
                setAdminComment('');
                fetchDisputes();
            }
        } catch (error: any) {
            console.error('Error resolving dispute:', error);
            toast.error(error.response?.data?.message || 'Failed to process dispute');
        } finally {
            setProcessing(false);
        }
    };

    const columns = [
        {
            id: 'vendor',
            label: 'Vendor',
            minWidth: 180,
            format: (_: any, row: Dispute) => (
                <div>
                    <div className="font-medium text-gray-900">{row.vendor_name}</div>
                    <div className="text-xs text-gray-500 font-mono">{row.vendor_id}</div>
                </div>
            )
        },
        {
            id: 'penalty_info',
            label: 'Penalty Info',
            minWidth: 150,
            format: (_: any, row: Dispute) => (
                <div>
                    <div className="text-sm font-semibold text-red-600">₹{row.penalty_amount}</div>
                    <div className="text-xs text-gray-600">{row.penalty_description}</div>
                </div>
            )
        },
        {
            id: 'reason',
            label: 'Dispute Reason',
            minWidth: 200,
            format: (_: any, row: Dispute) => (
                <div>
                    <div className="text-sm italic text-gray-700">"{row.reason}"</div>
                    <div className="text-xs text-gray-400 mt-1">{new Date(row.created_at).toLocaleString()}</div>
                </div>
            )
        },
        {
            id: 'status',
            label: 'Status',
            minWidth: 100,
            format: (value: string) => (
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${value === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    value === 'resolved' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                    }`}>
                    {value.toUpperCase()}
                </span>
            )
        },
        {
            id: 'actions',
            label: 'Actions',
            minWidth: 100,
            format: (_: any, row: Dispute) => (
                row.status === 'pending' ? (
                    <button
                        onClick={() => handleOpenReview(row)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                    >
                        Review
                    </button>
                ) : (
                    <div className="text-xs text-gray-500 italic">
                        {row.admin_comment ? `Note: ${row.admin_comment}` : 'No comment'}
                    </div>
                )
            )
        }
    ];

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Penalty Disputes</h1>
                        <p className="mt-1 text-sm text-gray-600">
                            Manage and review vendor penalty appeals
                        </p>
                    </div>
                    {/* No "Add" button for disputes as they are user-generated */}
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm">
                <Table
                    columns={columns}
                    data={disputes}
                    isLoading={loading}
                    title="Disputes List"
                    pagination={{
                        current_page: 1,
                        per_page: disputes.length > 0 ? disputes.length : 10,
                        total: disputes.length,
                        total_pages: 1
                    }}
                />
            </div>

            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title="Review Dispute"
                size="md"
            >
                {selectedDispute && (
                    <div className="space-y-6">
                        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                            <div className="flex justify-between border-b border-gray-200 pb-2">
                                <span className="text-sm text-gray-600">Vendor</span>
                                <span className="text-sm font-medium">{selectedDispute.vendor_name}</span>
                            </div>
                            <div className="flex justify-between border-b border-gray-200 pb-2">
                                <span className="text-sm text-gray-600">Penalty Amount</span>
                                <span className="text-sm font-bold text-red-600">₹{selectedDispute.penalty_amount}</span>
                            </div>
                            <div>
                                <span className="text-sm text-gray-600 block mb-1">Vendor's Reason</span>
                                <p className="text-sm italic text-gray-800 bg-white p-2 rounded border border-gray-200">
                                    "{selectedDispute.reason}"
                                </p>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Admin Comment / Reason
                            </label>
                            <textarea
                                value={adminComment}
                                onChange={(e) => setAdminComment(e.target.value)}
                                rows={3}
                                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                                placeholder="Enter reason for decision..."
                            />
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={() => handleResolution('rejected')}
                                disabled={processing}
                                className="flex-1 px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition font-medium disabled:opacity-50"
                            >
                                Reject (Cancel Penalty)
                            </button>
                            <button
                                onClick={() => handleResolution('resolved')}
                                disabled={processing}
                                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50"
                            >
                                Resolve (Cut Money)
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default PenaltyDisputes;
