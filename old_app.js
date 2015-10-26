var searchEngine=function  ()
{

var self=this;
    self.buildIncidenceMatrix=function(directoryName){
        var fs = require('fs');
        return  buildIncidenceMatrix(readAllFilesInDir('./'+directoryName+'/'));
    };
    self.buildIndex=function(directoryName)
    {
        var fs = require('fs');
        return  buildIndex(readAllFilesInDir('./'+directoryName+'/'));
    };
  /*  self.buildTwoWordsIndex(directoryName)
    {
    return buildTwoWordsIndex(readAllFilesInDir('./'+directoryName+'/'));
    }*/

};

function Termin(termin,docId)
{
    this.termin=termin;
    this.docId=docId;
}

Termin.prototype.toString=function(){
    return "{ termin: "+this.termin+", docId: "+this.docId+" }";
}

Termin.prototype.equals=function(a,b)
{
    return a.termin== b.termin;
}

Termin.prototype.compare=function(a,b)
{
    var x= a.termin;
    var y= b.termin;
    return x < y ? -1 : x > y ? 1 : 0;
    //  return x < y ? -1 : x > y ? 1 : (a.docId< b.docId?-1:a.docId> b.docId?1:0);
}


       function readAllFilesInDir(dir) //function reads all files in the folder
    {
        var fs = require('fs');
        var data = [];
        var files= fs.readdirSync(dir);
            var c = 0;
            files.forEach(function (fileName) {
                c++;
               var html= fs.readFileSync(dir + fileName,'utf-8');
               data.push({fileName:fileName,fileContentString: html});
                    if (0 === --c) {

                     return   data; }
            });

        return   data;
    }

//buildIndex(readAllFilesInDir('./newfiles/'));
    function buildIndex(data) {

        var begin=new Date();
        var word_list = [],
        filesId=new Array(data.length);


        for (var i= 0,length=data.length;i<length;++i) {
           // console.log(data.length);

            var regex = /\W+/; // one or more non-word chars (anything not a-z0-9)

            var words = data[i].fileContentString.split(regex);

            for (var k = 0,lengthOfWordsArray=words.length; k < lengthOfWordsArray; ++k) {
                if(words[k]!='')
                word_list.push({termin: words[k].toLowerCase(), docId:i});
            }
            filesId[i]=data[i].fileName;

        }
        var TimSort = require('timsort');
        TimSort.sort(word_list, Termin.prototype.compare);


        var index=[];
        index.push({term:word_list[0].termin, docFreq:1,postingList:[word_list[0].docId]});
        var    previousToken=word_list[0].termin;

        for(var i= 1,length=word_list.length;i<length;++i)
        {
            //console.log(dictionary[i].termin==previousToken);
            if(word_list[i].termin==previousToken){
               // console.log(index.length);
                index[index.length-1].docFreq++;
                //index[index.length-1].postingList.push(dictionary[i].docId)
                if (index[index.length-1].postingList.indexOf(word_list[i].docId) < 0) index[index.length-1].postingList.push(word_list[i].docId);
            }
            else
            {
                index.push({term:word_list[i].termin, docFreq:1,postingList:[word_list[i].docId]});
                previousToken=word_list[i].termin;
            }

        }

        return {index:index,docNames:filesId};
    }

function buildIncidenceMatrix(data)
{
    var words=[];
    for (var i= 0,length=data.length;i<length;++i)
    {
         words=words.concat(getWordsFromString(data[i].fileContentString,data[i].fileName));
    }
    words.sort(Termin.compare);
    var dictionary=buildDictionary(words);
    var matrix=new Array(data.length);

     for (var j=0;j<data.length;++j)
    {
        matrix[j]=new Array(dictionary.length);

        for(var k=0;k<dictionary.length;++k)
        {
       matrix[j][k]=(dictionary[k].postingList.indexOf(data[j].fileName)<0)?false:true;
        }
    }
    return matrix;
}

function getWordsFromString(string,id)
{
    var regex = /\W+/; // one or more non-word chars (anything not a-z0-9)
    var words = string.split(regex);
    var resultArray=[]
    for (var i = 0,lengthOfWordsArray=words.length; i < lengthOfWordsArray; ++i) {
            if(words[i]!='')
            {
                var termin=new Termin(words[i].toLowerCase(),id)
                termin.position=i;
                resultArray.push(termin);
            }
        }
    return resultArray;
}

function buildDictionary(word_list,equals,compare)
{
    var index=[];
    index.push({term:word_list[0].termin, docFreq:1,postingList:[word_list[0].docId]});
    var    previousToken=word_list[0].termin;

    for(var i= 1,length=word_list.length;i<length;++i)
    {
        if(word_list[i].termin==previousToken){
            index[index.length-1].docFreq++;
            if (index[index.length-1].postingList.indexOf(word_list[i].docId) < 0) index[index.length-1].postingList.push(word_list[i].docId);
        }
        else
        {
            index.push({term:word_list[i].termin, docFreq:1,postingList:[word_list[i].docId]});
            previousToken=word_list[i].termin;
        }
    }
    var TimSort = require('timsort');

    for(var j=0,indexLength=index.length;j<indexLength;++j) {
        TimSort.sort(index[j].postingList, function (a, b) {
            return a.docId < b.docId ? -1 : a.docId > b.docId ? 1 : 0;
        });
    }
    return index;
}



