/**
 * Created by nazar on 27.10.2015.
 */
compress();
function compress()
{
    var fs=require("fs");
    var config_data =JSON.parse(fs.readFileSync("config.json",'utf-8'));
    var index=JSON.parse(fs.readFileSync(config_data.output_file_path+"/index.txt",'utf-8')).data;
    var dictionary="";
    var newIndex= {dictionary:"",postings:[]};
    var step=4;
    var counter=0;
    var position=0;
    var new_position=0;
    var j=0;


    for(var i=0;i<index.length;++i)
    {

        // transform doc id into interval
        var temp=[index[i][1][0]];
        for (j=1;j<index[i][1].length;++j)
        {
            temp.push(index[i][1][j]-index[i][1][j-1]);
        }


        if(--counter<0)
        {
            newIndex.postings.push([temp,new_position]);
            counter=step;
        }
        else
        {
            newIndex.postings.push([temp]);
        }

        if(index[i][0].substr(0,4)!=index[i+1][0].substr(0,4)) {
            newIndex.dictionary += index[i][0].length + index[i][0];
        }
        else {
        j=i;
        var token=index[i][0].length+index[i][0].substr(0,4)+"*"+index[i][0].substr(4);
        while(index[i][0].substr(0,4)==index[j][0].substr(0,4) && j<index.length-1)
        {
            j++;
    token+="$"+index[j][0].substr(4);

        }
        i=j;
            newIndex.dictionary+=token;
        }
        new_position+=index[i][0].length;

    }
    //newIndex.dictionary="";
   // console.log(dictionary);
    fs.writeFile(config_data.output_file_path+"/commpressedIndex.txt",JSON.stringify(newIndex), "utf-8", function(){})
}