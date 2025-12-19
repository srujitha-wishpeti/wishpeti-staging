import React from 'react';

export default function PolicyPage({ title, content }) {
  return (
    <div style={{ padding: '100px 20px', maxWidth: '800px', margin: '0 auto', lineHeight: '1.6' }}>
      <h1>{title}</h1>
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  );
}