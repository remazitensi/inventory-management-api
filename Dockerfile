# 1. Node 공식 이미지로부터 시작
FROM node:18-alpine

# 2. 작업 디렉토리 설정
WORKDIR /usr/src/app

# 3. package.json, lock 파일 복사
COPY package*.json ./

# 4. 전체 의존성 설치 (dev 포함)
RUN npm install

# 5. 소스 복사
COPY . .

# 6. nest build (ts -> js 컴파일)
RUN npm run build

# 7. 앱 실행
CMD ["node", "dist/main.js"]

# 8. 포트 명시
EXPOSE 3000
