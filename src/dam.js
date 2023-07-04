const RANGE_COLOR = 510;
let coordM = 10.0; //Множитель масштаба координат
let XaxisShift = 300; //Смещение осей в пикселях

class Dam {
    n; //Размер вектора теоретических значений температуры
    elemNodes = []; //Координаты узлов
    nodes = []; //Номера узлов и их принадлежность к одной из двух частей
    bc = []; //номер узла и соответствующая ему температура воды или воздуха
    temperature = []; //Вектор температур стационарной задачи теплопроводности
    temperature1 = new Array(this.n); //Вектор температур нестационарной задачи теплопроводности

    isShowed = [true, true]; //Показатель выделения 1 или 2 части
    Kmatrix; //глобальная матрица теплопроводности
    Cmatrix; // глобальная матрица теплоёмкости


    constructor() {
    }

    read() { //Нарезка данных на 3 массива после получения ответа

        let strBlocks = meshTxt.split('@'); //Массив с 3-мя массивами

         let newStr = [
             strBlocks[0].split(','), //координаты узлов
             strBlocks[1].split(','), //номера элементов и его узлов
             strBlocks[2].split(',')  //граничные условия
         ];
          console.log(newStr)
       // let newStr = remasterText(meshTxt);

        // console.log(newStr)
        let nums = new Array(3); //перегон значений во Float
        for (let j = 0; j < 3; j++) {
            nums[j] = [];
            for (let i = 0; i < newStr[j].length; i++) {
                nums[j].push(parseFloat(newStr[j][i]));
            }
        }

        // console.log (nums)

        for (let j = 0, i = 0; j < nums[0].length; j += 2, i++) {
            this.nodes.push([nums[0][j], nums[0][j + 1]]);
        }
        this.nodes = TransMatrix(this.nodes); //координаты узлов X и Y (сначала все Х потом все У)

        for (let j = 0; j < nums[1].length; j += 4) {
            this.elemNodes.push([nums[1][j], nums[1][j + 1], nums[1][j + 2], nums[1][j + 3]]);
        }
        this.elemNodes = TransMatrix(this.elemNodes); //Номера узлов (1-2-3-4 все друг за другом)

        for (let j = 0, i = 0; j < nums[2].length / 2; j++, i++) {
            this.bc.push([nums[2][j], nums[2][j + nums[2].length / 2]]);
        }
        this.bc = TransMatrix(this.bc); //номера узлов и температуры воды и воздуха (сначала номера потом температуры)

        /* console.log(this.nodes)
         console.log(this.elemNodes)
         console.log(this.bc)*/


        /*console.log(this.nodes[0]) //Координата Х
        console.log("\n\n\n\n\n");
        console.log(this.nodes[1]) //Координата У
        console.log("\n\n\n\n\n");
        console.log(this.elemNodes[0]) //Номер узла 1
        console.log("\n\n\n\n\n");
        console.log(this.elemNodes[1]) //Номер узла 2
        console.log("\n\n\n\n\n");
        console.log(this.elemNodes[2]) //Номер узла 3
        console.log("\n\n\n\n\n");
        console.log(this.elemNodes[3]) //Лямбда
        console.log("\n\n\n\n\n");
        console.log(this.bc[0]) //Номер узла
        console.log("\n\n\n\n\n");
        console.log(this.bc[1]) //Температура воздуха/воды
        console.log("\n\n\n\n\n");*/
    }

    colorToColorType(color) { //Преобразование
        color = Math.floor(color) //Округление
        if (color > 255) {
            color = 'rgb(' + (color - 255 + 1) + ',0,0)';
        } else {
            color = 'rgb(0,0,' + color + ')';
        }
        return color;
    }

