import { defineConfig } from "vite"; // Vite 설정을 정의하는 defineConfig 함수 import
import react from "@vitejs/plugin-react"; // React 프로젝트를 위한 공식 Vite 플러그인 import
import path from "path"; // Node.js의 기본 모듈인 path를 import (경로 처리용)

export default defineConfig({ // defineConfig를 사용하여 Vite 설정을 정의하고 내보냄
    plugins: [react()], // React 컴포넌트 및 JSX 지원을 위한 React 플러그인 활성화
    resolve: {
        alias: {
            // @를 소스 디렉토리(src)의 절대 경로로 매핑하는 별칭(Alias) 설정
            // 이렇게 하면 import 경로에서 'src/' 대신 '@/'를 사용할 수 있어 경로 관리가 쉬워짐
            "@": path.resolve(__dirname, "./src"),
        },
    },
    server: {
        proxy: { // 개발 서버에서 프록시 설정을 정의 (CORS 문제 해결 및 API 요청 라우팅 목적)
            // '/api'로 시작하는 모든 요청에 대한 프록시 설정
            '/api': {
                target: 'http://localhost:8080', // 실제 백엔드 서버의 주소 (타겟)
                changeOrigin: true, // 호스트 헤더를 타겟 URL의 호스트로 변경 (CORS 정책 우회에 도움)
            },
            // '/uploads'로 시작하는 모든 요청에 대한 프록시 설정 (주로 이미지/파일 로드용)
            '/uploads': {
                target: 'http://localhost:8080', // 실제 파일이 저장된 백엔드 서버의 주소
                changeOrigin: true, // 호스트 헤더 변경
            }
        }
    }
});