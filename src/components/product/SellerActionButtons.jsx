//
//
//  판매자용 액션 버튼들 (상태 변경, 수정, 삭제)
//  상품을 등록한 판매자나 관리자만 볼 수 있는 관리 버튼들

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../common/Button";

const SellerActionButtons = ({
  //  Props로 정보를 받음
  product, //  상품 정보 객체
  isAdmin, //  관리자 여부
  isSeller, //  판매자 여부
  onStatusSave, //  상품 상태 변경 저장 핸들러
  onDelete, //  상품 삭제 핸들러
}) => {
  const navigate = useNavigate();
  const [selectedStatus, setSelectedStatus] = useState("");
  //  현재 선택된 상품 상태를 저장하는 로컬 상태
  //  SALE 판매중 / RESERVED 예약중 / SOLD_OUT 판매완료

  useEffect(() => {
    if (product?.status) {
      //  product가 있고 status가 있으면
      setSelectedStatus(product.status); //  현재 상품의 상태를 선택된 상태로 설정
    }
  }, [product]); //  product가 변경될 때마다 실행

  const handleStatusSave = async () => {
    if (selectedStatus === product.status) {
      //  선택된 상태가 현재 상태와 같으면 (변경된게 없다면)
      alert("변경된 상태가 없습니다.");
      return;
    }

    const statusText = {
      //  상태 코드를 사용자가 읽기 쉬운 텍스트로 변환
      //  객체의 [키] 표기법으로 동적으로 값을 가져옴
      SALE: "🟢 판매중",
      RESERVED: "🟡 예약중",
      SOLD_OUT: "🔴 판매완료",
    }[selectedStatus];

    if (!confirm(`상품 상태를 "${statusText}"(으)로 변경하시겠습니까?`)) {
      setSelectedStatus(product.status);
      return;
    }

    await onStatusSave(selectedStatus);
    //  부모 컴포넌트에서 전달받은 상태 변경 함수 실행
    //  서버에 상태 변경 요청
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "정말로 이 상품을 삭제하시겠습니까?\n삭제된 상품은 복구할 수 없습니다."
      )
    ) {
      return;
    }
    await onDelete(); //  확인을 누르면 부모 컴포넌트의 삭제 함수 실행
  };

  if (!product) return null;

  return (
    <>
      {/* 관리자 배지 */}
      {isAdmin && !isSeller && (
        <div className="mb-4 p-3 bg-yellow-50 border-2 border-yellow-300 rounded-lg text-center">
          <p className="text-yellow-700 font-bold">
            <i className="bi bi-shield-check mr-2"></i>
            관리자 권한으로 수정/삭제 가능
          </p>
        </div>
      )}

      {/* 상태 변경 UI */}
      <div className="mb-4 p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-gray-700 font-medium">상품 상태</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="border-2 border-primary rounded-lg px-4 py-2 font-medium"
          >
            <option value="SALE">🟢 판매중</option>
            <option value="RESERVED">🟡 예약중</option>
            <option value="SOLD_OUT">🔴 판매완료</option>
          </select>
        </div>
      </div>

      <Button
        onClick={handleStatusSave}
        variant="primary"
        className="w-full mb-3"
      >
        <i className="bi bi-check-circle text-xl mr-2"></i>
        상태 변경 저장
      </Button>

      {/* 구매 희망자 목록 (판매자만 표시) */}
      {isSeller &&
        product.interestedBuyers &&
        product.interestedBuyers.length > 0 && (
          <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200 mb-3">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center justify-between">
              <span>
                <i className="bi bi-people-fill mr-2"></i>구매 희망자 목록
              </span>
              <span className="text-sm text-blue-600">
                이 {product.interestedBuyers.length}명
              </span>
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {product.interestedBuyers.map((buyer) => (
                <div
                  key={buyer.userId}
                  className="flex items-center justify-between bg-white p-3 rounded-lg hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                      <i className="bi bi-person text-white"></i>
                    </div>
                    <div>
                      <p className="font-semibold">{buyer.nickname}</p>
                      {buyer.address && (
                        <p className="text-sm text-gray-500">
                          <i className="bi bi-geo-alt"></i>
                          {buyer.address}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      {/* 수정/삭제 버튼 */}
      <div className="flex gap-3">
        <Button
          onClick={() => navigate(`/products/${product.productId}/edit`)}
          variant="outline"
          className="flex-1"
        >
          <i className="bi bi-pencil mr-1"></i>수정
        </Button>
        <Button onClick={handleDelete} variant="danger" className="flex-1">
          <i className="bi bi-trash mr-1"></i>삭제
        </Button>
      </div>
    </>
  );
};

export default SellerActionButtons;
