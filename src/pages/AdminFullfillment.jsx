import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';

export default function AdminFulfillment() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const fetchFulfillmentTasks = async () => {
      // We pull the order AND the creator's private shipping info
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          profiles:creator_id (full_name, shipping_address, phone)
        `)
        .eq('gift_status', 'accepted'); // Only show what we need to buy

      if (!error) setTasks(data);
    };
    fetchFulfillmentTasks();
  }, []);

  return (
    <div style={{ padding: '40px' }}>
      <h2>📦 Fulfillment Queue</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
            <th>Item</th>
            <th>Creator</th>
            <th>Shipping Address</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map(order => (
            <tr key={order.id} style={{ borderBottom: '1px solid #eee' }}>
              <td>{order.item_name}</td>
              <td>{order.profiles?.full_name}</td>
              <td style={{ fontSize: '12px' }}>
                {order.profiles?.shipping_address}<br/>
                Phone: {order.profiles?.phone}
              </td>
              <td>
                <button onClick={() => markAsShipped(order.id)}>Mark Shipped</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}