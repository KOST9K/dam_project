const SHIFT_Y = 1000;

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

function splitString(stringToSplit, separator) {
    return stringToSplit.split(separator);
}

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

function rotate(p, angle) {
    return (new Point (p.x * Math.cos(angle) - p.y * Math.sin(angle),
        -p.x * Math.sin(angle) + p.y * Math.cos(angle)));
}

class Dam {

    elemNodes = new Array();
    nodes = new Array();


    constructor(sourse) {
        
        /*
        * Deprecated
        */ 
        /*
        sourse = this.read(sourse);

        let arr = [];
        for (let i = 0; i < sourse.length; i += 2) {
            arr.push(new Point(sourse[i], sourse[i + 1]));
        }

        var min = [100000,];
        for (let i = 0; i < arr.length; i ++) {
            if (arr[i].y < min[0]) {
                min = [arr[i].y, i];
            }
        }
        
        for (let i = 0; i < arr.length; i ++) {
            arr[i].y -= min[0];
            arr[i] = rotate(arr[i], Math.PI / 3);
        }
        this.coords = arr;
        this.temps = [];
        */
    }
    
    readNodes(sourse) {
        let newStr = splitString(sourse, ",");
        let nums = new Array();  

        for (let i = 0; i < newStr.length; i++) {
            nums.push(parseFloat(newStr[i]));
        }

        this.nodes = new Array(nums.length / 2);
        for (let j = 0, i = 0; j < nums.length; j+=2, i++) {
            this.nodes[this.nodes.length - 1] = new Array();
            this.nodes.push(nums[j], nums[j + 1]);
        }

        console.log('than here!!!!!!!!!');
        console.log(this.nodes);
        console.log(this.elemNodes);
    }

    readElemNodes(sourse) {
        let newStr = splitString(sourse, ",");
        let nums = new Array();  

        for (let i = 0; i < newStr.length; i++) {
            nums.push(parseFloat(newStr[i]));
        }

        this.elemNodes = new Array(nums.length / 2);
        for (let j = 0; j < nums.length; j+=4) {
            this.elemNodes[this.elemNodes.length - 1] = new Array();
            this.elemNodes.push(nums[j], nums[j + 1], nums[j + 2], nums[j + 3]);
        }
    }

    /*
    * Deprecated
    */
    /*
    read(sourse) {
        let str = sourse;
        let newStr = splitString(sourse, ",");
        let nums = [];
  
        //console.log(str);
        //console.log(newStr);
  
        
        for (let i = 0; i < newStr.length; i++) {
              nums.push(parseFloat(newStr[i]));
        }
  
        //console.log(nums);
        
        for (let i = 0; i <= nums.length; i+=2) {
              nums.splice(i, 1);
        }

        return nums;
    }
    */
  
    draw() {
        canvas.width = 500;
        canvas.height = 500;
        
        ctx.fillStyle = "green";
        
        ctx.beginPath();
  
        //ctx.moveTo(0, 0);
        console.log(this.coords);
        for (let i = 0; i < this.coords.length; i++) {
              this.coords[i].x *= 5;
              this.coords[i].y *= 5;
              ctx.moveTo(this.coords[i].x + 200, this.coords[i].y + 200);
              ctx.arc(this.coords[i].x + 200, this.coords[i].y + 200, 5, 0, Math.PI * 2, true);
        }
        console.log(this.coords);
        
        ctx.fill();
    }

    trsMatrix(N, ind, Ki) {

        let Ki_new = new Array(N);
    
        for (let i = 0; i < Ki_new.length; i++) {
            Ki_new[i] = new Array(N);
        } 
    
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

    getStifnessMatrix(coords, Lambda) {
        J = [
            [coords[0][2] - coords[0][0], coords[1][2] - coords[1][0]],
            [coords[0][1] - coords[0][0], coords[1][1] - coords[1][0]]
        ];

        Bnat = [
            [-1, 0, 1],
            [-1, 1, 0]
        ];

        B = MultiplyMatrix(InverseMatrix(J), Bnat);
        return MultiplyMatrix(multMatrixNumber(Lambda, TransMatrix(B)), MultiplyMatrix(Determinant(J) / 2, B));
    }

    solve() {

        let nodeLength = this.coords.length;    
        let K = new Array(nodeLength);
        let R = [];

        for (let i = 0; i < K.length; i++) {
            K[i] = new Array(nodeLength);
        }

        for (i in K) {
            i = 0;
        }

        for (let i = 0; i < this.elemNodes.length; i++) {
            var elem_n_lock = [1, 2, 3];
            elem_n_lock[0] = this.elemNodes[i][0];
            elem_n_lock[1] = this.elemNodes[i][1];
            elem_n_lock[2] = this.elemNodes[i][2];
        

            R = [1, 2, 3];
            for (let i = 0; i < 3; i++) {
                R[i] = this.nodes[elem_n_lock[i]];
            }

            Ki = getStifnessMatrix(R, elemNodes(i, 3));
            Ki = transformMatrix(nodeLength, elem_n_lock, Ki);

            K = SumMatrix(K, Ki);
        }
        
        var F = new Array(nodeLength);

        /*for (let i = 0; i < bc.length; i++) {
            K(bc(1,i),:) = zeros(1,N);
            K(bc(1,i),bc(1,i)) = 1;
            F(bc(1,i),1) = bc(2,i);
        }*/


            /*                                         


                                            for i=1:size(elem_nodes,2)
                                                R = [];
                                                elem_n_lock = elem_nodes(1:3,i);
                                                R = [nodes(:,elem_n_lock(1)),nodes(:,elem_n_lock(2)),nodes(:,elem_n_lock(3))];
                                                [Ki] = get_stiffness_matrix(R,elem_nodes(4,i));
                                                [Ki] = transform_matrix(N,elem_n_lock,Ki);
                                                K = K + Ki;
                                            end

        F = zeros(N,1);

        for i=1:size(bc,2)
            K(bc(1,i),:) = zeros(1,N);
            K(bc(1,i),bc(1,i)) = 1;
            F(bc(1,i),1) = bc(2,i);
        end

        T = linsolve(K,F);
        */
    }
}