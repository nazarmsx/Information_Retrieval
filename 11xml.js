var parseString = require('xml2js').parseString,
    fs=require('fs')
    Dict = require("collections/dict");
//var xml =fs.readFileSync('F://temp.fb2','utf-8') ;
//xml.replace('</ br>'," ");
//console.log(xml);
//parseString(xml, function (err, result) {
//    //console.dir(result.FictionBook.body[0].section[0].p);
//});
//indexFiles();

function indexFiles()
{
    var recursive = require('recursive-readdir');
    var fs = require('fs');

    recursive('F://Little//fb2', function (err, files) {

            var i = 0,
                fileQuantity = files.length;
            var dict = new Dict();

            console.log(files);
            //for (i = 0; i < fileQuantity; ++i) {
            //
            //    var file = fs.readFileSync(files[i], 'utf-8');
            //    //console.log(file);
            //    var words = tokenizer.tokenize(file),
            //        wordsLength = words.length;
            //    for (var k = 0; k < wordsLength; ++k) {
            //        var value = dict.get(words[k].toLowerCase());
            //        if (value) {
            //            if (i != value[value.length - 1][0])
            //                value.push([i,1]);
            //            else
            //                value[value.length - 1][1]++;
            //        }
            //        else {
            //            dict.add([[i,1]], words[k].toLowerCase());
            //        }
            //    }
            //
            //}
            //
            //
            //var outputarray = dict.entries();
            //console.timeEnd("read_files");
            //console.time("sort_index");
            //var TimSort = require('timsort');
            //TimSort.sort(outputarray, function (a, b) {
            //    return a[0] > b[0] ? 1 : a[0] < b[0] ? -1 : 0;
            //});
            //console.timeEnd("sort_index");
            //
            //console.time("write_index");
            //var wstream = fs.createWriteStream('F://fb_index.txt');
            //wstream.write(JSON.stringify(dict.toJSON()));
            //wstream.end();
            //

        }
    );
}

parse();
function parse() {
    var recursive = require('recursive-readdir');
    var fs = require('fs');
    var natural = require('natural'),
        tokenizer = new natural.AggressiveTokenizerRu();
    var dict=new Dict();
    recursive('F://Little//fb2', function (err, files) {

        for(var i=0; i<files.length;++i)
        {
            var xml =fs.readFileSync(files[i],'utf-8') ;
          //  console.log(xml);
            xml=xml.replace('</ br>'," ");
            xml=xml.replace('< emphasis>'," ");
            xml=xml.replace('</ emphasis>'," ");

            parseString(xml, function (err, result) {

               // console.dir(result.FictionBook.body[0].section[0].p);
                for(var k=0;k<result.FictionBook.body[0].section.length;++k){
                   // console.log(result.FictionBook.body[0].section[k]);
            //        console.log(result.FictionBook.body[0].section[k]);
                   // console.log(!result.FictionBook.body[0].section[k]  || !result.FictionBook.body[0].section[k].p);

console.log(JSON.stringify(result.FictionBook.body[0].section));
                    if((result.FictionBook.body[0].section[k] ==undefined) || (result.FictionBook.body[0].section[k].p==undefined))
    continue;

                                for(var j=0;j<result.FictionBook.body[0].section[k].p.length;++j) {


                    try{
                    var words = tokenizer.tokenize(result.FictionBook.body[0].section[k].p[j]);

                                wordsLength = words.length;
                            for (var k = 0; k < wordsLength; ++k) {
                                var value = dict.get(words[k].toLowerCase());
                                if (value) {
                                    if (i != value[value.length - 1][0])
                                        value.push([i,1]);
                                    else
                                        value[value.length - 1][1]++;
                                }
                                else {
                                    dict.add([[i,1]], words[k].toLowerCase());
                                }
                        //    }


                    }}
             //   words.forEach(function(elem){console.log(elem);});}
                    catch(exc)
                    {
                     //   console.log(result.FictionBook.body[0].section[0].p[j])
                      //  console.log(exc);
                    }
                }}
                var outputarray = dict.entries();
                //console.timeEnd("read_files");
                //console.time("sort_index");
                var TimSort = require('timsort');
                TimSort.sort(outputarray, function (a, b) {
                    return a[0] > b[0] ? 1 : a[0] < b[0] ? -1 : 0;
                });

                var wstream = fs.createWriteStream('F://fb_index.txt');
                wstream.write(JSON.stringify(dict.toJSON()));
                wstream.end();
            });
        }

    });
}