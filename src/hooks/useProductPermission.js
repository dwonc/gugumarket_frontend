//
//
//  상품에 대한 사용자 권한을 계산하는 커스텀 훅

import { useMemo } from "react";

const useProductPermission = (isAuthenticated, user, product) => {
  // 판매자 여부
  const isSeller = useMemo(() => {
    if (!isAuthenticated || !user || !product || !product.seller) {
      // 다음중 하나라도 없으면 판매자가 아님
      //  로그인 여부, 사용자정보, 상품정보 , 판매자 정보
      return false;
    }

    const userNameMatch = user.userName === product.seller.userName;
    //  현재 로그인한 사용자의 userName 과 상품 판매자의 userName 이 같은지
    const userIdMatch = user.userId === product.seller.userId;
    //  현재 로그인한 사용자의 userId 와 상품 판매장의 userId 가 같은지

    return userNameMatch || userIdMatch;
    //  둘중 하나만 맞아도 True 반환
  }, [isAuthenticated, user, product]);
  //  의존성 배열 : 이 세 값중 하나라도 변경되면 isSeller를 다시 계산

  // 관리자 여부
  const isAdmin = useMemo(() => {
    return isAuthenticated && user?.role === "ADMIN";
    //  로그인 했고, 사용자 역할이 ADMIN 이면 true
    //  User?.role: user가 없으면 undefined 반환 (에러 없이 안전하게)
  }, [isAuthenticated, user]);
  //  의존성 배열 : 로그인 상태나 사용자 정보가 변경되면 재계산

  // 수정 가능 여부
  const canEdit = useMemo(() => {
    return isSeller || isAdmin;
    //  판매자 이거나 관리자면 수정 가능
  }, [isSeller, isAdmin]);
  //  의존성 배열 : isSeller나 isAdmin 이 변경되면 재게산

  return { isSeller, isAdmin, canEdit };
  //  계산된 권한 정보들을 객체로 반환
  //  판매자 여부 , 관리자 여부 ,수정 가능 여부
};

export default useProductPermission;
