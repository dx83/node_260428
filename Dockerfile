# 1. node 이미지 가져옵 (node 설치됨)
FROM node:20-slim

# 2. 리눅스에 작업 디렉토리 생성
WORKDIR /app

# 3. package.json 파일 복사
COPY package*.json ./

# 4. node_modules 설치
RUN npm install --production

# 5. 나머지 파일 복사 (점 사이 띄어쓰기함)
COPY . .

# 6. 8081번 포트 개방
EXPOSE 8081

# 7. 컨테이너 실행 시 자동 실행할 명령어
CMD ["node", "app.js"]