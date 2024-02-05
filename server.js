const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 5000;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.get('/api/user', (req, res) => {
  res.send({
    user: {
      userName: 'Hosko Comms'
    }
  });
});

function shuffle(array) {
  var tmp, current, top = array.length;
  if (top)
    while (--top) {
      current = Math.floor(Math.random() * (top + 1));
      tmp = array[current];
      array[current] = array[top];
      array[top] = tmp;
    }
  return array;
}

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}
var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "1234",
  database: "touchstone",
  multipleStatements: true
});

app.get('/api/dashboarddata/:country?/:city?', (req, res) => {
  //var carriers = 0;
  var stringForQuery = ""
  if(req.params.country && req.params.country !== "country") {
    stringForQuery = "AND country = '" + req.params.country + "'";
  }       
  if(req.params.city) {
    stringForQuery = "AND city = '" + req.params.city + "'";
  }      
  var query = `SELECT COUNT(DISTINCT carrierName) 'carriers' FROM da;
              SELECT COUNT(DISTINCT country) 'countries' FROM da;
              SELECT COUNT(id) 'carrierQuotes' FROM da WHERE carrierName = 'Hosko Comms'  ${stringForQuery};
              SELECT SUM(mrcUsd) 'totalMrc' from touchstone.da where carrierName = 'Hosko Comms'  ${stringForQuery};
              SELECT SUM(nrcUsd) 'totalNrc' from touchstone.da where carrierName = 'Hosko Comms'  ${stringForQuery};
              SELECT COUNT(DISTINCT city) 'cities' FROM touchstone.da;`;
  //con.connect(function(err) {
  //  if (err) throw err;
    con.query(query, function(err, result, fields) {
      res.send({
        carriers: result[0][0].carriers,
        countries: result[1][0].countries,
        quotes: result[2][0].carrierQuotes,
        totalMrc: result[3][0].totalMrc,
        totalNrc: result[4][0].totalNrc,
        cities: result[5][0].cities
      });
      // con.end()
    });
//  });

});
app.get('/api/dashboard/cities/:country?', (req, res) => {
  //var carriers = 0;
  var stringForQuery = ""
  if(req.params.country) {
    stringForQuery = "where country = '" + req.params.country + "'";
  }   
  var query = `SELECT DISTINCT city 'city' FROM da ${stringForQuery} group by city order by city;`; // [0]
    con.query(query, function(err, result, fields) {

      res.send({
        data: result
      });
    });

});
app.get('/api/getRegions/:country?', (req, res) => {
  //var carriers = 0;
  var query = "SELECT DISTINCT zone 'region' FROM zones;"; // [0]

    con.query(query, function(err, result, fields) {
      res.send({
        data: result
      });
    });
});
app.get('/api/getServiceCategories', (req, res) => {
  //var carriers = 0;
  var query = "SELECT DISTINCT serviceCategory 'service' FROM da;"; // [0]

    con.query(query, function(err, result, fields) {
      res.send({
        data: result
      });
    });
});
app.get('/api/getAccessTechnologies', (req, res) => {
  //var carriers = 0;
  var query = "SELECT DISTINCT reqTechnology 'technology' FROM da;"; // [0]

    con.query(query, function(err, result, fields) {
      res.send({
        data: result
      });
    });
});
app.get('/api/getBandwidths', (req, res) => {
  //var carriers = 0;
  var query = "SELECT DISTINCT rfqRequestedBandwidth 'speed' FROM da group by rfqRequestedBandwidth order by rfqRequestedBandwidth;"; // [0]

    con.query(query, function(err, result, fields) {
      res.send({
        data: result
      });
    });
});
app.get('/api/getCountries/:region?', (req, res) => {
  //var carriers = 0;
  var stringForQuery = ""
  if(req.params.region) {
    stringForQuery = "where zone = '" + req.params.region + "'";
  } 
  var query = `SELECT DISTINCT country 'country' FROM zones ${stringForQuery}  GROUP BY country order by country;`; // [0]

  //con.connect(function(err) {
  //  if (err) throw err;
    con.query(query, function(err, result, fields) {
      // console.log(result)
      // var citiesArray = [];
      // for (var i = 0; i < result.length; i++) {
      //   citiesArray.push(result[i].cities)
      // }
      result.forEach(function(res) {
        res.value = res.label
      })
      res.send({
        data: result
      });
      // con.end()
    });
//  });

});
app.get('/api/dashboard/chart/:country?/:city?', (req, res) => {
    console.log(req.params.country, req.params.city)
    var stringForQuery = ""
    if(req.params.country && req.params.country !== "country") {
      stringForQuery = "AND country = '" + req.params.country + "'";
    }       
    if(req.params.city) {
      stringForQuery = "AND city = '" + req.params.city + "'";
    }           
    var query = `SELECT COUNT(IF(reqTechnology = 'Broadband' ${stringForQuery}, 1, null)) 'broadband',
              	COUNT(IF(reqTechnology = 'DIA' ${stringForQuery}, 1, null)) 'dia',
              	COUNT(IF(reqTechnology= 'Ethernet' ${stringForQuery}, 1, null)) 'ethernet',
              	COUNT(IF(reqTechnology = 'MPLS' ${stringForQuery}, 1, null)) 'mpls',
                COUNT(IF(reqTechnology = 'Private Line' ${stringForQuery}, 1, null)) 'privateLine',
                COUNT(IF(reqTechnology = 'SDH' ${stringForQuery}, 1, null)) 'sdh',
                COUNT(IF(reqTechnology = 'VSAT' ${stringForQuery}, 1, null)) 'vsat',
                COUNT(IF(reqTechnology = 'xDSL' ${stringForQuery}, 1, null)) 'xdsl',
                COUNT(IF(reqTechnology = 'Wireless' ${stringForQuery}, 1, null)) 'wireless',        
                carrierName from touchstone.da GROUP BY carrierName;`;    //[0]      
      query += `SELECT COUNT(IF(serviceCategory = 'Internet' ${stringForQuery}, 1, null)) 'internet',
  	            COUNT(IF(serviceCategory = 'Private Line' ${stringForQuery}, 1, null)) 'privateline',
  	            COUNT(IF(serviceCategory= 'MPLS' ${stringForQuery}, 1, null)) 'mpls',      
                carrierName from touchstone.da GROUP BY carrierName;`; // [1]
      query += `SELECT COUNT(IF(uid2 = 'Major' ${stringForQuery}, 1, null)) 'major',
                COUNT(IF(uid2 = 'National' ${stringForQuery}, 1, null)) 'national',
                carrierName from da GROUP BY carrierName;`;  // [2]    
      query += `SELECT COUNT(IF(rfqRequestedBandwidth = '2 Mbps' ${stringForQuery}, 1, null)) 'mbps2',
                COUNT(IF(rfqRequestedBandwidth = '10 Mbps' ${stringForQuery}, 1, null)) 'mbps10',
                COUNT(IF(rfqRequestedBandwidth= '100 Mbps' ${stringForQuery}, 1, null)) 'mbps100',
                COUNT(IF(rfqRequestedBandwidth = '250 Mbps' ${stringForQuery}, 1, null)) 'mbps250',
                COUNT(IF(rfqRequestedBandwidth = '500 Mbps' ${stringForQuery}, 1, null)) 'mbps500',
                COUNT(IF(rfqRequestedBandwidth = '1 Gbps' ${stringForQuery}, 1, null)) 'mbps1000',
                COUNT(IF(rfqRequestedBandwidth = '10 Gbps' ${stringForQuery}, 1, null)) 'mbps10000',
                carrierName from touchstone.da GROUP BY carrierName;`;    //[3]                   
      var speedsArray = ["2 Mbps", "10 Mbps", "100 Mbps", "250 Mbps", "500 Mbps", "1 Gbps", "10 Gbps"];
      queryArray = [];
      var carriers = ["Cluj Comms", "Dragu Tel", "Hosko Comms", "Jimmy Tel", "Shep Comm", "Ursu Tel"]
      speedsArray.forEach(function(speed) {
        queryArray.push(`SELECT carrierName, avg(mrcUsd) 'speed' from da where rfqRequestedBandwidth = '${speed}' ${stringForQuery} GROUP BY carrierName order by carrierName;`) 
      })               
      query += queryArray.join("");     // [4]               
    con.query(query, function(err, result, fields) {

      if (err) throw err;
      var techArray = ["Broadband", "DIA", "Ethernet", "MPLS", "Private Line", "SDH", "VSAT", "xDSL", "Wireless"];

      var hoskoTechs = [];
      var jimmyTechs = [];
      var draguTechs = [];
      var clujTechs = [];
      var shepTechs = [];
      var ursuTechs = [];

      hoskoTechs = Object.values(result[0][2])
      clujTechs = Object.values(result[0][0])
      draguTechs = Object.values(result[0][1])
      jimmyTechs = Object.values(result[0][3])
      shepTechs = Object.values(result[0][4])
      ursuTechs = Object.values(result[0][5])
        
        
      var hoskoServ = Object.values(result[1][2])
      var clujServ = Object.values(result[1][0])
      var draguServ = Object.values(result[1][1])
      var jimmyServ = Object.values(result[1][3])
      var shepServ = Object.values(result[1][4])
      var ursuServ = Object.values(result[1][5])
      
      var hoskoLoc = Object.values(result[2][2])
      var clujLoc = Object.values(result[2][0])
      var draguLoc = Object.values(result[2][1])
      var jimmyLoc = Object.values(result[2][3])
      var shepLoc = Object.values(result[2][4])
      var ursuLoc = Object.values(result[2][5])
      
      // var speedsArray = ["2 Mbps", "10 Mbps", "100 Mbps", "250 Mbps", "500 Mbps", "1 Gbps", "10 Gbps"]  
      // console.log(result);
      var hoskoSpeed = Object.values(result[3][2])
      var clujSpeed = Object.values(result[3][0])
      var draguSpeed = Object.values(result[3][1])
      var jimmySpeed = Object.values(result[3][3])
      var shepSpeed = Object.values(result[3][4])
      var ursuSpeed = Object.values(result[3][5])
            
      res.send({
        query: result,

        lineData: {
          labels: techArray,
          datasets: [{
              label: 'Hosko Comm',
              fill: false,
              data: hoskoTechs,
              backgroundColor: "#251CDD"
            },
            {
              label: 'Carrier 1',
              data: jimmyTechs,
              fill: false,
              backgroundColor: "#9D7679"
            },
            {
              label: 'Carrier 2',
              data: draguTechs,
              fill: false,
              backgroundColor: "#75E4D8"
            },
            {
              label: 'Carrier 3',
              data: clujTechs,
              fill: false,
              backgroundColor: "#D67D96"
            },
            {
              label: 'Carrier 4',
              data: shepTechs,
              fill: false,
              backgroundColor: "#D35AEF"
            },
            {
              label: 'Carrier 5',
              data: ursuTechs,
              fill: false,
              backgroundColor: "#27D81E"
            }
          ]
        },
        serviceData: {
          labels: ["Internet", "Private Line", "MPLS"],
          datasets: [{
              label: 'Hosko Comm',
              fill: false,
              data: hoskoServ,
              backgroundColor: "#251CDD"
            },
            {
              label: 'Carrier 1',
              data: jimmyServ,
              fill: false,
              backgroundColor: "#9D7679"
            },
            {
              label: 'Carrier 2',
              data: draguServ,
              fill: false,
              backgroundColor: "#75E4D8"
            },
            {
              label: 'Carrier 3',
              data: clujServ,
              fill: false,
              backgroundColor: "#D67D96"
            },
            {
              label: 'Carrier 4',
              data: shepServ,
              fill: false,
              backgroundColor: "#D35AEF"
            },
            {
              label: 'Carrier 5',
              data: ursuServ,
              fill: false,
              backgroundColor: "#27D81E"
            }
          ]
        },             
        locationData: {
          labels: ["Major", "National"],
          datasets: [{
              label: 'Hosko Comm',
              fill: false,
              data: hoskoLoc,
              backgroundColor: "#251CDD"
            },
            {
              label: 'Carrier 1',
              data: jimmyLoc,
              fill: false,
              backgroundColor: "#9D7679"
            },
            {
              label: 'Carrier 2',
              data: draguLoc,
              fill: false,
              backgroundColor: "#75E4D8"
            },
            {
              label: 'Carrier 3',
              data: clujLoc,
              fill: false,
              backgroundColor: "#D67D96"
            },
            {
              label: 'Carrier 4',
              data: shepLoc,
              fill: false,
              backgroundColor: "#D35AEF"
            },
            {
              label: 'Carrier 5',
              data: ursuLoc,
              fill: false,
              backgroundColor: "#27D81E"
            }
          ]
        },
        speedData: {
          labels: speedsArray,
          datasets: [{
              label: 'Hosko Comm',
              fill: false,
              data: hoskoSpeed,
              backgroundColor: "#251CDD"
            },
            {
              label: 'Carrier 1',
              data: jimmySpeed,
              fill: false,
              backgroundColor: "#9D7679"
            },
            {
              label: 'Carrier 2',
              data: draguSpeed,
              fill: false,
              backgroundColor: "#75E4D8"
            },
            {
              label: 'Carrier 3',
              data: clujSpeed,
              fill: false,
              backgroundColor: "#D67D96"
            },
            {
              label: 'Carrier 4',
              data: shepSpeed,
              fill: false,
              backgroundColor: "#D35AEF"
            },
            {
              label: 'Carrier 5',
              data: ursuSpeed,
              fill: false,
              backgroundColor: "#27D81E"
            }
          ]
        
        }                     
      });
    });
});


