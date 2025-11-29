
🛒 GuguMarket – 실시간 중고거래 플랫폼

Bootcamp Team Project · 팀장: 최동원

GuguMarket은 중고 상품 거래 과정을
실시간 1:1 채팅, 알림(Notification), 위치 기반 탐색
기능으로 강화한 웹 서비스입니다.

단순 CRUD를 넘어서 실제 서비스 흐름에 가까운 설계를 목표로 했습니다.


---

📌 핵심 기능 요약

🔍 상품 기능

상품 등록 / 수정 / 삭제

이미지 업로드 및 미리보기

상품 상세 조회

찜(Like) & 공유

신고하기

카테고리 / 지역 / 가격 필터링



---

💬 실시간 채팅 (WebSocket/STOMP)

실시간 1:1 채팅

메시지 읽음 처리

채팅방 목록 / 모달 전환

거래 페이지와 연동된 채팅 UI





---

🔔 알림 시스템

채팅 알림

댓글 알림

거래 알림(예약/완료/취소)

Admin 알림

WebSocket 기반 실시간 반영





---

👤 사용자 서비스

이메일 로그인

카카오 소셜 로그인

아이디/비밀번호 찾기

프로필 수정 (이미지 포함)

마이페이지

거래 내역 조회



---

📍 지도 기반 기능

구/동 단위 지역 필터링

지도에서 상품 조회

가격 범위 필터링



---

🧩 기술 스택

Frontend

React

React Router

Zustand

Axios / JWT Axios

TailwindCSS

Bootstrap Icons

WebSocket(STOMP) 클라이언트


Backend

Spring Boot 3.x

Spring Security + JWT

JPA / Querydsl

MySQL

WebSocket(STOMP)



---

👥 팀 구성 및 역할

🧭 팀장 / Full-cycle 개발 — 최동원

Backend

JWT 인증·인가 구조 전체 구현 (Spring Security)

실시간 WebSocket 채팅 서버 구현

Notification 서버 구조 설계 및 실제 알림 전송 구현

ChatController / ChatMessageHandler / AdminController / NotificationController / AuthController 개발

전반적 버그 트래킹 및 코드리뷰

Repository 정렬/조회 구조 정비(createdDateDesc 제거)


Frontend

채팅 UI 전체 구현 (ChatList, ChatModal, WebSocket 연동)

Notification 페이지 및 실시간 반영 처리

ChatRoom Modal / ChatList Page / Admin Page / LoginPage / Error Page 개발

공통 컴포넌트 구조화 & 라우팅 전체 구성

팀 작업 흐름 정리 및 전체 기능 테스트



---

Backend 팀원

이름	담당

김보민 MapController,	CategoryController, MainController
김동민	CommentController, PurchaseController
박성훈	ImageController, QnaController
김봉환	LikeController, ProductController, TransactionController
신의진	MypageController, UserController


Frontend 팀원

페이지	담당

MapPage / MainPage / MapPage	김보민
SignupPage	신의진
ProductDetail / Write / Edit / 댓글 UI	김봉환
Purchase / PurchaseComplete / TransactionDetail	김동민
MyPage	신의진
QnA List / Form	박성훈
Admin / UserDetail / Notification / Error / ChatList	최동원



---

🔧 최동원이 직접 해결한 주요 버그 내역 (Git 커밋 기반)

🔹 1. 실시간 채팅/알림 버그

채팅 첫 메시지에서 알림이 반영되지 않는 버그 해결

STOMP subscribe 타이밍/구조 재정리

WebSocket destination 매칭 문제 해결

unreadCount 실시간 반영 기능 안정화

채팅 말풍선 오른쪽 고정 버그 해결(senderId 로직 수정)


🔹 2. UI & 상태관리 버그

디테일 페이지 Like 토글 미반영 버그 → Zustand store 통합

채팅 모달 상태 초기화 문제 해결

이미지 로딩 플리커 현상 해결

fallback 이미지(No Image) 공통 적용


🔹 3. Repository 조회 구조 개선

createdDateDesc 정렬 하드코딩 제거

불필요한 정렬 강제 → 서비스 단에서 유연한 정렬 가능 구조로 변경



---

📁 프로젝트 구조

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


---

📅 개발 기간

2024.11.24 ~ 2024.12.08


---

🎯 팀장의 후기

짧은 기간이었지만 단순 CRUD 수준이 아니라
실시간 통신 · 인증/인가 · 알림 · 지도 기능까지
실서비스에 가까운 흐름을 구현하는 데 집중했습니다.

버그 해결과 구조 정리를 반복하면서
“작동하는 것”을 넘어서
안정적이고 예측 가능한 서비스 흐름을 만드는 데 가장 신경 썼습니다.
