var rev = "1";

var jobNames = ["Explorer", "Engineer", "Agriculturalist", "Settler",
    "Administrator"],
    resourceNames = ["Money", "Citizens", "Ores", "Energy", "Artifacts"],
    galacticNames = ["Galactic Population", "Galactic Energy", "Space Bucks", "Total Artifacts"],
    landNames = ["Unexplored Land", "Rough Terrain", "Basic Infrastructure",
        "Farms", "Towns", "Cities"],
    jobUpgrades = [
        ["Larger Exploration Parties", "Explorers uncover 15% more land per tick", [0, 1000, 0, 0],
            [0.15, 0, 0, 0, 0]
        ],
        ["Educated Engineers", "Engineers improve 15% more land per tick", [250, 1000, 0, 0],
            [0, 0.15, 0, 0, 0]
        ],
        ["One with the Land", "Agriculturalists improve 15% more land per tick", [1000, 5000, 0, 0],
            [0, 0, 0.15, 0, 0]
        ]
    ];

canvas = document.getElementById("viewScreen");
ctx = canvas.getContext("2d");

var pause = false;
var tickLength = 1000;

var images = [];
var patterns = [];

var lTick = document.getElementById("lTickValue"),
    rTick = document.getElementById("rTickValue");

//-----------------//
//    New Game     //
//-----------------//
function newGame() {
    //Set "Active Game"
    localStorage.inProgress = "1";
    localStorage.jobUpgrades = JSON.stringify(jobUpgrades);
    drawJobUpgrades();
    planetSize = Math.floor(Math.random() * (100000 - 50000) + 50000);
    land = landCount();
    jobs = jobCount();
    resources = resourceCount();
    resources[1] += 10;
    pName = planetName();

    function landCount() {
        var result = [planetSize];
        for (i = 1; i < landNames.length; i++) {
            result.push(0);
            //console.log(result);
        }
        return result;
    }

    function jobCount() {
        var result = [];
        for (i = 0; i < jobNames.length; i++) {
            result.push([0, 1, Math.pow(10, i + 1)]);
            //console.log(result);
        }
        return result;
    }

    function resourceCount() {
        var result = [];
        for (i = 0; i < resourceNames.length; i++) {
            result.push(0);
            //console.log(result);
        }
        return result;
    }

    function planetName() {
        var text = "";
        var c = "BCDFGHJKLMNPQRSTVWXYZ";
        var v = "AEIOU";

        for (var i = 0; i < 3; i++) {
            text += c.charAt(Math.floor(Math.random() * c.length));
            text += v.charAt(Math.floor(Math.random() * v.length));
        }
        text += c.charAt(Math.floor(Math.random() * c.length));
        text += "-" + Math.floor(Math.random() * (9 - 1) + 1);
        return text;
    }
    display();
    save();
    console.log("New Planet: " + pName + "| Size: " + planetSize);
}

//-----------------//
//      Reset      //
//-----------------//
function reset() {
    localStorage.removeItem('history');
    history();
    tickLength = 1000;
    newGame();
    display();
}

//-----------------//
//    End Game    //
//-----------------//
function endGame() {
    pause = true;
    localStorage.inProgress = "0";
    history();
  

    var string = "You've added <strong>" + pName + "</strong> to your Galactic Union!<br />" +
        "<p>Landmass: " + planetSize + "<br />";
    for (i = 0; i < resourceNames.length; i++) {
        string += resourceNames[i] + ": " + parseInt(resources[i]) + "<br />";
    }
    string += "</p><p id='endGameGalactic'>Your Galactic Union will continue to gain " + growth * 0.1 +
        " Citizens and " + energyGen * 0.1 + " Energy each Galactic Turn from this planet.</p><br /><button onclick='newGame();menu.planet();'>On to the Next Planet!</button>";
    alert(string);
}

