import React, { useState } from "react";

const ImageUpload = ({ onUpload }) => {
  const [imageUrl, setImageUrl] = useState("");

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        setImageUrl(result);
        onUpload(result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      {imageUrl && <img src={imageUrl} alt="Preview" width="100" />}
    </div>
  );
};

export default ImageUpload;
