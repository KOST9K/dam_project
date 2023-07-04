function TransMatrix(A)   //Транспонированная матрица
{
    let m = A.length, n = A[0].length, AT = [];
    for (let i = 0; i < n; i++)
     { AT[ i ] = [];
       for (let j = 0; j < m; j++) AT[ i ][j] = A[j][ i ];
     }
    return AT; //Результат - матрица
}

function SumMatrix(A,B) //Сложение двух матриц
{   
    let n = A.length;
    let m = A[0].length;

    let C = new Array(n);

    for (let i = 0; i < n; i++) {
      C[i] = new Array(m);
      for (let j = 0 ; j < m; j++) {
        C[i][j] = A[i][j] + B[i][j];
      }
    }

    return C; //Результат - матрица
}

function SubMatrixLineletiant(A,B) //Вычитание двух матриц
{
    let n = A.length;
    let C = new Array(n);

    for (let i = 0; i < n; i++) {
        C[i] = A[i] - B[i];
    }

    return C; //Результат - строка
}



function multMatrixNumber(a,A)  //Умножение матрицы на число
{   
    let m = A.length, n = A[0].length, B = [];
    for (let i = 0; i < m; i++)
     { B[ i ] = [];
       for (let j = 0; j < n; j++) B[ i ][j] = a*A[ i ][j];
     }
    return B; //Результат - матрица
}

function MultiplyMatrix(A,B) {   //Перемножение матриц
    let rowsA = A.length;
    let colsA = A[0].length;
    let rowsB = B.length;
    let colsB = B[0].length;
    let C = [];
    
    for (let i = 0; i < rowsA; i++) {C[ i ] = [];}

    for (let k = 0; k < colsB; k++) {
      for (let i = 0; i < rowsA; i++) {
        let t = 0;
        for (let j = 0; j < rowsB; j++) {t += A[i][j]*B[j][k];}
        C[i][k] = t;
      }
    }
    return C; //Результат - матрица
}

function MultiplyMatrixLineVariant(A,B) { //Перемножение матрицы на строку
  let rowsA = A.length;
  let rowsB = B.length;
  //let colsB = B[0].length;
  let C = new Array(rowsA);

  for (let i = 0; i < rowsA; i++) {
    let t = 0;
    for (let j = 0; j < rowsB; j++) {
      t += A[i][j]*B[j];
    }
    C[i] = t;
  }
  
  return C; //Результат - строка
}

function MatrixPow(n,A)//Возведение матрицы в степень(не используется)
{ 
    if (n === 1) return A;
    else return MultiplyMatrix( A, MatrixPow(n-1,A) );
}

function Determinant(A)
{
    let N = A.length, B = [], denom = 1, exchanges = 0;
    for (let i = 0; i < N; ++i)
    { B[i] = [];
        for (let j = 0; j < N; ++j) B[i][j] = A[i][j];
    }
    for (let i = 0; i < N-1; ++i)
    { let maxN = i, maxValue = Math.abs(B[i][i]);
        for (let j = i+1; j < N; ++j)
        { let value = Math.abs(B[j][i]);
            if (value > maxValue){ maxN = j; maxValue = value; }
        }
        if (maxN > i)
        { let temp = B[i]; B[i] = B[maxN]; B[maxN] = temp;
            ++exchanges;
        }
        else { if (maxValue === 0) return maxValue; }
        let value1 = B[i][i];
        for (let j = i+1; j < N; ++j)
        { let value2 = B[j][i];
            B[j][i] = 0;
            for (let k = i+1; k < N; ++k) B[j][k] = (B[j][k]*value1-B[i][k]*value2)/denom;
        }
        denom = value1;
    }
    if (exchanges%2) return -B[N-1][N-1];
    else return B[N-1][N-1];
}

function InverseMatrix(A)   //Обратная матрица
{   
    let det = Determinant(A);

  // console.log(det)
  //  console.log("\n\n\n\n\n");

    if (det === 0 ) return false;
    let N = A.length;
    let Ad = AdjugateMatrix(A);

   // console.log(Ad)
   // console.log("\n\n\n\n\n");


    for (let i = 0; i < N; i++)
     { for (let j = 0; j < N; j++) Ad[i][j] /= det; }
    return Ad; //Результат - матрица
}