//-----------------//
// History Manager //
//-----------------//
function history() {
    if (typeof energyGen === 'undefined') energyGen = 0;
    if (typeof growth === 'undefined') growth = 0;
    //Do If History Exists//
    if (localStorage.history) {
        console.log("History Exists");
        if (Array.isArray(JSON.parse(localStorage.history))) {
            console.log("It's an Array");
            var hist = JSON.parse(localStorage.history);
            if (hist[hist.length - 1][0] == pName) {
                console.log("Same Planet");
                hist[hist.length - 1] = [pName, planetSize, resources, growth * 0.1, energyGen * 0.1];
            } else {
                hist.push([pName, planetSize, resources, growth * 0.1, energyGen * 0.1]);
            }
            localStorage.history = JSON.stringify(hist);
        } else {
            console.log("History bad type - adding current planet");
            localStorage.history = JSON.stringify([
                [pName, planetSize, resources, growth * 0.1, energyGen * 0.1]
            ]);
        }
    } else {
        console.log("No History - adding current planet");
        localStorage.history = JSON.stringify([
            [pName, planetSize, resources, growth * 0.1, energyGen * 0.1]
        ]);
    }
    console.log("History: " + JSON.parse(localStorage.history));
}

//-----------------//
//    Load Time    //
//-----------------//
window.onload = function () {
    function preload() {
        for (var i = 0; i < preload.arguments.length; i++) {
            images[i] = new Image();
            //images[i].onload = console.log("Loaded "+preload.arguments[i]);
            images[i].src = preload.arguments[i];
            //console.log("Loading "+preload.arguments[i]);
        }
    }
    preload(
        "http://i.imgur.com/gNgIBvn.png",
        "http://i.imgur.com/CZw0nnO.png",
        "http://i.imgur.com/UCoGhaf.png",
        "http://i.imgur.com/riS1ePF.png",
        "http://i.imgur.com/I1hk6RW.png",
        "http://i.imgur.com/AhmRM7a.png",
        "http://i.imgur.com/XEuRvPz.png");

    if (localStorage.inProgress != "1") {
        newGame();
    } else {
        land = JSON.parse(localStorage.land);
        jobs = JSON.parse(localStorage.jobs);
        resources = JSON.parse(localStorage.resources);
        planetSize = parseInt(localStorage.planetSize, 10);
        pName = localStorage.pName;
    }

    history();
    galac();

    if (localStorage.galactic == null) {
        galactic = [
            [0, 0],
            [0, 0],
            [0, 0],
            [0, 0]
        ];
    } else {
        galactic = JSON.parse(localStorage.galactic);
    }
    menu.planet();
    drawButtons();
    drawResources();
    drawGalactic();
    drawMarket();
    drawLand();
    drawJobUpgrades();
    display();
};

var galac = function () {
    var hist = JSON.parse(localStorage.history);
    var output = [];
    var totalPop = 0,
        popGrow = 0,
        totalEnergy = 0,
        energyGrow = 0;
    for (var i = 0; i < hist.length; i++) {
        totalPop += hist[i][2][1];
        //console.log("Total: " + totalPop);
        popGrow += hist[i][3];
        //console.log("Growth: " + popGrow);
        totalEnergy += hist[i][2][3];
        //console.log("Total: " + totalPop);
        energyGrow += hist[i][4];
    }

    function isNumber(obj) {
        return !isNaN(parseFloat(obj));
    }
    if (isNumber(popGrow)) {
        popGrow = 0;
    }
    output.push([totalPop, popGrow], [totalEnergy, energyGrow], [0], [0]);
    return output;
};
//-----------------//
//    Save Time    //
//-----------------//
function save() {
    localStorage.land = JSON.stringify(land);
    localStorage.jobs = JSON.stringify(jobs);
    localStorage.galactic = JSON.stringify(galactic);
    localStorage.resources = JSON.stringify(resources);
    localStorage.planetSize = planetSize;
    localStorage.pName = pName;
}
// noprotect
//-----------------//
// Increment Items //
//-----------------//
function earnResources() {
    //  Seed  //
    var rand = Math.random();
    // citizens //
    growth = Math.ceil(land[1] * 0.1 + land[2] * 0.25 + land[3] * 0.5 + land[4] * 1 + land[5] * 5);
    resources[1] += growth;
    //  Ores  //
    if (land[1] !== 0 && jobs[1][0] !== 0 && rand <= 0.03) {
        resources[2] += Math.ceil(rand * 1000);
        console.log("Ore: " + resources[2]);
    }
    // Money //
    if (land[3] !== 0 || land[4] !== 0 || land[5] !== 0) {
        earnings = (land[3] * 0.1 + land[4] * 0.5 + land[5] * 2.5);
        resources[0] += earnings;
        //console.log("Earned Money: " + earnings);
    }
    // Artifacts //
    if (land[1] !== 0 || land[2] !== 0 || land[3] !== 0 || land[4] !== 0) {
        if (rand <= 0.005) resources[4]++;
    }
    // Energy //
    if (land[4] !== 0 || land[5] !== 0) {
        energyGen = land[4] * 0.05 + land[5] * 0.25;
        resources[3] += energyGen;
    }
}

