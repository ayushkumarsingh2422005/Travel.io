import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

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
    const [resolvingId, setResolvingId] = useState<string | null>(null);
    const [adminComment, setAdminComment] = useState('');

    useEffect(() => {
        fetchDisputes();
    }, []);

    const fetchDisputes = async () => {
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
            const errorMsg = error.response?.data?.message || error.message || 'Failed to load disputes';
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleResolve = async (disputeId: string, action: 'resolved' | 'rejected') => {
        if (!window.confirm(`Are you sure you want to ${action === 'resolved' ? 'resolve' : 'reject'} this dispute?`)) {
            return;
        }

        setResolvingId(disputeId);
        try {
            const token = localStorage.getItem('marcocabs_admin_token');
            const response = await axios.post('http://localhost:5000/admin/penalty-disputes/resolve', {
                disputeId,
                action,
                adminComment
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                toast.success(`Dispute ${action} successfully`);
                setAdminComment('');
                fetchDisputes();
            }
        } catch (error: any) {
            console.error('Error resolving dispute:', error);
            toast.error(error.response?.data?.message || 'Failed to process dispute');
        } finally {
            setResolvingId(null);
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-black">Loading disputes...</div>;
    }

    return (
        <div className="p-8 text-black">
            <h1 className="text-2xl font-bold mb-6">Penalty Disputes</h1>

            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-4">Vendor</th>
                            <th className="p-4">Penalty Info</th>
                            <th className="p-4">Dispute Reason</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {disputes.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-4 text-center text-gray-500">No disputes found</td>
                            </tr>
                        ) : (
                            disputes.map(dispute => (
                                <tr key={dispute.id} className="border-b hover:bg-gray-50">
                                    <td className="p-4">
                                        <div className="font-semibold">{dispute.vendor_name}</div>
                                        <div className="text-xs text-gray-500">{dispute.vendor_id}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="text-sm font-semibold text-red-600">₹{dispute.penalty_amount}</div>
                                        <div className="text-xs">{dispute.penalty_description}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="text-sm italic">"{dispute.reason}"</div>
                                        <div className="text-xs text-gray-400">{new Date(dispute.created_at).toLocaleString()}</div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                            dispute.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                            dispute.status === 'resolved' ? 'bg-green-100 text-green-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                            {dispute.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        {dispute.status === 'pending' ? (
                                            <div className="space-y-2">
                                                <input 
                                                    type="text" 
                                                    placeholder="Admin comment..."
                                                    className="w-full text-xs p-1 border rounded"
                                                    value={resolvingId === dispute.id ? adminComment : ''}
                                                    onChange={(e) => {
                                                        setResolvingId(dispute.id);
                                                        setAdminComment(e.target.value);
                                                    }}
                                                />
                                                <div className="flex gap-2">
                                                    <button 
                                                        onClick={() => handleResolve(dispute.id, 'resolved')}
                                                        className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700"
                                                        disabled={resolvingId === dispute.id && !adminComment}
                                                    >
                                                        Resolve (Cut Money)
                                                    </button>
                                                    <button 
                                                        onClick={() => handleResolve(dispute.id, 'rejected')}
                                                        className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700"
                                                        disabled={resolvingId === dispute.id && !adminComment}
                                                    >
                                                        Reject (Cancel Penalty)
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-xs text-gray-500">
                                                {dispute.admin_comment ? `Note: ${dispute.admin_comment}` : 'No comment'}
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PenaltyDisputes;