    /*draw(from, to) { //Отрисовка графика (старая)
        console.log("paint begin");
        let T = this.temperature; //Массив температур узлов
        console.log(T)

        canvas.width = 1200; //Ширина полотна
        canvas.height = 500; //Высота полотна

        let coords = TransMatrix(this.nodes); //Координаты узлов

        console.log(coords)

        let maxTemper = -100, minTemper = 1000, minCoord = 10000;

        for (let i = 0; i < T.length; i++) {
            if (T[i] > maxTemper) {
                maxTemper = T[i]; //Максимальная температура
            } else if (T[i] < minTemper) {
                minTemper = T[i]; //Минимальная температура
            }
        }

        ctx.fillStyle = 'green';
        ctx.font = "18px Verdana";
        ctx.fillText(minTemper.toFixed(2) + '°C', 70, 350); //Вывод минимальной температуры в легенде
        ctx.fillText(maxTemper.toFixed(2) + '°C', 70, 65); //Вывод максимальной температуры в легенде
        ctx.transform(1, 0, 0, -1, 0, canvas.height); //Переворот осей координат |_ (изначально У инвертирован)
        ctx.translate(XaxisShift, 0); //Смещение

        let deltaT = maxTemper - minTemper; //Температурный шаг
        let sectorT = Math.floor(RANGE_COLOR / deltaT); //Шаг цвета для закраски
        let pointColor = new Array(T.length); //Массив для раскраски узлов их температурой

        for (let i = 0; i < T.length; i++) {
            pointColor[i] = (T[i] - minTemper + 1) * sectorT;
        }
        console.log(pointColor)

        for (let i = 0; i < coords.length; i++) { //Самая маленькая координата
            if (minCoord > coords[i][0]) {
                minCoord = coords[i][0];
            }
        }

        for (let i = 0; i < coords.length; i++) {
            coords[i][0] -= minCoord; //Вычитание из координат самой маленькой координаты
        }

        for (let i = 0; i < coords.length; i++) { //Масштаб координат
            coords[i][0] *= coordM;
            coords[i][1] *= coordM;
        }

        for (let i = from; i < to; i++) {

            let v1 = { //узел 1
                x: coords[this.elemNodes[0][i] - 1][0],
                y: coords[this.elemNodes[0][i] - 1][1],
                color: pointColor[this.elemNodes[0][i] - 1]
            };
            let v2 = { //узел 2
                x: coords[this.elemNodes[1][i] - 1][0],
                y: coords[this.elemNodes[1][i] - 1][1],
                color: pointColor[this.elemNodes[1][i] - 1]
            };
            let v3 = { //узел 3
                x: coords[this.elemNodes[2][i] - 1][0],
                y: coords[this.elemNodes[2][i] - 1][1],
                color: pointColor[this.elemNodes[2][i] - 1]
            };

            let radius = Math.floor(Math.sqrt(
                Math.pow(Math.abs(v1.x - v2.x), 2) + Math.pow(Math.abs(v1.y - v2.y), 2)
            ));
            ///////////////////////////////
            let tmpColor = v1.color;
            tmpColor = this.colorToColorType(tmpColor);

            let grd1 = ctx.createRadialGradient(v1.x, v1.y, 0, v1.x, v1.y, radius);
            grd1.addColorStop(0, tmpColor);

            tmpColor = this.colorToColorType(Math.abs(Math.floor((v2.color - v3.color) / 2)));
            grd1.addColorStop(1, tmpColor);

            ////////////////////////////////
            tmpColor = v2.color;

            tmpColor = this.colorToColorType(tmpColor);

            var grd2 = ctx.createRadialGradient(v2.x, v2.y, 0, v2.x, v2.y, radius);
            grd2.addColorStop(0, tmpColor);
            tmpColor = this.colorToColorType(Math.abs(Math.floor((v1.color - v3.color) / 2)));
            grd2.addColorStop(1, tmpColor);

            ///////////////////////////////
            tmpColor = v3.color;

            tmpColor = this.colorToColorType(tmpColor);

            var grd3 = ctx.createRadialGradient(v3.x, v3.y, 0, v3.x, v3.y, radius);
            grd3.addColorStop(0, tmpColor);

            tmpColor = this.colorToColorType(Math.abs(Math.floor((v1.color - v2.color) / 2)));
            grd3.addColorStop(1, tmpColor);

            //Отрисовка графика
            ctx.beginPath();

            ctx.moveTo(v1.x, v1.y);
            ctx.lineTo(v2.x, v2.y);
            ctx.lineTo(v3.x, v3.y);

            ctx.closePath();

            // fill with black
            //ctx.fill();

            // set blend mode
            ctx.globalCompositeOperation = "lighter";

            ctx.fillStyle = grd1;
            ctx.fill();

            ctx.fillStyle = grd2;
            ctx.fill();

            ctx.fillStyle = grd3;
            ctx.fill();
            ctx.globalCompositeOperation = "source-over";

        }

        /!* Отрисовка легенды *!/
        let grd4 = ctx.createLinearGradient(35, 150, 35, 400);
        grd4.addColorStop(0, 'blue');
        grd4.addColorStop(1, 'red');
        ctx.globalCompositeOperation = "lighter";
        ctx.fillStyle = grd4;
        ctx.fillRect(20-XaxisShift, 150, 50, 300);
        ctx.globalCompositeOperation = "source-over";
        console.log('Paint closed');
    }*/