function landConversion() {
    for (var i = 0; i < land.length - 1; i++) {
        if (land[i] !== 0) {
            if (land[i] - jobs[i][0] * jobs[i][1] >= 0) {
                land[i] -= jobs[i][0] * jobs[i][1];
                land[i + 1] += jobs[i][0] * jobs[i][1];
            } else {
                land[i + 1] += land[i];
                land[i] -= land[i];
            }
        }
    }
}
//-----------------//
//    Purchases    //
//-----------------//
var buy = {
    job: function (i) {
        var civCost = jobs[i][2];
        if (resources[1] >= civCost) {
            resources[1] -= civCost;
            jobs[i][0]++;
            jobs[i][2] = Math.ceil(jobs[i][2] * 1.15);
            display();
        }
    },
    jobUpgrade: function (i) {
        var ju = JSON.parse(localStorage.jobUpgrades);
        var cost = ju[i][2];
        var effect = ju[i][3];
        if (cost[0] <= resources[0] && cost[1] <= resources[1] && cost[2] <= resources[2] && cost[3] <= resources[3]) {
            //Subtract Resources//
            for (var x = 0; x < cost.length; x++) {
                resources[x] -= cost[x];
            }
            //Apply Effects//
            for (x = 0; x < effect.length; x++) {
                jobs[x][1] *= effect[x] + 1;
            }
            //Increase Costs//
            for (x = 0; x < ju[i][2].length; x++) {
                ju[i][2][x] *= 1.333;
            }
            localStorage.jobUpgrades = JSON.stringify(ju);
            drawJobUpgrades();
        }
    }
};

//-----------------//
// Tick Controller //
//-----------------//
var start = new Date().getTime(),
    time = 0;

function tick() {

    time += tickLength;
    var diff = (new Date().getTime() - start) - time;
    window.setTimeout(tick, (tickLength - diff));

    if (pause !== true) {
        if (land[5] != planetSize) {
            landConversion();
            earnResources();
            tickMeters(diff);
        } else {
            endGame();
            land[5]++;
        }
    }
    display();
}
window.setTimeout(tick, tickLength);

