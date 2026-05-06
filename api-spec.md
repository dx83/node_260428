# Node1 Routes API 명세서

워크스페이스에 `node1`의 `routes` 폴더를 기준으로 API 명세서를 추출했습니다. (오타 가능성 고려) 각 라우트 파일의 API 엔드포인트, 메서드, 설명을 정리했습니다. 기본 URL은 `127.0.0.1:8081/api/`로 가정합니다.

## board.js (게시판 관련 API)
- **POST** `/board/insert.json`  
  게시물 삽입. Body: `{ "title": "제목", "content": "내용", "writer": "글쓴이" }`

- **GET** `/board/selectlist.json?page=1&size=10&text=`  
  게시물 목록 조회 (페이징, 검색 지원). Query: page, size, text.

- **GET** `/board/selectone.json?no=5`  
  게시물 상세 조회 (조회수 증가). Query: no.

- **GET** `/board/prev.json?no=5`  
  이전 게시물 조회. Query: no.

- **GET** `/board/next.json?no=5`  
  다음 게시물 조회. Query: no.

## customer.js (회원 관련 API)
- **PUT** `/customer/update.do`  
  회원 정보 변경 (토큰 필요). Body: `{ "name": "변경할이름", "phone": "010-7777-7777" }`

- **POST** `/customer/join.do`  
  회원가입 (비밀번호 암호화). Body: `{ "email": "abc@abc.com", "name": "ABC", "password": "1234", "phone": "010-0000-4321" }`

- **POST** `/customer/login_token.do`  
  로그인 (토큰 적용, 주석 처리됨). Body: `{ "email": "a@a.com", "password": "1234" }`

## item.js (물품 관련 API)
- **POST** `/item/insert.do`  
  물품 등록. Body: `{ "name": "컴퓨터", "price": "140000", "detail": "설명", "qty": 200, "phone": "010-0002-0000" }`

- **PUT** `/item/update.do?code=5`  
  물품 변경. Query: code. Body: `{ "name": "수박", "price": 35000, "detail": "씨많은", "qty": 111 }`

- **DELETE** `/item/delete.do`  
  물품 삭제. Body: `{ "code": 123 }`

- **GET** `/item/list.do?page=1&cnt=10&search=`  
  물품 목록 조회 (페이징, 검색 지원). Query: page, cnt, search.

- **GET** `/item/select.do?code=1`  
  물품 1개 조회. Query: code.

## itemimage.js (물품 이미지 관련 API)
- **POST** `/itemimage/insert.do`  
  물품 이미지 등록 (파일 업로드). Body: `{ "code": 4 }` + 파일 첨부 (image).

- **GET** `/itemimage/image.do?no=51`  
  이미지 가져오기. Query: no.

- **GET** `/itemimage/list.do?code=14`  
  물품별 이미지 목록 조회. Query: code.

- **DELETE** `/itemimage/delete.do`  
  물품 이미지 삭제. Body: `{ "no": 56 }`

- **PUT** `/itemimage/update.do`  
  물품 이미지 변경 (파일 업로드). Body: `{ "no": 123 }` + 파일 첨부 (image).