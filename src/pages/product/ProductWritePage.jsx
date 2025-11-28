import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useProductStore } from "../../stores/productStore";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import Button from "../../components/common/Button";
import Loading from "../../components/common/Loading";
import ErrorMessage from "../../components/common/ErrorMessage";

//
//  상품 등록 페이지 컴포넌트
//
const ProductWritePage = () => {
  const navigate = useNavigate();

  const {
    categories, //  카테고리 목록
    uploading, //  업로드 중 상태
    loading, //  로딩 중 상태
    error, //  에러 상태
    fetchCategories, //  카테고리 가져오는 함수
    uploadImage, // 단일 이미지 업로드 함수
    uploadMultipleImages, // 여러 이미지 업로드 함수
    createProduct, // 상품 등록 함수
  } = useProductStore();

  // 폼 데이터
  const [formData, setFormData] = useState({
    categoryId: "", // 선택된 카테고리 ID
    title: "", //  상품 제목
    price: "", //  상품 가격
    content: "", //  상품  설명
    mainImage: "", // 대표 이미지 URL
    additionalImages: [], //  추가 이미지 URL 배열
    bankName: "", //  은행명
    accountNumber: "", //  계좌번호
    accountHolder: "", //  예금주
  });

  // 이미지 미리보기
  const [mainImagePreview, setMainImagePreview] = useState("");
  //  대표이미지 미리보기 URL 저장
  const [additionalImagePreviews, setAdditionalImagePreviews] = useState([]);
  //  추가 이미지 미리보기 URL 저장

  // 에러 메시지
  const [errorMsg, setErrorMsg] = useState("");

  // 카테고리 목록 불러오기
  useEffect(() => {
    fetchCategories(); //  서버에서 카테고리 목록을 가져옴
  }, [fetchCategories]); //  fetchCategories가 변경되면 다시 실행

  // 입력값 변경 핸들러
  const handleInputChange = (e) => {
    const { name, value } = e.target; // 어떤 필드인지(name)와 입력된 값(value)을 가져와요
    setFormData((prev) => ({
      ...prev, //  기존 데이터는 그대로 두고
      [name]: value, //  변경된 필드만 새 값으로 업데이트
    }));
  };

  // 메인 이미지 업로드
  const handleMainImageUpload = async (e) => {
    const file = e.target.files[0]; //  선택된 파일을 가져옴 (첫번쨰 파일만)
    if (!file) return; //  파일이 없으면 함수를 종료

    // 파일 크기 체크 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert("파일 크기는 10MB를 초과할 수 없습니다.");
      e.target.value = "";
      return;
    }

    try {
      const imageUrl = await uploadImage(file);
      //  서버에 이미지를 업로드하고 URL을 받아와요
      setFormData((prev) => ({ ...prev, mainImage: imageUrl }));
      //  formData에 이미지 URL을 저장
      setMainImagePreview(imageUrl);
      //  미리보기를 위해 이미지 URL을 별도로 저장
    } catch (error) {
      alert("업로드 실패: " + error.message);
      e.target.value = "";
    }
  };

  // 메인 이미지 제거
  const removeMainImage = () => {
    setFormData((prev) => ({ ...prev, mainImage: "" }));
    //  formData에서 이미지 URL을 빈 문자열로 변경
    setMainImagePreview("");
    //  파일 input도 초기화 ( 다시 같은 파일을 선택할 수 있도록)
    document.getElementById("mainImage").value = "";
  };

  // 추가 이미지 업로드
  const handleAdditionalImagesUpload = async (e) => {
    const files = Array.from(e.target.files);
    //  선택된 여러 파일들을 배열로 변환(FileList -> Array)
    if (files.length === 0) return;

    if (files.length > 5) {
      alert("최대 5개의 이미지만 업로드 가능합니다.");
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
      //  여러 이미지를 한번에 업로드하고 URL 배열을 받아옴
      setFormData((prev) => ({ ...prev, additionalImages: imageUrls }));
      //  formData에 이미지 URL 배열을 저장
      setAdditionalImagePreviews(imageUrls);
      //  미리보기를 위해 URL 배열을 별도로 저장
    } catch (error) {
      alert("업로드 실패: " + error.message);
      e.target.value = "";
    }
  };

  // 추가 이미지 제거
  const removeAdditionalImages = () => {
    setFormData((prev) => ({ ...prev, additionalImages: [] }));
    //  form 데이터에서 이미지 배열을 비움
    setAdditionalImagePreviews([]);
    //  미리보기 배열도 비우기
    document.getElementById("additionalImages").value = "";
    //  파일 input을 초기화
  };

  // 폼 제출
  const handleSubmit = async (e) => {
    e.preventDefault(); //  페이지가 새로고침 되는것을 막기
    setErrorMsg(""); //  기존 에러메시지 초기화

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
      const product = await createProduct(formData);
      //  createProduct 함수를 호출해서 서버에 상품 등록
      alert("✅ 상품이 등록되었습니다!");
      navigate(`/products/${product.productId}`);
      //  상품 등록후 등록 된 상품의 상세페이지로 이동
    } catch (error) {
      setErrorMsg(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              <i className="bi bi-box-seam text-primary mr-2"></i>
              상품 등록
            </h1>
            <p className="text-gray-600">판매하실 상품 정보를 입력해주세요.</p>
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
                {Array.isArray(categories) &&
                  categories.map((category) => (
                    <option
                      key={category.categoryId}
                      value={category.categoryId}
                    >
                      {category.categoryName}
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
                        document.getElementById("mainImage").click()
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
                        onError={(e) => {
                          console.error("이미지 로드 실패:", mainImagePreview); // ← 추가
                          if (!e.target.dataset.errorHandled) {
                            e.target.dataset.errorHandled = "true";
                            // 백엔드 URL 붙이기
                            if (!mainImagePreview.startsWith("http")) {
                              e.target.src = `http://localhost:8080${mainImagePreview}`;
                            }
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={removeMainImage}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg transition-all"
                      >
                        <i className="bi bi-x-lg"></i>
                      </button>
                      <p className="text-center text-sm text-green-600 mt-2">
                        <i className="bi bi-check-circle-fill mr-1"></i>업로드
                        완료
                      </p>
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
                        document.getElementById("additionalImages").click()
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
                    <div className="grid grid-cols-5 gap-2">
                      {additionalImagePreviews.map((url, index) => (
                        <div key={index} className="relative">
                          <img
                            src={url}
                            alt={`추가 이미지 ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                            onError={(e) => {
                              console.error(
                                `추가 이미지 ${index + 1} 로드 실패:`,
                                url
                              );
                              if (!e.target.dataset.errorHandled) {
                                e.target.dataset.errorHandled = "true";
                                // 상대 경로면 절대 경로로 변환
                                if (!url.startsWith("http")) {
                                  e.target.src = `http://localhost:8080${url}`;
                                }
                              }
                            }}
                          />
                          {/* ✅ 개별 삭제 버튼 추가 */}
                          <button
                            type="button"
                            onClick={() => {
                              const newPreviews =
                                additionalImagePreviews.filter(
                                  (_, i) => i !== index
                                );
                              const newImages =
                                formData.additionalImages.filter(
                                  (_, i) => i !== index
                                );
                              setAdditionalImagePreviews(newPreviews);
                              setFormData((prev) => ({
                                ...prev,
                                additionalImages: newImages,
                              }));
                            }}
                            className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-lg transition-all"
                          >
                            <i className="bi bi-x text-xs"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between items-center mt-4">
                      <p className="text-sm text-green-600">
                        <i className="bi bi-check-circle-fill mr-1"></i>
                        {additionalImagePreviews.length}개 업로드 완료
                      </p>
                      <button
                        type="button"
                        onClick={removeAdditionalImages}
                        className="text-sm text-red-500 hover:text-red-700"
                      >
                        <i className="bi bi-x-circle mr-1"></i>전체 삭제
                      </button>
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
                onClick={() => navigate(-1)}
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
                    등록 중...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle mr-2"></i>등록하기
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

export default ProductWritePage;
