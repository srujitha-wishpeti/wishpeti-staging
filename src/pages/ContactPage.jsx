export default function ContactUs() {
  return (
    <div style={{ padding: '80px 20px', textAlign: 'center' }}>
      <h2>Contact Us</h2>
      <p style={{ color: '#64748b', marginBottom: '32px' }}>Have a question? We're here to help.</p>
      <form style={{ maxWidth: '400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <input type="text" placeholder="Your Name" style={inputStyle} />
        <input type="email" placeholder="Your Email" style={inputStyle} />
        <textarea placeholder="How can we help?" rows="5" style={inputStyle}></textarea>
        <button type="submit" style={submitButtonStyle}>Send Message</button>
      </form>
    </div>
  );
}

const inputStyle = { padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '1rem' };
const submitButtonStyle = { padding: '12px', backgroundColor: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' };