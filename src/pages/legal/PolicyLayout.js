import React from 'react';

const PolicyLayout = ({ title, children }) => (
  <div style={styles.page}>
    <div style={styles.container}>
      <h1 style={styles.title}>{title}</h1>
      <div style={styles.content}>{children}</div>
    </div>
  </div>
);

const styles = {
  page: { padding: '80px 20px', backgroundColor: '#f8fafc', minHeight: '100vh' },
  container: { maxWidth: '800px', margin: '0 auto', backgroundColor: '#fff', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' },
  title: { fontSize: '2rem', marginBottom: '24px', color: '#0f172a' },
  content: { lineHeight: '1.8', color: '#334155', fontSize: '1.1rem' }
};

export default PolicyLayout;