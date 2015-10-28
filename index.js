var Dict = require("collections/dict");

//test();
function test() {
    var dict = new Dict();
    console.time("token_index");
    tokenStream('F://little',
        function (token, filename) {
            token = token.toLowerCase();
            var value = dict.get(token);
            if (value) {
                if (filename != value[value.length - 1])
                    value.push(filename);
            }
            else {
                dict.add([filename], token);
            }

        },
        function () {
            var outputarray = dict.entries();
            var TimSort = require('timsort');
            TimSort.sort(outputarray, function (a, b) {
                return a[0] > b[0] ? 1 : a[0] < b[0] ? -1 : 0;
            });

            var fs = require('fs');
            var wstream = fs.createWriteStream('F://index.txt');
            wstream.write(JSON.stringify(outputarray));

            wstream.end();
            console.timeEnd("token_index");

        });
}

function tokenStream(directory, ontoken, onend) {
    var recursive = require('recursive-readdir');
    var fs = require('fs');
    var readline = require('readline');
    var stream = require('stream');

    var util = require('util');

    recursive(directory, function (err, files) {

        var i = 0,
            fileQuantity = files.length;


        var instream = fs.createReadStream(files[i]);
        var outstream = new stream;
        var rl = readline.createInterface(instream, outstream);
        rl.filename = i;
        var natural = require('natural'),
            tokenizer = new natural.AggressiveTokenizerRu();

        var line = function (line) {
            var words = tokenizer.tokenize(line),
                wordsLength = words.length;
            for (var k = 0; k < wordsLength; ++k) {
                ontoken(words[k], i);
            }
        };
        var close = function () {

            i++;
            if (i >= fileQuantity) {
                onend();
                return;
            }
            var instream = fs.createReadStream(files[i]);
            var outstream = new stream;
            var rl = readline.createInterface(instream, outstream);
            rl.filename = i;
            var regex = /\W+/;
            rl.on('line', line);
            rl.on('close', close);
        };
        rl.on('line', line);


        rl.on('close', close);


    });
}


