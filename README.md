## 프로젝트 개요  
재고 관리 시스템 API를 NestJS, TypeORM, MySQL, Docker, Docker Compose를 활용해 개발한 과제입니다.  
회원가입, 로그인(JWT), 제품 등록, 유통기한 포함 재고 입출고, 재고 조회, 입출고 히스토리 조회 기능을 포함하며, 동시성 문제를 고려한 트랜잭션 처리를 구현하였습니다.

---

## 기술 스택  
- Node.js (NestJS)  
- TypeORM  
- MySQL  
- Docker, Docker Compose  
- Swagger (API 문서 및 테스트)

---

## 프로젝트 구조

```
denode-kimjaeyoung/
├── src/
│ ├── auth/ # 인증 관련 기능 (회원가입, 로그인, JWT)
│ ├── products/ # 제품 등록 및 관리
│ ├── inventory/ # 재고 입고, 출고, 재고 조회 기능
│ ├── history/ # 입출고 히스토리 조회 기능
│ ├── common/ # 공통 모듈, 필터, 예외 처리 등
│ ├── main.ts # 애플리케이션 진입점
│ └── app.module.ts # 모듈 통합 및 설정
├── test/ # 단위 및 통합 테스트 코드
├── .env.example # 환경변수 예시 파일
├── Dockerfile # NestJS 애플리케이션 Docker 이미지 빌드 설정
├── docker-compose.yml # MySQL 및 NestJS 컨테이너 구성
├── package.json # 프로젝트 의존성 및 스크립트
├── README.md # 프로젝트 설명서 (본 파일)
└── tsconfig.json # TypeScript 컴파일러 설정
```
---

## 실행 방법

### 1. 저장소 클론  
```bash
git clone <레포지토리_주소>
cd denode-kimjaeyoung
```

2. 환경 변수 설정
.env 파일을 프로젝트 루트에 생성 후, 데이터베이스 연결 정보 등 환경 변수를 설정하세요.

3. Docker 컨테이너 실행
```bash
docker-compose up --build
```
MySQL과 NestJS 서버가 컨테이너로 실행됩니다.

서버는 기본 포트 3000에서 실행됩니다.

4. 서비스 접속 및 Swagger UI
브라우저에서 http://localhost:3000/api 접속

Swagger UI에서 API 문서 확인 및 테스트 가능

5. 컨테이너 종료
```bash
docker-compose down
```
## 주요 기능

| 기능                  | 설명                                            |
|---------------------|-------------------------------------------------|
| 회원가입 및 로그인      | JWT를 활용한 인증 기능                              |
| 제품 등록              | 입고할 제품 등록                                   |
| 재고 입고/출고         | 유통기한 포함 가능, 동시성 처리 적용                   |
| 보유 재고 조회          | 페이지네이션 적용                                   |
| 입출고 히스토리 조회     | 입고 및 출고 내역 확인 가능                            |

API 문서
Swagger UI를 통해 전체 API 명세 및 실행을 확인할 수 있습니다.

URL: http://localhost:3000/api

테스트 실행 방법
```bash
npm run test
```

## 컨테이너화 (Dockerization)

본 프로젝트는 `Dockerfile` 및 `docker-compose.yml`을 이용하여 **NestJS 애플리케이션**과 **MySQL 데이터베이스**를 손쉽게 실행할 수 있도록 컨테이너화하였습니다.

### Dockerfile
- NestJS 애플리케이션을 빌드하고 실행하는 설정이 포함되어 있습니다.
- `node:18-alpine` 기반 이미지 사용
- `npm install`, `npm run build`, `npm run start:prod` 명령어 자동 실행

### docker-compose.yml
- 다음 두 개의 서비스가 정의되어 있습니다:
  - **app**: NestJS 서버
  - **db**: MySQL 8 데이터베이스
- `.env` 환경 변수 파일을 기반으로 데이터베이스 연결
- 포트 매핑:
  - `3000:3000` → NestJS API 서버
  - `3306:3306` → MySQL DB

### 실행 방법
```bash
docker-compose up --build
```

구현 및 설계 특징

✅ RESTful API 원칙에 따라 설계 (명확한 URI, 적절한 HTTP 메서드 및 상태 코드 사용)

✅ 모든 요청 및 응답은 application/json 포맷으로 통신

✅ TypeORM을 이용한 명확한 DB 모델링과 관계 설정

✅ 낙관적 락과 트랜잭션 처리를 통해 동시성 문제 해결

✅ Docker, Docker Compose 기반 환경으로 누구나 쉽게 실행 가능

✅ 전역 예외 필터 및 커스텀 예외를 통한 일관된 오류 처리