function AdjugateMatrix(A)  //Союзная матрица
{                                        
    let N = A.length, adjA = [];
    for (let i = 0; i < N; i++)
     { adjA[ i ] = [];
       for (let j = 0; j < N; j++)
        { let B = [], sign = ((i+j)%2===0) ? 1 : -1;
          for (let m = 0; m < j; m++)
           { B[m] = [];
             for (let n = 0; n < i; n++)   B[m][n] = A[m][n];
             for (let n = i+1; n < N; n++) B[m][n-1] = A[m][n];
           }
          for (let m = j+1; m < N; m++)
           { B[m-1] = [];
             for (let n = 0; n < i; n++)   B[m-1][n] = A[m][n];
             for (let n = i+1; n < N; n++) B[m-1][n-1] = A[m][n];
           }
          adjA[ i ][j] = sign*Determinant(B);   
        }
     }
    return adjA;
}

function trsMatrix(N, ind, Ki) { //Локальная матрица приведённая к размеру глобальной
  let Ki_new = new Array(N);

  for (let i = 0; i < Ki_new.length; i++) {
      Ki_new[i] = new Array(N);
      for (let j = 0; j < Ki_new.length; j++) {
        Ki_new[i][j] = 0;
      }
  } //Создание двумерного массива
  
  for (let i = 0; i < 3; i++) {
    ind[i]--;
  } //номера узлов -1

    //Заполнение значениями глобальной матрицы на основе локальной
  Ki_new[ind[0]][ind[0]] = Ki[0][0];
  
  Ki_new[ind[0]][ind[1]] = Ki[0][1];
  
  Ki_new[ind[0]][ind[2]] = Ki[0][2];
  
  Ki_new[ind[1]][ind[0]] = Ki[1][0];
  
  Ki_new[ind[1]][ind[1]] = Ki[1][1];
  
  Ki_new[ind[1]][ind[2]] = Ki[1][2];
  
  Ki_new[ind[2]][ind[0]] = Ki[2][0];
  
  Ki_new[ind[2]][ind[1]] = Ki[2][1];
  
  Ki_new[ind[2]][ind[2]] = Ki[2][2];

  return Ki_new;
}

function getStifnessMatrix(coords, Lambda) { //Локальная матрица жесткости 2х3
  let J = [
      [coords[0][2] - coords[0][0], coords[1][2] - coords[1][0]],
      [coords[0][1] - coords[0][0], coords[1][1] - coords[1][0]]
  ]; //Якобиан

  let Bnat = [
      [-1, 0, 1],
      [-1, 1, 0]
  ];

  let B = MultiplyMatrix(InverseMatrix(J), Bnat);

  return MultiplyMatrix(multMatrixNumber(Lambda, TransMatrix(B)), multMatrixNumber(Determinant(J) / 2, B));
  //Возвращает матрицу 3х3
}

function cPrintMatrixMTLB(A, x) { //Вывод матрицы
 let str = '';

  for (let i = 0; i < x; i++) {
      str += '['
    for (let j = 0; j < x; j++) {

      str += A[i][j];
      str += ' ';

    }
      str += ']'
    str +=';'
    str += '\n';
  }
  console.log(str);
}

function cPrintMatrix(A, x) { //Вывод матрицы
    let str = '';

    for (let i = 0; i < x; i++) {
        for (let j = 0; j < x; j++) {
            str += A[i][j];
            str += ' ';
        }

        str += '\n';
    }
    console.log(str);
}

function getHeatCapacityMatrix(coords, rho, Cv, t=1){  //Матрица теплопроводности
    let J = [
        [coords[0][2] - coords[0][0], coords[1][2] - coords[1][0]],
        [coords[0][1] - coords[0][0], coords[1][1] - coords[1][0]]
    ]; //Якобиан

    let NTN = [
        [2, 1, 1],
        [1, 2, 1],
        [1, 1, 2]
    ]
        //Проверить с другой формулой для подсчёта площади и поварьировать A/12 и det(J)/24
   return multMatrixNumber(rho*Cv*t*Determinant(J)/24,NTN)
}