app.post('/api/world', (req, res) => {
  console.log(req.body);
  res.send(
    `I received your POST request. This is what you sent me: ${req.body.post}`,
  );
});
app.post('/api/getQuotes', (req, res) => {
  console.log(req.body);
  var request = req.body;
  var locationTypeQuery = ``;
  var countryQuery = ``;
  var cityQuery = ``;
  var serviceQuery = ``;
  var technologyQuery = ``;
  var termQuery  = ``;
  var bandString = ``;
  if(request.location.locationType) {
    locationTypeQuery = `AND uid2 = '${request.location.locationType}'`
  }
  if(request.location.country) {
    countryQuery = `country = '${request.location.country}'`
  }
  if(request.location.city) {
    cityQuery = `AND city = '${request.location.city}'`
  }
  if(request.service.service) {
    serviceQuery = `AND serviceCategory = '${request.service.service}'`
  }  
  if(request.service.technology) {
    technologyQuery = `AND reqTechnology = '${request.service.technology}'`
  }
  if(request.service.term) {
    termQuery = `AND reqTerm = '${request.service.term}'`
  }
  var bandwidthsArray = [];
  var queries = []
  if(request.bandwidth.length > 0) {

    endBandString = `)`;  
    
    bandwidthsArray.push(`AND (`);
    request.bandwidth.forEach(function(bandwidth, index) {
      console.log(index);
      if(index === 0) {
        bandwidthsArray.push(`rfqRequestedBandwidth = '${bandwidth}'`)
      } else {
    
        bandwidthsArray.push(` OR rfqRequestedBandwidth = '${bandwidth}'`)
      }
    })
    bandwidthsArray.push(endBandString);
    // var bands = request.bandwidth;
    // bands.forEach(function(band) {
    // 
    //   queries.push(`SELECT carrierName, avg(mrcUsd) 'averageMrc', avg(nrcUsd) 'averageNrc' from da WHERE ${countryQuery} ${locationTypeQuery} ${cityQuery} ${serviceQuery} ${technologyQuery} ${termQuery} AND rfqRequestedBandwidth = '${band}'  GROUP BY carrierName order by carrierName;`);
    // })
    // console.log(queries);
  }
  var query = `SELECT carrierName, avg(mrcUsd) 'averageMrc', avg(nrcUsd) 'averageNrc' from da WHERE (${countryQuery} ${locationTypeQuery} ${cityQuery} ${serviceQuery} ${technologyQuery} ${termQuery}) ${bandwidthsArray.join("")}  GROUP BY carrierName order by carrierName;`;
  // query += queries.join("")
  console.log(query);
  con.query(query, function(err, result, fields) {
      if (err) throw err;
      res.send(
        result
      );
  })
});
app.post('/api/getBandwidthQuotes', (req, res) => {
  console.log(req.body.bandwidth);
  var request = req.body;
  var locationTypeQuery = ``;
  var countryQuery = ``;
  var cityQuery = ``;
  var serviceQuery = ``;
  var technologyQuery = ``;
  var termQuery  = ``;
  var bandString = ``;
  if(request.location.locationType) {
    locationTypeQuery = `AND uid2 = '${request.location.locationType}'`
  }
  if(request.location.country) {
    countryQuery = `country = '${request.location.country}'`
  }
  if(request.location.city) {
    cityQuery = `AND city = '${request.location.city}'`
  }
  if(request.service.service) {
    serviceQuery = `AND serviceCategory = '${request.service.service}'`
  }  
  if(request.service.technology) {
    technologyQuery = `AND reqTechnology = '${request.service.technology}'`
  }
  if(request.service.term) {
    termQuery = `AND reqTerm = '${request.service.term}'`
  }
  var bandwidthsArray = [];
  var queries = []
  if(request.bandwidth.length > 0) {

    var bands = request.bandwidth;
    bands.forEach(function(band) {
      
      queries.push(`SELECT carrierName, avg(mrcUsd) 'averageMrc', avg(nrcUsd) 'averageNrc', rfqRequestedBandwidth from da WHERE ${countryQuery} ${locationTypeQuery} ${cityQuery} ${serviceQuery} ${technologyQuery} ${termQuery} AND rfqRequestedBandwidth = '${band}'  GROUP BY carrierName order by carrierName;`);
    })
    console.log(queries);
  }
  // var query = `SELECT carrierName, avg(mrcUsd) 'averageMrc', avg(nrcUsd) 'averageNrc' from da WHERE (${countryQuery} ${locationTypeQuery} ${cityQuery} ${serviceQuery} ${technologyQuery} ${termQuery}) ${bandwidthsArray.join("")}  GROUP BY carrierName order by carrierName;`;
  var query = queries.join("")
  console.log(query);
  con.query(query, function(err, result, fields) {
      if (err) throw err;
      var labels = req.body.bandwidth;
      var datasetsArray = []
      var datasetsObj = {}


      var hoskoMrc = [];
      var jimmyMrc = [];
      var draguMrc = [];
      var clujMrc = [];
      var shepMrc = [];
      var ursuMrc = [];
      var hoskoNrc = [];
      var jimmyNrc = [];
      var draguNrc = [];
      var clujNrc = [];
      var shepNrc = [];
      var ursuNrc = [];      
      for (var i = 0; i < result.length; i++) {
        // console.log(result[i])
        result[i].forEach(function(carrier) {
          console.log(carrier)
          switch (carrier.carrierName) {
            case 'Cluj Comms':
              clujMrc.push(carrier.averageMrc)
              clujNrc.push(carrier.averageNrc)
              break;
            case 'Hosko Comms':
              hoskoMrc.push(carrier.averageMrc)
              hoskoNrc.push(carrier.averageNrc)
              break;
            case 'Dragu Tel':
              draguMrc.push(carrier.averageMrc)
              draguNrc.push(carrier.averageNrc)
              break;
            case 'Jimmy Tel':
              jimmyMrc.push(carrier.averageMrc)
              jimmyNrc.push(carrier.averageNrc)
              break;     
            case 'Shep Comm':
              shepMrc.push(carrier.averageMrc)
              shepNrc.push(carrier.averageNrc)
              break;
            case 'Ursu Tel':
              ursuMrc.push(carrier.averageMrc)
              ursuNrc.push(carrier.averageNrc)
              break;                                                                 
            default:
              
          }
        })
      }
      // console.log(clujMrc, labels);
      var chartData = {}
     
      var hoskoColor = getRandomColor();
      var draguColor = getRandomColor();
      var jimmyColor = getRandomColor();
      var clujColor = getRandomColor();
      var ursuColor = getRandomColor();
      var shepColor = getRandomColor();
      chartData.averageMrc = {
        labels: labels,
        datasets: [{
          label: "Hosko Comms",
          data: hoskoMrc,
          fill: false,
          backgroundColor: hoskoColor
        }, {
          label: "Dragu Tel",
          data: draguMrc,
          fill: false,
          backgroundColor: draguColor
        }, {
          label: "Jimmy Tel",
          data: jimmyMrc,
          fill: false,
          backgroundColor: jimmyColor
        }, {
          label: "Shep Comm",
          data: shepMrc,
          fill: false,
          backgroundColor: shepColor
        }, {
          label: "Cluj Comms",
          data: clujMrc,
          fill: false,
          backgroundColor: clujColor
        }, {
          label: "Ursu Tel",
          data: ursuMrc,
          fill: false,
          backgroundColor: ursuColor
        }]
      }
      chartData.averageNrc = {
        labels: labels,
        datasets: [{
          label: "Hosko Comms",
          data: hoskoNrc,
          fill: false,
          backgroundColor: hoskoColor
        }, {
          label: "Dragu Tel",
          data: draguNrc,
          fill: false,
          backgroundColor: draguColor
        }, {
          label: "Jimmy Tel",
          data: jimmyNrc,
          fill: false,
          backgroundColor: jimmyColor
        }, {
          label: "Shep Comm",
          data: shepNrc,
          fill: false,
          backgroundColor: shepColor
        }, {
          label: "Cluj Comms",
          data: clujNrc,
          fill: false,
          backgroundColor: clujColor
        }, {
          label: "Ursu Tel",
          data: ursuNrc,
          fill: false,
          backgroundColor: ursuColor
        }]
      }
      chartData.rawData = result      
      res.send(
        chartData
      );
  })
});
app.listen(port, () => {
  console.log(`Listening on port ${port}`)


});