import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../auth/AuthProvider';
import { getCurrencySymbol } from '../utils/currency';
import { ChevronLeft, Gift, User, Calendar, ExternalLink } from 'lucide-react';

export default function EarningsPage() {
    const { session } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (session?.user) {
            fetchOrders();
        }
    }, [session]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .eq('creator_id', session.user.id)
                .eq('status', 'completed')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setOrders(data || []);
        } catch (err) {
            console.error("Error:", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Earnings...</div>;

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                <button 
                    onClick={() => navigate(-1)} 
                    style={{ background: '#f1f5f9', border: 'none', padding: '10px', borderRadius: '12px', cursor: 'pointer' }}
                >
                    <ChevronLeft size={20} />
                </button>
                <h1 style={{ fontSize: '28px', fontWeight: '800', margin: 0 }}>Gifts & Earnings</h1>
            </div>

            {/* Stats Summary */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '20px', 
                marginBottom: '40px' 
            }}>
                <div style={statBox}>
                    <label style={statLabel}>TOTAL EARNED</label>
                    <div style={statValue}>
                        ₹{orders.reduce((sum, o) => sum + o.amount, 0).toLocaleString()}
                    </div>
                </div>
                <div style={statBox}>
                    <label style={statLabel}>TOTAL GIFTS</label>
                    <div style={statValue}>{orders.length}</div>
                </div>
            </div>

            {/* Transactions Table */}
            <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <div style={{ padding: '20px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>Recent Transactions</h3>
                </div>
                
                {orders.length === 0 ? (
                    <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
                        <Gift size={48} style={{ marginBottom: '16px', opacity: 0.2 }} />
                        <p>No transactions found yet.</p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <th style={thStyle}>Date</th>
                                    <th style={thStyle}>Giver</th>
                                    <th style={thStyle}>Item/Type</th>
                                    <th style={thStyle}>Amount</th>
                                    <th style={thStyle}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order) => (
                                    <tr key={order.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                                        <td style={tdStyle}>{new Date(order.created_at).toLocaleDateString()}</td>
                                        <td style={tdStyle}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <User size={14} color="#94a3b8" />
                                                {order.buyer_name || 'Anonymous'}
                                            </div>
                                        </td>
                                        <td style={tdStyle}>
                                            <span style={{ fontSize: '13px', fontWeight: '600' }}>
                                                {order.is_crowdfund ? 'Contribution' : (order.items?.[0]?.title || 'Surprise Gift')}
                                            </span>
                                        </td>
                                        <td style={{...tdStyle, fontWeight: '700', color: '#10b981' }}>
                                            +{getCurrencySymbol(order.currency_code)}{order.amount.toLocaleString()}
                                        </td>
                                        <td style={tdStyle}>
                                            <span style={statusBadge}>Completed</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

// Internal Styles
const statBox = { padding: '24px', background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' };
const statLabel = { fontSize: '11px', fontWeight: '700', color: '#64748b', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' };
const statValue = { fontSize: '24px', fontWeight: '800', color: '#1e293b' };
const thStyle = { padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' };
const tdStyle = { padding: '16px 20px', fontSize: '14px', color: '#1e293b' };
const statusBadge = { padding: '4px 8px', borderRadius: '6px', background: '#ecfdf5', color: '#059669', fontSize: '11px', fontWeight: '700' };