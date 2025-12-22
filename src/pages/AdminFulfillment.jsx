import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { getCurrencyPreference, formatPrice } from '../utils/currency';

export default function AdminFulfillment() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [costs, setCosts] = useState({});

  const saveActualCost = async (orderId) => {
    const cost = costs[orderId];
    if (!cost) return alert("Please enter a cost first");

    const { error } = await supabase
        .from('orders')
        .update({ actual_purchase_cost: parseFloat(cost) })
        .eq('id', orderId);

    if (error) alert("Error saving cost: " + error.message);
    else alert("Cost saved successfully!");
  };



// Inside your component
const [currencyPref, setCurrencyPref] = useState(getCurrencyPreference());

useEffect(() => {
  const handleCurrencyChange = () => setCurrencyPref(getCurrencyPreference());
  window.addEventListener('currencyChanged', handleCurrencyChange);
  return () => window.removeEventListener('currencyChanged', handleCurrencyChange);
}, []);

  useEffect(() => {
    fetchOrders();
  }, []);

  const [trackingNumbers, setTrackingNumbers] = useState({});

  const saveShippingInfo = async (orderId) => {
    const cost = costs[orderId];
    const tracking = trackingNumbers[orderId];

    const { error } = await supabase
        .from('orders')
        .update({ 
        actual_purchase_cost: cost ? parseFloat(cost) : null,
        tracking_number: tracking || null,
        gift_status: tracking ? 'shipped' : 'accepted' // Auto-update status if tracking added
        })
        .eq('id', orderId);

    if (error) alert("Error: " + error.message);
    else {
        alert("Shipping info updated!");
        fetchOrders(); // Refresh to see new profit/status
    }
  };

  const [isUploading, setIsUploading] = useState(null); // Stores orderId being uploaded

  const uploadInvoice = async (orderId, file) => {
    if (!file) return;
    
    setIsUploading(orderId);
    try {
        const fileExt = file.name.split('.').pop();
        // Path: orders/ORDER_ID/invoice-RANDOM.pdf
        const filePath = `invoices/${orderId}-${Date.now()}.${fileExt}`;

        const { data, error: uploadError } = await supabase.storage
        .from('order-invoices')
        .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
        });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
        .from('order-invoices')
        .getPublicUrl(filePath);

        const { error: updateError } = await supabase
        .from('orders')
        .update({ invoice_url: publicUrl })
        .eq('id', orderId);

        if (updateError) throw updateError;

        alert("Invoice linked successfully!");
        fetchOrders(); 
    } catch (error) {
        console.error("Full Error:", error);
        alert("Upload failed: Check Storage RLS policies.");
    } finally {
        setIsUploading(null);
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      // 1. Fetch orders first to ensure we see them
      // 2. We use a 'left join' by not using !inner
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          creator_profiles (
            full_name,
            address_line1,
            address_line2,
            city,
            state,
            zip_code,
            country
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Supabase Error:", error);
        throw error;
      }

      console.log("Admin Data Fetched:", data);
      setTasks(data || []);
    } catch (err) {
      console.error("Fetch error:", err.message);
      alert("Failed to fetch: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper to safely get the item title from the 'items' array
  const getItemTitle = (items) => {
    if (!items || !Array.isArray(items) || items.length === 0) return 'Unknown Item';
    // Accessing the 'title' from the first object in the items array
    return items[0].title || 'No Title';
  };

  const getMerchantUrl = (items) => {
    if (!items || !Array.isArray(items) || items.length === 0) return '#';
    return items[0].url || '#';
  };

  const getStoreName = (items) => {
    if (!items || !Array.isArray(items) || items.length === 0) return 'Merchant';
    return items[0].store || 'Merchant';
  };

  // Helper for status badge colors
  const getStatusStyle = (status) => {
    const base = { padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' };
    switch (status?.toLowerCase()) {
      case 'pending': return { ...base, backgroundColor: '#fef3c7', color: '#92400e' }; // Yellow
      case 'paid': return { ...base, backgroundColor: '#dcfce7', color: '#166534' };    // Green
      case 'accepted': return { ...base, backgroundColor: '#dbeafe', color: '#1e40af' }; // Blue
      case 'shipped': return { ...base, backgroundColor: '#f3e8ff', color: '#6b21a8' };  // Purple
      default: return { ...base, backgroundColor: '#f1f5f9', color: '#475569' };
    }
  };

  const updateInvoiceUrl = async (orderId, url) => {
    const { error } = await supabase
        .from('orders')
        .update({ invoice_url: url })
        .eq('id', orderId);

    if (error) alert(error.message);
    else fetchOrders(); // Refresh to show the upload input again
  };

  const { code: prefCode, rate: globalRate } = getCurrencyPreference();

  const { rate: currentGlobalRate } = getCurrencyPreference(); //

  const stats = tasks.reduce((acc, order) => {
    if (order.payment_status === 'paid') {
        const rawAmount = Number(order.total_amount || 0);
        
        // Use the snapshot rate from the DB if available, else current global rate
        const rateUsed = order.exchange_rate_at_payment || currentGlobalRate;

        // MATH: Since rate is INR -> Target, DIVIDE to get back to INR
        const amountInINR = order.currency_code !== 'INR' 
        ? (rawAmount / rateUsed) 
        : rawAmount;

        acc.totalRevenue += amountInINR;
        acc.totalSpend += Number(order.actual_purchase_cost || 0);
    }
    return acc;
  }, { totalRevenue: 0, totalSpend: 0 });

  const netProfit = stats.totalRevenue - stats.totalSpend;

  if (loading) return <div style={{ padding: '40px' }}>Loading Admin Data...</div>;

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '30px' }}>
        <h2 style={{ margin: 0 }}>📦 Admin Fulfillment Queue</h2>
        <p style={{ color: '#64748b' }}>Manage physical gift deliveries and creator details.</p>
      </header>

      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' }}>
        <div style={summaryCardStyle}>
            <div style={{ color: '#64748b', fontSize: '12px' }}>Gross Revenue</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b' }}>₹{stats.totalRevenue.toFixed(2)}</div>
        </div>
        
        <div style={summaryCardStyle}>
            <div style={{ color: '#64748b', fontSize: '12px' }}>Total Spend (Cost)</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ef4444' }}>₹{stats.totalSpend.toFixed(2)}</div>
        </div>

        <div style={summaryCardStyle}>
            <div style={{ color: '#64748b', fontSize: '12px' }}>Net Profit</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>₹{netProfit.toFixed(2)}</div>
        </div>
      </div>
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <tr style={{ textAlign: 'left' }}>
              <th style={cellStyle}>Gift Item</th>
              <th style={cellStyle}>Status</th>
              <th style={cellStyle}>Creator</th>
              <th style={cellStyle}>Shipping Address</th>
              <th style={cellStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map(order => (
            <tr key={order.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={cellStyle}>
                <div style={{ fontWeight: '600', color: '#1e293b' }}>
                    {getItemTitle(order.items)}
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>ID: {order.id.slice(0, 8)}</div>
                </td>
                
                <td style={cellStyle}>
                <span style={getStatusStyle(order.gift_status)}>
                    {order.gift_status}
                </span>
                <div style={{fontSize: '10px', marginTop: '4px', color: '#64748b'}}>
                    Pay Status: {order.payment_status}
                </div>
                </td>

                <td style={cellStyle}>
                {order.creator_profiles?.full_name || 'Name Missing'}
                </td>

                <td style={cellStyle}>
                {order.creator_profiles ? (
                    <div style={{ fontSize: '12px', color: '#475569', lineHeight: '1.4' }}>
                    <strong>{order.creator_profiles.address_line1}</strong><br/>
                    {order.creator_profiles.address_line2 && <>{order.creator_profiles.address_line2}<br/></>}
                    {order.creator_profiles.city}, {order.creator_profiles.state} {order.creator_profiles.zip_code}<br/>
                    {order.creator_profiles.country}
                    </div>
                ) : (
                    <span style={{ color: '#ef4444' }}>Address Missing</span>
                )}
                </td>

                <td style={cellStyle}>
                <button 
                    onClick={() => window.open(getMerchantUrl(order.items), '_blank')}
                    style={actionBtnStyle}
                >
                    Buy on {getStoreName(order.items)}
                </button>
                </td>
                <td style={cellStyle}>
                    <div style={{ fontWeight: 'bold', color: '#1e293b' }}>
                        {/* Use rate=1 here because order.total_amount is already converted */}
                        Fan Paid: {formatPrice(order.total_amount, order.currency_code, 1)}
                    </div>
                    
                    {order.currency_code !== 'INR' && (
                        <div style={{ fontSize: '10px', color: '#64748b' }}>
                        (≈ {formatPrice(order.total_amount / (order.exchange_rate_at_payment || currentGlobalRate), 'INR', 1)})
                        </div>
                    )}
                </td>
                <td style={cellStyle}>
                    <div>
                        <label style={{ fontSize: '10px', color: '#64748b', display: 'block', marginBottom: '4px' }}>
                            MERCHANT INVOICE
                        </label>
                        
                        {order.invoice_url ? (
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                            <a href={order.invoice_url} target="_blank" rel="noreferrer" style={viewInvoiceBtn}>
                                View Invoice ↗
                            </a>
                            {/* Button to clear the URL if you need to re-upload */}
                            <button 
                                onClick={() => updateInvoiceUrl(order.id, null)} 
                                style={deleteBtnStyle}
                            >
                                Remove
                            </button>
                            </div>
                        ) : (
                            <input 
                            type="file" 
                            accept="image/*,.pdf"
                            onChange={(e) => uploadInvoice(order.id, e.target.files[0])}
                            style={{ fontSize: '10px' }}
                            />
                        )}
                    </div>
                </td>
                <td style={cellStyle}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '150px' }}>
                        <div>
                        <label style={{ fontSize: '10px', color: '#64748b' }}>Actual Cost (₹)</label>
                        <input 
                            type="number" 
                            value={costs[order.id] || ''}
                            onChange={(e) => setCosts({...costs, [order.id]: e.target.value})}
                            style={inputStyle}
                        />
                        </div>
                        <div>
                        <label style={{ fontSize: '10px', color: '#64748b' }}>Tracking ID</label>
                        <input 
                            type="text" 
                            placeholder="AWB / Courier"
                            value={trackingNumbers[order.id] || order.tracking_number || ''}
                            onChange={(e) => setTrackingNumbers({...trackingNumbers, [order.id]: e.target.value})}
                            style={inputStyle}
                        />
                        </div>
                        <button onClick={() => saveShippingInfo(order.id)} style={smallSaveBtnStyle}>
                        Update Logistics
                        </button>
                    </div>
                </td>
            </tr>
          ))}
          </tbody>
        </table>
        
        {tasks.length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
            No orders found yet.
          </div>
        )}
      </div>
    </div>
  );
}

