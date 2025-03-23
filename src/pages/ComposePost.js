import React, { useState } from 'react';
import '../styles/ComposePost.css';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, auth } from './firebase';
import { toast } from 'react-toastify';

function ComposePost({ isActive, onClose, onPost }) {
  const [content, setContent] = useState('');
  const [mediaFiles, setMediaFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleContentChange = (e) => {
    setContent(e.target.value);
  };

  const handleMediaChange = (e) => {
    const files = Array.from(e.target.files);
    setMediaFiles([...mediaFiles, ...files]);
    
    // Create preview URLs for the selected files
    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls([...previewUrls, ...newPreviewUrls]);
  };

  const removeMedia = (index) => {
    const updatedFiles = [...mediaFiles];
    const updatedPreviews = [...previewUrls];
    
    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(previewUrls[index]);
    
    updatedFiles.splice(index, 1);
    updatedPreviews.splice(index, 1);
    
    setMediaFiles(updatedFiles);
    setPreviewUrls(updatedPreviews);
  };

  const handleSubmit = async () => {
    if (!content.trim() && mediaFiles.length === 0) {
      toast.error("Please add some content to your post");
      return;
    }

    setIsLoading(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        toast.error("You must be logged in to post");
        return;
      }

      // Upload any media files and get their URLs
      const mediaUrls = [];
      for (const file of mediaFiles) {
        const storageRef = ref(storage, `posts/${currentUser.uid}/${Date.now()}-${file.name}`);
        const uploadResult = await uploadBytes(storageRef, file);
        const downloadUrl = await getDownloadURL(uploadResult.ref);
        mediaUrls.push(downloadUrl);
      }

      // Create the post document in Firestore
      const postData = {
        userId: currentUser.uid,
        username: currentUser.displayName || "Anonymous User",
        userEmail: currentUser.email,
        content: content,
        media: mediaUrls,
        timestamp: serverTimestamp(),
        likes: 0,
        comments: []
      };

      const docRef = await addDoc(collection(db, "posts"), postData);
      
      // Call the onPost callback with the content and media
      onPost(content, mediaUrls);
      
      // Reset the form
      setContent('');
      setMediaFiles([]);
      setPreviewUrls([]);
      
      toast.success("Post created successfully!");
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Failed to create post: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isActive) return null;

  return (
    <div className="compose-overlay">
      <div className="compose-container">
        <div className="compose-header">
          <h2>Create Post</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <textarea
          placeholder="What's on your mind?"
          value={content}
          onChange={handleContentChange}
          className="compose-textarea"
        />
        
        {previewUrls.length > 0 && (
          <div className="media-previews">
            {previewUrls.map((url, index) => (
              <div key={index} className="media-preview-container">
                <img src={url} alt={`Preview ${index}`} className="media-preview" />
                <button 
                  className="remove-media-button" 
                  onClick={() => removeMedia(index)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        
        <div className="compose-actions">
          <label className="media-button">
            Add Media
            <input
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleMediaChange}
              style={{ display: 'none' }}
            />
          </label>
          
          <button 
            className="post-button" 
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? "Posting..." : "Post"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ComposePost;