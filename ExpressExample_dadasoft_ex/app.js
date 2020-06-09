/**
 * 웹서버 만들기
 * 
 * 웹브라우저에서 아래 주소의 페이지를 열고 웹페이지에서 요청
 * http://localhost:3000/
 * http://localhost:3000/login2.html
 * http://localhost:3000/photo.html
 * http://localhost:3000/house1585280388624.png
 */

// Express 기본 모듈 불러오기
var express = require('express')
  , http = require('http')
  , path = require('path');

// Express의 미들웨어 불러오기
var bodyParser = require('body-parser')
  , cookieParser = require('cookie-parser')
  , static = require('serve-static')
  , errorHandler = require('errorhandler');

// 에러 핸들러 모듈 사용
var expressErrorHandler = require('express-error-handler');

// Session 미들웨어 불러오기
var expressSession = require('express-session');

// 파일 업로드용 미들웨어
var multer = require('multer');
var fs = require('fs');

//클라이언트에서 ajax로 요청 시 CORS(다중 서버 접속) 지원
var cors = require('cors');


// 익스프레스 객체 생성
var app = express();

// 기본 속성 설정
app.set('port', process.env.PORT || 3000);

// body-parser를 이용해 application/x-www-form-urlencoded 파싱
app.use(bodyParser.urlencoded({ extended: false }))

// body-parser를 이용해 application/json 파싱
app.use(bodyParser.json())

// public 폴더와 uploads 폴더 오픈
// app.use('/public', static(path.join(__dirname, 'public')));
// app.use('/uploads', static(path.join(__dirname, 'uploads')));
app.use('/', static(path.join(__dirname, 'public')));
app.use('/', static(path.join(__dirname, 'uploads')));


// cookie-parser 설정
app.use(cookieParser());

// 세션 설정
app.use(expressSession({
	secret:'my key',
	resave:true,
	saveUninitialized:true
}));


//클라이언트에서 ajax로 요청 시 CORS(다중 서버 접속) 지원
app.use(cors());


//multer 미들웨어 사용 : 미들웨어 사용 순서 중요  body-parser -> multer -> router
// 파일 제한 : 10개, 1G
var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, 'uploads')
    },
    filename: function (req, file, callback) {
        /*callback(null, file.originalname + Date.now())*/
		//callback(null, file.originalname)
		var extension = path.extname(file.originalname);
		var basename = path.basename(file.originalname, extension);
		callback(null, basename + Date.now() + extension);
	 }
});

var upload = multer({ 
    storage: storage,
    limits: {
		files: 10,
		fileSize: 1024 * 1024 * 1024
	}
});

// 라우터 사용하여 라우팅 함수 등록
var router = express.Router();

router.route('/process/login2').post(function(req, res) {
	console.log('/process/login 호출됨.');
	// 클라이언트에 응답 전송
	res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
	res.write('<meta name="viewport" content="width=device-width, height=device-height, initial-scale=1">');
	res.write('<br><br>&nbsp;&nbsp;<font size =5 color =gray>로그인 성공</font><br><br>');
	res.write('<hr/>');
	res.write('<br>&nbsp;&nbsp<font color =gray size=3>업로드하는 사진이 있으면 페이지 이동!!!</font></p>');
	res.write('&nbsp;&nbsp;<a href = /photo.html><input type= button value= "파일업로드 페이지로 이동"> </input></a>');				
	res.end();
});

// 파일 업로드 라우팅 함수 - 로그인 후 세션 저장함
router.route('/process/photo').post(upload.array('photo', 1), function(req, res) {
	console.log('/process/photo 호출됨.');
	
	try {
		var files = req.files;
	
        console.dir('#===== 업로드된 첫번째 파일 정보 =====#')
        console.dir(req.files[0]);
        console.dir('#=====#')
        
		// 현재의 파일 정보를 저장할 변수 선언
		var originalname = '',
			filename = '',
			mimetype = '',
			size = 0;
		
		if (Array.isArray(files)) {   // 배열에 들어가 있는 경우 (설정에서 1개의 파일도 배열에 넣게 했음)
	        console.log("배열에 들어있는 파일 갯수 : %d", files.length);
	        
	        for (var index = 0; index < files.length; index++) {
	        	originalname = files[index].originalname;
	        	filename = files[index].filename;
	        	mimetype = files[index].mimetype;
	        	size = files[index].size;
	        }
	        
	    } else {   // 배열에 들어가 있지 않은 경우 (현재 설정에서는 해당 없음)
	        console.log("파일 갯수 : 1 ");
	        
	    	originalname = files[index].originalname;
	    	filename = files[index].name;
	    	mimetype = files[index].mimetype;
	    	size = files[index].size;
	    }
		
		console.log('현재 파일 정보 : ' + originalname + ', ' + filename + ', '
				+ mimetype + ', ' + size);
		
		// 클라이언트에 응답 전송
		res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
		res.write('<meta name="viewport" content="width=device-width, height=device-height, initial-scale=1">');
		res.write('<br><br>&nbsp;&nbsp;<font size =5 color =gray>파일업로드 성공</font><br><br>');
		res.write('<hr/>');
		res.write('<br>&nbsp원본 파일명 : ' + originalname +'<br>&nbsp저장 파일명 : ' + filename );
		res.write('<br>&nbsp;MIME TYPE : ' + mimetype );
		res.write('<br>&nbsp;파일  크기 : ' + size );
		res.write('<br><br>&nbsp;&nbsp;<a href = /><input type= button value= "포트폴리오 화면으로 이동"></input></a>');			
		res.end();
		
	} catch(err) {
		console.dir(err.stack);
	}	
		
});


app.use('/', router);


// 404 에러 페이지 처리
var errorHandler = expressErrorHandler({
    static: {
      '404': './public/404.html'
    }
});

app.use( expressErrorHandler.httpError(404) );
app.use( errorHandler );

// Express 서버 시작
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

