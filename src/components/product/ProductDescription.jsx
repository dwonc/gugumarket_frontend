//상품 설명 섹션

const ProductDescription = ({ product }) => {
  if (!product) return null;

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
