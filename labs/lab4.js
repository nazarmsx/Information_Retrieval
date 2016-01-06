/**
 * Created by nazar on 05.12.2015.
 */
var natural = require('natural');
var Dict = require("collections/dict");

//buildInvertedIndex();
//trigramIndex()
function trigramIndex()
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
                var words = tokenizer.tokenize(file);
                    wordsLength = words.length;
var previous="";
                for (var k = 0; k < wordsLength; ++k) {
                     for (var j=0;j<words[k].length;j++)
                    {
                        var word_to_insert="";
                        if(j==0 && words[k].length>=3)
                        {
                           // console.log(words[k].substr(0,2));
                            word_to_insert='$'+words[k].substr(0,2);

                        }
                        else if( j+2>words[k].length )
                        {
                            if(j+1>words[k].length)
                            break;
                                else word_to_insert = words[k].substr(words[k].length - 2, 2) + '$';

                        }

                        if(word_to_insert=="")
                        {

                            word_to_insert=words[k].substr(j,3)

                        }

if(word_to_insert!=""){

                        word_to_insert=  word_to_insert.toLowerCase();
                        var value = dict.get(word_to_insert);
                        if (value) {
                            if (i != value[value.length - 1][0])
                                value.push([i,1]);
                            else
                                value[value.length - 1][1]++;
                        }
                        else {
                            dict.add([[i,1]], word_to_insert);
                        }

                    }}

                }

            }


            var outputarray = dict.entries();

            var TimSort = require('timsort');
            TimSort.sort(outputarray, function (a, b) {
                return a[0] > b[0] ? 1 : a[0] < b[0] ? -1 : 0;
            });
            var wstream = fs.createWriteStream('4lab.txt');
            wstream.write(JSON.stringify(dict.toJSON()));
            wstream.end();


        }
    );
}

//permutationIndex();
function permutationIndex()
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
                var words = tokenizer.tokenize(file);
                wordsLength = words.length;
                var previous="";
                for (var k = 0; k < wordsLength; ++k) {

                    var words_mixed=mix(words[k]);
                    for (var j=0;j<words_mixed.length;j++)
                    {
                        var word_to_insert=words_mixed[j];


                        if(word_to_insert!=""){

                            word_to_insert=  word_to_insert.toLowerCase();
                            var value = dict.get(word_to_insert);
                            if (value) {
                                if (i != value[value.length - 1][0])
                                    value.push([i,1]);
                                else
                                    value[value.length - 1][1]++;
                            }
                            else {
                                dict.add([[i,1]], word_to_insert);
                            }

                        }}

                }

            }


            var outputarray = dict.entries();

            var TimSort = require('timsort');
            TimSort.sort(outputarray, function (a, b) {
                return a[0] > b[0] ? 1 : a[0] < b[0] ? -1 : 0;
            });
            var wstream = fs.createWriteStream('permutationIndex.txt');
            wstream.write(JSON.stringify(dict.toJSON()));
            wstream.end();


        }
    );
}

treeTest();
function treeTest()
{
    var recursive = require('recursive-readdir');
    var fs = require('fs');
    var config=JSON.parse(fs.readFileSync("config.json"));


    recursive(config.path_to_data, function (err, files) {
            var trie = new SuffixTrie;
            var i = 0,
                fileQuantity = files.length;
            var dict = new Dict();

            var natural = require('natural'),
                tokenizer = new natural.AggressiveTokenizerRu();
            for (i = 0; i < fileQuantity; ++i) {

                var file = fs.readFileSync(files[i], 'utf-8');



                //console.log(file);
                var words = tokenizer.tokenize(file);
                wordsLength = words.length;
                var previous="";
                for (var k = 0; k < wordsLength; ++k) {

                    trie.add(words[k]);

                }

            }



           console.log( trie.find("pot"));

        }
    );
}
//console.log(mix('hello'));
function mix(string)
{
    var result=[string+'$'];
    var temp=result[0];
    for(var i=0;i<string.length;++i)
    {
    var mix=temp.substr(1,string.length)+temp.substr(0,1);
        temp=mix;
        result.push(mix);

    }
    return result;
}