    draw(from, to) { //Отрисовка графика


        console.log("paint begin");
        let T = this.temperature; //Массив температур узлов
        console.log(T)

        canvas.width = 1200; //Ширина полотна
        canvas.height = 500; //Высота полотна

        let coords = TransMatrix(this.nodes); //Координаты узлов

        console.log(coords)

        let maxTemper = -100, minTemper = 1000, minCoord = 10000;

        for (let i = 0; i < T.length; i++) {
            if (T[i] > maxTemper) {
                maxTemper = T[i]; //Максимальная температура
            } else if (T[i] < minTemper) {
                minTemper = T[i]; //Минимальная температура
            }
        }

        ctx.fillStyle = 'green';
        ctx.font = "18px Verdana";
        ctx.fillText(minTemper.toFixed(2) + '°C', 70, 350); //Вывод минимальной температуры в легенде
        ctx.fillText(maxTemper.toFixed(2) + '°C', 70, 65); //Вывод максимальной температуры в легенде
        ctx.transform(1, 0, 0, -1, 0, canvas.height); //Перемещение осей в левый нижний угол ( |__ )
        ctx.translate(XaxisShift, 0); //Смещение


        let deltaT = maxTemper - minTemper; //Температурный шаг
        let sectorT = 255 / maxTemper; //Шаг цвета для закраски
        let pointColor = new Array(T.length); //Массив для раскраски узлов их температурой


        for (let i = 0; i < T.length; i++) {
            let R = 0, B = 255, temp;
            temp = T[i] * sectorT;
            R += temp;
            B -= temp;

            pointColor[i] = 'rgb(' + R + ',0' + ',' + B + ')';
        }
        console.log(pointColor)

        for (let i = 0; i < coords.length; i++) { //Самая маленькая координата
            if (minCoord > coords[i][0]) {
                minCoord = coords[i][0];
            }
        }

        for (let i = 0; i < coords.length; i++) {
            coords[i][0] -= minCoord; //Вычитание из координат самой маленькой координаты для смещения графика в видимую область
        }

        for (let i = 0; i < coords.length; i++) { //Масштаб координат
            coords[i][0] *= coordM;
            coords[i][1] *= coordM;
        }

        for (let i = from; i < to; i++) {

            let v1 = { //узел 1
                x: coords[this.elemNodes[0][i] - 1][0],
                y: coords[this.elemNodes[0][i] - 1][1],
                color: pointColor[this.elemNodes[0][i] - 1]
            };
            let v2 = { //узел 2
                x: coords[this.elemNodes[1][i] - 1][0],
                y: coords[this.elemNodes[1][i] - 1][1],
                color: pointColor[this.elemNodes[1][i] - 1]
            };
            let v3 = { //узел 3
                x: coords[this.elemNodes[2][i] - 1][0],
                y: coords[this.elemNodes[2][i] - 1][1],
                color: pointColor[this.elemNodes[2][i] - 1]
            };

            let radius = Math.floor(Math.sqrt( //Радиус для радиального градиента
                Math.pow(Math.abs(v2.x - v3.x), 2) + Math.pow(Math.abs(v2.y - v3.y), 2)
            ));

            ///////////////////////////////
            let grd1 = ctx.createLinearGradient(v1.x, v1.y, v3.x, v3.y);
            grd1.addColorStop(0, v1.color);

            ////////////////////////////////

            let grd2 = ctx.createLinearGradient(v1.x, v1.y, v3.x, v3.y);
            grd2.addColorStop(0, v1.color);
            grd2.addColorStop(1, v3.color);

            ///////////////////////////////
            let grd3 = ctx.createLinearGradient(v3.x, v3.y, v1.x, v1.y);
            grd3.addColorStop(0, v3.color);

            //Отрисовка графика
            ctx.beginPath();

            ctx.moveTo(v1.x, v1.y);
            ctx.lineTo(v2.x, v2.y);
            ctx.lineTo(v3.x, v3.y);

            ctx.closePath();

            ctx.globalCompositeOperation = "lighter";

            /*ctx.fillStyle = grd1;
            ctx.fill();*/

            ctx.fillStyle = grd2;
            ctx.fill();

            /*ctx.fillStyle = grd3;
            ctx.fill();*/
            ctx.globalCompositeOperation = "source-over";

        }

        //Отрисовка легенды
        let grd4 = ctx.createLinearGradient(35, 150, 35, 400);
        grd4.addColorStop(0, 'blue');
        grd4.addColorStop(1, 'red');
        // ctx.globalCompositeOperation = "lighter";
        ctx.fillStyle = grd4;
        ctx.fillRect(20 - XaxisShift, 150, 50, 300);
        ctx.globalCompositeOperation = "source-over";
        console.log('Paint closed');
    }

