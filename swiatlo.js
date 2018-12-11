var canvas = document.getElementById("myCanvas");
var canvasWidth = canvas.width;
var canvasHeight = canvas.height;
var ctx = canvas.getContext("2d");
var canvasData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
var MODE = 2;
let obiekty = [[],[],[],[]];
// That's how you define the value of a pixel //
function drawPixel(x, y, r, g, b, a) {
    var index = (x + y * canvasWidth) * 4;
    canvasData.data[index + 0] = r;
    canvasData.data[index + 1] = g;
    canvasData.data[index + 2] = b;
    canvasData.data[index + 3] = a;
}

// That's how you update the canvas, so that your //
// modification are taken in consideration //
function updateCanvas() {
    ctx.putImageData(canvasData, 0, 0);
}

//rysowana kula i dane do nich
let ip = 1.0;
let ia = 0.1;

let positionLX = 50;
let positionLY = 50;

let PLASTIK = 0;
let KREDA = 1;
let DREWNO = 2;
let METAL = 3;

let ka = [0.45, 0.8, 0.5, 0.1];
let kd = [0.9, 0.9, 0.6, 0.4];
let ks = [0.2, 0.01, 0.4, 0.6];
let m = [50, 25, 10, 100];

let xL = 400;
let yL = 500;
let zL = -1600;

const odlegloscOdRzutni = 150;
// //Dkazdy obiekt wypelniam poczatkowymi danymi
// for (let n = 0; n < 4; n++)
//     //jeden obiekt to obraz 300 na 300
//     for (let i = 0; i < 300; i++) {
//         obiekty[n].push([]);
//         for (let j = 0; j < 300; j++) {
//             obiekty[n][i].push({z: Math.random(), c1: 240, c2: 240, c3: 240});
//         }
//     }

const sprawdzPunktCzyWPolsfera = (x, y) => {
    let a = 1,
        b = -2 * odlegloscOdRzutni,
        c = Math.pow(x, 2) + Math.pow(y, 2) + Math.pow(odlegloscOdRzutni, 2) - Math.pow(150, 2);
    let delta = Math.pow(b, 2) - 4 * a * c;
    return delta >= 0;
}

function resetconfig() {
    obiekty = [[],[],[],[]];
    if (MODE === 1) {
        for (let x = 0; x < 300; x++) {
            obiekty[0].push([]);
            for (let y = 0; y < 300; y++) {
                if (sprawdzPunktCzyWPolsfera(x - 300 / 2, y - 300 / 2)) {
                    let a = 1;
                    let b = -2 * odlegloscOdRzutni;
                    let c = Math.pow((x - 300 / 2), 2) + Math.pow((y - 300 / 2), 2) + Math.pow(odlegloscOdRzutni, 2) - Math.pow(150, 2);
                    let delta = Math.pow(b, 2) - 4 * a * c;

                    obiekty[0][x].push({
                        z: ((-b - Math.sqrt(delta)) / 2 * a), c1: 240, c2: 240, c3: 240
                    });
                } else
                    obiekty[0][x].push({
                        z: 120, c1: 240, c2: 240, c3: 240
                    });
            }
        }
    } else if (MODE === 2) {
        for (let x = 0; x < 300; x++) {
            obiekty[0].push([]);
            for (let y = 0; y < 300; y++) {
                obiekty[0][x].push({
                    z: (100), c1: 240, c2: 240, c3: 240
                });
            }
        }
    }
}
resetconfig();

let paintComponent = (obiekt, material = 0) => {
    writeValues();
    //pętle dla 300 na 300 obiektu
    for (let x = 0; x < 300; x++) {
        for (let y = 0; y < 300; y++) {

            //liczymy fonga
            let fong = ip * bphong([positionLX, positionLY, -obiekt[x][y].z], [xL - x, yL - y, zL - obiekt[x][y].z],
                normalny(x, y, obiekt[x][y].z), [x, y, obiekt[x][y].z], m[material], ip, kd[material], ks[material]);
            let a = ia * ka[material];
            //sprawdzamy czy funkcya fonga nie wykroczyla poza lub czy zostala prawidlowo wygenerowana
            if (isNaN(fong))
                fong = 0;
            let res = fong + a;
            //dla wartosci fonga zwracamy wartosci koloru yaki ma być narysowany
            //zwracana to tablica trzech wartosci [number, number, number]
            colors = getColor(res);
            drawPixel(x, y, colors[0], colors[1], colors[2], 255);
        }
    }
    updateCanvas();
}

//funkcje wykorzystywane przy funkcji paintComponent

