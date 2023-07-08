let ZONE_LEN = 56; //Длина однго столбца массива координат
let WATER_LEN = 12; //Длина первой строки температур для воды

var canvas = document.getElementById("canvas"); //Поиск полотна для графика
var ctx = canvas.getContext("2d"); //Получаем контекст полотна для отрисовывания в 2D
var loadText = document.querySelector('#loadText');


let sourse = 'https://kost9k.github.io/data/'; //отсюда подтягиваются данные для первой задачи

let dam = new Dam();

function startMain() {
    if (meshTxt !== "") {
        loadText.textContent = 'Loading...';
        $('#loadCircle').show();
        document.getElementById("start").remove()
    }

    function doSolve() {
        if (document.getElementById("nonText").hidden === true && meshTxt !== "") { //Решение стационарного уравнения

            document.getElementById("DtLoaded").setAttribute("hidden", true)
            dam.read(); //Считали данные с гитхаба
            dam.solve(); //Высчитали уравнение
            dam.draw(0, dam.elemNodes[0].length); //Отрисовка графика

            document.getElementById("loadText").style.color = "green";
            loadText.textContent = 'Done';
            $('#loadCircle').hide();
            document.getElementById("redraw").removeAttribute("hidden")

        } else {
            alert("Загрузите данные")
        }
    }

    setTimeout(doSolve, 0);

    if (document.getElementById("nonText").hidden === false) { //Решение нестационарного уравнения (не реализовано)
        ourRequest.onload = function () {
            if (ourRequest.readyState === 4 && ourRequest.status === 200) {
                let days = document.getElementById("day_input").value; //Время в днях
                loadText.textContent = 'Loading...';
                $('#loadCircle').show();

                dam = new Dam();
                dam.read(ourRequest);
                dam.n = days; //Количество дней
                dam.solve2(); //Встроенная функция подсчёта
                //dam.draw(0, dam.elemNodes[0].length); //Отрисовка графика
                document.getElementById("loadText").style.color = "green";
                loadText.textContent = 'Done';
                $('#loadCircle').hide();
                ourRequest.abort;
            }
        }
        ourRequest.send();
    }
}


/*------------------------По нажатию кнопки ReDraw dam---------------------*/
function reDraw() { //Перерисовка графика (в теории делает запрос на гитхаб)
    document.getElementById("loadText").style.color = "red";
    loadText.textContent = 'Loading...';
    $('#loadCircle').show();

    const ourRequest1 = new XMLHttpRequest();
    ourRequest1.open('GET', sourse, true);
    ourRequest1.onload = function () {
        if (ourRequest1.readyState === 4 && ourRequest1.status === 200) {
            dam.solve();
            dam.draw(0, dam.elemNodes[0].length);
            document.getElementById("loadText").style.color = "green";
            loadText.textContent = 'Done';
            $('#loadCircle').hide();
        }
    };
    ourRequest1.send();
}

let meshTxt = ""; //Переменная для загруженной сетки


function processFiles(files) { //Функция загрузки текста из файла
    let file = files[0];
    let reader = new FileReader();

    reader.onload = function (e) {
        let output = document.getElementById("fileOutput");
        output.textContent = e.target.result;
        meshTxt = e.target.result;

        if (meshTxt !== "") {
            document.getElementById("DtLoaded").removeAttribute("hidden")
        }
        /*  let strBlocks = meshTxt.split('@'); //Массив с 3-мя массивами

          let newStr = [
              strBlocks[0].split(','), //координаты узлов
              strBlocks[1].split(','), //номера элементов и его узлов
              strBlocks[2].split(',')  //граничные условия
          ];

          console.log (newStr)*/


        /* let newStr = remasterText(meshTxt);

         let nums = new Array(3); //перегон значений во Float
         for (let j = 0; j < 3; j++) {
             nums[j] = [];
             for (let i = 0; i < newStr[j].length; i++) {
                 nums[j].push(parseFloat(newStr[j][i]));
             }
         }

         console.log(nums)*/

    }

    reader.readAsText(file);

}