    solve() {
        let nodeLength = this.nodes[0].length; //Длина массива иксов

        let K = new Array(nodeLength);
        let R;

        for (let i = 0; i < K.length; i++) { //Глобальная матрица теплопроводности размерностью кол-во элементов х кол-во элементов
            K[i] = new Array(nodeLength); // Создание двумерного массива
            for (let j = 0; j < K[0].length; j++) {
                K[i][j] = 0;
            }
        }

        for (let i = 0; i < this.elemNodes[0].length; i++) {
            let elem_n_lock = [1, 2, 3];
            elem_n_lock[0] = this.elemNodes[0][i]; //Первый столбец номеров узлов
            elem_n_lock[1] = this.elemNodes[1][i]; //Второй столбец
            elem_n_lock[2] = this.elemNodes[2][i]; //Третий столбец

            R = [1, 2, 3];
            for (let i = 0; i < 3; i++) {
                R[i] = [this.nodes[0][elem_n_lock[i] - 1], this.nodes[1][elem_n_lock[i] - 1]];
            }//1 строчка координат и номер узла - 1
            R = TransMatrix(R);
            //  console.log(R)

            let Ki = getStifnessMatrix(R, this.elemNodes[3][i]); //Получение матрицы жесткости 3x3
            // console.log(Ki)
            Ki = trsMatrix(nodeLength, elem_n_lock, Ki); //Получение локальной матрицы теплопроводности размером с глобальную матрицу
            // console.log(Ki)
            K = SumMatrix(K, Ki); //Сложение глобальной и локальной матриц
            //console.log(K)

        }

        this.Kmatrix = K;
        let F = new Array(nodeLength);

        for (let i = 0; i < F.length; i++) {
            F[i] = 0;
        }
        //Доделка глобальной матрицы с учётом граничных условий
        for (let i = 0; i < this.bc[0].length; i++) {
            for (let j = 0; j < K[0].length; j++) {
                K[this.bc[0][i] - 1][j] = 0;
            }
            //По номеру элемента на пересечении столбца и строки ставится 1 в глобальной матрице
            K[this.bc[0][i] - 1][this.bc[0][i] - 1] = 1;
            F[this.bc[0][i] - 1] = this.bc[1][i]; //В столбец записывается значение граничного условия
        }
        //  console.log(K)
        this.temperature = MultiplyMatrixLineVariant(InverseMatrix(K), F);
        // console.log(this.temperature)

    }

