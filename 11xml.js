var parseString = require('xml2js').parseString,
    fs=require('fs')
    Dict = require("collections/dict");

var xmldoc = require('xmldoc');

search('rowling potter ron sirius azkaban chamber');
function search(query)
{
    var natural = require('natural'),
        tokenizer = new natural.AggressiveTokenizerRu();

    var result=new Dict();;
    indexFb2(function(dict,names){

        var words = tokenizer.tokenize(query.toLowerCase()),
            wordsLength = words.length;
        for (var k = 0; k < wordsLength; ++k) {

            var posting=dict.get(words[k]);
if(posting){
            for (var j=0;j<posting.length;++j)
            {
                //console.log(posting[j]);
                //
                var value = result.get(names[posting[j][0]]);
                if (value) {

                    var tempscore= 0.5;
                    if(posting[j][2]=='body')
                    {
                        tempscore= 0.5;
                    }
                    if(posting[j][2]=='title')
                    {
                        tempscore= 0.3;
                    }
                    if(posting[j][2]=='author')
                    {
                        tempscore= 0.2;
                    }
                    value.score+=tempscore;
                    //console.log(posting[j][2]);
                }
                else
                {
                    var tempscore= 0.5;
                    if(posting[j][2]=='body')
                    {
                        tempscore= 0.5;
                    }
                    if(posting[j][2]=='title')
                    {
                        tempscore= 0.3;
                    }
                    if(posting[j][2]=='author')
                    {
                        tempscore= 0.2;
                    }

                    result.add({score:tempscore},names[posting[j][0]])
                }


            }}

        }

        var outputarray = result.entries();

        var TimSort = require('timsort');
        TimSort.sort(outputarray, function (a, b) {
            return a[1].score < b[1].score  ? 1 : a[1].score  > b[1].score  ? -1 : 0;
        });
      console.log(outputarray);

    });
}

//console.log(document.name('some'));

function indexFb2(callback)
{
var natural = require('natural'),
    tokenizer = new natural.AggressiveTokenizerRu();
var dict=new Dict();
var recursive = require('recursive-readdir');
var fs = require('fs');
var document_names=[];
recursive('F://Little//fb2', function (err, files) {

    for(var i=0; i<files.length;++i) {
        var xml = fs.readFileSync(files[i], 'utf-8');
        document_names.push(files[i]);
        //console.log(files[i]);
        var document = new xmldoc.XmlDocument(xml);
        var author = document.descendantWithPath("description.title-info.author.first-name").val + ' ' + document.descendantWithPath("description.title-info.author.middle-name").val + ' ' + document.descendantWithPath("description.title-info.author.last-name").val;
        var title = document.descendantWithPath("description.title-info.book-title").val;
        var text = document.descendantWithPath('body').childrenNamed('section');

        var words = tokenizer.tokenize(author),
            wordsLength = words.length;
        for (var k = 0; k < wordsLength; ++k) {
            var value = dict.get(words[k].toLowerCase());
            if (value) {
                if (i != value[value.length - 1][0])
                    value.push([i,1,'author']);
                else
                    value[value.length - 1][1]++;
            }
            else {
                dict.add([[i,1,'author']], words[k].toLowerCase());
            }
        }
        var words = tokenizer.tokenize(title),
            wordsLength = words.length;
        for (var k = 0; k < wordsLength; ++k) {
            var value = dict.get(words[k].toLowerCase());
            if (value) {
                if (i != value[value.length - 1][0])
                    value.push([i,1,'title']);
                else
                    value[value.length - 1][1]++;
            }
            else {
                dict.add([[i,1,'title']], words[k].toLowerCase());
            }
        }

        text.forEach(function (elem) {
            elem.eachChild(function (child) {

                var words = tokenizer.tokenize(child.val),
                    wordsLength = words.length;
                for (var k = 0; k < wordsLength; ++k) {
                    var value = dict.get(words[k].toLowerCase());
                    if (value) {
                        if (i != value[value.length - 1][0])
                            value.push([i,1,'body']);
                        else {
                            if(value[value.length - 1][2]=='body')
                            value[value.length - 1][1]++;
                            else {
                                value.push([i,1,'body']);
                               /// dict.add([[i, 1, 'body']], words[k].toLowerCase());
//console.log(value[0][2]);
                                //console.log(     words[k].toLowerCase());
                            }
                         //   console.log(value);
                        }
                    }
                    else {
                        dict.add([[i,1,'body']], words[k].toLowerCase());
                    }
                }
            });

        });

    }
callback(dict,document_names);
    var outputarray = dict.entries();
    //console.timeEnd("read_files");
    //console.time("sort_index");
    var TimSort = require('timsort');
    TimSort.sort(outputarray, function (a, b) {
        return a[0] > b[0] ? 1 : a[0] < b[0] ? -1 : 0;
    });

    var wstream = fs.createWriteStream('F://fb_index.txt');
    wstream.write(JSON.stringify(outputarray));
    wstream.end();

//console.log(xml);
});}

