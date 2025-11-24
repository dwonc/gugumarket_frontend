import { useMemo } from "react";

const useProductPermission = (isAuthenticated, user, product) => {
  // 판매자 여부
  const isSeller = useMemo(() => {
    if (!isAuthenticated || !user || !product || !product.seller) {
      return false;
    }

    const userNameMatch = user.userName === product.seller.userName;
    const userIdMatch = user.userId === product.seller.userId;

    return userNameMatch || userIdMatch;
  }, [isAuthenticated, user, product]);

  // 관리자 여부
  const isAdmin = useMemo(() => {
    return isAuthenticated && user?.role === "ADMIN";
  }, [isAuthenticated, user]);

  // 수정 가능 여부
  const canEdit = useMemo(() => {
    return isSeller || isAdmin;
  }, [isSeller, isAdmin]);

  return { isSeller, isAdmin, canEdit };
};

export default useProductPermission;
