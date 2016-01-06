/**
 * Created by nazar on 05.12.2015.
 */
var Dict = require("collections/dict");
//buildDictionary();
function buildTwoIndex()
{
    var recursive = require('recursive-readdir');
    var fs = require('fs');
    var config=JSON.parse(fs.readFileSync("config.json"));


    recursive(config.path_to_data, function (err, files) {

            var i = 0,
                fileQuantity = files.length;
            var dict = new Dict();

            var natural = require('natural'),
                tokenizer = new natural.AggressiveTokenizerRu();
            for (i = 0; i < fileQuantity; ++i) {

                var file = fs.readFileSync(files[i], 'utf-8');
                //console.log(file);
                var words = tokenizer.tokenize(file),
                    wordsLength = words.length;
                for (var k = 0; k < wordsLength-1; ++k) {

                    var value = dict.get(words[k].toLowerCase()+' '+words[k+1].toLowerCase());
                    if (value) {
                        if (i != value[value.length - 1][0])
                            value.push([i,1]);
                        else
                            value[value.length - 1][1]++;
                    }
                    else {
                        dict.add([[i,1]], words[k].toLowerCase()+' '+words[k+1].toLowerCase());
                    }
                }

            }


            var outputarray = dict.entries();

            var TimSort = require('timsort');
            TimSort.sort(outputarray, function (a, b) {
                return a[0] > b[0] ? 1 : a[0] < b[0] ? -1 : 0;
            });
            var wstream = fs.createWriteStream('two_word_index.txt');
            wstream.write(JSON.stringify(outputarray));
            wstream.end();


        }
    );
}
//buildTwoIndex();
function buildTwoIndex()
{
    var recursive = require('recursive-readdir');
    var fs = require('fs');
    var config=JSON.parse(fs.readFileSync("config.json"));


    recursive(config.path_to_data, function (err, files) {

            var i = 0,
                fileQuantity = files.length;
            var dict = new Dict();

            var natural = require('natural'),
                tokenizer = new natural.AggressiveTokenizerRu();
            for (i = 0; i < fileQuantity; ++i) {

                var file = fs.readFileSync(files[i], 'utf-8');
                //console.log(file);
                var words = tokenizer.tokenize(file),
                    wordsLength = words.length;
                for (var k = 0; k < wordsLength; ++k) {

                    var value = dict.get(words[k].toLowerCase());
                    if (value) {
                        if (i != value[value.length - 1][0])
                            value.push([i,[k]]);
                        else
                            value[value.length - 1][1].push(k);
                    }
                    else {
                        dict.add([[i,[k]]], words[k].toLowerCase());
                    }
                }

            }


            var outputarray = dict.entries();

            var TimSort = require('timsort');
            TimSort.sort(outputarray, function (a, b) {
                return a[0] > b[0] ? 1 : a[0] < b[0] ? -1 : 0;
            });
            var wstream = fs.createWriteStream('F://two_word_index.txt');
            wstream.write(JSON.stringify(outputarray));
            wstream.end();


        }
    );
}