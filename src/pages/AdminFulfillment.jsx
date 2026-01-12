import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { getCurrencyPreference, formatPrice } from '../utils/currency';

export default function AdminFulfillment() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [costs, setCosts] = useState({});
  const [trackingNumbers, setTrackingNumbers] = useState({});
  const [isUploading, setIsUploading] = useState(null);
  const [currencyPref, setCurrencyPref] = useState(getCurrencyPreference());

  useEffect(() => {
    const handleCurrencyChange = () => setCurrencyPref(getCurrencyPreference());
    window.addEventListener('currencyChanged', handleCurrencyChange);
    fetchOrders();
    return () => window.removeEventListener('currencyChanged', handleCurrencyChange);
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data: orders, error: orderError } = await supabase
  .from('orders')
  .select(`
    *,
    creator_profiles!creator_id ( 
      full_name,
      address_line1,
      address_line2,
      city,
      state,
      postal_code,
      country
    )
  `)
  .order('created_at', { ascending: false });

      if (orderError) throw orderError;

      const itemIds = [...new Set(orders.map(o => o.item_id).filter(Boolean))];

      let itemsMap = {};
      if (itemIds.length > 0) {
        const { data: items, error: itemError } = await supabase
          .from('wishlist_items')
          .select('id, title, url, quantity, notes, store')
          .in('id', itemIds);

        if (itemError) throw itemError;

        itemsMap = items.reduce((acc, item) => {
          acc[item.id] = item;
          return acc;
        }, {});
      }

      const combinedData = orders.map(order => ({
        ...order,
        item_details: itemsMap[order.item_id] || null
      }));

      setTasks(combinedData);
    } catch (err) {
      console.error("Fetch error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const getItemTitle = (order) => order?.item_details?.title || 'Unknown Item';
  const getMerchantUrl = (order) => order?.item_details?.url || '#';
  const getStoreName = (order) => order?.item_details?.store || 'Merchant';
  const getItemQty = (order) => order?.item_details?.quantity || 1;
  const getItemNotes = (order) => order?.item_details?.notes || '';

  const saveShippingInfo = async (orderId) => {
    const cost = costs[orderId];
    const tracking = trackingNumbers[orderId];

    const { error } = await supabase
        .from('orders')
        .update({ 
          actual_purchase_cost: cost ? parseFloat(cost) : null,
          tracking_number: tracking || null,
          gift_status: tracking ? 'shipped' : 'accepted' 
        })
        .eq('id', orderId);

    if (error) alert("Error: " + error.message);
    else {
        alert("Shipping info updated!");
        fetchOrders(); 
    }
  };

  const uploadInvoice = async (orderId, file) => {
    if (!file) return;
    setIsUploading(orderId);
    try {
        const fileExt = file.name.split('.').pop();
        const filePath = `invoices/${orderId}-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('order-invoices').upload(filePath, file);
        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage.from('order-invoices').getPublicUrl(filePath);
        const { error: updateError } = await supabase.from('orders').update({ invoice_url: publicUrl }).eq('id', orderId);
        if (updateError) throw updateError;

        alert("Invoice linked successfully!");
        fetchOrders(); 
    } catch (error) {
        alert("Upload failed.");
    } finally {
        setIsUploading(null);
    }
  };

  const updateInvoiceUrl = async (orderId, url) => {
    const { error } = await supabase.from('orders').update({ invoice_url: url }).eq('id', orderId);
    if (error) alert(error.message);
    else fetchOrders();
  };

  const getStatusStyle = (status) => {
    const base = { padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' };
    switch (status?.toLowerCase()) {
      case 'pending': return { ...base, backgroundColor: '#fef3c7', color: '#92400e' };
      case 'paid': return { ...base, backgroundColor: '#dcfce7', color: '#166534' };
      case 'accepted': return { ...base, backgroundColor: '#dbeafe', color: '#1e40af' };
      case 'shipped': return { ...base, backgroundColor: '#f3e8ff', color: '#6b21a8' };
      default: return { ...base, backgroundColor: '#f1f5f9', color: '#475569' };
    }
  };

  const PLATFORM_FEE_PERCENT = 0.05;
  const stats = tasks.reduce((acc, order) => {
    if (order.payment_status === 'paid') {
        const rawAmount = Number(order.total_amount || 0);
        const rateUsed = order.exchange_rate_at_payment || currencyPref.rate;
        const amountInINR = order.currency_code !== 'INR' ? (rawAmount / rateUsed) : rawAmount;
        acc.totalRevenue += amountInINR;
        if (order.is_surprise || order.is_gift_fund) {
            acc.platformEarnings += amountInINR * PLATFORM_FEE_PERCENT;
        } else {
            acc.totalSpend += Number(order.actual_purchase_cost || 0);
        }
    }
    return acc;
  }, { totalRevenue: 0, totalSpend: 0 });

  const netProfit = stats.totalRevenue - stats.totalSpend;

  if (loading) return <div style={{ padding: '40px' }}>Loading Admin Data...</div>;

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', maxWidth: '1400px', margin: '0 auto' }}>
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
              <th style={cellStyle}>Merchant Link</th>
              <th style={cellStyle}>Fan Paid</th>
              <th style={cellStyle}>Invoice</th>
              <th style={cellStyle}>Logistics</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map(order => {
              const isRefunded = order.payment_status === 'refunded';
              return (
              <tr key={order.id} style={{ 
                borderBottom: '1px solid #f1f5f9',
                backgroundColor: isRefunded ? '#fcfafa' : 'transparent',
                opacity: isRefunded ? 0.7 : 1
              }}>
                  <td style={cellStyle}>
                      <div style={{ fontWeight: '600', color: isRefunded ? '#94a3b8' : '#1e293b' }}>{getItemTitle(order)}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>Qty: {getItemQty(order)}</div>
                      {getItemNotes(order) && (
                          <div style={{ fontSize: '11px', color: '#b91c1c', marginTop: '4px', background: '#fef2f2', padding: '4px' }}>
                              Note: {getItemNotes(order)}
                          </div>
                      )}
                      <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>ID: {order.id.slice(0, 8)}</div>
                  </td>
                  
                  <td style={cellStyle}>
                      {/* Prioritize title, fallback to ID if both missing */}
                      <div style={{ fontWeight: '600', color: isRefunded ? '#94a3b8' : '#1e293b' }}>
                          {getItemTitle(order)}
                      </div>
                      
                      {isRefunded && (
                          <div style={{
                              marginTop: '8px',
                              padding: '4px 8px',
                              backgroundColor: '#fee2e2',
                              color: '#b91c1c',
                              fontSize: '11px',
                              fontWeight: 'bold',
                              borderRadius: '4px',
                              border: '1px solid #f87171',
                              textAlign: 'center'
                          }}>
                              ⚠️ PAYMENT REFUNDED - DO NOT SHIP
                          </div>
                      )}
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Qty: {getItemQty(order)}</div>
                  </td>

                  <td style={cellStyle}>{order.creator_profiles?.full_name || 'Name Missing'}</td>

                  <td style={cellStyle}>
                      {order.creator_profiles ? (
                          <div style={{ fontSize: '12px', color: '#475569', lineHeight: '1.4' }}>
                              <strong>{order.creator_profiles.address_line1}</strong><br/>
                              {order.creator_profiles.city}, {order.creator_profiles.state} {order.creator_profiles.postal_code}
                          </div>
                      ) : <span style={{ color: '#ef4444' }}>Address Missing</span>}
                  </td>

                  <td style={cellStyle}>
                      <button 
                        onClick={() => window.open(getMerchantUrl(order), '_blank')} 
                        style={{...actionBtnStyle, backgroundColor: isRefunded ? '#94a3b8' : '#4f46e5', cursor: isRefunded ? 'not-allowed' : 'pointer'}}
                        disabled={isRefunded}
                      >
                          Buy on {getStoreName(order)}
                      </button>
                  </td>

                  <td style={cellStyle}>
                      <div style={{ fontWeight: 'bold' }}>{formatPrice(order.total_amount, order.currency_code, 1)}</div>
                  </td>

                  <td style={cellStyle}>
                      {order.invoice_url ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <a href={order.invoice_url} target="_blank" rel="noreferrer" style={viewInvoiceBtn}>View ↗</a>
                              <button onClick={() => updateInvoiceUrl(order.id, null)} style={deleteBtnStyle}>Remove</button>
                          </div>
                      ) : (
                          <input type="file" disabled={isRefunded} onChange={(e) => uploadInvoice(order.id, e.target.files[0])} style={{ fontSize: '10px' }} />
                      )}
                  </td>

                  <td style={cellStyle}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                          <input type="number" placeholder="Cost (₹)" disabled={isRefunded} value={costs[order.id] || order.actual_purchase_cost || ''} 
                                 onChange={(e) => setCosts({...costs, [order.id]: e.target.value})} style={inputStyle} />
                          <input type="text" placeholder="Tracking ID" disabled={isRefunded} value={trackingNumbers[order.id] || order.tracking_number || ''}
                                 onChange={(e) => setTrackingNumbers({...trackingNumbers, [order.id]: e.target.value})} style={inputStyle} />
                          <button 
                            onClick={() => saveShippingInfo(order.id)} 
                            style={{...smallSaveBtnStyle, backgroundColor: isRefunded ? '#cbd5e1' : '#10b981'}}
                            disabled={isRefunded}
                          >Update</button>
                      </div>
                  </td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const cellStyle = { padding: '16px 20px', fontSize: '14px', verticalAlign: 'top' };
const actionBtnStyle = { padding: '8px 12px', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' };
const summaryCardStyle = { backgroundColor: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', flex: '1', minWidth: '200px' };
const inputStyle = { width: '100%', padding: '6px', fontSize: '12px', borderRadius: '4px', border: '1px solid #cbd5e1', boxSizing: 'border-box' };
const smallSaveBtnStyle = { padding: '6px 10px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: '600' };
const viewInvoiceBtn = { fontSize: '11px', color: '#4f46e5', textDecoration: 'none', fontWeight: '600', padding: '4px 8px', backgroundColor: '#eef2ff', borderRadius: '4px', border: '1px solid #c7d2fe', textAlign: 'center' };
const deleteBtnStyle = { padding: '4px 8px', backgroundColor: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '10px' };
const refundBadgeStyle = { marginTop: '8px', padding: '4px 6px', backgroundColor: '#fee2e2', color: '#b91c1c', fontSize: '10px', fontWeight: 'bold', borderRadius: '4px', border: '1px solid #f87171', textAlign: 'center' };