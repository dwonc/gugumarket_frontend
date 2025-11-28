import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProductStore } from "../../stores/productStore";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import Button from "../../components/common/Button";
import Loading from "../../components/common/Loading";
import ErrorMessage from "../../components/common/ErrorMessage";

//
// 상품 수정 페이지
//

const ProductEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    product, //  현재 상품 데이터 객체
    categories, //  카테고리 목록 배열
    uploading, //  이미지 업로드 중 여부(true,false)
    loading, //  로딩 상태(true, false)
    error, //에러 메시지(문자열 or NULL)
    fetchProduct, //  상품 조회 함수: (id) => Promise
    fetchCategories, //  카테고리 목록 조회 함수: () => Promise
    uploadImage, //  단일 이미지 업로드: (file) => Promise<url>
    uploadMultipleImages, //  다중 이미지 업로드: (files[]) =>  Proimse<urls[]>
    updateProduct, //  상품 수정 : (id, formData) => Promise
  } = useProductStore();

  // 폼 데이터
  const [formData, setFormData] = useState({
    categoryId: "", //  카테고리 ID (문자열)
    title: "", // 상품명
    price: "", //  가격
    content: "", // 상품 설명
    mainImage: "", // 메인 이미지 URL
    additionalImages: [], //  추가 이미지 URL 이미지 배열
    bankName: "", //  은행명
    accountNumber: "", //  계좌번호
    accountHolder: "", //  예금주
  });
  //  초기값 : 모든 필드가 비어있는 상태
  //  setFormData: 이 상태를 업데이트하는 함수

  // 이미지 미리보기
  const [mainImagePreview, setMainImagePreview] = useState("");
  const [additionalImagePreviews, setAdditionalImagePreviews] = useState([]);

  // 에러 메시지
  const [errorMsg, setErrorMsg] = useState("");

  // 데이터 로딩 상태
  const [dataLoaded, setDataLoaded] = useState(false);

  // 카테고리 목록과 상품 정보 불러오기
  useEffect(() => {
    const loadData = async () => {
      // 내부 비동기 함수 정의 -> useEffect 자체는 async 함수가 될수 없어서 내부 선언
      try {
        await fetchCategories(); //  카테고리 목록 불러오기

        const data = await fetchProduct(id); // 상품 정보 불러오기

        const productData = data.product; //  서버 응답에서 상품 데이터 추출

        // 폼 데이터 설정
        setFormData({
          categoryId: String(productData.categoryId || ""),
          //categoryId를 문자열로 변환 (select 옵션은 문자열이어야 함)
          title: productData.title || "", //  상품명
          price: productData.price || "", //  가격
          content: productData.content || "", //  상품 설명
          mainImage: productData.mainImage || "", //  메인 이미지 URL
          //  추가 이미지 URL 배열
          additionalImages:
            productData.productImages?.map((img) => img.imageUrl) || [],
          //  배열에서 이미지URL만 추출 Optional Chaning (?.)사용 : productImages가 없으면 빈배열)
          bankName: productData.bankName || "", //  은행명
          accountNumber: productData.accountNumber || "", //  계좌번호
          accountHolder: productData.accountHolder || "", //  예금주
        });

        // 이미지 미리보기 설정
        setMainImagePreview(productData.mainImage || "");
        setAdditionalImagePreviews(
          productData.productImages?.map((img) => img.imageUrl) || []
        );

        setDataLoaded(true);
      } catch (err) {
        console.error("데이터 로딩 실패:", err);
        setErrorMsg("상품 정보를 불러오는데 실패했습니다.");
        setDataLoaded(true); // 에러여도 로딩 완료 처리
      }
    };

    if (id) {
      loadData();
    }
  }, [id, fetchCategories, fetchProduct]);

  // 입력값 변경 핸들러
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 메인 이미지 업로드
  const handleMainImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 파일 크기 체크 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert("파일 크기는 10MB를 초과할 수 없습니다.");
      e.target.value = "";
      return;
    }

    try {
      const imageUrl = await uploadImage(file);
      //  uploadImage 함수 호출(Zustand Store의 함수 사용)
      //  내부적으로 POST /api/products/upload/image 요청
      //  formData로 파일 전송
      //  서버에서 업로드된 이미지 URL 반환
      //  예시: "https://example.com/uploads/image123.jpg"

      //메인 이미지 교체
      setFormData((prev) => ({ ...prev, mainImage: imageUrl }));
      setMainImagePreview(imageUrl);
    } catch (error) {
      alert("업로드 실패: " + error.message);
      e.target.value = "";
    }
  };

  // 메인 이미지 제거
  const removeMainImage = () => {
    setFormData((prev) => ({ ...prev, mainImage: "" })); //  formData에서 메인 이미지 제거
    setMainImagePreview("");
    const input = document.getElementById("mainImage"); //  DOM에서 file input 요소 가져오기
    if (input) input.value = "";
    //  input이 존재하면 값 초기화  -> 이렇게 해야 같은 파일을 다시 선택할 수 있음
  };

  // 추가 이미지 업로드
  const handleAdditionalImagesUpload = async (e) => {
    const files = Array.from(e.target.files); //  선택된 파일들을 배열로 변환
    //e.target.files는 FileList객체 (배열아님)
    //Array.from() 으로 진짜 배열로 전환
    if (files.length === 0) return;

    const currentCount = additionalImagePreviews.length; //  현재 업로드된 이미지 개수
    const newCount = files.length; //새로 추가하려는 이미지 개수
    const totalCount = currentCount + newCount; // 전체 합계

    if (totalCount > 5) {
      alert(
        `최대5개의 이미지만 업로드 가능합니다.\n 현재: ${currentCount}개, 추가: ${newCount}개, 합계: ${totalCount}개`
      );
      e.target.value = "";
      return;
    }

    // 파일 크기 체크
    for (let file of files) {
      if (file.size > 10 * 1024 * 1024) {
        alert("파일 크기는 10MB를 초과할 수 없습니다: " + file.name);
        e.target.value = "";
        return;
      }
    }

    try {
      const imageUrls = await uploadMultipleImages(files);
      //  다중 이미지 업로드 함수 호출
      //  POST -> /api/produts/upload/images
      //  서버에서 업로드된 이미지 URL 배열 반환
      //  예시 ["rurl1.jpg", "url2.jpg", "url3.jpg"]

      const updatedImages = [...additionalImagePreviews, ...imageUrls];
      //  스프레드 연산자로 두 배열 합치기

      setFormData((prev) => ({
        ...prev,
        additionalImages: updatedImages,
      }));
      setAdditionalImagePreviews(updatedImages);

      e.target.value = "";

      alert(`✅ ${imageUrls.length}개의 이미지가 추가되었습니다!`);
    } catch (error) {
      console.error("❌ 업로드 실패:", error);
      alert("업로드 실패: " + error.message);
      e.target.value = "";
    }
  };

  // 추가 이미지 제거
  const removeAdditionalImages = () => {
    setFormData((prev) => ({ ...prev, additionalImages: [] })); //  formData에서 추가 이미지 배열 비우기
    setAdditionalImagePreviews([]);
    const input = document.getElementById("additionalImages");
    if (input) input.value = "";
  };

  // 폼 제출
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    // 유효성 검사
    if (!formData.categoryId) {
      setErrorMsg("카테고리를 선택해주세요.");
      return;
    }

    if (!formData.title.trim()) {
      setErrorMsg("상품명을 입력해주세요.");
      return;
    }

    if (!formData.price || formData.price <= 0) {
      setErrorMsg("판매가격을 입력해주세요.");
      return;
    }

    if (!formData.mainImage) {
      setErrorMsg("대표 이미지를 업로드해주세요.");
      return;
    }

    if (!formData.content.trim()) {
      setErrorMsg("상품 설명을 입력해주세요.");
      return;
    }

    if (!formData.bankName) {
      setErrorMsg("은행명을 선택해주세요.");
      return;
    }

    if (!formData.accountNumber.trim()) {
      setErrorMsg("계좌번호를 입력해주세요.");
      return;
    }

    if (!formData.accountHolder.trim()) {
      setErrorMsg("예금주를 입력해주세요.");
      return;
    }

    try {
      const updatedProduct = await updateProduct(id, formData);
      alert("✅ 상품이 수정되었습니다!");
      navigate(`/products/${id}`);
    } catch (error) {
      setErrorMsg(error.message);
    }
  };

  // 로딩 중
  if (!dataLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loading text="상품 정보를 불러오는 중..." />
      </div>
    );
  }

  // 에러 발생
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <ErrorMessage message={error} type="error" />
          <Button onClick={() => navigate(-1)} className="mt-4">
            <i className="bi bi-arrow-left mr-2"></i>돌아가기
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              <i className="bi bi-box-seam text-primary mr-2"></i>
              상품 수정
            </h1>
            <p className="text-gray-600">상품 정보를 수정해주세요.</p>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="mb-6">
              <ErrorMessage
                message={errorMsg}
                type="error"
                onClose={() => setErrorMsg("")}
              />
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category */}
            <div>
              <label
                htmlFor="categoryId"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                카테고리 <span className="text-red-500">*</span>
              </label>
              <select
                id="categoryId"
                name="categoryId"
                value={formData.categoryId}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary transition-colors"
              >
                <option value="">카테고리를 선택하세요</option>
                {categories.map((category) => (
                  <option key={category.categoryId} value={category.categoryId}>
                    {category.categoryName || category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                상품명 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                maxLength="100"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary transition-colors"
                placeholder="상품명을 입력하세요 (최대 100자)"
              />
            </div>

            {/* Price */}
            <div>
              <label
                htmlFor="price"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                판매가격 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="1000"
                  className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary transition-colors"
                  placeholder="0"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                  원
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                <i className="bi bi-info-circle mr-1"></i>
                가격은 1,000원 단위로 입력해주세요.
              </p>
            </div>

            {/* Main Image */}
            <div>
              <label
                htmlFor="mainImage"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                대표 이미지 <span className="text-red-500">*</span>
              </label>
              <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-primary transition-colors">
                {!mainImagePreview ? (
                  <div className="text-center">
                    <i className="bi bi-cloud-upload text-5xl text-gray-400 mb-3"></i>
                    <p className="text-gray-600 mb-2">
                      클릭하여 이미지를 업로드하세요
                    </p>
                    <p className="text-sm text-gray-500">
                      JPG, PNG, GIF, WEBP 파일 (최대 10MB)
                    </p>
                    <input
                      type="file"
                      id="mainImage"
                      accept="image/*"
                      className="hidden"
                      onChange={handleMainImageUpload}
                      disabled={uploading}
                    />
                    <Button
                      type="button"
                      onClick={() =>
                        document.getElementById("mainImage")?.click()
                      }
                      variant="secondary"
                      className="mt-4"
                      disabled={uploading}
                    >
                      파일 선택
                    </Button>
                  </div>
                ) : (
                  <div className="mt-4">
                    <div className="relative">
                      <img
                        src={mainImagePreview}
                        alt="미리보기"
                        className="max-h-64 mx-auto rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={removeMainImage}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg transition-all"
                      >
                        <i className="bi bi-x-lg"></i>
                      </button>
                      <div className="flex justify-center gap-3 mt-4">
                        <p className="text-sm text-green-600">
                          <i className="bi bi-check-circle-fill mr-1"></i>
                          현재 이미지
                        </p>
                        <button
                          type="button"
                          onClick={() =>
                            document.getElementById("mainImage")?.click()
                          }
                          className="text-sm text-blue-600 hover:text-blue-700"
                        >
                          <i className="bi bi-arrow-repeat mr-1"></i>이미지 변경
                        </button>
                      </div>
                      <input
                        type="file"
                        id="mainImage"
                        accept="image/*"
                        className="hidden"
                        onChange={handleMainImageUpload}
                        disabled={uploading}
                      />
                    </div>
                  </div>
                )}

                {/* Upload Progress */}
                {uploading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-white bg-opacity-90">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
                    <p className="text-primary mt-2">업로드 중...</p>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Images */}
            <div>
              <label
                htmlFor="additionalImages"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                추가 이미지 (최대 5개)
                {additionalImagePreviews.length > 0 && (
                  <span className="text-sm text-gray-500 ml-2">
                    현재 {additionalImagePreviews.length}/5개
                  </span>
                )}
              </label>
              <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-primary transition-colors">
                {additionalImagePreviews.length === 0 ? (
                  <div className="text-center">
                    <i className="bi bi-images text-5xl text-gray-400 mb-3"></i>
                    <p className="text-gray-600 mb-2">
                      여러 이미지를 선택하세요
                    </p>
                    <p className="text-sm text-gray-500">
                      최대 5개까지 업로드 가능
                    </p>
                    <input
                      type="file"
                      id="additionalImages"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleAdditionalImagesUpload}
                      disabled={uploading}
                    />
                    <Button
                      type="button"
                      onClick={() =>
                        document.getElementById("additionalImages")?.click()
                      }
                      variant="secondary"
                      className="mt-4"
                      disabled={uploading}
                    >
                      파일 선택
                    </Button>
                  </div>
                ) : (
                  <div>
                    {/* 이미지 그리드 */}
                    <div
                      className={`grid gap-2 ${
                        additionalImagePreviews.length === 1
                          ? "grid-cols-1"
                          : additionalImagePreviews.length === 2
                          ? "grid-cols-2"
                          : additionalImagePreviews.length === 3
                          ? "grid-cols-3"
                          : additionalImagePreviews.length === 4
                          ? "grid-cols-4"
                          : "grid-cols-5"
                      }`}
                    >
                      {additionalImagePreviews.map((url, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={url}
                            alt={`추가 이미지 ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                            onError={(e) => {
                              console.error(
                                `이미지 ${index + 1} 로드 실패:`,
                                url
                              );
                              e.target.src =
                                "https://via.placeholder.com/150?text=Error";
                            }}
                          />
                          {/* 개별 삭제 버튼 */}
                          <button
                            type="button"
                            onClick={() => {
                              const newImages = additionalImagePreviews.filter(
                                (_, i) => i !== index
                              );
                              setAdditionalImagePreviews(newImages);
                              setFormData((prev) => ({
                                ...prev,
                                additionalImages: newImages,
                              }));
                            }}
                            className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <i className="bi bi-x text-sm"></i>
                          </button>
                          {/* 이미지 번호 */}
                          <div className="absolute bottom-1 left-1 bg-black/50 text-white text-xs px-2 py-0.5 rounded">
                            {index + 1}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* 버튼들 */}
                    <div className="flex justify-between items-center mt-4">
                      <p className="text-sm text-green-600">
                        <i className="bi bi-check-circle-fill mr-1"></i>
                        {additionalImagePreviews.length}개 이미지
                      </p>
                      <div className="flex gap-3">
                        {/* ✅ 추가 버튼 (5개 미만일 때만) */}
                        {additionalImagePreviews.length < 5 && (
                          <button
                            type="button"
                            onClick={() =>
                              document
                                .getElementById("additionalImages")
                                ?.click()
                            }
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                          >
                            <i className="bi bi-plus-circle mr-1"></i>
                            이미지 추가 ({5 - additionalImagePreviews.length}개
                            더 가능)
                          </button>
                        )}
                        {/* 전체 삭제 버튼 */}
                        <button
                          type="button"
                          onClick={removeAdditionalImages}
                          className="text-sm text-red-500 hover:text-red-700"
                        >
                          <i className="bi bi-x-circle mr-1"></i>전체 삭제
                        </button>
                      </div>
                    </div>

                    {/* ✅ 숨겨진 input */}
                    <input
                      type="file"
                      id="additionalImages"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleAdditionalImagesUpload}
                      disabled={uploading}
                    />
                  </div>
                )}

                {/* Upload Progress */}
                {uploading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-white bg-opacity-90 rounded-lg">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
                    <p className="text-primary mt-2">업로드 중...</p>
                  </div>
                )}
              </div>
            </div>

            {/* Content */}
            <div>
              <label
                htmlFor="content"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                상품 설명 <span className="text-red-500">*</span>
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                required
                rows="8"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary transition-colors resize-none"
                placeholder="상품에 대한 자세한 설명을 입력해주세요.&#10;&#10;- 상품 상태&#10;- 구매 시기&#10;- 하자 유무 등"
              ></textarea>
            </div>

            {/* Bank Info Section */}
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                <i className="bi bi-bank text-primary mr-2"></i>계좌 정보
              </h3>

              {/* Bank Name */}
              <div>
                <label
                  htmlFor="bankName"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  은행명 <span className="text-red-500">*</span>
                </label>
                <select
                  id="bankName"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary transition-colors"
                >
                  <option value="">은행을 선택하세요</option>
                  <option value="KB국민은행">KB국민은행</option>
                  <option value="신한은행">신한은행</option>
                  <option value="우리은행">우리은행</option>
                  <option value="하나은행">하나은행</option>
                  <option value="NH농협은행">NH농협은행</option>
                  <option value="IBK기업은행">IBK기업은행</option>
                  <option value="SC제일은행">SC제일은행</option>
                  <option value="한국씨티은행">한국씨티은행</option>
                  <option value="KDB산업은행">KDB산업은행</option>
                  <option value="SH수협은행">SH수협은행</option>
                  <option value="새마을금고">새마을금고</option>
                  <option value="신협">신협</option>
                  <option value="우체국">우체국</option>
                  <option value="카카오뱅크">카카오뱅크</option>
                  <option value="케이뱅크">케이뱅크</option>
                  <option value="토스뱅크">토스뱅크</option>
                  <option value="기타">기타</option>
                </select>
              </div>

              {/* Account Number */}
              <div>
                <label
                  htmlFor="accountNumber"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  계좌번호 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="accountNumber"
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary transition-colors"
                  placeholder="- 없이 숫자만 입력"
                />
              </div>

              {/* Account Holder */}
              <div>
                <label
                  htmlFor="accountHolder"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  예금주 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="accountHolder"
                  name="accountHolder"
                  value={formData.accountHolder}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary transition-colors"
                  placeholder="예금주명을 입력하세요"
                />
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                onClick={() => navigate(`/products/${id}`)}
                variant="secondary"
                className="flex-1"
              >
                <i className="bi bi-x-circle mr-2"></i>취소
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="flex-1"
                disabled={loading || uploading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    수정 중...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle mr-2"></i>수정하기
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProductEditPage;
