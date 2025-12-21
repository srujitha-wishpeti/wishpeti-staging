import { useState } from 'react';
import { supabase } from '../services/supabaseClient';

export default function AvatarUpload({ url, onUpload }) {
  const [uploading, setUploading] = useState(false);

  async function uploadAvatar(event) {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) throw new Error('Select an image.');

      const file = event.target.files[0];
      const user = (await supabase.auth.getUser()).data.user;
      const fileExt = file.name.split('.').pop();
      const fileName = `avatar_${Math.random()}.${fileExt}`;
      // This structure: "USER_ID/FILENAME"
      const filePath = `${user.id}/${fileName}`; 

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get Public URL
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      onUpload(data.publicUrl);

    } catch (error) {
      alert(error.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <div style={{ 
        width: '100px', height: '100px', borderRadius: '50%', 
        backgroundColor: '#e5e7eb', margin: '0 auto 12px',
        overflow: 'hidden', border: '2px solid #4f46e5',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
        {url ? (
            <img src={url} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
            <span style={{ fontSize: '2rem' }}>👤</span>
        )}
        </div>

        {/* 🚀 This label acts as the button for the hidden input */}
        <label 
        htmlFor="avatar-upload" 
        style={{ 
            cursor: 'pointer', 
            fontSize: '0.9rem', 
            color: '#4f46e5', 
            fontWeight: '600',
            display: 'block' 
        }}
        >
        {uploading ? 'Uploading...' : 'Change Photo'}
        </label>

        <input
        id="avatar-upload"
        type="file"
        accept="image/*"
        onChange={uploadAvatar}
        disabled={uploading}
        /* 🚀 HIDE THE BROWSER DEFAULT BUTTON */
        style={{
            position: 'absolute',
            width: '1px',
            height: '1px',
            padding: '0',
            margin: '-1px',
            overflow: 'hidden',
            clip: 'rect(0,0,0,0)',
            border: '0'
        }}
        />
    </div>
  );
}