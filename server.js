var express = require('express'),
        app = express(),
        path = require('path'),
        csv = require('csv'),
        fs = require('fs'),
        bodyParser = require('body-parser'),
        cookieParser = require('cookie-parser'),
        session = require('express-session'),
	sudo = require('sudo');
        
var db = require('mongojs').connect('localhost/sampleSchool', ['teachers', 'rosters']);
process.on('uncaughtException', function(err) {
        console.log('uncaught exception: ' + err);
});
        
        


var port = process.env.PORT || 80; 

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(express.bodyParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.use(session({secret:'secret stuff'}));

//GETS
app.get('/', function(req, res){
    console.log('uhiiuhiuhihihiuhiudex');
    res.sendfile('index.html');
});

app.get('/uploadpage', function(req, res) {
    console.log('this time it is upload page');
    db.teachers.findOne({userID: req.session.userID}, function(err, doc){
        console.log(doc + ', ' + req.session.userID);
        if (doc) {
            res.sendfile('uploadpage.html');
        }
        else {
            res.redirect('/');
        }
    });
});

//POSTS
app.post('/login', function(req, res){
    console.log('we are now in login post: '+ req.body.username);
    var reqUN = req.body.username;
    var reqPW = req.body.password;
    db.teachers.find({'username': reqUN}, function(err, users) {
        console.log('found username: ' + reqUN);
        if (err || !users || users.length == 0) {
            console.log('something went wrong at login');
            res.redirect('/');
        }
        else {
            console.log(users[0].password + '::' + reqPW);
            if (users[0].password == reqPW) {
                console.log('success!: ' + users[0].userID);
                req.session.userID = users[0].userID;
                console.log(req.session.userID);
                res.redirect('/uploadpage');
                //res.send({success: true, username: users[0].username, testString: "hey what up"});
            }
            else {
                res.send({success: false, testString: "wrong pass"});                
            }
        }
    });
});

app.post('/loginm', function(req, res){
    console.log('we are now in login post: '+ req.body.username);
    var reqUN = req.body.username;
    var reqPW = req.body.password;
    db.teachers.find({'username': reqUN}, function(err, users) {
        console.log('found username: ' + reqUN);
        if (err || !users || users.length == 0) {
            console.log('something went wrong at login');
            res.send({success: false, testString: "lol you suck"});
        }
        else {
            console.log(users[0].password + '::' + reqPW);
            if (users[0].password == reqPW) {
                console.log('success!');
                req.session.id = users[0].userID;
                db.rosters.find({teacherId: users[0].userID}, function(err, rosters){
                    if (err || !rosters || rosters.length == 0) {
                        console.log('no rosters: ' + users[0].userID + '\n' + rosters);
                        res.send({'roster': null});
                    }
                    else {
                        console.log(JSON.stringify(rosters[0]));
                        res.send({success: 1, students: rosters});
                    }
                });
            }
            else {
                res.send({success: 0, testString: "wrong pass"});                
            }
        }
    });
});

app.post('/upload', function(req, res){
    console.log(req.session.id);
    var roster = {students:[]};
    console.log('upload attempted: ' + JSON.stringify(req.files.roster));
    var filename = req.files.roster.originalFilename;
    var periodRegex = /_(.+)\.csv$/;
    var periodArray = periodRegex.exec(filename);
    var period;
    if (periodArray) {
        period = periodArray[1];
        roster.period = period;
        console.log('period: ' + roster.period);
    }
    csv().from.stream(fs.createReadStream(req.files.roster.path))
    .to.array(function(data){
        data.forEach(function(e, i, a){
            if (e[0]) {
                //HERE WE NEED TO WRITE THE TEST CASE FOR SPECIAL CHARACETRS
                var student = {last:e[0]};
                student.first = e[1];
                if (e.length > 2) {
                    student.id = e[2];
                }
                roster.students.push(student);
                console.log('new student: ' + JSON.stringify(student));
            }
            if (i == a.length-1) {
                db.rosters.update({teacherId:req.session.userID, period: period}, {$set:{studentList:roster}}, {upsert:true}, function(err, count){
                    console.log('ok done');
                    res.redirect('back');
                });
            }
        });
    });
});

app.post('/print', function(req, res){
    var name = req.body.name;
    var time = req.body.time;
    var reason = req.body.reason;
    var options = {
        cachePassword: true,
        prompt: 'raspberry',
    };
    var print = sudo(['./print-pass.py', name, time, reason], options);
    print.stdout.on('data', function(data){
        console.log('stdout: ' + data);
    });
});

app.listen(port);


function user(userID, username, email, password) {
    this.userID = userID;
    this.username = username;
    this.email = email;
    this.password = password;
}

//THIS IS THE PART WHERE I MAKE SHIT UP
db.teachers.find({'userID': 8675309}, function(err, accounts) {
    if (err) {
        console.error(err);
        return;
    }
    if (accounts.length == 0) {
        var playerZero = new user(8675309, 'test', 'patrick@saoconnell.com', 'test');
        db.teachers.save(playerZero, function(err, saved) {
            if (err||!saved) console.log('no go lol');
            else {
                console.log('made user: ' + playerZero.username);
            }
        });
    }
    else {
        db.teachers.find({username:'test'}, function(err, docs){
            if (!err) {
                console.log(JSON.stringify(docs[0]));
            }
        });
    }
});

//END OF AUTO SECTION