//readDirectory();
function readDirectory() {
    console.time("sync_index");
    console.time("read_files");
    var recursive = require('recursive-readdir');
    var fs = require('fs');
    var natural = require('natural'),
        tokenizer = new natural.AggressiveTokenizerRu();
    recursive('F:/data', function (err, files) {

            var i = 0,
                fileQuantity = files.length;
            var dict = new Dict();

            for (i = 0; i < fileQuantity; ++i) {

                var file = fs.readFileSync(files[i], 'utf-8');
                //console.log(file);
                var words = tokenizer.tokenize(file),
                    wordsLength = words.length;
                for (var k = 0; k < wordsLength; ++k) {
                    var value = dict.get(words[k]);
                    if (value) {
                        if (i != value[value.length - 1])
                            value.push(i);
                    }
                    else {
                        dict.add([i], words[k].toLowerCase());
                    }
                }

            }


            var outputarray = dict.entries();
            console.timeEnd("read_files");
            console.time("sort_index");
            var TimSort = require('timsort');
            TimSort.sort(outputarray, function (a, b) {
                return a[0] > b[0] ? 1 : a[0] < b[0] ? -1 : 0;
            });
            console.timeEnd("sort_index");

            console.time("write_index");
            var wstream = fs.createWriteStream('F://index_.txt');
            // console.log(JSON.stringify(dict.toArray()));
            wstream.write(JSON.stringify(dict.toJSON()));
            wstream.end();
            console.timeEnd("write_index");
            console.timeEnd("sync_index");

        }
    );
}
//dispatcher();
function dispatcher() {
    var fs = require('fs'),
        config_data = JSON.parse(fs.readFileSync("config.json", 'utf-8'));

    if (!fs.existsSync(config_data.output_file_path)){
        fs.mkdirSync(config_data.output_file_path);
    }

    console.log(config_data);
    console.time("----------TOTAL TIME:--------------");

    var recursive = require('recursive-readdir');

    recursive(config_data.path_to_data, function (err, files) {


        files = files.map(function (elem, index) {
            return {filename: elem, id: index};
        });
        console.log(config_data.output_file_path+"/filesCodes.txt");
        fs.writeFile(config_data.output_file_path+"/filesCodes.txt",JSON.stringify({files:files}), "utf-8", function(){})

        var data = split(files, config_data.threads);

        var async = require('async');
        var counter = 0;
        const child_process = require('child_process');

        for (var i = 0; i < data.length; i++) {
            var wstream = fs.createWriteStream(config_data.output_file_path+"/"+i + 'files.txt');

            wstream.write(JSON.stringify(data[i]));
            wstream.end();
            var workerProcess = child_process.exec('node child.js  ' + i,

                function (error, stdout, stderr) {
                    if (error) {
                        console.log(error.stack);
                        console.log('Error code: ' + error.code);
                        console.log('Signal received: ' + error.signal);
                    }
                    console.log('stdout: ' + stdout);
                    if (stderr != '') console.log('stderr: ' + stderr);
                });

            workerProcess.on('exit', function (code) {
                console.log(counter+' child process exited with exit code ' + code);
                if (++counter == data.length) {
                    var partialIndexes = [];
                    for (var k = 0; k < data.length; ++k) {
                        partialIndexes.push(config_data.output_file_path+"/" + k + 'index.txt');
                    }
                    merge(partialIndexes);
                }
            });
        }
    });
}
merge(['f://temp/0index.txt','f://temp/1index.txt','f://temp//2index.txt','f://temp/3index.txt','f://temp/4index.txt']);
function merge(partialIndex) {
    var fs = require('fs');
    console.log(partialIndex);
    var config_data = JSON.parse(fs.readFileSync("config.json", 'utf-8'));

    var filesAlreadyReaded = 0;
    console.log("Merge begins.");
    var SortedMap = require("collections/sorted-array-map"),
        FastSet = require("collections/fast-set"),
        fs = require('fs'),
        async = require('async'),
        dict = new SortedMap(),
        wstream = fs.createWriteStream(config_data.output_file_path+"/" + "index.txt"),
        readers = [];

    wstream.write('{"data":[');

    var send_data = function () {
        var temp = dict.keys();

        //console.log("Before:"+dict.length);
        for (var k = 0; k < temp.length * 0.3; k++) {
            wstream.write(JSON.stringify([temp[k], dict.get(temp[k])]) + "," + "\n");
            dict.delete(temp[k]);
        }
      //  console.log("After:"+dict.length);

        temp = null;
        for (var k = readers.length - 1; k >= 0; k--) {

            readers[k].resume();
            readers[k].paused = false;
        }

    };

    var counter = 0,
        barrier = 200;

    for (var i = 0; i < partialIndex.length; ++i) {

        var LineByLineReader = require('line-by-line'),
            lr = new LineByLineReader(partialIndex[i]);

        readers.push(lr);
        readers[i].counter = 0;

        !function outer(ii) {

            lr.on('error', function (err) {
                // 'err' contains error object
            });
            lr.on('line', function (line) {
                var temp = JSON.parse(line);
                // ii;
                //console.log(temp[0]+": doc"+ii+" number:"+readers[ii].counter);
//console.log(ii);
                //   console.log("Dict:"+ dict.length);
                //   console.log("Counter:"+ counter);
                if (dict.has(temp[0])) {
                    dict.get(temp[0]).addEach(temp[1]);
                }
                else {
                    dict.add(new FastSet(temp[1]), temp[0]);
                }
                temp = null;
                counter++;

                if (++readers[ii].counter > barrier) {
                    //console.log("reader:"+ii+" was paused with couner:"+readers[ii].counter);
                  //  readers[ii].pause();
                    readers[ii].paused = true;
                }
                if (readers.every(function (elem) {
                        return elem.paused;
                    })) {
                    //console.log("________________PASSED_");
                    barrier += barrier;
                    send_data(
                    );

                }

            });
            lr.on('end', function () {
                // console.log("Readed "+ii);
                if (++filesAlreadyReaded == partialIndex.length) {
                    //wstream.write(JSON.stringify(dict.entries()));
                    var index = dict.entries();
                    for (var j = 0; j < index.length-1; j++) {
                        wstream.write(JSON.stringify(index[j]) + ",\n");
                    }
                    wstream.write(JSON.stringify(index[index.length-1]+"\n") );
                    wstream.write("]}");
                    wstream.end()
                    setTimeout(temp,4000);

                    //console.timeEnd("----------TOTAL TIME:--------------");
                }


            });

        }(i);
    }
}


