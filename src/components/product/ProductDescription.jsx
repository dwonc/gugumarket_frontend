//
//
//  상품  상세 페이지의 설명(본문) 섹션

const ProductDescription = ({ product }) => {
  //  Prps로 상품 정보를 받아옴
  if (!product) return null;
  //  상품 정보가 없으면 아무것도 렌더링 하지않음
  return (
    <div className="mt-8 bg-white rounded-2xl shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">상품 설명</h2>
      <div className="prose max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
        {product.content}
      </div>
    </div>
  );
};

export default ProductDescription;
