var express = require('express');//1.모듈을 가져온다.
var app = express();//2.가져온 모듈(함수)을 실행한다.
var bodyParser = require('body-parser');
var fs = require('fs');

app.use(bodyParser.urlencoded({ extended: false}));
app.locals.pretty = true;

/* template engine이 있는 디렉토리를 셋팅한다*/
app.set('view engine','pug');//pug를 쓰겠다.
app.set('views','./views_file');//views_file 디렉토리 밑에 둔다.

/*    ROUTING    */
app.get('/topic/new', (req,res)=>{
    fs.readdir('data',(err,files)=>{//files 안에는 data 디렉토리 안의 파일명들이 배열로 담겨있다!
        if(err) {
            console.log(err);
            res.status(500).send('Internal Server Error');
        }
        res.render('new',{topics:files});//render하고자 하는 패키지 파일의 이름을 넣어줘야함!
    });
});
app.get(['/topic','/topic/:xyz'], (req,res)=>{//topic페이지로 들어오면 글 목록이 나오게 한다.
    fs.readdir('data',(err,files)=>{//files 안에는 data 디렉토리 안의 파일명들이 배열로 담겨있다!
        if(err) {
            console.log(err);
            res.status(500).send('Internal Server Error');
        }
        var xyz = req.params.xyz;
        if(xyz){//parameter가 있을 때(xyz값이 존재할 때) javascript는 값이 null이거나 존재하지 않으면 false
            fs.readFile('data/'+xyz,'utf8',(err,data)=>{//readFile로 읽어온 정보는 'data'에 담겨있다!
                if(err) {
                    console.log(err);
                    res.status(500).send('Internal Server Error');
                }
                res.render('view',{topics:files, title:xyz, desc:data});//파라미터를 통해 가져온 값이 원하는 값이다. xyz라는 파라미터 값을 'title'변수에 던져준다!
            });
        } else {//parameter가 없을 때
            res.render('view',{topics:files, title:'웹앱만들기',desc:'재밌는데 힘드네요!'});//'topic'으로 접근했을 때는 그냥 'view'라는 파일은 views_file에 있어야함, 'view' 안의 topics에  files를 넣는다?
        }
        
    });
    
});
//topic으로만 url을 쳐서 들어가면 Cannot GET /topic 에러가 뜬다.
//왜냐하면 post방식으로만 구현을 하고, url을 다 쳤을 때의 get방식은 구현하지 않았기 때문.
app.post('/topic', (req,res)=>{//사용자가 보낸 title을 제목, desc를 내용으로 하는 파일 생성 및 저장할 것이다.
    var title = req.body.title;
    var desc = req.body.desc;
    fs.writeFile('data/'+title, desc, (err)=>{//'data'디렉토리 밑에 파일을 생성한다.
        if (err){
            res.status(500).send('Internal Server Error');
        }
        res.redirect('/topic/'+title);//'title'페이지로 리다이렉트한다.(form>input>'title')
    });
    
});
app.listen(3000,function(){//3.포트번호와 컨트롤러를 할당한다.
    console.log('Connected,3000 port!');
})
