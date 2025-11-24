//이미지 갤러리 (메인 이미지 + 썸네일)

import { useState, useEffect } from "react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const NO_IMAGE_PLACEHOLDER =
  "data:image/svg+xml;base64," +
  btoa(
    '<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">' +
      '<rect width="100%" height="100%" fill="#6B4F4F"/>' +
      '<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" ' +
      'font-family="sans-serif" font-size="16" fill="#FFFFFF">No Image</text>' +
      "</svg>"
  );

const getProductImageUrl = (imagePath) => {
  if (!imagePath || imagePath.trim() === "") {
    return NO_IMAGE_PLACEHOLDER;
  }

  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }

  const baseUrl = API_BASE_URL.replace(/\/$/, "");
  const cleanedPath = imagePath.replace(/^\//, "");
  return `${baseUrl}/${cleanedPath}`;
};

const ProductImageGallery = ({ product }) => {
  const [selectedImage, setSelectedImage] = useState("");

  useEffect(() => {
    if (product?.mainImage) {
      setSelectedImage(product.mainImage);
    }
  }, [product]);

  const handleImageChange = (imageUrl) => {
    setSelectedImage(imageUrl);
  };

  if (!product) return null;

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-lg">
        <img
          src={getProductImageUrl(selectedImage) || null}
          alt={product.title}
          className="w-full h-96 object-cover"
          onError={(e) => {
            if (e.target.dataset.hadError) return undefined;
            e.target.dataset.hadError = "true";
            e.target.src = NO_IMAGE_PLACEHOLDER;
          }}
        />
      </div>

      {/* Thumbnail Images */}
      <div className="grid grid-cols-4 gap-3">
        {/* 메인 이미지 썸네일 */}
        <div
          className={`bg-white rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all ${
            selectedImage === product.mainImage ? "ring-2 ring-primary" : ""
          }`}
          onClick={() => handleImageChange(product.mainImage)}
        >
          <img
            src={getProductImageUrl(product.mainImage) || null}
            alt="메인 이미지"
            className="w-full h-24 object-cover"
            onError={(e) => {
              if (e.target.dataset.hadError) return undefined;
              e.target.dataset.hadError = "true";
              e.target.src = NO_IMAGE_PLACEHOLDER;
            }}
          />
        </div>

        {/* 추가 이미지 썸네일 */}
        {product.productImages &&
          Array.isArray(product.productImages) &&
          product.productImages
            .filter((image) => {
              const url = typeof image === "string" ? image : image?.imageUrl;
              return url && url.trim() !== "";
            })
            .map((image, index) => {
              const imageUrl =
                typeof image === "string" ? image : image.imageUrl;
              const imageId = typeof image === "string" ? index : image.imageId;

              return (
                <div
                  key={imageId || index}
                  className={`bg-white rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all ${
                    selectedImage === imageUrl ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => handleImageChange(imageUrl)}
                >
                  <img
                    src={getProductImageUrl(imageUrl) || null}
                    alt={`상품 이미지 ${index + 1}`}
                    className="w-full h-24 object-cover"
                    onError={(e) => {
                      console.error(`이미지 ${index + 1} 로드 실패:`, imageUrl);
                      if (e.target.dataset.errorHandled) return undefined;
                      e.target.dataset.errorHandled = "true";
                      e.target.src = NO_IMAGE_PLACEHOLDER;
                    }}
                  />
                </div>
              );
            })}
      </div>
    </div>
  );
};

export default ProductImageGallery;