// STYLES
const cellStyle = { padding: '16px 20px', fontSize: '14px', verticalAlign: 'top' };

const actionBtnStyle = { 
  padding: '8px 12px', 
  backgroundColor: '#4f46e5', 
  color: 'white', 
  border: 'none', 
  borderRadius: '6px', 
  cursor: 'pointer',
  fontSize: '12px',
  fontWeight: '600'
};

const secondaryBtnStyle = {
  padding: '6px 10px',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '12px',
  fontWeight: '500'
};

const summaryCardStyle = {
  backgroundColor: '#fff',
  padding: '20px',
  borderRadius: '12px',
  border: '1px solid #e2e8f0',
  flex: '1',
  minWidth: '200px'
};

const inputStyle = { 
  width: '100%', 
  padding: '6px', 
  fontSize: '12px', 
  borderRadius: '4px', 
  border: '1px solid #cbd5e1',
  marginTop: '2px',
  boxSizing: 'border-box'
};

const smallSaveBtnStyle = {
  marginTop: '8px',
  padding: '6px 10px',
  backgroundColor: '#10b981',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '11px',
  fontWeight: '600'
};

const viewInvoiceBtn = { 
  fontSize: '11px', 
  color: '#4f46e5', 
  textDecoration: 'none', 
  fontWeight: '600', 
  padding: '6px 10px', 
  backgroundColor: '#eef2ff', 
  borderRadius: '4px',
  display: 'inline-flex',
  alignItems: 'center',
  border: '1px solid #c7d2fe',
  transition: 'all 0.2s'
};

const deleteBtnStyle = {
  padding: '4px 8px',
  backgroundColor: '#fee2e2',
  color: '#b91c1c',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '10px',
  marginLeft: '8px'
};