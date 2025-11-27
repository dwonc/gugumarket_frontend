// pages/MapPage.jsx
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import axios from "../../api/axios";

const MapPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [radiusFilter, setRadiusFilter] = useState(null);
  const [priceFilter, setPriceFilter] = useState(null);

  // 🎨 상태별 스타일 설정
  const getStatusStyle = (status) => {
    switch (status) {
      case "AVAILABLE":
        return {
          color: "#FF6B6B", // 빨간색
          bgColor: "#FF6B6B",
          badge: null,
          opacity: 1,
          filter: "none",
        };
      case "RESERVED":
        return {
          color: "#FFA500", // 주황색
          bgColor: "#FFA500",
          badge: "예약중",
          badgeBg: "#FFA500",
          opacity: 0.9,
          filter: "none",
        };
      case "SOLD":
        return {
          color: "#9CA3AF", // 회색
          bgColor: "#9CA3AF",
          badge: "판매완료",
          badgeBg: "#6B7280",
          opacity: 0.6,
          filter: "grayscale(100%)",
        };
      default:
        return {
          color: "#FF6B6B",
          bgColor: "#FF6B6B",
          badge: null,
          opacity: 1,
          filter: "none",
        };
    }
  };

  // 상품 목록 가져오기
  const loadProducts = async () => {
    try {
      let url = "http://localhost:8080/api/products/map";
      if (priceFilter) {
        url += `?maxPrice=${priceFilter}`;
      }

      const response = await axios.get(url);

      if (response.data.success) {
        setProducts(response.data.products);
        setFilteredProducts(response.data.products);
        setLoading(false);
      }
    } catch (error) {
      console.error("❌ 상품 로드 실패:", error);
      alert("상품을 불러오는데 실패했습니다: " + error.message);
      setLoading(false);
    }
  };

  // 두 좌표 사이의 거리 계산 (km)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // 반경 필터 적용
  const applyRadiusFilter = (radius) => {
    setRadiusFilter(radius);

    if (!radius || !userLocation) {
      setFilteredProducts(products);
      return;
    }

    const filtered = products.filter((product) => {
      if (!product.latitude || !product.longitude) return false;

      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        product.latitude,
        product.longitude
      );

      return distance <= radius;
    });
    setFilteredProducts(filtered);
  };

  // 가격 필터 적용
  const applyPriceFilter = (maxPrice) => {
    setPriceFilter(maxPrice);
  };

  // 가격 필터 변경 시 상품 재조회
  useEffect(() => {
    loadProducts();
  }, [priceFilter]);

  // 현재 위치 가져오기
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      alert("이 브라우저는 위치 서비스를 지원하지 않습니다.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setUserLocation(location);

        if (map) {
          const moveLatLon = new window.kakao.maps.LatLng(
            location.latitude,
            location.longitude
          );
          map.setCenter(moveLatLon);
          map.setLevel(5);

          new window.kakao.maps.Marker({
            position: moveLatLon,
            map: map,
            image: new window.kakao.maps.MarkerImage(
              "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png",
              new window.kakao.maps.Size(24, 35)
            ),
          });
        }
      },
      (error) => {
        console.error("❌ 위치 가져오기 실패:", error);
        let errorMessage = "";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage =
              "위치 권한이 거부되었습니다.\n브라우저 설정에서 위치 권한을 허용해주세요.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "위치 정보를 사용할 수 없습니다.";
            break;
          case error.TIMEOUT:
            errorMessage = "위치 요청 시간이 초과되었습니다.";
            break;
          default:
            errorMessage = "알 수 없는 오류가 발생했습니다.";
        }
        alert(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  };

  // 좌표 업데이트
  const updateAllCoordinates = async () => {
    if (
      !window.confirm(
        "모든 상품의 좌표를 업데이트하시겠습니까?\n(시간이 조금 걸릴 수 있습니다)"
      )
    )
      return;

    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:8080/api/products/map/update-coordinates",
        {},
        { withCredentials: true }
      );

      if (response.data.success) {
        alert("✅ 좌표 업데이트 완료!\n페이지를 새로고침합니다.");
        window.location.reload();
      }
    } catch (error) {
      console.error("❌ 업데이트 실패:", error);
      alert(
        "업데이트 실패: " + (error.response?.data?.message || error.message)
      );
      setLoading(false);
    }
  };

  // 지도 초기화
  const initMap = () => {
    if (!window.kakao || !window.kakao.maps) {
      console.error("❌ Kakao Maps SDK가 로드되지 않았습니다.");
      return;
    }

    const container = document.getElementById("map");
    const options = {
      center: new window.kakao.maps.LatLng(37.5665, 126.978),
      level: 8,
    };

    const kakaoMap = new window.kakao.maps.Map(container, options);
    setMap(kakaoMap);

    loadProducts();
  };

  useEffect(() => {
    if (window.kakao && window.kakao.maps) {
      initMap();
    }
  }, []);

  // 🔥 알 마커 생성 함수
  const createMarkers = useCallback(() => {
    if (!map || filteredProducts.length === 0) {
      return;
    }

    // 기존 마커 제거
    markers.forEach((marker) => {
      if (marker && marker.setMap) {
        marker.setMap(null);
      }
    });

    const newMarkers = [];
    const bounds = new window.kakao.maps.LatLngBounds();

    filteredProducts.forEach((product) => {
      if (product.latitude && product.longitude) {
        const position = new window.kakao.maps.LatLng(
          product.latitude,
          product.longitude
        );

        // 🎨 상태별 스타일 가져오기
        const style = getStatusStyle(product.status);
        const isHovered = hoveredProduct?.productId === product.productId;

        // 🥚 알 마커 HTML
        const markerContent = document.createElement("div");
        markerContent.className = "egg-marker";
        markerContent.style.opacity = style.opacity;
        markerContent.innerHTML = `
          <div style="
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
            cursor: ${product.status === "SOLD" ? "not-allowed" : "pointer"};
          ">
            ${
              style.badge
                ? `
              <div style="
                position: absolute;
                top: -5px;
                left: 50%;
                transform: translateX(-50%);
                background: ${style.badgeBg};
                color: white;
                padding: 2px 8px;
                border-radius: 10px;
                font-weight: bold;
                font-size: 10px;
                white-space: nowrap;
                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                z-index: 10;
              ">
                ${style.badge}
              </div>
            `
                : ""
            }
            
            <img 
              src="${
                isHovered ? "/images/egg-cracked.png" : "/images/egg-normal.png"
              }" 
              alt="egg" 
              style="
                width: 50px;
                height: 50px;
                object-fit: contain;
                filter: ${style.filter} drop-shadow(0 2px 4px rgba(0,0,0,0.2));
                transition: transform 0.3s ease;
                transform: ${isHovered ? "scale(1.2)" : "scale(1)"};
              "
            />
            
            <div style="
              background: ${style.bgColor};
              color: white;
              padding: 4px 8px;
              border-radius: 12px;
              font-weight: bold;
              font-size: 12px;
              margin-top: -5px;
              box-shadow: 0 2px 6px rgba(0,0,0,0.2);
              white-space: nowrap;
            ">
              ${(product.price / 10000).toFixed(0)}만원
            </div>
          </div>
        `;

        const customOverlay = new window.kakao.maps.CustomOverlay({
          position: position,
          content: markerContent,
          yAnchor: 1,
        });

        customOverlay.setMap(map);

        // 마우스 호버 이벤트 (판매완료는 제외)
        if (product.status !== "SOLD") {
          markerContent.addEventListener("mouseenter", () => {
            setHoveredProduct(product);
          });

          markerContent.addEventListener("mouseleave", () => {
            setTimeout(() => {
              setHoveredProduct(null);
            }, 200);
          });
        }

        // 클릭 시 상세 모달
        markerContent.addEventListener("click", () => {
          setSelectedProduct(product);
          map.setCenter(position);
          map.setLevel(4);
        });

        newMarkers.push(customOverlay);
        bounds.extend(position);
      }
    });

    setMarkers(newMarkers);

    if (newMarkers.length > 0 && !radiusFilter) {
      map.setBounds(bounds);
    }
  }, [map, filteredProducts, radiusFilter, hoveredProduct]);

  // 마커 생성 트리거
  useEffect(() => {
    createMarkers();
  }, [createMarkers]);

  const handleProductClick = (productId) => {
    navigate(`/products/${productId}`);
  };

  // 🎨 상태 배지 렌더링 함수
  const renderStatusBadge = (status) => {
    const style = getStatusStyle(status);
    if (!style.badge) return null;

    return (
      <div
        className="absolute top-2 right-2 px-3 py-1 rounded-full text-white font-bold text-xs shadow-lg"
        style={{ backgroundColor: style.badgeBg }}
      >
        {style.badge}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <div className="flex-1 relative">
        <div
          id="map"
          className="w-full h-full"
          style={{ minHeight: "calc(100vh - 200px)" }}
        ></div>

        {/* 왼쪽 필터 패널 */}
        <div className="absolute top-4 left-4 bg-white rounded-2xl shadow-xl p-4 z-20">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <span className="text-2xl mr-2">🥚</span>
            GUGU Market
          </h2>

          {/* 반경 필터 */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center">
              <i className="bi bi-geo-alt-fill text-primary mr-2"></i>
              반경 필터
            </h3>
            <div className="flex flex-col space-y-2">
              <button
                onClick={() => applyRadiusFilter(null)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  radiusFilter === null
                    ? "bg-primary text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                전체
              </button>
              <button
                onClick={() => applyRadiusFilter(1)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  radiusFilter === 1
                    ? "bg-primary text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                1km
              </button>
              <button
                onClick={() => applyRadiusFilter(5)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  radiusFilter === 5
                    ? "bg-primary text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                5km
              </button>
              <button
                onClick={() => applyRadiusFilter(10)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  radiusFilter === 10
                    ? "bg-primary text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                10km
              </button>
            </div>
          </div>

          {/* 가격 필터 */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center">
              <i className="bi bi-cash-coin text-yellow-500 mr-2"></i>
              가격 필터
            </h3>
            <div className="flex flex-col space-y-2">
              <button
                onClick={() => applyPriceFilter(null)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  priceFilter === null
                    ? "bg-yellow-500 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                전체
              </button>
              <button
                onClick={() => applyPriceFilter(10000)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  priceFilter === 10000
                    ? "bg-yellow-500 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                1만원 이하
              </button>
              <button
                onClick={() => applyPriceFilter(30000)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  priceFilter === 30000
                    ? "bg-yellow-500 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                3만원 이하
              </button>
              <button
                onClick={() => applyPriceFilter(50000)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  priceFilter === 50000
                    ? "bg-yellow-500 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                5만원 이하
              </button>
              <button
                onClick={() => applyPriceFilter(100000)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  priceFilter === 100000
                    ? "bg-yellow-500 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                10만원 이하
              </button>
            </div>
          </div>

          {/* 내 위치 버튼 */}
          <button
            onClick={getUserLocation}
            className="w-full px-4 py-2 rounded-lg font-medium bg-blue-500 text-white hover:bg-blue-600 transition-all flex items-center justify-center space-x-1 mb-3"
          >
            <i className="bi bi-crosshair"></i>
            <span>내 위치</span>
          </button>

          {/* 좌표 업데이트 버튼 */}
          <button
            onClick={updateAllCoordinates}
            className="w-full px-4 py-2 rounded-lg font-medium bg-yellow-500 text-white hover:bg-yellow-600 transition-all text-sm"
          >
            🔄 좌표 업데이트
          </button>
        </div>

        {/* 로딩 */}
        {loading && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white px-6 py-3 rounded-full shadow-lg z-20">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
              <span className="text-gray-700 font-medium">
                상품을 불러오는 중...
              </span>
            </div>
          </div>
        )}

        {/* 🆕 호버 시 미리보기 카드 */}
        {hoveredProduct && (
          <div
            className="absolute z-30 pointer-events-none"
            style={{
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
            }}
            onMouseEnter={() => setHoveredProduct(hoveredProduct)}
            onMouseLeave={() => setHoveredProduct(null)}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl overflow-hidden w-72 pointer-events-auto animate-fadeIn relative"
              onClick={() => handleProductClick(hoveredProduct.productId)}
              style={{
                opacity: getStatusStyle(hoveredProduct.status).opacity,
              }}
            >
              {/* 🎨 상태 배지 */}
              {renderStatusBadge(hoveredProduct.status)}

              {/* 상품 이미지 */}
              <div
                className="h-40 bg-cover bg-center cursor-pointer"
                style={{
                  backgroundImage: `url(${
                    hoveredProduct.thumbnailImageUrl || "/images/no-image.png"
                  })`,
                  filter: getStatusStyle(hoveredProduct.status).filter,
                }}
              ></div>

              {/* 상품 정보 */}
              <div className="p-4">
                <h3 className="text-base font-bold text-gray-800 mb-2 line-clamp-2 cursor-pointer hover:text-primary">
                  {hoveredProduct.productName}
                </h3>

                <p
                  className="text-xl font-bold mb-2"
                  style={{
                    color: getStatusStyle(hoveredProduct.status).color,
                  }}
                >
                  {hoveredProduct.price?.toLocaleString()}원
                </p>

                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <i className="bi bi-geo-alt mr-1"></i>
                  <span className="line-clamp-1">
                    {hoveredProduct.sellerAddress || "위치 정보 없음"}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>
                    <i className="bi bi-eye mr-1"></i>
                    조회 {hoveredProduct.viewCount || 0}
                  </span>
                  <span>
                    <i className="bi bi-heart mr-1"></i>찜{" "}
                    {hoveredProduct.likeCount || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 클릭 시 상세 모달 */}
        {selectedProduct && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setSelectedProduct(null)}
            ></div>

            <div className="fixed left-1/2 bottom-8 transform -translate-x-1/2 z-50 w-11/12 max-w-md">
              <div
                className="bg-white rounded-2xl shadow-2xl overflow-hidden animate-slideUp relative"
                onClick={(e) => e.stopPropagation()}
                style={{
                  opacity: getStatusStyle(selectedProduct.status).opacity,
                }}
              >
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors z-10"
                >
                  <i className="bi bi-x-lg text-gray-700"></i>
                </button>

                {/* 🎨 상태 배지 */}
                {renderStatusBadge(selectedProduct.status)}

                <div
                  className="h-48 bg-cover bg-center cursor-pointer"
                  style={{
                    backgroundImage: `url(${
                      selectedProduct.thumbnailImageUrl ||
                      "/images/no-image.png"
                    })`,
                    filter: getStatusStyle(selectedProduct.status).filter,
                  }}
                  onClick={() => handleProductClick(selectedProduct.productId)}
                ></div>

                <div className="p-4">
                  <h3
                    className="text-xl font-bold text-gray-800 mb-2 cursor-pointer hover:text-primary line-clamp-2"
                    onClick={() =>
                      handleProductClick(selectedProduct.productId)
                    }
                  >
                    {selectedProduct.productName}
                  </h3>

                  <p
                    className="text-2xl font-bold mb-2"
                    style={{
                      color: getStatusStyle(selectedProduct.status).color,
                    }}
                  >
                    {selectedProduct.price?.toLocaleString()}원
                  </p>

                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <i className="bi bi-geo-alt mr-1"></i>
                    <span className="line-clamp-1">
                      {selectedProduct.sellerAddress || "위치 정보 없음"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                    <span>
                      <i className="bi bi-eye mr-1"></i>
                      조회 {selectedProduct.viewCount || 0}
                    </span>
                    <span>
                      <i className="bi bi-heart mr-1"></i>찜{" "}
                      {selectedProduct.likeCount || 0}
                    </span>
                  </div>

                  <button
                    onClick={() =>
                      handleProductClick(selectedProduct.productId)
                    }
                    className={`w-full py-3 rounded-lg font-bold transition-all duration-300 shadow-md hover:shadow-lg ${
                      selectedProduct.status === "SOLD"
                        ? "bg-gray-400 text-white cursor-not-allowed"
                        : "bg-primary text-white hover:bg-secondary"
                    }`}
                    disabled={selectedProduct.status === "SOLD"}
                  >
                    {selectedProduct.status === "SOLD"
                      ? "판매완료된 상품입니다"
                      : "상품 보러가기"}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* 상품 개수 표시 */}
        <div className="absolute top-4 right-4 bg-white px-4 py-2 rounded-full shadow-lg z-20">
          <span className="text-gray-700 font-medium">
            <i className="bi bi-pin-map-fill text-primary mr-2"></i>
            {filteredProducts.filter((p) => p.latitude && p.longitude).length}
            개의 상품
          </span>
        </div>
      </div>

      <Footer />

      <style jsx>{`
        @keyframes slideUp {
          from {
            transform: translate(-50%, 100%);
            opacity: 0;
          }
          to {
            transform: translate(-50%, 0);
            opacity: 1;
          }
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default MapPage;
