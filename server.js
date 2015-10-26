var searchEngine=require('./app.js');
var searchEngineInstance = new searchEngine.searchEngine;

var indexData=(searchEngineInstance.buildIndex('./files/'));
var index=indexData.index;
var fileCodes=searchEngineInstance.buildIndex('./files/').docNames;


var http = require('http') // http module
    , qs = require('qs'); // querystring parser
var express = require('express');
var app = express();

var termsIndexes=[];
 for(var i=0;i<index.length;i++)
 {
     termsIndexes[index[i].term]=i;
 }

app.all('/', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});
app.get('/', function (req, res,next) {
    res.send('Hello World!');
});
app.get("/query/:q",function(request, response,next){
    var q = request.params.q;
    response.writeHead(200, {"Access-Control-Allow-Origin": "*","Access-Control-Allow-Headers": "X-Requested-With"});
     var result=getFileNames(q);
    console.log(JSON.stringify(result));

    if(result != "error" && result.length>0 ){
    response.write(JSON.stringify(result));
    }
    else
    {
        response.write('No data!');
    }

    response.send();
});
var server = app.listen(5555,"0.0.0.0", function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://95.67.52.25:%s',port);
});

var resultDocuments=getFileNames('a');
for  (var i=0;i<resultDocuments.length;++i)
{
    resultDocuments[i]=fileCodes[resultDocuments[i]];
}
console.log(resultDocuments);

function getFileNames(query)
{
    var resultDocuments=[];
    var postingLists=Object.create(null);
    var terms=[];
    var regex = /\W+/; // one or more non-word chars (anything not a-z0-9)
    var terms=query.split(regex);

    for (var k=0;k<terms.length;++k)
    {
        terms[k]=terms[k].toLowerCase();

        if(checkToken( terms[k])) {

            if(index[termsIndexes[terms[k]]]){ //not such word at index
            postingLists[terms[k]] = index[termsIndexes[terms[k]]].postingList}
            else
            {
                postingLists[terms[k]]=[];
            }
        }
    }

    if(Object.keys(postingLists).length==1)
    {
        return postingLists[terms[0]];
    }

    //console.log(terms);
    resultDocuments=resultDocuments.concat(postingLists[terms[0]]);
    for (var k=0;k<terms.length;)
    {

        if(!terms[k+1] || !terms[k+2])
        {
        break;
        }
        else
        {
            if (checkToken(terms[k]) && !(checkToken(terms[k+1])) &&(checkToken(terms[k+2])))
            {

                switch (terms[k+1])
                {

                    case 'or':
                        resultDocuments=merge(resultDocuments,postingLists[terms[k+2]]);
                        break;
                    case 'and':
                        resultDocuments=intersect(resultDocuments,postingLists[terms[k+2]]);
                        break;
                    default
                        : return "error";
                }
                k+=2;
            }
            else if((checkToken(terms[k]) && !(checkToken(terms[k+1])) &&(!checkToken(terms[k+2]) && checkToken(terms[k+3]) ))) //and not token
            {

                if(terms[k+1]=='and' && terms[k+2]=='not')
                {
                     resultDocuments=andnot(resultDocuments,postingLists[terms[k+3]]);
                }
                else
                {
                    return "error";
                }

                k+=3;
            }
        }

    }



    return resultDocuments;

}
//console.log(fileCodes);

function checkToken(token)
{
    if(token=='or') return false;
    if(token=='not') return false;
    if(token=='and') return false;
    if(!token) return false;
return true;
}
function intersect(a,b)
{
    var result=[];
   // console.log('A:'+a);
   // console.log('B:'+b);

    var   aLength= a.length;
    var   bLength= b.length;
    for (var i= 0,k=0;(i< a.length) && (k<b.length);)
    {

    if(a[i]==b[k])
    {
        result.push(a[i]);
        ++i;
        ++k;
    }
        else {
        if (a[i]<b[k]){++i;} else{++k;}
        }
    }

   // console.log('Res:'+result+';');

    return result;
}
function merge(a,b)
{
    var result=a;
    b.forEach(function (elem)
    {
        if (result.indexOf(elem)<0) result.push(elem);
    });
    result.sort();
    return result;
}
function andnot(a,b)
{
    var result=[];
    a.forEach(function (elem)
    {
        if (b.indexOf(elem)<0) result.push(elem);
    });

    return result;
}


