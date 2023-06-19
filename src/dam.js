const RANGE_COLOR = 510;

class Dam {
    elemNodes = new Array();
    nodes = new Array();
    bc = new Array();
    temperature = [];
    isShowed = [true, true];


    constructor() {
    }

    read(ourRequest) {
        let ourData = ourRequest.responseText;

        let strBlocks = ourData.split('@');

        let newStr = [
            strBlocks[0].split(','),
            strBlocks[1].split(','),
            strBlocks[2].split(',')
        ];

        let nums = new Array(3);
        for (let j = 0; j < 3; j++) {
            nums[j] = new Array();
            for (let i = 0; i < newStr[j].length; i++) {
                nums[j].push(parseFloat(newStr[j][i]));
            }
        };

        for (let j = 0, i = 0; j < nums[0].length; j+=2, i++) {
            this.nodes.push(new Array(nums[0][j], nums[0][j + 1]));
        }
        this.nodes = TransMatrix(this.nodes);

        for (let j = 0; j < nums[1].length; j+=4) {
            this.elemNodes.push(new Array(nums[1][j], nums[1][j + 1], nums[1][j + 2], nums[1][j + 3]));
        }
        this.elemNodes = TransMatrix(this.elemNodes);

        for (let j = 0, i = 0; j < nums[2].length / 2; j++, i++) {
            this.bc.push(new Array(nums[2][j], nums[2][j + nums[2].length / 2]));
        }
        this.bc = TransMatrix(this.bc);
    }
  
    colorToColorType(color) {
        color = Math.floor(color)
        if (color > 255) {
            color = 'rgb(' + (color - 255 + 1) + ',0,0)';
        } else {
            color = 'rgb(0,0,' + color + ')';
        }
        return color;
    }

