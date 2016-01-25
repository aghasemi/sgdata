
var express = require('express');
var sync_request = require('sync-request');
var moment = require('moment');



var app = express();
var port = process.env.PORT || 8484;

var sgUrl='https://www.swissgrid.ch/exportsdldata.html/content/swissgrid/en/home/experts/topics/ancillary_services/tenders/tertiary-control-power/jcr:content/par/sdltrlsearch_0?exporttype=csv&sdltype=trl&timefrom={from}&timeto={to}&_charset_=UTF-8&language=en&table=tbl_tcp{unit}&leistung={sign}&timespan=%2000_24'
var validUnits=['d','daily','w','weekly'];
var validSigns=['p','positive','n','negative'];



app.get('/:unit/:sign/:from/:to', function (req, res) {
  var unit=req.params.unit;
  var sign=req.params.sign;
  var from=req.params.from;
  var to=req.params.to;
  var grp=req.params.grouping;
  if(unit==undefined)
  {
    return;
  }
  
  var unitIndex=validUnits.indexOf(unit.toString());
  if (unitIndex==-1)
  {
    res.status(500).end('<h1>Invalid unit</h1>')
    return;
  }
  var unitStr=(unitIndex<=1) ? 'daily':'weekly';
  
  var signIndex=validSigns.indexOf(sign.toString());
  if (signIndex==-1)
  {
    res.status(500).end('<h1>Invalid sign</h1>')
    return;
  }
  var signStr=(signIndex<=1) ? '%2B':'-';

  var fromDate=moment(from.toString(), "DD.MM.YYYY");
  var toDate=moment(to.toString(), "DD.MM.YYYY");
  console.log(fromDate.toString()+' ** '+toDate.toString()+' # '+unitStr+' # '+signStr);
  if ((unitStr==='weekly')&& (fromDate.day()!=1 || toDate.day()!=0))
  {
     res.status(500).end('<h1>Invalid date range for weekly data</h1>')
     return;
  }
  //res.send('Hello '+unit+sign+from+'-'+to+'&'+(grp==undefined));
  var url=sgUrl.replace('{from}',fromDate.format('DD.MM.YYYY')).replace('{to}',fromDate.format('DD.MM.YYYY')).replace('{sign}',signStr).replace('{unit}',unitStr);
  var raw = sync_request('GET', url, {'headers': {}});
  // pass in the contents of a csv file
   var lines=raw.getBody().toString().split('\n');
   var data=Array();
   var respStr='';
   var filename='export.csv'
   res.set({'Content-Type': 'text/plain',"Content-Disposition": 'filename="'+filename+'"',
   });

   lines.forEach(function(currLine, index, allLines) {
      if (index>=3)
        {
          currLine=currLine.replace("'","");
          record=currLine.split(';');
          record.pop();
          //console.log(record.toString())
          data.push(record);
          respStr+=record.join(' , ')+'\n';
        }
    });
  
    res.end(respStr);
  
});

app.get('/', function (req, res) {
    res.end('Index page');
    next();
});

app.listen(port, function () {
  console.log('Example app listening on port!');
  console.log('Hi! '+port)
});