    solve2() { //Решение нестационарной задачи теплопроводности (не завершена сборка уравнения)
        let nodeLength = this.nodes[0].length;
        let C = new Array(nodeLength);
        let K = new Array(nodeLength);
        let R;
        let Tn = new Array(nodeLength)
        let rho = 2370; //Плотность
        let Cv = 1070; //Коэффициент теплоёмкости

        let Fn = new Array(nodeLength);

        for (let i = 0; i < C.length; i++) { //Пустая глобальная матрица теплоемкости
            Tn[i] = 5; //Начальный вектор температур
            Fn[i] = 0; //////////////////////////////////////////////////////////////
            C[i] = new Array(nodeLength); // Создание двумерного массива
            for (let j = 0; j < C[0].length; j++) {
                C[i][j] = 0;
            }
        }

        for (let i = 0; i < this.elemNodes[0].length; i++) {
            var elem_n_lock = [1, 2, 3]; //Выбор элемента
            elem_n_lock[0] = this.elemNodes[0][i]; //Первый столбец номеров узлов
            elem_n_lock[1] = this.elemNodes[1][i]; //Второй столбец
            elem_n_lock[2] = this.elemNodes[2][i]; //Третий столбец

            R = [1, 2, 3]; //Координаты узлов
            for (let i = 0; i < 3; i++) {
                R[i] = [this.nodes[0][elem_n_lock[i] - 1], this.nodes[1][elem_n_lock[i] - 1]];

            }//1 строчка координат и номер узла - 1
            R = TransMatrix(R);

            let Ci = getHeatCapacityMatrix(R, rho, Cv, 1); //Получение матрицы теплоёмкости 3x3
            Ci = trsMatrix(nodeLength, elem_n_lock, Ci); //Получение локальной матрицы теплоёмкости размером с глобальную матрицу
            C = SumMatrix(C, Ci); //Сложение глобальной и локальной матриц

        }


        for (let i = 0; i < K.length; i++) { //Глобальная матрица теплопроводности размерностью кол-во элементов х кол-во элементов
            K[i] = new Array(nodeLength); // Создание двумерного массива
            for (let j = 0; j < K[0].length; j++) {
                K[i][j] = 0;
            }
        }

        for (let i = 0; i < this.elemNodes[0].length; i++) {
            var elem_n_lock = [1, 2, 3];
            elem_n_lock[0] = this.elemNodes[0][i]; //Первый столбец номеров узлов
            elem_n_lock[1] = this.elemNodes[1][i]; //Второй столбец
            elem_n_lock[2] = this.elemNodes[2][i]; //Третий столбец

            R = [1, 2, 3];
            for (let i = 0; i < 3; i++) {
                R[i] = [this.nodes[0][elem_n_lock[i] - 1], this.nodes[1][elem_n_lock[i] - 1]];
            }//1 строчка координат и номер узла - 1
            R = TransMatrix(R);

            let Ki = getStifnessMatrix(R, this.elemNodes[3][i]); //Получение матрицы жесткости 3x3
            Ki = trsMatrix(nodeLength, elem_n_lock, Ki); //Получение локальной матрицы теплопроводности размером с глобальную матрицу
            K = SumMatrix(K, Ki); //Сложение глобальной и локальной матриц
        }


        //Доделка глобальной матрицы с учётом граничных условий
        for (let i = 0; i < this.bc[0].length; i++) {
            for (let j = 0; j < K[0].length; j++) {
                K[this.bc[0][i] - 1][j] = 0;
                C[this.bc[0][i] - 1][j] = 0;

            }
            //По номеру элемента на пересечении столбца и строки ставится 1 в глобальной матрице
            K[this.bc[0][i] - 1][this.bc[0][i] - 1] = 1;
            C[this.bc[0][i] - 1][this.bc[0][i] - 1] = 1;
        }


        this.Kmatrix = K;
        this.Cmatrix = C;


        //console.log("ГЛОБАЛЬНАЯ МАТРИЦА ТЕПЛОЁМКОСТИ\n\n\n\n\n"+this.Cmatrix+"\n\n\n\n\n")
        //console.log("ГЛОБАЛЬНАЯ МАТРИЦА ТЕПЛОПРОВОДНОСТИ\n\n\n\n\n"+this.Kmatrix+"\n\n\n\n\n")

        //for (let i = 0; i < 1; i++) {
        let step = this.n * 86400;

        //Поменять вектор граничных условий Fn!!!!!!!

        // console.log(K);
        // console.log(C);
        let one = InverseMatrix(C);
        cPrintMatrix(one)
        //console.log(one);


        //let one= multMatrixNumber(step,MultiplyMatrixLineVariant(MultiplyMatrix(InverseMatrix(C),K),Tn[i]));
        /* console.log("1 шаг\n\n\n\n\n"+one+"\n\n\n\n\n")
         let two = multMatrixNumber(step,MultiplyMatrix(InverseMatrix(C), Fn));
         console.log("2 шаг\n\n\n\n\n"+two+"\n\n\n\n\n")
         let three = SumMatrix(one,two);
         console.log("3 шаг\n\n\n\n\n"+three+"\n\n\n\n\n")*/


        //Tn[i+1] = SubMatrixLineVariant(Tn[i], three);

        // }

        //this.temperature1=Tn;
        //console.log("Вектор решения\n\n\n\n\n"+this.temperature1+"\n\n\n\n\n")


    }