//console.log(buildIndex(readAllFilesInDir('./test_data/')).length);
//console.log(buildTwoWordsIndex(readAllFilesInDir('./files/')).length);

function buildTwoWordsIndex(data)
{

    var i= 0,
        dataLength=data.length,
        words=[],
        twoWordsIndex=[];
    for(i=0;i<dataLength;++i)
    {
        var termins=getWordsFromString(data[i].fileContentString,data[i].fileName);

        for(var k=0; k<termins.length-1;k++)
        {
            twoWordsIndex.push(new Termin(termins[k].termin+' '+termins[k+1].termin,i));
        }
    }
    var TimSort = require('timsort');
    TimSort.sort(twoWordsIndex, Termin.prototype.compare);
    twoWordsIndex=buildDictionary(twoWordsIndex,Termin.prototype.compare)
    // var fs = require('fs');
    //fs.writeFile("twowordindex.txt", JSON.stringify(twoWordsIndex,null, 4));
    return twoWordsIndex;
}

//console.log(JSON.stringify(buildCordinateIndex(readAllFilesInDir('./files/')),null, 4));
//console.log(JSON.stringify(buildCordinateIndex(readAllFilesInDir('./test_data/'))));
//var fs = require('fs');
//fs.writeFile("results.txt", JSON.stringify(buildCordinateIndex(readAllFilesInDir('./newfiles/'))));

function buildCordinateIndex(data)
{
    var index=[],
        filesId=new Array(data.length);

for (var i=0;i<data.length; i++) {
    filesId[i]=data[i].fileName;
    index=index.concat(getWordsFromString(data[i].fileContentString,i));
};
    var TimSort = require('timsort');
    TimSort.sort(index, Termin.prototype.compare);
    //console.log(index);
    index=buildDictionaryWithAxes(index);

    // var fs = require('fs');
   // fs.writeFile("cordinateIndex.txt", JSON.stringify(index,null, 4));

    return index;
}
function arrayObjectIndexOf(myArray, searchTerm, property) {
    for(var i = 0, len = myArray.length; i < len; i++) {
        if (myArray[i][property] === searchTerm) return i;
    }
    return -1;
}
function buildDictionaryWithAxes(wordArray)
{
    var index=[];
    //console.log(wordArray);
   // index.push({term:wordArray[0].termin, docFreq:1,postingList:[wordArray[0].docId]});
    index.push({term:wordArray[0].termin, docFreq:1,postingList:[{docId:wordArray[0].docId,positions:[wordArray[0].position]}]});
    var    previousToken=wordArray[0].termin;
    var docIdIndex=0;
    for(var i= 1,length=wordArray.length;i<length;++i)
    {
        if(wordArray[i].termin==previousToken){

            if (arrayObjectIndexOf (index[index.length-1].postingList,wordArray[i].docId,'docId') < 0) {
               // console.log(JSON.stringify(index[index.length - 1].postingList));
                docIdIndex++;
                index[index.length - 1].postingList.push({docId: wordArray[i].docId, positions: [wordArray[i].position]});
            }
            else{
                index[index.length-1].docFreq++;
                index[index.length - 1].postingList[docIdIndex].positions.push(wordArray[i].position);
            }
        }
        else
        {
            index.push({term:wordArray[i].termin, docFreq:1,postingList:[{docId:[wordArray[i].docId],positions:[wordArray[i].position]}]});
            previousToken=wordArray[i].termin;
            docIdIndex=0;
        }
    }
    var TimSort = require('timsort');

    for(var j=0,indexLength=index.length;j<indexLength;++j)
    {
        TimSort.sort( index[j].postingList, function (a,b){
            return a.docId< b.docId?-1: a.docId> b.docId? 1:0;
        });

    }
    return index;
}








function Document(documentName,documentContents)
{
    this.name=documentName;
    this.contents=documentContents;
}
module.exports.searchEngine=searchEngine;

//test();
function test()
{
    var indexTypes=[{name:'Inverted index',indexFunc:buildIndex},{name:'Two-word index',indexFunc:buildTwoWordsIndex},{name:'Cordinateindex',indexFunc:buildCordinateIndex}];
    var files=readAllFilesInDir('./newfiles/');
    var stats=[];
    var fs = require('fs');

    indexTypes.forEach(function (elem)
    {
       // console.log('____________'+elem.name+'_______________');
        var begin=new Date();
        console.log();
        var index=elem.indexFunc(files)
        var end=new Date();
        stats.push({name:elem.name,timeElapsed:(end-begin)*0.001});
        fs.writeFile(elem.name+'.txt', JSON.stringify(index), function(err) {
            if(err) {
                return console.log(err);
            }});
    });
    console.log(stats);
}