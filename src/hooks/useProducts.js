import { useState, useEffect } from "react";
import { getProductList, getCategories, getDistricts } from "../api/mainApi";
import useLikeStore from "../stores/likeStore";

/**
 * 메인 페이지 상품 데이터를 관리하는 커스텀 훅
 */
const useProducts = (initialParams = {}) => {
  const [products, setProducts] = useState([]);
  //  상품 목록을 저장하는 상태 (배열)
  const [categories, setCategories] = useState([]);
  //  카테고리 목록을 저장하는 상태 (배열)
  const [districts, setDistricts] = useState([]);
  //  지역 목록을 저장하는  상태 (배열)
  const [pagination, setPagination] = useState({
    //  페이지네이션 정보를 저장하는 상태
    currentPage: 0, //  현재 페이지 번호 (0부터 시작)
    totalPages: 0, //  전체 페이지 수
    totalElements: 0, //  전체 상품 개수
    size: 12, //  한 페이지당 상품 개수
    first: true, //  첫 페이지인지 여부
    last: true, //  마지막 페이지인지 여부
  });
  const [loading, setLoading] = useState(true);
  //  데이터 로딩 중인지 여부를 저장하는 상태
  const [error, setError] = useState(null);
  //  에러 메시지를 저장하는 상태
  const [params, setParams] = useState({
    //  검색 / 필터 / 정렬 파라미터를 저장하는 상태
    page: 0, //  페이지 번호
    size: 12, //  페이지 크기
    sort: ["createdDate", "desc"], // 정렬기 기준 [필드명, 방향]
    ...initialParams, //  초기 파라미터 병함( 있다면 )
  });

  // 🔥 Zustand store에서 초기화 함수 가져오기
  const initializeLikes = useLikeStore((state) => state.initializeLikes);

  // 🔥 카테고리 목록 가져오기
  const fetchCategories = async () => {
    try {
      const response = await getCategories(true);
      //  서버에 카테고리 목록 요청(true는 활성화된 카테고리만)
      if (response.success) {
        setCategories(response.data || []);
      }
    } catch (err) {
      console.error("카테고리 조회 실패:", err);
    }
  };

  // 🔥 지역 목록 가져오기
  const fetchDistricts = async () => {
    try {
      const response = await getDistricts();
      //  서버에 지역 목록 요청
      if (response.success) {
        //  요청 성공 시
        setDistricts(response.districts || []); // districts 상태를 업데이트
      }
    } catch (err) {
      console.error("지역 목록 조회 실패:", err);
    }
  };

  // 🔥 상품 목록 가져오기
  const fetchProducts = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getProductList(params);
      //  서버에 상품 목록 요청 (현재 params 전달)
      //  params: {page:0 , size: 12, sort"[...], categoryId?:1 , keyword?:"검색어"}

      if (response.success) {
        //  요청 성공시
        setProducts(response.content || []); //  상품 목록 업데이트

        // 🔥 찜 상태 초기화 (Zustand에 저장)
        initializeLikes(response.content || []);

        setPagination({
          //  페이지네이션 정보 업데이트
          currentPage: response.currentPage, //  현재 페이지 (에: 0)
          totalPages: response.totalPages, //  전체 페이지 (예: 0)
          totalElements: response.totalElements, // 전체 상품 수 (예: 120개)
          size: response.size, //  페이지 크기 (예: 12개)
          first: response.first, //  첫 페이지 여부 (true / false)
          last: response.last, //  마지막 페이지 여부 (true / false)
        });
      } else {
        setError(response.message || "데이터를 불러오는데 실패했습니다.");
      }
    } catch (err) {
      setError(err.message || "데이터를 불러오는데 실패했습니다.");
      console.error("상품 데이터 조회 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 최초 로드: 카테고리 + 지역 목록 조회
  useEffect(() => {
    fetchCategories(); //  카테고리 목록 가져오기
    fetchDistricts(); //  지역 목록 가져오기
  }, []); //  빈 배열 :  마운트시 1회만 실행

  // params 변경 시 상품 재조회
  useEffect(() => {
    //  params가 변경될 때마다 실행
    fetchProducts(); //  새로운 params로 상품 목록 다시 가져오기
  }, [params]); //  params가 변경될 때 마다 실행

  // 페이지 변경
  const changePage = (newPage) => {
    setParams((prev) => ({ ...prev, page: newPage }));
  };

  // 카테고리 필터 변경
  const changeCategory = (categoryId) => {
    setParams((prev) => ({
      ...prev, //  기존 params 복사
      categoryId: categoryId || undefined, // categoryId 설정 (null 이면 undefined로)
      page: 0, //  필터 변경 시 첫 페이지로
    }));
  };

  // 검색어 변경
  const changeKeyword = (keyword) => {
    setParams((prev) => ({
      ...prev, // 기존 params 복사
      keyword: keyword || undefined, //  keyword 설정 ( 빈 문자열이면 undefined로)
      page: 0, //  필터 변경시 첫 페이지로
    }));
  };

  // 🔥 지역 필터 변경
  const changeDistrict = (district) => {
    setParams((prev) => ({
      ...prev, //  기존 params 복사
      district: district || undefined, //  district 설정
      page: 0, //  필터 변경시 첫 페이지로
    }));
  };

  // 🔥 정렬 변경
  const changeSort = (sortField, sortDirection) => {
    setParams((prev) => ({
      ...prev, //  기존 params 복사
      sort: [sortField, sortDirection], //  sort 배열 설정
      page: 0, //  정렬 변경 시 첫 페이지로
    }));
  };

  // 필터 초기화
  const resetFilters = () => {
    setParams({ page: 0, size: 12, sort: ["createdDate", "desc"] });
    //  첫페이지 , 12개씩   , 최신순
    // categoryId, keyword, district는 제거됨
  };

  return {
    //  반환값( 컴포넌트에서 사용할 데이터와 함수들 )

    //  데이터
    products, //  상품 목록 배열
    categories, // 카테고리 목록 배열
    districts, // 지역 목록 배열
    pagination, //  페이지네이션 정보 객체
    loading, // 로딩 상태
    error, // 에러 상태
    params, //  현재 검색/필터 파라미터

    //  함수들
    changePage, //  페이지 변경함수
    changeCategory, //  카테고리 변경 함수
    changeKeyword, // 검색어 변경 함수
    changeDistrict, // 지역 변경 함수
    changeSort, // 정렬 변경 함수
    resetFilters, //  필터 초기화 함수
    refetch: fetchProducts, // 수동으로 데이터 다시 가져오기 함수
  };
};

export default useProducts;
