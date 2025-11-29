🛒 GuguMarket

중고 거래 + 채팅 + 알림 기반 통합 마켓 플랫폼
(부트캠프 팀 프로젝트 · 팀장: 최동원)

📌 프로젝트 개요

GuguMarket은 사용자 간 중고 상품 거래를 위한 플랫폼으로,
실시간 1:1 채팅, 위치 기반 필터링, 알림 시스템,
상품 CRUD, 신고/공유/댓글, 마이페이지, Admin 기능
등 실제 서비스 수준의 기능을 구현한 프로젝트입니다.

⚙️ 주요 기능
🔍 상품 기능

상품 필터링 (구 단위 / 가격순 / 최신순)

상품 등록 / 수정 / 삭제

상품 상세 조회

상품 이미지 업로드

상품 좋아요/공유하기

신고하기 기능

💬 커뮤니케이션 기능

실시간 1:1 채팅 (WebSocket / STOMP)

채팅방별 읽음 처리

댓글 기능 + 댓글 알림

Q&A 작성 및 관리

🔔 알림 시스템

댓글 알림

거래 관련 알림

Admin 관련 알림

👤 사용자 기능

소셜 로그인 (완료)

아이디 / 비밀번호 찾기 (완료)

마이페이지

거래 내역 조회

사용자 상세 조회 (Admin)

📍 지도 기반 기능

지역 기반 상품 필터링

지도 렌더링 및 위치 기반 탐색

🧩 기술 스택
Frontend

React, React Router

Zustand (상태관리)

Axios

Tailwind / Bootstrap Icons

WebSocket / STOMP 클라이언트

Backend

Spring Boot 3.x

Spring Security (JWT)

JPA / Querydsl

MySQL

Redis (세션/알림 또는 캐시 용도)

WebSocket(STOMP)

👥 팀원 역할 분담
🧭 팀장 · Backend/Frontend Full-cycle — 최동원

Spring Security & JWT 인증 전체 구현

ChatController, AdminController, AuthController, NotificationController 구현

실시간 1:1 채팅 Front + WebSocket 연동

ChatRoom Modal(List) / Notification Page / Admin Page / UserDetail Page / Error Page

프로젝트 구조 총괄 · 코드리뷰 · 이슈 해결

Backend
이름	담당 컨트롤러
김보민	CategoryController, MainController
김동민	CommentController, PurchaseController
박성훈	ImageController, QnaController
김봉환	LikeController, ProductController, TransactionController
신의진	MypageController, UserController

Frontend
페이지	담당자
MainPage	김보민
MpaPage 김보민
SignupPage	신의진
ProductDetailPage	김봉환
ProductWritePage	김봉환
ProductEditPage	김봉환
Comment	김봉환
PurchasePage	김동민
PurchaseCompletePage	김동민
TransactionDetailPage	김동민
MyPage	신의진
NotificationPage	최동원
QnaListPage	박성훈
QnaFormPage	박성훈
AdminPage	최동원
UserDetailPage	최동원
ErrorPage	최동원
ChatlistPage 최동원

📌 프로젝트 구조도
gugumarket/
 ├── backend/
 │    ├── controller/
 │    ├── service/
 │    ├── repository/
 │    └── config/
 └── frontend/
      ├── pages/
      ├── components/
      ├── hooks/
      └── api/

📅 개발 기간

2025.11.24 ~ 2024.12.08 (예시, 너희 일정 넣으면 됨)

📌 팀장으로서 남기는 말

본 프로젝트는 실무 수준의 설계와
실제 거래 중심 서비스의 흐름을 모두 구현한 팀 프로젝트입니다.
설계, 코드 리뷰, WebSocket 연동, 인증·인가, Admin 시스템까지
전체 구조를 총괄하며 팀원들과 함께 완성했습니다.
