//
//
//  이미지 갤러리 컴포넌트(메인 이미지 + 썸네일)
//  사용자가 썸네일을 클릭하면 메인이미지가 바뀌는 기능을 제공

import { useState, useEffect } from "react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

//  이미지가 없을때 보여 줄 기본 이미지 (SVG)
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
  //  이미지 경로가 없거나 빈 문자열이면 기본 이미지 반환
  if (!imagePath || imagePath.trim() === "") {
    return NO_IMAGE_PLACEHOLDER;
  }

  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    //  이미 완전한 URL이면 (http:// 또는 https:// 로 시작 ) 그대로 반환
    return imagePath;
  }

  //  상대 경로를 절대 경로로 변환
  const baseUrl = API_BASE_URL.replace(/\/$/, "");
  //  API_BASE_URL 끝에 "/" 있다면 제거
  const cleanedPath = imagePath.replace(/^\//, "");
  //  imagePath 앞의 "/" 있다면 제거
  return `${baseUrl}/${cleanedPath}`;
  //  두 경로를 합쳐서 완전한 URL 생성
  //  ex) "http://localhost:8080" + "/" + "uploads/image.jpg"
};

const ProductImageGallery = ({ product }) => {
  const [selectedImage, setSelectedImage] = useState("");
  //  현재 선택된 (크게 보여지는) 이미지의 URL 을 저장하는 상태

  useEffect(() => {
    //  상품이 로드되면 메인 이미지를 선택된 이미지로 설정
    if (product?.mainImage) {
      //  product가 있고 mainImage가 있으면
      setSelectedImage(product.mainImage); //  메인 이미지를 선택된 이미지로 설정
    }
  }, [product]); //  product가 변경될 때 마다 실행

  const handleImageChange = (imageUrl) => {
    //  썸네일을 클릭했을 때 실행되는 함수
    setSelectedImage(imageUrl); //  클릭한 이미지를 메인 이미지로 변경
  };

  if (!product) return null; //  상품 정보가 없으면 아무것도 렌더링 하지않음

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