//setTimeout(function(){
//    var trie = new SuffixTrie;
//    trie.add("foo");
//    trie.add("foobar");
//    trie.add("barber");
//console.log(trie.find("barber"));
//},0);




var SuffixTrie;
SuffixTrie = (function() {
    function SuffixTrie() {
        this.count = 0;
        this.structure = {};
        this.prefix = "";
    }
    SuffixTrie.prototype.add = function(string) {
        var chr, index, length, next, node;
        node = this.structure;
        length = string.length;
        index = 0;
        while (index < length) {
            chr = string[index++];
            next = node[chr];
            if (next) {
                node = next;
            } else {
                node[chr] = {};
                node = node[chr];
            }
        }
        if (node.terminator) {
            return false;
        } else {
            node.terminator = true;
            this.count++;
            return true;
        }
    };
    SuffixTrie.prototype.remove = function(string) {
        var chr, index, length, node;
        node = this.structure;
        length = string.length;
        index = 0;
        while (index < length) {
            chr = string[index++];
            node = node[chr];
            if (!node) {
                return false;
            }
        }
        if (node.terminator) {
            delete node.terminator;
            this.count--;
            return true;
        } else {
            return false;
        }
    };
    SuffixTrie.prototype.contains = function(string) {
        var node;
        node = this.findNode(string);
        return node !== null && node.terminator;
    };
    SuffixTrie.prototype.subTrie = function(prefix) {
        var node, subTrie;
        node = this.findNode(prefix);
        subTrie = new SuffixTrie;
        subTrie.structure = node;
        subTrie.prefix = prefix;
        return subTrie;
    };
    SuffixTrie.prototype.find = function(prefix) {
        return SuffixTrie.nodeToArray(this.findNode(prefix), prefix);
    };
    SuffixTrie.prototype.findNode = function(string) {
        var currentChar, index, length, node;
        node = this.structure;
        length = string.length;
        index = 0;
        while (index < length) {
            currentChar = string[index++];
            node = node[currentChar];
            if (!node) {
                return null;
            }
        }
        return node;
    };
    SuffixTrie.prototype.each = function(callback) {
        return SuffixTrie.each(callback, this.structure, 0, this.prefix);
    };
    SuffixTrie.each = function(callback, node, index, string) {
        var property;
        if (node.terminator) {
            callback(index++, string);
        }
        for (property in node) {
            index = this.each(callback, node[property], index, string + property);
        }
        return index;
    };
    SuffixTrie.prototype.size = function() {
        return this.count;
    };
    SuffixTrie.prototype.calculateSize = function(node) {
        var property, size;
        if (node == null) {
            node = this.structure;
        }
        size = node.terminator ? 1 : 0;
        for (property in node) {
            size += this.calculateSize(node[property]);
        }
        return size;
    };
    SuffixTrie.fromArray = function(array) {
        var i, length, trie;
        trie = new SuffixTrie;
        length = array.length;
        i = 0;
        while (i < length) {
            trie.add(array[i++]);
        }
        trie.count = i;
        return trie;
    };
    SuffixTrie.prototype.toArray = function() {
        return SuffixTrie.nodeToArray(this.structure, this.prefix);
    };
    SuffixTrie.nodeToArray = function(node, prefix) {
        var array;
        array = [];
        this.each(function(index, value) {
            return array[index] = value;
        }, node, 0, prefix);
        return array;
    };
    SuffixTrie.fromJSON = function(json) {
        var trie;
        trie = new SuffixTrie;
        trie.structure = JSON.parse(json);
        trie.calculateSize();
        return trie;
    };
    SuffixTrie.prototype.toJSON = function() {
        return JSON.stringify(this.structure);
    };
    return SuffixTrie;
})();