function remasterText(text) { //функция поиска нужных значений для сетки и узлов элементов
    let exitArr = []; //Массив, повторяющий массив из dam.js
    let nodesCoords = []; //Массив координат узлов
    let elemNodes = []; //Массив номеров узлов элементов

    text = text.split('\r\n'); //Убираем из строки символы переноса

    console.log(text)

    let buf = [];
    for (let i = 0; i < text.length; i++) {
        if (text[i] === "*Node") { //Ищем слово *Node
            let j = 0;
            while (text[i + j] !== "*Element, type=DC2D3") { //Пока мы не достигли конца блока координат
                buf[j] = text[i + 1 + j].split(','); //Избавляемся от запятых
                j++
            }
        }
    }

    // console.log(buf)

    let ind = 0;
    for (let i = 0; i < buf.length - 1; i++) {
        nodesCoords[ind] = buf[i][1] //Иксы
        nodesCoords[ind + 1] = buf[i][2] //Игреки
        ind += 2;
    }
    exitArr[0] = nodesCoords
    // console.log(nodesCoords)
    buf = []; // обнуляем массив

    for (let i = 0; i < text.length; i++) {
        if (text[i] === "*Element, type=DC2D3") { //Ищем слово *Element
            let j = 0;
            while (text[i + j] !== "*Nset, nset=Concrete-1") { //Пока мы не достигли конца блока координат
                buf[j] = text[i + 1 + j].split(','); //Избавляемся от запятых
                j++
            }
        }
    }

    buf.pop() //достал последнюю строчку с текстом
    // console.log(buf)

    ind = 0;
    for (let i = 0; i < buf.length; i++) {
        elemNodes[ind] = (buf[i][1]) //1 узел
        elemNodes[ind + 1] = (buf[i][2]) //2 узел
        elemNodes[ind + 2] = (buf[i][3])//3 узел
        ind += 4;
    }
    // console.log(elemNodes)

    buf = [];
    ind = 0;
    for (let i = 0; i < text.length; i++) {
        if (text[i] === "*Elset, elset=Concrete-1, generate") { //Ищем первый материал
            let temp = text[i + 1].split(',');
            ZONE_LEN = Number(temp[1]);
            for (let j = Number(temp[0]) - 1; j < Number(temp[1]) - 1; j++) {
                elemNodes[ind + 3] = document.getElementById("coefB1").value //коэффициент теплопроводности 1 материала
                ind += 4;
            }
            temp = []; //Очистил массив для 2 материала
        }
    }

    for (let i = 0; i < text.length; i++) {
        if (text[i] === "*Elset, elset=Concrete-2, generate") { //Ищем второй материал
            let temp = text[i + 1].split(',');
            for (let j = Number(temp[0]) - 1; j < Number(temp[1]) + 1; j++) {
                elemNodes[ind + 3] = document.getElementById("coefB2").value //коэффициент теплопроводности 2 материала
                ind += 4;
            }
            temp = []; //Очистил массив
        }
    }
    ind = 0;
    exitArr[1] = elemNodes;
    // console.log(elemNodes)


    let AirIndex, WaterIndex, GalleryIndex; ////
    //console.log(text);
    let bcArr = [];  //Массив граничных условий
    let buf2;
    for (let i = text.length; i > 0; i--) {
        if (text[i] === "*Nset, nset=T_water") {
            WaterIndex = i;
        }
        if (text[i] === "*Nset, nset=T_air") {
            AirIndex = i;
            let letterRegex = /[a-zA-Z]/ //Регулярное выражение для проверки на наличие буквы в строке (если нет галерей)
            let j = 1;

            while (letterRegex.test(text[i + j]) === false) { //Пока в строке нет буквы, то повышай индекс (универсально для пристутствия/отсутствия галерей)
                GalleryIndex = i + j;
                j++

            }
            GalleryIndex++;
            console.log(GalleryIndex)
        }


        /*if (text[i] === "*Nset, nset=T_gallery") { // На случай, если есть галереи
            GalleryIndex = i;
        }*/
    }

    buf2 = text.slice(WaterIndex + 1, AirIndex) //Получил данные температур воды в виде двумерного массива


    for (let i = 0; i < buf2.length; i++) {
        buf2[i] = buf2[i].split(',') //Разделяю одномерные массивы по запятым
        bcArr = bcArr.concat(buf2[i]); //добавляю в массив граничных условий строку элементов для температур воды
    }
    let arrEnd1 = bcArr.length;
    WATER_LEN = arrEnd1; // Переменная для перерасчёта
    buf2 = text.slice(AirIndex + 1, GalleryIndex) //Получил данные температур воздуха в виде двумерного массива


    for (let i = 0; i < buf2.length; i++) {
        buf2[i] = buf2[i].split(',') //Разделяю одномерные массивы по запятым
        bcArr = bcArr.concat(buf2[i]); //добавляю в массив граничных условий строку элементов для температур воздуха
    }
    let arrEnd2 = bcArr.length;

    buf2 = []; //очищаю массив

    for (let i = 0; i < arrEnd1; i++) {
        buf2[i] = document.getElementById("tWater").value; //
    }
    bcArr = bcArr.concat(buf2);

    for (let i = 0; i < arrEnd2 - arrEnd1; i++) {
        buf2[i] = document.getElementById("tAir").value;
    }
    bcArr = bcArr.concat(buf2);

    buf2 = []; //очищаю массив
    //console.log(bcArr);
    exitArr[2] = bcArr;


    console.log(exitArr)
    return exitArr;
}


function updateChanges() {   /*забор коэффициентов из инпутов*/
    let text = document.getElementById('coefB1').value;
    for (let i = 0; i < ZONE_LEN; i++) {
        dam.elemNodes[3][i] = Number(text);
    }

    text = document.getElementById('coefB2').value;
    for (let i = ZONE_LEN; i < dam.elemNodes[0].length; i++) {
        dam.elemNodes[3][i] = Number(text);
    }

    text = document.getElementById('tWater').value;
    for (let i = 0; i < WATER_LEN; i++) {
        dam.bc[1][i] = Number(text); //Граничные условия
    }

    text = document.getElementById('tAir').value;
    for (let i = WATER_LEN; i < dam.bc[0].length; i++) {
        dam.bc[1][i] = Number(text);
    }

    // console.log(dam.elemNodes)
    // console.log(dam.bc)

    reDraw();
}

function showBlock1() {
    dam.showBlock1()
}

function showBlock2() {
    dam.showBlock2()
}

function reDrawBlock1() {
    dam.reDrawBlock1()
}

function reDrawBlock2() {
    dam.reDrawBlock2()
}


/* Операции для взаимодействия со страницей */

function switchEqType() {
    document.getElementById("nonText").removeAttribute("hidden")
    document.getElementById("dayInputDiv").removeAttribute("hidden")
}

function switchEqType2() {
    document.getElementById("nonText").setAttribute("hidden", true)
    document.getElementById("dayInputDiv").setAttribute("hidden", true)
}


function showHint() {
    document.getElementById("btnHint").setAttribute("hidden", true)
    document.getElementById("btnHintHide").removeAttribute("hidden")
    document.getElementById("hintDiv").style.visibility = "visible"

}

function hideHint() {
    document.getElementById("btnHint").removeAttribute("hidden")
    document.getElementById("btnHintHide").setAttribute("hidden", true)
    document.getElementById("hintDiv").style.visibility = "hidden"
}