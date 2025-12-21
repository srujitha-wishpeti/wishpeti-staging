import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { Camera } from 'lucide-react';

export default function BannerUpload({ url, onUpload }) {
  const [uploading, setUploading] = useState(false);

  const uploadBanner = async (event) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) throw new Error('Select an image.');

      const file = event.target.files[0];
      const user = (await supabase.auth.getUser()).data.user;
      const fileExt = file.name.split('.').pop();
      const fileName = `banner_${Math.random()}.${fileExt}`;
      // This structure: "USER_ID/FILENAME"
      const filePath = `${user.id}/${fileName}`; 

      const { error: uploadError } = await supabase.storage
        .from('banners')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('banners')
        .getPublicUrl(filePath);

      onUpload(publicUrl);
    } catch (error) {
      alert(error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{
      width: '100%',
      height: '160px',
      borderRadius: '12px',
      backgroundImage: `url(${url || 'https://images.unsplash.com/photo-1557683316-973673baf926'})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      position: 'relative',
      marginBottom: '20px',
      border: '1px solid #ddd',
      overflow: 'hidden'
    }}>
      <label style={{
        position: 'absolute', bottom: '10px', right: '10px',
        background: 'rgba(255,255,255,0.9)', padding: '6px 12px',
        borderRadius: '20px', cursor: 'pointer', fontSize: '12px', 
        fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px'
      }}>
        <Camera size={14} /> {uploading ? "..." : "Edit Cover"}
        <input type="file" style={{ display: 'none' }} hidden accept="image/*" onChange={uploadBanner} disabled={uploading} />
      </label>
    </div>
  );
}