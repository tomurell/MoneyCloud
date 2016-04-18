//


var exo3;
var exo4;
var exo5;
var exo6;
var introTxt = "Shown here are investments in the top 200 companies as recorded in the CrunchBase \narchive through 2013 [crunchbase.com], using p5.js [p5js.org].\n\n> Company bubbles are color-coded by category; sized by total amount of investment.\n\n> Investors (bars along the bottom) are shown sized by total amount invested.\n\nPrepared as coursework for ARTG5330  //  april 2016 \n\ninformation design + visualization  //  northeastern university\n\nthomas urell [github.com/tomurell]"
var companySystem = [];
var investorSystem = [];
var attractors = [];
var attractorsC = [];
var table;
var categories = {};
var catnums = {};
var aggregated = {};
var investors = [];
var selectInvestors = [];
var investorDisplay = [];
var particles = [];
var connections = [];
var moneyStorm = [];
var highlightInv = [];
var mousePress = false;
var boxLive = true;

function preload() {
    table = loadTable("data/supertotal2.csv", "csv", "header");
    exo3 = loadFont("fonts/Exo2-Light.ttf");
    exo4 = loadFont("fonts/Exo2-Regular.ttf");
    exo5 = loadFont("fonts/Exo2-Medium.ttf");
    exo6 = loadFont("fonts/Exo2-SemiBold.ttf");
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

//+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+
//SETUP
function setup() {
    var canvas = createCanvas(windowWidth, windowHeight);
    frameRate(30);
    colorMode(HSB, 360, 100, 100, 100);
    background(0);

    for (var r = 0; r < table.getRowCount(); r++) {
        var cname = table.getString(r, "company_name");
        var iname = table.getString(r, "investor_name");
        var category = table.getString(r, "category_code");
        var catnumb = table.getString(r, "category_num");
        var invested = table.getString(r, "amount_usd");
        invested = parseInt(invested);

        if (!isNaN(invested)) {
            if (aggregated.hasOwnProperty(cname)) {
                aggregated[cname] += invested;
            } else {
                aggregated[cname] = invested;
            }
        }

        if (!isNaN(invested)) {
            if (investors.hasOwnProperty(iname)) {
                investors[iname] += invested;
            } else {
                investors[iname] = invested;
            }
        }

        categories[cname] = category;
        catnums[cname] = catnumb;
    }

    var aAggregated = [];
    Object.keys(aggregated).forEach(function (name_) {
        var company = {};
        company.name = name_;
        company.category = categories[name_];
        company.cnum = catnums[name_];
        company.sum = aggregated[name_]
        aAggregated.push(company);
    });

    var aInvestors = [];
    Object.keys(investors).forEach(function (name_) {
        var investor = {};
        investor.iname = name_;
        investor.totalInv = investors[name_];
        aInvestors.push(investor);
    });

    aAggregated.sort(function (companyA, companyB) {
        return companyB.sum - companyA.sum;
    });

    aAggregated = aAggregated.slice(0, 200);

    for (var r = 0; r < table.getRowCount(); r++) {
        var compname = table.getString(r, "company_name");
        var invname = table.getString(r, "investor_name");
        var date = table.getString(r, "funded_at");
        var category = table.getString(r, "category_code");
        var amt = table.getString(r, "amount_usd");
        amt = parseInt(amt);

        var foundCompany = aAggregated.find(function (element, index, array) {
            if (element.name == compname) {
                return true;
            } else {
                return false;
            }
        });

        if (foundCompany) {
            var foundInvestor = false;
            foundInvestor = aInvestors.find(function (element, index, array) {
                if (element.iname == invname) {
                    return true;
                } else {
                    return false;
                }
            });

            if (foundInvestor) {
                var connection = {};
                connection.company = foundCompany;
                connection.investor = foundInvestor;
                connection.amount = amt;
                connection.date = date;
                connections.push(connection);
            }
        }
    }

    connections.forEach(function (connection) {
        var found = selectInvestors.find(function (selectInvestor) {
            return selectInvestor == connection.investor;
        });
        if (!found) selectInvestors.push(connection.investor)
    });

    selectInvestors.sort(function (inameA, inameB) {
        return inameB.totalInv - inameA.totalInv;
    });

    for (var i = 0; i < aAggregated.length; i++) {
        var p = new Company(aAggregated[i].name
            , aAggregated[i].sum
            , aAggregated[i].category
            , aAggregated[i].cnum);
        companySystem.push(p);
    }

    for (var h = 0; h < selectInvestors.length; h++) {
        var j = new investorBar(selectInvestors[h].iname
            , selectInvestors[h].totalInv);
        investorSystem.push(j);
    }

    var atL = new Attractor(createVector(width * .275, height * .4), 84);
    attractors.push(atL);

    var atR = new Attractor(createVector(width * .9, height * .4), 84);
    attractors.push(atR);

}

//+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+
//DRAW
function draw() {
    background(200, 25, 40, 100);
    noStroke();
    fill(0, 0, 100, 100);
    rect(width * 0.006
        , height * 0.008
        , width * 0.9875
        , height * 0.9825
        , 2);

    investorSystem.forEach(function (j) {
        j.update();
        j.draw();
    });

    companySystem.forEach(function (p) {
        p.update();
        p.draw();
    });

    collideCompanies();

    attractors.forEach(function (at) {
        at.draw();
    });

    attractorsC.forEach(function (atC) {
        atC.draw();
    });

    for (var i = moneyStorm.length - 1; i >= 0; i--) {
        var p = moneyStorm[i];
        if (p.areYouDeadYet()) {
            moneyStorm.splice(i, 1);
        } else {
            p.update();
            p.draw();
        }
    }

    collideMoneys();

    introBox();

}

//+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+
//INTROBOX
function introBox() {
    var mouseBox = false;
    var mouseEye = false;
    var closeBoxPos = createVector(width / 2 - 60, height / 2 + 100);
    var infoBoxPos = createVector(width * 0.025, height * 0.025);

    function mouseOnBox() {
        mouseBox = collidePointRect(mouseX, mouseY
            , closeBoxPos.x
            , closeBoxPos.y
            , 120
            , 40);
    }

    function checkEye() {
        mouseEye = collidePointRect(mouseX, mouseY
            , infoBoxPos.x
            , infoBoxPos.y
            , 60
            , 30)
    }

    function checkBox(){
        if(mouseEye == true && mouseIsPressed){
            boxLive = true;
        }
        if(mouseBox == true && mouseIsPressed){
            boxLive = false;
        } 
    }
    
    checkBox(this);
    checkEye(this);

    if (boxLive) {
        noStroke();
        fill(200, 25, 40, 40);
        rect(0, 0, width, height);
        
        noStroke();
        fill(200, 0, 100, 100);
        rect(width / 2 - 310
            , height / 2 - 240
            , 620
            , 400
            , 2);

        textAlign(CENTER, TOP);
        textFont(exo3);
        textSize(48);
        fill(200, 25, 40, 100);
        text("Money Cloud", width / 2, height / 2 - 220);

        textAlign(LEFT, TOP);
        textFont(exo4);
        textSize(14);
        fill(200, 25, 40, 100);
        text(introTxt, width / 2 - 280, height / 2 - 140);

        mouseOnBox();

        if (mouseBox) {
            noStroke();
            fill(200, 25, 40, 100);
            rect(closeBoxPos.x, closeBoxPos.y, 120, 40, 2);

            textAlign(CENTER, CENTER);
            textFont(exo5);
            textSize(14);
            fill(200, 0, 100, 100);
            text("Ok, close it!", width / 2, closeBoxPos.y + 20);
        } else {
            noStroke();
            fill(200, 5, 90, 100);
            rect(closeBoxPos.x, closeBoxPos.y, 120, 40, 2);

            textAlign(CENTER, CENTER);
            textFont(exo5);
            textSize(14);
            fill(200, 25, 40, 100);
            text("Ok, close it!", width / 2, closeBoxPos.y + 20);
        }
    } else {
        if (mouseEye) {
            noStroke();
            fill(200, 25, 40, 100);
            rect(infoBoxPos.x, infoBoxPos.y, 60, 30, 2);

            textAlign(CENTER, CENTER);
            textFont(exo5);
            textSize(14);
            fill(200, 0, 100, 100);
            text("info", infoBoxPos.x + 28, infoBoxPos.y + 14);
        } else {
            noStroke();
            fill(200, 5, 90, 100);
            rect(infoBoxPos.x, infoBoxPos.y, 60, 30, 2);

            textAlign(CENTER, CENTER);
            textFont(exo5);
            textSize(14);
            fill(200, 0, 100, 100);
            text("info", infoBoxPos.x + 28, infoBoxPos.y + 14);
        }
    }
    
    checkBox(this);
    
}

//+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+
//COMPANY BUBBLE
var Company = function (name, sum, category, cnum) {
    this.name = name;
    this.sum = sum;
    this.category = category;
    this.cnum = cnum;
    var color = map(this.cnum, 0, 44, 120, 330);
    this.radius = sqrt(sum) / 2000;
    var initialRadius = this.radius;
    var maxRadius = 96;
    var tempAng = random(0, TWO_PI);
    this.pos = createVector(cos(tempAng), sin(tempAng));
    this.pos.div(this.radius);
    this.pos.mult(15000);
    this.pos.set(this.pos.x + width / 2, this.pos.y + height / 2);
    this.vel = createVector(0, 0);
    var acc = createVector(0, 0);
    var isMouseOver = false;

    this.update = function () {

        checkMouse(this);

        attractors.forEach(function (A) {
            var att = p5.Vector.sub(A.getPos(), this.pos);
            var distanceSq = att.magSq();
            if (distanceSq > 1) {
                att.normalize();
                att.mult(4);
                att.mult(initialRadius * .001);
                acc.add(att);
            }

        }, this);

        this.pos.add(this.vel);
        this.vel.add(acc);
        acc.mult(0);

    }

    var doOnce = true;

    this.draw = function () {

        if (isMouseOver == true) {
            fill(color, 30, 70, 100);
        } else {
            fill(color, 20, 60, 90);
        };

        noStroke();
        ellipse(this.pos.x
            , this.pos.y
            , this.radius * 2 - 4
            , this.radius * 2 - 4);

        if (this.radius == maxRadius) {
            textAlign(CENTER, CENTER);
            fill(0, 0, 100, 100);
            textFont(exo4);
            textSize(24);
            textLeading(22);
            text(this.name
                , this.pos.x - 48
                , this.pos.y - 60
                , maxRadius
                , maxRadius);
            textFont(exo5);
            textSize(12);
            var dispSum = nfc(this.sum / 1000000000, 2);
            text("$" + dispSum + "B", this.pos.x, this.pos.y + 66);

            textFont(exo5);
            textSize(12);
            text(this.category, this.pos.x, this.pos.y + 50);
            
            textAlign(LEFT, BOTTOM);
            textFont(exo4);
            textSize(18);
            fill(200, 25, 40, 100);
            text(this.name
                 , width * 0.025
                 , height * 0.25 - 32);
            
            textFont(exo6);
            textSize(10);
            fill(200, 25, 40, 100);
            text("INVESTMENTS"
                 , width * 0.025
                 , height * 0.25 - 16);

            if (doOnce) {
                getInvestorParticles(this.name);
                doOnce = false;
            }

            moneyMouse(this);

            var atC = new AttractorC(createVector(this.pos.x, this.pos.y), 2);
                attractorsC.push(atC);

            highlightInv.forEach(function (h) {
                h.update();
                h.draw();
            });

        } else {
            doOnce = true;
        }

    }

    function getInvestorParticles(compName) {
        investorDisplay = [];
        highlightInv = [];
        for (var i = 0; i < connections.length; i++) {
            if (connections[i].company.name == compName) {
                investorDisplay.push(connections[i]);
            }
        }
        
        print(investorDisplay);

        for (var j = 0; j < investorDisplay.length; j++) {
            var h = new Highlight(investorDisplay[j].investor.iname
                                , investorDisplay[j].amount
                                , investorDisplay[j].date
                                , compName
                                , j);
                highlightInv.push(h);
        }
        
    }

    function checkMouse(instance) {
        var mousePos = createVector(mouseX, mouseY);
        if (!boxLive && mousePos.dist(instance.pos) <= instance.radius) {
            incRadius(instance);
            isMouseOver = true;
        } else {
            decRadius(instance);
            isMouseOver = false;
        }
    }

    function incRadius(instance) {
        instance.radius += 6;
        if (instance.radius > maxRadius) {
            instance.radius = maxRadius;
        }
    }

    function decRadius(instance) {
        instance.radius -= 8;
        if (instance.radius < initialRadius) {
            instance.radius = initialRadius;
        }
    }

    function moneyMouse(instance) {
        if (mouseIsPressed) {
            mousePress = true;
        } else {
            mousePress = false;
            attractorsC = [];
        }
    }
}

//+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+
//HIGHTLIGHT INVESTOR BARS + $$ PARTICLES
var Highlight = function (iname, amount, date, compName, seqNum) {
    this.iname = iname;
    this.cname = compName;
    this.pos = getInvLoc(this.iname);
    this.boxSize = getInvBox(this.iname);
    this.amount = amount;
    this.date = date;
    this.dispAmt = nfc(this.amount/1000000, 0);
    this.seqNum = seqNum * 12;
    this.opacity = 10;
    var maxOp = 95;

    this.update = function () {
        if (this.opacity < maxOp) {
            this.opacity += 4;
        }
    }

    this.draw = function () {
        noStroke();
        fill(200, 25, 40, this.opacity);
        rect(this.pos.x
            , this.pos.y
            , this.boxSize.x
            , this.boxSize.y);

        textAlign(LEFT);
        textSize(10);
        textFont(exo4);
        fill(200, 25, 40, 100);
        text(this.date + " : " + this.iname + " : $" + this.dispAmt + "M"
             ,  width * 0.025
             ,  height * 0.25 + this.seqNum);

        if (mouseIsPressed) {
            makeMoneyStorm(this);
        }

    }


    function makeMoneyStorm(instance) {
        for (var d = 0; d < instance.amount / 1000000000; d++) {
            var m = new Money(instance);
            moneyStorm.push(m);
        }
    }

    var Money = function (instance) {
        this.radius = random(3, 12);
        var tempAng = random(0, TWO_PI);
        this.pos = createVector(cos(tempAng), sin(tempAng));
        this.pos.div(this.radius);
        this.pos.mult(40);
        this.pos.set(this.pos.x + (instance.pos.x + (instance.boxSize.x / 2))
            , this.pos.y + (instance.pos.y));
        this.vel = createVector(0, 0);
        var acc = createVector(0, 0);
        this.hue = random(40, 50);
        this.lifespan = random(60, 80);

        this.update = function () {

            this.lifespan--;

            attractorsC.forEach(function (A) {
                var att = p5.Vector.sub(A.getPos(), this.pos);
                var distanceSq = att.magSq();
                if (distanceSq > 1) {
                    att.normalize();
                    att.mult(20);
                    att.mult(this.radius * .01);
                    acc.add(att);
                }
            }, this);

            this.pos.add(this.vel);
            this.vel.add(acc);
            this.vel.mult(0.92);
            acc.mult(0);

        }

        this.draw = function () {
            var sparkle = 0;
            var sparkle2 = 80;
            if (int(this.pos.x) % 2 == 0) {
                sparkle = 0;
                sparkle2 = 80;
            } else {
                sparkle = 80;
                sparkle2 = 0;
            }

            noStroke();
            fill(this.hue, sparkle, 100, this.lifespan * 2);
            ellipse(this.pos.x
                , this.pos.y
                , this.radius * 2 - 2
                , this.radius * 2 - 2);

            textAlign(LEFT, BOTTOM);
            fill(this.hue, sparkle2, 100, this.lifespan * 2);
            textSize(this.radius * 1.5);
            textFont(exo6);
            text("$", this.pos.x - 5, this.pos.y + 9);

        }

        this.areYouDeadYet = function () {
            return this.lifespan <= 0;
        }
    }

}

function getInvLoc(name) {
    for (var i = 0; i < investorSystem.length; i++) {
        if (investorSystem[i].iname == name) {
            return investorSystem[i].pos;
        }
    }
}

function getInvBox(name) {
    for (var i = 0; i < investorSystem.length; i++) {
        if (investorSystem[i].iname == name) {
            return investorSystem[i].boxSize;
        }
    }
}

//+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+
//INVESTOR BARS
var investorBar = function (iname, totalInv) {
    this.iname = iname;
    this.dispInv = totalInv / 1000000000;
    this.totalInv = sqrt(totalInv) / 500;
    this.boxSize = createVector(this.totalInv / random(3, 6), this.totalInv);
    this.pos = createVector(width * (random(0.025, .95)), height * 0.9905 - this.boxSize.y);

    var isMouseOver = false;
    var isInv = false;

    this.update = function () {
        checkMouse(this);
    }

    this.draw = function () {

        if (!boxLive && isMouseOver == true) {
            fill(200, 25, 40, 80);
        
            if (mouseIsPressed) {
                noStroke();
                textFont(exo3);
                textSize(16);
                fill(200, 25, 40, 100);
                text(this.iname, this.pos.x, this.pos.y - 18);
                
                textFont(exo5);
                textSize(10);
                fill(200, 25, 40, 100);
                text("$" + nfc(this.dispInv, 2) + "B", this.pos.x, this.pos.y - 4);
                
            }
            
        } else {
            fill(200, 25, 40, 10)
        }

        noStroke();
        rect(this.pos.x
            , this.pos.y
            , this.boxSize.x
            , this.boxSize.y);

    }

    function checkMouse(instance) {
        isMouseOver = collidePointRect(mouseX, mouseY
            , instance.pos.x
            , instance.pos.y
            , instance.boxSize.x
            , instance.boxSize.y);
    }
        
}

//+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+
//ATTRACTORS + COLLISIONS
var Attractor = function (pos, s) {
    this.pos = pos.copy();
    var strength = s * 10;
    this.draw = function () {
        noStroke();
        fill(230, 0, 0, 0);
        ellipse(this.pos.x, this.pos.y, strength, strength);
    }

    this.getPos = function () {
        return this.pos.copy();
    }

    this.getStrength = function () {
        return strength * 10;
    }

}

var AttractorC = function (pos, s) {
    this.pos = pos.copy();
    var strength = s;
    this.draw = function () {
        noStroke();
        fill(230, 0, 0, 0);
        ellipse(this.pos.x, this.pos.y, strength, strength);
    }

    this.getPos = function () {
        return this.pos.copy();
    }

    this.getStrength = function () {
        return strength;
    }

}

function collideCompanies() {
    for (var STEPS = 0; STEPS < 3; STEPS++) {
        for (var i = 0; i < companySystem.length - 1; i++) {
            for (var j = i + 1; j < companySystem.length; j++) {
                var pa = companySystem[i];
                var pb = companySystem[j];
                var ab = p5.Vector.sub(pb.pos, pa.pos);
                var distSq = ab.magSq();
                if (distSq <= sq(pa.radius + pb.radius)) {
                    var dist = sqrt(distSq);
                    var overlap = (pa.radius + pb.radius) - dist;
                    ab.div(dist);
                    ab.mult(overlap * 0.5);
                    pb.pos.add(ab);
                    ab.mult(-1);
                    pa.pos.add(ab);
                    pa.vel.mult(0.98);
                    pb.vel.mult(0.98);
                }
            }
        }
    }
}

function collideMoneys() {
    for (var STEPS = 0; STEPS < 3; STEPS++) {
        for (var i = 0; i < moneyStorm.length - 1; i++) {
            for (var j = i + 1; j < moneyStorm.length; j++) {
                var pa = moneyStorm[i];
                var pb = moneyStorm[j];
                var ab = p5.Vector.sub(pb.pos, pa.pos);
                var distSq = ab.magSq();
                if (distSq <= sq(pa.radius + pb.radius)) {
                    var dist = sqrt(distSq);
                    var overlap = (pa.radius + pb.radius) - dist;
                    ab.div(dist);
                    ab.mult(overlap * .5);
                    pb.pos.add(ab);
                    ab.mult(-1);
                    pa.pos.add(ab);
                    pa.vel.mult(0.98);
                    pb.vel.mult(0.98);
                }
            }
        }
    }
}