//-----------------//
//   Write to UI   //
//-----------------//
function comma(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function nosp(x) {
    return x.replace(/\s+/g, '');
}

function niceNum(n) {
  var nx = Math.floor(JSON.stringify(n).length/3);
  if (JSON.stringify(n).length%3===0) {nx--;}
  if (nx<2) {return comma(n);}
  var name = ["M","B","T","Qua","Qui","Sex","Sep","Oct","Non","Dec",
             "UnDec","DuoDec","TreDec","QuaDec","QuinDec"];
  return (n/Math.pow(1000,nx)).toFixed(2) + " " + name[nx-2];
}

function display() {
    // Job Button Contents //
    for (var i = 0; i < jobNames.length; i++) {
        document.getElementById(jobNames[i] + "Amt").innerHTML = jobs[i][0];
        document.getElementById(jobNames[i] + "Cost").innerHTML = niceNum(jobs[i][2]) + " citizens";
        document.getElementById(jobNames[i] + "Progress").max = jobs[i][2];
        document.getElementById(jobNames[i] + "Progress").value = resources[1];
        if (resources[1] >= jobs[i][2]) {
            document.getElementById(jobNames[i]).className = "buyJob jobAvail";
        } else {
            document.getElementById(jobNames[i]).className = "buyJob";
        }
    }

    // Resource Displays //
    for (i = 0; i < resourceNames.length; i++) {
        document.getElementById(resourceNames[i] + "Amt").innerHTML = comma(Math.floor(resources[i]));
    }
    // Galactic Displays //
    for (i = 0; i < galacticNames.length; i++) {
        document.getElementById(galacticNames[i].replace(/\s+/g, '') + "Amt").innerHTML = comma(Math.floor(galac()[i][0]));
        if (i === 0 || i === 1) document.getElementById(galacticNames[i].replace(/\s+/g, '') + "Rate").innerHTML = "+" + comma(Math.floor(galac()[i][1])) + "/min";
    }
    for (i = 0; i < galacticNames.length; i++) {
        document.getElementById(galacticNames[i].replace(/\s+/g, '') + "MktAmt").innerHTML = comma(Math.floor(galac()[i][0]));
        if (i === 0 || i === 1) document.getElementById(galacticNames[i].replace(/\s+/g, '') + "MktRate").innerHTML = "+" + comma(Math.floor(galac()[i][1])) + "/min";
    }
    // Land Displays //
    for (i = 0; i < landNames.length; i++) {
        document.getElementById(landNames[i].replace(/\s+/g, '') + "Amt").innerHTML = niceNum(land[i]);
        if (i !== 0) {
            document.getElementsByClassName("lps")[i].innerHTML = "+" + (jobs[i - 1][0] * jobs[i - 1][1]).toFixed(1) + "/t";
        }
        document.getElementById(landNames[i].replace(/\s+/g, '') + "Progress").max = planetSize;
        document.getElementById(landNames[i].replace(/\s+/g, '') + "Progress").value = land[i];
    }

    // History List //

    //Start String and Start Table Header Row//
    var histString = "<table id='historyList'><tr><th>Planet Name</th>";
    for (i = 0; i < resourceNames.length; i++) {
        histString += "<th>" + resourceNames[i] + "</th>";
    }
    histString += "</tr>";
    var hist = JSON.parse(localStorage.history);

    //Start Content Rows//
    for (i = hist.length-1; i >= 0; i--) {
        histString += "<tr><td>" + hist[i][0] + "</td>";
        for (j = 0; j < hist[i][2].length; j++) {
            histString += "<td>" + niceNum(parseInt(hist[i][2][j])) + "</td>";
        }
        if (!hist[i][3]) hist[i][3] = 0;
        if (!hist[i][4]) hist[i][4] = 0;
        histString += "</tr><tr><td colspan='6' class='histPerm'>Permanent Galactic Generation: " + comma(Math.floor(hist[i][3])) + " Citizens and " + comma(Math.floor(hist[i][4])) + " Energy</td></tr>";
    }
    histString += "</table>";
    document.getElementById('historyDisplay').innerHTML = histString;

    document.getElementById("tickNum").innerHTML = tickLength;

    if (pause) {
        document.getElementById("pause").style.background = "green";
    } else {
        document.getElementById("pause").style.background = "red";
    }

    planetDraw();

}

function tickMeters(diff) {
    lTick.style.transition = 'width ' + ((tickLength - diff) / 1000) + 's linear';
    rTick.style.transition = 'width ' + ((tickLength - diff) / 1000) + 's linear';
    lTick.style.width = '100%';
    rTick.style.width = '100%';
    setTimeout(function () {
        hundred(diff);
    }, tickLength - (diff + 25));
}

function hundred(diff) {
    lTick.style.transition = 'width 0s linear';
    rTick.style.transition = 'width 0s linear';
    lTick.style.width = "0%";
    rTick.style.width = "0%";
}



//Generate Dynamic Items //
function drawButtons() {
    var string = "";
    for (var i = 0; i < jobNames.length; i++) {
        string += "<button id='" + jobNames[i] + "' class='buyJob' onclick='buy.job(" + i + ")'><strong>" + jobNames[i] +
            "</strong><br /><span id='" + jobNames[i] + "Amt'></span><br /><span id='" + jobNames[i] + "Cost'></span>" +
            "<br /><progress value='0' max='1' id='" + jobNames[i] + "Progress'></progress></button>";
    }
    document.getElementById("jobsBox").innerHTML = string;
}

function drawResources() {
    var string = "";
    for (var i = 0; i < resourceNames.length; i++) {
        string += "<div class='resourceDisplay' id='" + resourceNames[i] + "Disp'><strong>" + resourceNames[i] + "</strong><br />" +
            "<span id='" + resourceNames[i] + "Amt'></span></div>";
    }
    document.getElementById("resourcesBox").innerHTML = string;
}

function drawGalactic() {
    var string = "";
    for (var i = 0; i < galacticNames.length; i++) {
        string += "<div class='galacticDisplay' id='" + galacticNames[i].replace(/\s+/g, '') + "Disp'><strong>" + galacticNames[i] + "</strong><br />" +
            "<span id='" + galacticNames[i].replace(/\s+/g, '') + "Amt'></span><br /><span id='" + galacticNames[i].replace(/\s+/g, '') + "Rate'></span></div>";
    }
    document.getElementById("galacticBox").innerHTML = string;
}

function drawMarket() {
    var string = "";
    for (var i = 0; i < galacticNames.length; i++) {
        string += "<div class='galacticDisplay' id='" + galacticNames[i].replace(/\s+/g, '') + "MktDisp'><strong>" + galacticNames[i] + "</strong><br />" +
            "<span id='" + galacticNames[i].replace(/\s+/g, '') + "MktAmt'></span><br /><span id='" + galacticNames[i].replace(/\s+/g, '') + "MktRate'></span></div>";
    }
    document.getElementById("marketBox").innerHTML = string;
}

function drawLand() {
    var string = "";
    for (var i = 0; i < landNames.length; i++) {
        var str = landNames[i].replace(/\s+/g, '');
        string += "<div class='landDisplay' id='" + str + "Disp'><strong>" + landNames[i].substr(0, 15) + "</strong><br />" +
            "<span id='" + str + "Amt'></span><br /><span class='lps'></span>" +
            "<progress value='0' max='1' id='" + str + "Progress'></progress></div>";
    }
    document.getElementById("landBox").innerHTML = string;
}

function drawJobUpgrades() {
    var ju = JSON.parse(localStorage.jobUpgrades);
    var string = "";
    for (var i = 0; i < ju.length; i++) {
        var cost = "Cost: ";
        for (var j = 0; j < ju[i][2].length; j++) {
            if (ju[i][2][j] !== 0) {
                cost += comma(parseInt(ju[i][2][j])) + " " + resourceNames[j] + "  ";
            }
        }
        string += "<button id='" + nosp(ju[i][0]) + "' class='jobUpgradeButton' onclick='buy.jobUpgrade(" + i +
            ")'><strong>" + ju[i][0] + "</strong><br /><span>" + ju[i][1] +
            "</span><br /><span class='jobUpgradeCost'>" + cost + "</button>";
    }
    document.getElementById("jobUpgradeBox").innerHTML = string;
}

// populates Popup Area with Alerts //
function alert(string) {
    var pop = document.getElementById("popAlert");
    pop.style.display = 'block';
    pop.innerHTML = "<button id='popClose' onclick='menu.planet()'>X</button><br />" + string;
}

function closePop() {
    document.getElementById('popup').style.display = 'none';
}
var menu = {
    closeAll: function () {
        var items = document.getElementsByClassName('menuScreen');
        for (i = 0; i < items.length; i++) {
            if (items[i].style.display !== 'none') {
                items[i].style.display = 'none';
            }
        }
        document.getElementById('popup').style.display = "none";
    },
    planet: function () {
        this.closeAll();
        document.getElementById('popup').style.display = "block";
        document.getElementById('planetView').style.display = "block";
    },
    galactic: function () {
        this.closeAll();
        document.getElementById('popup').style.display = "block";
        document.getElementById('galactic').style.display = "block";
    },
    market: function () {
        this.closeAll();
        document.getElementById('popup').style.display = "block";
        document.getElementById('market').style.display = "block";
    },
    options: function () {
        this.closeAll();
        document.getElementById('popup').style.display = "block";
        document.getElementById('options').style.display = "block";
    }
};

//Planet Draw//
var shipX = 20;

var planetDraw = function () {
    for (i = 0; i < images.length; i++) {
        patterns[i] = ctx.createPattern(images[i], "repeat");
    }
    var myData = [land[0], land[1], land[2], land[3], land[4], land[5]];

    function getTotal() {
        var myTotal = 0;
        for (var j = 0; j < myData.length; j++) {
            myTotal += (typeof myData[j] == 'number') ? myData[j] : 0;
        }
        return myTotal;
    }

    function plotData() {
        var canvas;
        var ctx;
        var lastend = 0;
        var myTotal = getTotal();

        canvas = document.getElementById("viewScreen");
        ctx = canvas.getContext("2d");

        //Create Tiles
        var myColor = ["#222", patterns[0], patterns[1], patterns[2], patterns[4], patterns[5]];
        var planetX = ctx.canvas.width / 2;
        var altX = ctx.canvas.width / 2;
        var planetY = ctx.canvas.height / 2;
        var radius = ctx.canvas.height / 2 - 75;
        ctx.clearRect(0, 0, canvas.width, canvas.height);



        ctx.fillStyle = "rgba(221,221,255,.5)";
        ctx.shadowBlur = 30;
        ctx.shadowColor = "#DDDDFF";
        ctx.arc(altX, planetY, radius + 13, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.shadowBlur = 0;

        //Draw Ship
        //if (shipX===20) mod=-5;
        //if (shipX===-60) mod=5;
        //shipX+=mod;
        //ctx.save();
        //ctx.translate(ctx.canvas.width/3*2,ctx.canvas.height/2);
        //ctx.translate(20,20);
        //ctx.rotate(-90*Math.PI/180);
        //ctx.drawImage(images[3],shipX,0);
        //ctx.restore();

        //Render Wedges
        for (var i = 0; i < myData.length; i++) {
            ctx.fillStyle = myColor[i];
            ctx.beginPath();
            ctx.moveTo(planetX, ctx.canvas.height / 2);
            ctx.arc(altX, planetY, radius, lastend, lastend + (Math.PI * 2 * (myData[i] / myTotal)), false);
            ctx.lineTo(planetX, planetY);
            ctx.fill();
            lastend += Math.PI * 2 * (myData[i] / myTotal);
        }
    }

    plotData();
};

function drawMiniPlanets() {
    var histplanets = 0;
    if (JSON.parse(localStorage.history).length >= 15) {
        histPlanets = 15;
    } else histPlanets = JSON.parse(localStorage.history).length;
    for (i = 0; i < histPlanets; i++) {
        var r = Math.floor((Math.random() * 20 - 1) + 1);
        var x = 0,
            y = Math.floor((Math.random() * 550 - 100) + 100);
        if (r >= 10) {
            x = Math.floor((Math.random() * ctx.canvas.width / 3 - 40) + 40);
        } else {
            x = Math.floor((Math.random() * 920 - ((ctx.canvas.width / 3) * 2)) + ((ctx.canvas.width / 3) * 2));
        }
        console.log(x, y);

        ctx.font = "30px Verdana";
        ctx.fillStyle = "#ffffff";
        ctx.fillText(pName, 10, 90);
    }
}
//-----------------//
// 3 Second Timer  //
//-----------------//
window.setInterval(function () {
    save();
}, 3000);