    showBlock1() { //Выделение первого блока жёлтым
        console.log('start');

        this.isShowed[0] = false;

        let coords = TransMatrix(this.nodes);
        let maxTemper = -100, minTemper = 1000, minCoord = 10000;

        for (let i = 0; i < coords.length; i++) {
            if (minCoord > coords[i][0]) {
                minCoord = coords[i][0];
            }
        }

        for (let i = 0; i < coords.length; i++) {
            coords[i][0] -= minCoord;
        }

        for (let i = 0; i < coords.length; i++) {
            coords[i][0] *= coordM;
            coords[i][1] *= coordM;
        }

        for (let i = 0; i < ZONE_LEN; i++) {
            var v1 = {x: coords[this.elemNodes[0][i] - 1][0], y: coords[this.elemNodes[0][i] - 1][1]};
            var v2 = {x: coords[this.elemNodes[1][i] - 1][0], y: coords[this.elemNodes[1][i] - 1][1]};
            var v3 = {x: coords[this.elemNodes[2][i] - 1][0], y: coords[this.elemNodes[2][i] - 1][1]};

            ctx.beginPath();
            ctx.moveTo(v1.x, v1.y);
            ctx.lineTo(v2.x, v2.y);
            ctx.lineTo(v3.x, v3.y);
            ctx.closePath();
            ctx.fillStyle = 'yellow';
            ctx.fill();
        }
    }

    showBlock2() { //Выделение 2-го блока оранжевым
        this.isShowed[1] = false;
        let coords = TransMatrix(this.nodes);
        let maxTemper = -100, minTemper = 1000, minCoord = 10000;

        for (let i = 0; i < coords.length; i++) {
            if (minCoord > coords[i][0]) {
                minCoord = coords[i][0];
            }
        }

        for (let i = 0; i < coords.length; i++) {
            coords[i][0] -= minCoord;
        }

        for (let i = 0; i < coords.length; i++) {
            coords[i][0] *= coordM;
            coords[i][1] *= coordM;
        }
        for (let i = ZONE_LEN; i < this.elemNodes[0].length; i++) {
            var v1 = {x: coords[this.elemNodes[0][i] - 1][0], y: coords[this.elemNodes[0][i] - 1][1]};
            var v2 = {x: coords[this.elemNodes[1][i] - 1][0], y: coords[this.elemNodes[1][i] - 1][1]};
            var v3 = {x: coords[this.elemNodes[2][i] - 1][0], y: coords[this.elemNodes[2][i] - 1][1]};

            ctx.beginPath();
            ctx.moveTo(v1.x, v1.y);
            ctx.lineTo(v2.x, v2.y);
            ctx.lineTo(v3.x, v3.y);
            ctx.closePath();
            ctx.fillStyle = 'orange';
            ctx.fill();
        }
    }

    reDrawBlock1() { //Возвращение 1 части к закраске градиентом
        if (this.isShowed[0] === false && this.isShowed[1] === false) {
            this.draw(0, this.elemNodes[0].length);
            this.showBlock2();
        } else {
            this.draw(0, this.elemNodes[0].length);
        }
        this.isShowed[0] = true;
    }

    reDrawBlock2() { //Возвращение 2 части к закраске градиентом
        if (this.isShowed[0] === false && this.isShowed[1] === false) {
            this.draw(0, this.elemNodes[0].length);
            this.showBlock1();
        } else {
            this.draw(0, this.elemNodes[0].length);
        }
        this.isShowed[1] = true;
    }


}

