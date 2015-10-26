console.log("Child Process " + process.argv[2] + " executed." );

//processFiles(process.argv[2] ,process.argv[3] )
var fs=require('fs');
var file= fs.readFileSync(process.argv[2]+'files.txt','utf-8');
processFiles(JSON.parse(file),process.argv[2])

function processFiles(fileNames,number)
{var Dict = require("collections/dict");

    //console.log(fileNames);
    console.time("sync_index"+number);
    var fs=require('fs');
    var natural = require('natural'),
        tokenizer = new natural.AggressiveTokenizerRu();

    var i= 0,
        fileQuantity=fileNames.length;
    var dict = new Dict();

    for(i=0;i<fileQuantity;++i)
    {

        var file= fs.readFileSync(fileNames[i].filename,'utf-8');

        var words=tokenizer.tokenize(file),
            wordsLength=words.length;
        for(var k=0;k<wordsLength;++k) {
            var value = dict.get(words[k]);
            if (value) {
                if(fileNames[i].id!=value[value.length-1])
                    value.push(fileNames[i].id);
            }
            else {
                dict.add([fileNames[i].id], words[k].toLowerCase());
            }
        }

    }



    var outputarray=dict.entries();
    var TimSort = require('timsort');
    TimSort.sort(outputarray,function(a,b){
        return a[0]>b[0]?1:a[0]<b[0]?-1:0;
    });

    var wstream = fs.createWriteStream('F://'+number+'index.txt');
    for (var j=0;j<outputarray.length;j++) {
        wstream.write(JSON.stringify(outputarray[j])+'\n');
    }
        wstream.end();

    console.timeEnd("sync_index"+number);



}