//liczy jaki kolor ma być wyswietlony dla danej wartosci
const getColor = (p) => {
    let v = (255 * p);
    if (v < 0)
        v = 0;
    else if (v > 255)
        v = 255;
    return [v, v, v];
};

//normalny dla półsfery
const normalny = (x, y, z) => {
    return [x, y, z - odlegloscOdRzutni];
}

//funkcja liczoca fonga i funkcje poboczne wykorzystywane przy fongu

let bphong = (wektorV, wektorL, wektorN, wektorP, m, ip, kd, ks) => {
    kDoNormalizacjiV = 1 / dlugosc(wektorV);
    kDoNormalizacjiL = 1 / dlugosc(wektorL);
    kDoNormalizacjiN = 1 / dlugosc(wektorN);
    wektorV = [wektorV[0] * kDoNormalizacjiV, wektorV[1] * kDoNormalizacjiV, wektorV[2] * kDoNormalizacjiV];
    wektorL = [wektorL[0] * kDoNormalizacjiL, wektorL[1] * kDoNormalizacjiL, wektorL[2] * kDoNormalizacjiL];
    wektorN = [wektorN[0] * kDoNormalizacjiN, wektorN[1] * kDoNormalizacjiN, wektorN[2] * kDoNormalizacjiN];

    let wektorH = obliczH(wektorV, wektorL);
    kDoNormalizacjiH = 1 / dlugosc(wektorH);
    wektorH = [wektorH[0] * kDoNormalizacjiH, wektorH[1] * kDoNormalizacjiH, wektorH[2] * kDoNormalizacjiH];

    let NdotL = saturate(scalar(wektorN, wektorL));
    let NdotH = saturate(scalar(wektorN, wektorH));

    let wynik = kd * NdotL * ip + ks * Math.pow(NdotH, m) * ip;

    return saturate(wynik);
}

const dlugosc = (wektor) => {
    return Math.sqrt(wektor[0] * wektor[0] + wektor[1] * wektor[1] + wektor[2] * wektor[2]);
}

const obliczH = (naKtorym, zKtorym) => {
    let k = dlugosc(zKtorym) / dlugosc(naKtorym);
    let temp = [naKtorym[0] * k, naKtorym[1] * k, naKtorym[2] * k];
    let x = [zKtorym[0] - temp[0], zKtorym[1] - temp[1], zKtorym[2] - temp[2]];
    return [temp[0] + x[0] / 2, temp[1] + x[1] / 2, temp[2] + x[2] / 2];
}

const saturate = (x) => {
    if (x < 0)
        return 0;
    if (x > 1)
        return 1;
    return x;
}

const scalar = (naKtorym, zKtorym) => {
    return naKtorym[0] * zKtorym[0] + naKtorym[1] * zKtorym[1] + naKtorym[2] * zKtorym[2];
}

// start painting
const changeXL = () => {
    let x = document.getElementById("xL").value;
    xL = x;
    paintComponent(obiekty[0]);
};

const changeYL = () => {
    let y = document.getElementById("yL").value;
    yL = y;
    paintComponent(obiekty[0]);
};

const changeZL = () => {
    let z = document.getElementById("zL").value;
    zL = z;
    paintComponent(obiekty[0]);
};

const changeIP = () => {
    let newIp = document.getElementById("ip").value;
    ip = newIp;
    paintComponent(obiekty[0]);
};

const changeIA = () => {
    let newIa = document.getElementById("ia").value;
    ia = newIa;
    paintComponent(obiekty[0]);
};

const changePLX = () => {
    let newplx = document.getElementById("plx").value;
    positionLX = newplx;
    paintComponent(obiekty[0]);
};

const changePLY = () => {
    let newply = document.getElementById("ply").value;
    positionLY = newply;
    paintComponent(obiekty[0]);
};

const changeMaterial = () => {
    let material = document.getElementById("material").value;
    paintComponent(obiekty[0], material);
};

const writeValues = () => {
    document.getElementById("xLValue").innerText = xL;
    document.getElementById("yLValue").innerText = yL;
    document.getElementById("zLValue").innerText = zL;
    document.getElementById("ipValue").innerText = ip;
    document.getElementById("iaValue").innerText = ia;
    document.getElementById("mode").innerText = MODE;
};

const changeMode = () => {
    if (MODE === 1)
        MODE = 2;
    else if (MODE === 2)
        MODE = 1;
    document.getElementById("mode").innerText = MODE;
    resetconfig();
    paintComponent(obiekty[0]);
}

paintComponent(obiekty[0]);