function writeToFile(data, wstream) {

    for (var j = 0; j < data.length; j++) {
        wstream.write(JSON.stringify(data[j]));
    }
    wstream.end()
    console.timeEnd("----------TOTAL TIME:--------------");

    return;
}

function split(a, n) {
    var len = a.length, out = [], i = 0;
    while (i < len) {
        var size = Math.ceil((len - i) / n--);
        out.push(a.slice(i, i + size));
        i += size;
    }
    return out;
}


//another_merge(['f://temp/0index.txt','f://temp/1index.txt','f://temp//2index.txt','f://temp/3index.txt','f://temp/4index.txt']);
//another_merge(['f://temp/0index.txt','f://temp/1index.txt']);

function another_merge(partialIndex) {
    var fs = require('fs');
    console.log(partialIndex);
    var config_data = JSON.parse(fs.readFileSync("config.json", 'utf-8'));

    var filesAlreadyReaded = 0;
    console.log("Merge begins.");
    var SortedMap = require("collections/sorted-array-map"),
        FastSet = require("collections/fast-set"),
        fs = require('fs'),
        async = require('async'),
        dict = new SortedMap(),
        wstream = fs.createWriteStream(config_data.output_file_path+"/" + "index.txt"),
        readers = [],
        buffers=[],
        counters=[];
    wstream.write('{"data":[');

    var send_data = function () {

        var min_index=0
        for (var j=1;j<buffers.length;++j)
        {
            if(buffers[counters[j]][0]<buffers[counters[min_index]][0]){
                min_index=j;
            }
        }
        wstream.write(JSON.stringify(buffers[counters[min_index]])+"\n");
        temp = null;
        for (var k = readers.length - 1; k >= 0; k--) {

            readers[k].resume();
            readers[k].paused = false;
        }

    };

    var counter = 0,
        barrier = 20;

    for (var i = 0; i < partialIndex.length; ++i) {

        var LineByLineReader = require('line-by-line'),
            lr = new LineByLineReader(partialIndex[i]);
        counters[i]=0;
        readers.push(lr);
        readers[i].counter = 0;

        !function outer(ii) {

            lr.on('error', function (err) {
                // 'err' contains error object
            });
            lr.on('line', function (line) {
                var temp = JSON.parse(line);
                buffers[ii].push[temp];
                temp = null;
                counter++;

                if (++readers[ii].counter > barrier) {
                    //console.log("reader:"+ii+" was paused with couner:"+readers[ii].counter);
                    readers[ii].pause();
                    readers[ii].paused = true;
                }
                if (readers.every(function (elem) {
                        return elem.paused;
                    })) {
                    //console.log("________________PASSED_");
                    barrier += barrier;
                    send_data();

                }

            });
            lr.on('end', function () {
                // console.log("Readed "+ii);
                if (++filesAlreadyReaded == partialIndex.length) {
                    //wstream.write(JSON.stringify(dict.entries()));
                    var index = dict.entries();
                    for (var j = 0; j < index.length-1; j++) {
                        wstream.write(JSON.stringify(index[j]) + ",\n");
                    }
                    wstream.write(JSON.stringify(index[index.length-1]) );
                    wstream.write("]}");
                    wstream.end();

                    setTimeout(temp,4000);


                }


            });

        }(i);
    }



}

function temp()
{
    var fs=require("fs");
    var config_data =JSON.parse(fs.readFileSync("config.json",'utf-8'));
//console.log(fs.readFileSync(config_data.output_file_path+"/index.txt",'utf-8'));
    var index=JSON.parse(fs.readFileSync(config_data.output_file_path+"/index.txt",'utf-8')).data;
    for(var i=0;i<index.length-1;++i)
    {
        if(index[i][0]>index[i+1][0])
        {
            console.log("Erro at index :"+i+" "+index[i][0]+">"+index[i+1][0]);
        }

    }
}