    draw(from, to) {
        console.log("paint begin");
        let T = this.temperature;

        canvas.width = 1200;
        canvas.height = 500;

        let coords = TransMatrix(this.nodes);
        let maxTemper = -100, minTemper = 1000, minCoord = 10000;
        
        for (let i = 0; i < T.length; i++) {
            if (T[i] > maxTemper) {
                maxTemper = T[i];
            } else if (T[i] < minTemper) {
                minTemper = T[i];
            }
        }

        //ctx.textAlign = "center";
        ctx.fillStyle = 'green';
        ctx.font = "18px Verdana";
        ctx.fillText(minTemper.toFixed(2) + '°C', 70, 350);
        ctx.fillText(maxTemper.toFixed(2) + '°C', 70, 65);
        ctx.transform(1, 0, 0, -1, 0, canvas.height);

        let deltaT = maxTemper - minTemper;
        let sectorT = Math.floor(RANGE_COLOR / deltaT);
        let pointColor = new Array(T.length);

        for (let i = 0; i < T.length; i++) {
            pointColor[i] = (T[i] - minTemper + 1) * sectorT;
        }

        for (let i = 0; i < coords.length; i++) {
            if (minCoord > coords[i][0]) {
                minCoord = coords[i][0];
            }
        }

        for (let i = 0; i < coords.length; i++) {
            coords[i][0] -= minCoord;
        }

        for (let i = 0; i < coords.length; i++) {
            coords[i][0] *= 2.0;
            coords[i][1] *= 2.0;
        }

        for (let i = from; i < to; i++) {
            
            var v1 = { x: coords[this.elemNodes[0][i] - 1][0], y: coords[this.elemNodes[0][i] - 1][1], color: pointColor[this.elemNodes[0][i] - 1] };
            var v2 = { x: coords[this.elemNodes[1][i] - 1][0], y: coords[this.elemNodes[1][i] - 1][1], color: pointColor[this.elemNodes[1][i] - 1] };
            var v3 = { x: coords[this.elemNodes[2][i] - 1][0], y: coords[this.elemNodes[2][i] - 1][1], color: pointColor[this.elemNodes[2][i] - 1] };

            var radius = Math.floor(Math.sqrt(
                Math.pow(Math.abs(v1.x - v2.x), 2) + Math.pow(Math.abs(v1.y - v2.y), 2)
            ));
            ///////////////////////////////
            let tmpColor = v1.color;
            tmpColor = this.colorToColorType(tmpColor);
            
            var grd1 = ctx.createRadialGradient(v1.x, v1.y, 0, v1.x, v1.y, radius);
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

        /** draw legend */
        var grd4 = ctx.createLinearGradient(35, 150, 35, 400);
        grd4.addColorStop(0, 'blue');
        grd4.addColorStop(1, 'red');
        ctx.globalCompositeOperation = "lighter";
        ctx.fillStyle = grd4;
        ctx.fillRect(20, 150, 50, 300);
        ctx.globalCompositeOperation = "source-over";
        console.log('Paint closed');
    }

    solve() {
        let nodeLength = this.nodes[0].length;    
        let K = new Array(nodeLength);
        let R;

        for (let i = 0; i < K.length; i++) {
            K[i] = new Array(nodeLength);
            for (let j = 0; j < K[0].length; j++) {
                K[i][j] = 0;
            }
        }

        for (let i = 0; i < this.elemNodes[0].length; i++) {
            var elem_n_lock = [1, 2, 3];
            elem_n_lock[0] = this.elemNodes[0][i];
            elem_n_lock[1] = this.elemNodes[1][i];
            elem_n_lock[2] = this.elemNodes[2][i];
        
            R = [1, 2, 3];
            for (let i = 0; i < 3; i++) {
                R[i] = new Array(this.nodes[0][elem_n_lock[i] - 1], this.nodes[1][elem_n_lock[i] - 1]);
            }
            R = TransMatrix(R);
            
            let Ki = getStifnessMatrix(R, this.elemNodes[3][i]);
            Ki = trsMatrix(nodeLength, elem_n_lock, Ki);
            K = SumMatrix(K, Ki);
        }

        var F = new Array(nodeLength);

        for (let i = 0; i < F.length; i++) {
            F[i] = 0;
        }

        for (let i = 0; i < this.bc[0].length; i++) {
            for (let j = 0; j < K[0].length; j++) {
                K[this.bc[0][i] - 1][j] = 0;
            }
            K[this.bc[0][i] - 1][this.bc[0][i] - 1] = 1;            
            F[this.bc[0][i] - 1] = this.bc[1][i];
        }

        this.temperature = MultiplyMatrixLineVariant(InverseMatrix(K), F);
    }

    showBlock1() {
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
            coords[i][0] *= 2.0;
            coords[i][1] *= 2.0;
        }

        for (let i = 0; i < ZONE_LEN; i++) {
            var v1 = { x: coords[this.elemNodes[0][i] - 1][0], y: coords[this.elemNodes[0][i] - 1][1] };
            var v2 = { x: coords[this.elemNodes[1][i] - 1][0], y: coords[this.elemNodes[1][i] - 1][1] };
            var v3 = { x: coords[this.elemNodes[2][i] - 1][0], y: coords[this.elemNodes[2][i] - 1][1] };
            
            ctx.beginPath();
            ctx.moveTo(v1.x, v1.y);
            ctx.lineTo(v2.x, v2.y);
            ctx.lineTo(v3.x, v3.y);
            ctx.closePath();
            ctx.fillStyle = 'yellow';
            ctx.fill();
        }
    }

    showBlock2() {
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
            coords[i][0] *= 2.0;
            coords[i][1] *= 2.0;
        }
        for (let i = ZONE_LEN; i < this.elemNodes[0].length; i++) {
            var v1 = { x: coords[this.elemNodes[0][i] - 1][0], y: coords[this.elemNodes[0][i] - 1][1] };
            var v2 = { x: coords[this.elemNodes[1][i] - 1][0], y: coords[this.elemNodes[1][i] - 1][1] };
            var v3 = { x: coords[this.elemNodes[2][i] - 1][0], y: coords[this.elemNodes[2][i] - 1][1] };
            
            ctx.beginPath();
            ctx.moveTo(v1.x, v1.y);
            ctx.lineTo(v2.x, v2.y);
            ctx.lineTo(v3.x, v3.y);
            ctx.closePath();
            ctx.fillStyle = 'orange';
            ctx.fill();
        }
    }
    
    reDrawBlock1 () {
        if (this.isShowed[0] == false && this.isShowed[1] == false) {
            this.draw(0, this.elemNodes[0].length);
            this.showBlock2();
        } else {
            this.draw(0, this.elemNodes[0].length);
        }
        this.isShowed[0] = true;
    }

    reDrawBlock2 () {
        if (this.isShowed[0] == false && this.isShowed[1] == false) {
            this.draw(0, this.elemNodes[0].length);
            this.showBlock1();
        } else {
            this.draw(0, this.elemNodes[0].length);
        }
        this.isShowed[1] = true;
    }

}