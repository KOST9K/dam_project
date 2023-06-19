const ZONE_LEN = 56;
const WATER_LEN = 12;

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

var loadText = document.querySelector('#loadText');
loadText.textContent = 'Loading...';
$('#loadCircle').show();

let sourse = 'https://hikrento.github.io/data/'; //отсюда подтягиваются данные (поменять на свой)
var ourRequest = new XMLHttpRequest();
ourRequest.open('GET', sourse);
ourRequest.onload = function() {
    if (ourRequest.readyState == 4 && ourRequest.status == 200) {
        dam = new Dam();
        dam.read(ourRequest);
        dam.solve(); //?????
        dam.draw(0, dam.elemNodes[0].length); //Отрисовка графика
        loadText.color = 'green'
        loadText.textContent = 'Done';
        $('#loadCircle').hide();
        ourRequest.abort;
    }
};
ourRequest.send();

/*------------------------По нажатию кнопки ReDraw dam---------------------*/
function reDraw() { //Перерисовка графика
    loadText.color = 'red';
    loadText.textContent = 'Loading...';
    $('#loadCircle').show();
    
    var ourRequest1 = new XMLHttpRequest();
    var fff = ourRequest1.open('GET', sourse, true);
    ourRequest1.onload = function() {
        if (ourRequest1.readyState == 4 && ourRequest1.status == 200) {
            dam.solve();
            dam.draw(0, dam.elemNodes[0].length);
            loadText.color = 'green';
            loadText.textContent = 'Done';
            $('#loadCircle').hide();
        }
    };
    ourRequest1.send();
}

function updateChanges() {   /*забор коэффициентов из инпутов*/
    var text = document.getElementById('coefB1').value;
    for (let i = 0; i < ZONE_LEN; i++) {
        dam.elemNodes[3][i] = Number(text);
    }

    text = document.getElementById('coefB2').value;
    for (let i = ZONE_LEN; i < dam.elemNodes[0].length; i++) {
        dam.elemNodes[3][i] = Number(text);
    }

    text = document.getElementById('tWater').value;  
    for (let i = 0; i < WATER_LEN; i++) {
        dam.bc[1][i] = Number(text);
    }

    text = document.getElementById('tAir').value; 
    for (let i = WATER_LEN; i < dam.bc[0].length; i++) {
        dam.bc[1][i] = Number(text);
    }
    reDraw();
}

function showBlock1 () {dam.showBlock1()}
function showBlock2 () {dam.showBlock2()}
function reDrawBlock1() {dam.reDrawBlock1()}
function reDrawBlock2() {dam.reDrawBlock2()}