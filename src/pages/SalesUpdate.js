import React, { useState, useRef } from 'react';
import '../styles/SalesUpdate.css'; 
function SalesUpdate({ onClose }) {
  const [postContent, setPostContent] = useState('');
  const [previews, setPreviews] = useState([]);
  const fileInputRef = useRef(null);

  const handleImageAttach = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const newPreviews = [...previews];

      Array.from(e.target.files).forEach(file => {
        if (file.type.match('image.*')) {
          const reader = new FileReader();
          
          reader.onload = (e) => {
            newPreviews.push(e.target.result);
            setPreviews([...newPreviews]);
          };
          
          reader.readAsDataURL(file);
        }
      });
    }
  };

  const handleRemovePreview = (index) => {
    const newPreviews = [...previews];
    newPreviews.splice(index, 1);
    setPreviews(newPreviews);
  };

  const handlePost = () => {
    if (postContent.trim() || previews.length > 0) {
      console.log("Posted:", postContent, previews);
      setPostContent('');
      setPreviews([]);
      onClose(); 
    }
  };

  return (
    <div className="sales-modal-overlay">
      <div className="sales-modal">
        <h2>Sales Update</h2>
        <textarea 
          className="compose-textarea" 
          placeholder="Enter product details..."
          value={postContent}
          onChange={(e) => setPostContent(e.target.value)}
        ></textarea>
        
        <div className="preview-container">
          {previews.map((src, index) => (
            <div className="preview-item" key={index}>
              <img src={src} alt="Preview" />
              <div 
                className="remove-preview" 
                onClick={() => handleRemovePreview(index)}
              >×</div>
            </div>
          ))}
        </div>

        <div className="compose-footer">
          <button onClick={handleImageAttach}>Attach Image</button>
          <input 
            type="file" 
            className="file-input" 
            accept="image/*" 
            multiple 
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
          <button className="post-button" onClick={handlePost}>Post</button>
          <button className="close-button" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

export default SalesUpdate;
