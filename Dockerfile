# 1. Node 공식 이미지로부터 빌드 시작 (최신 LTS 버전)
FROM node:18-alpine

# 2. 작업 디렉토리 설정
WORKDIR /usr/src/app

# 3. package.json, package-lock.json 복사
COPY package*.json ./

# 4. 의존성 설치
RUN npm install --production

# 5. 소스코드 복사
COPY . .

# 6. 앱 빌드 (tsc 컴파일)
RUN npm run build

# 7. 앱 실행 (빌드된 JS 코드로)
CMD ["node", "dist/main.js"]

# 8. 컨테이너가 3000 포트를 사용할 것임 명시
EXPOSE 3000
