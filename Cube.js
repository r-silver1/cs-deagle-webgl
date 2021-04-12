//--------------------------------------------------------//
//grading note: roundCone.js: logic for defining, updating and storing shapes
//--------------------------------------------------------//
class Cube{
    static vertices = new Float32Array([

        //front
        .5, .5, .5,  -.5, .5, .5,  -.5, -.5, .5,
        .5, .5, .5,  -.5, -.5, .5,  .5, -.5, .5,
        //back
        .5, .5, -.5,  -.5, .5, -.5,  -.5, -.5, -.5,
        .5, .5, -.5,  -.5, -.5, -.5,  .5, -.5, -.5,
        //right
        .5, .5, -.5,  .5, .5, .5,  .5, -.5, .5,
        .5, .5, -.5,  .5, -.5, .5, .5, -.5, -.5,
        //left
        -.5, .5, -.5,  -.5, .5, .5,  -.5, -.5, .5,
        -.5, .5, -.5,  -.5, -.5, .5, -.5, -.5, -.5,
        //top
        .5, .5, .5,  .5, .5, -.5,  -.5, .5, -.5,
        .5, .5, .5,  -.5, .5, -.5,  -.5, .5, .5,
        //bottom
        .5, -.5, .5,  .5, -.5, -.5,  -.5, -.5, -.5,
        .5, -.5, .5,  -.5, -.5, -.5,  -.5, -.5, .5,

    ]);

    //todo: moved around coordinate order, need to fix this
    static coordUV = new Float32Array([
        //front face
        1.0, 1.0,  0.0, 1.0,  0.0, 0.0,
        1.0, 1.0,  0.0, 0.0,   1.0, 0.0,
        //rear face
        0.0, 1.0,  1.0, 1.0,  1.0, 0.0,
        0.0, 1.0,  1.0, 0.0,  0.0, 0.0,
        //right face (or is it left?)
        1.0, 1.0, 0.0, 1.0,  0.0, 0.0,
        1.0, 1.0, 0.0, 0.0,  1.0, 0.0,
        //left
        0.0, 1.0, 1.0, 1.0,  1.0, 0.0,
        0.0, 1.0, 1.0, 0.0,  0.0, 0.0,
        //top
        0.0, 1.0, 1.0, 1.0,  1.0, 0.0,
        0.0, 1.0, 1.0, 0.0,  0.0, 0.0,
        //bottom
        1.0, 1.0, 1.0, 0.0,  0.0, 0.0,
        1.0, 1.0, 0.0, 0.0,  0.0, 1.0,

    ]);


    //todo: replace this logic with more permaneant color solution... i.e. loop list with this.color for instance, don't use static, convert to float array
    static colors = new Float32Array([
        1, 0, 0, 1,   1, 0, 0, 1,   1, 0, 0, 1,
        1, 0, 0, 1,   1, 0, 0, 1,   1, 0, 0, 1,

        1, 0, 0, 1,   1, 0, 0, 1,   1, 0, 0, 1,
        1, 0, 0, 1,   1, 0, 0, 1,   1, 0, 0, 1,

        1, 0, 0, 1,   1, 0, 0, 1,   1, 0, 0, 1,
        1, 0, 0, 1,   1, 0, 0, 1,   1, 0, 0, 1,

        1, 0, 0, 1,   1, 0, 0, 1,   1, 0, 0, 1,
        1, 0, 0, 1,   1, 0, 0, 1,   1, 0, 0, 1,

        1, 0, 0, 1,   1, 0, 0, 1,   1, 0, 0, 1,
        1, 0, 0, 1,   1, 0, 0, 1,   1, 0, 0, 1,

        1, 0, 0, 1,   1, 0, 0, 1,   1, 0, 0, 1,
        1, 0, 0, 1,   1, 0, 0, 1,   1, 0, 0, 1,

    ]);

    static initNorms(){
        let normLines = [];
        let normCol = [];
        let i = 0;

        while(i < Cube.vertices.length){
            normLines.push(0.0);
            normLines.push(0.0);
            normLines.push(0.0);

            normCol.push(0);
            normCol.push(.8);
            normCol.push(.8);
            normCol.push(.8);

            let scale = 3.0;
            normLines.push(scale*Cube.vertices[i]);
            i+=1;
            normLines.push(scale*Cube.vertices[i]);
            i+=1;
            normLines.push(scale*Cube.vertices[i]);
            i+=1;

            normCol.push(0);
            normCol.push(.8);
            normCol.push(.8);
            normCol.push(.8);

        }
        return [normLines, normCol];
    }

    static returns = Cube.initNorms();
    static lines = Cube.returns[0];
    static cols = Cube.returns[1];
    static linesFloat = new Float32Array(Cube.lines);
    static colsFloat = new Float32Array(Cube.cols);

    constructor(){
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
        //coordMat: used to cache coordinates... not all shapes used, so uninitialized
        this.coordMat;
        this.w = 1.0;
        this.h = 1.0;
        this.d = 1.0;
        this.textureNum = -1;
    }

    render() {
        this.drawCube();
        if(g_normOn) {
            this.drawCubeNorms();
        }
    }

    cacheCoords(){
        this.coordMat = new Matrix4(this.matrix);
    }

    //grading note: drawCube function: draw 6 faces with different fake shading colors
    drawCube(){
        //pass matrix to u_ModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        //pass color of point to u_FragColor uniform variable
        gl.uniform4f(u_FragColor, this.color[0], this.color[1], this.color[2], this.color[3]);
        //set texture
        gl.uniform1i(u_whichTexture, this.textureNum);


        gl.bindBuffer(gl.ARRAY_BUFFER, g_vertexBuffer);
        //new for 3dUV:
        //for cube
        gl.bufferData(gl.ARRAY_BUFFER, Cube.vertices, gl.DYNAMIC_DRAW);
        //assign buffer obj to position variable; 2nd 11arg = 3: 3D coord, 3 values/vertex x y z
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
        //enable assignment to a_pos var
        gl.enableVertexAttribArray(a_Position);

        //for cubes
        //only need texture coordinates if we're using a texture
        if(this.textureNum == -1){
            gl.disableVertexAttribArray(a_TexCoord);
        }else{
            gl.bindBuffer(gl.ARRAY_BUFFER, g_UVbuff);
            gl.bufferData(gl.ARRAY_BUFFER, Cube.coordUV, gl.DYNAMIC_DRAW);
            gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, 0, 0);
            //enable assignment to a_pos var
            gl.enableVertexAttribArray(a_TexCoord);
        }

        //new for shader
        gl.bindBuffer(gl.ARRAY_BUFFER, g_ColBuff);
        //for cube
        gl.bufferData(gl.ARRAY_BUFFER, Cube.colors, gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(a_Color, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Color);

        //normal array
        gl.bindBuffer(gl.ARRAY_BUFFER, g_NormBuff);
        //for cube
        // use vertices as normals; defined as cube centered at "origin"
        gl.bufferData(gl.ARRAY_BUFFER, Cube.vertices, gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Normal);

        //normal (inverse transpose) matrix
        var normalMatrix = new Matrix4();
        normalMatrix.setInverseOf(this.matrix);
        normalMatrix.transpose();
        gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);

        //for cube
        gl.drawArrays(gl.TRIANGLES, 0, Cube.vertices.length/3);

    }

    drawCubeNorms(){
        //pass matrix to u_ModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        //todo: do i even need this fragcolor variable anymore? remove! from all files, initialization etc
        //pass color of point to u_FragColor uniform variable
        gl.uniform4f(u_FragColor, this.color[0], this.color[1], this.color[2], this.color[3]);
        //set texture
        gl.uniform1i(u_whichTexture, this.textureNum);


        gl.bindBuffer(gl.ARRAY_BUFFER, g_vertexBuffer);
        //new for 3dUV:
        //for lines
        gl.bufferData(gl.ARRAY_BUFFER, Cube.linesFloat, gl.DYNAMIC_DRAW);
        //assign buffer obj to position variable; 2nd 11arg = 3: 3D coord, 3 values/vertex x y z
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
        //enable assignment to a_pos var
        gl.enableVertexAttribArray(a_Position);

        //for lines
        gl.disableVertexAttribArray(a_TexCoord);


        //new for shader
        gl.bindBuffer(gl.ARRAY_BUFFER, g_ColBuff);

        //for lines
        gl.bufferData(gl.ARRAY_BUFFER, Cube.colsFloat, gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(a_Color, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Color);

        //normal array
        gl.bindBuffer(gl.ARRAY_BUFFER, g_NormBuff);
        //for lines
        gl.bufferData(gl.ARRAY_BUFFER, Cube.linesFloat, gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Normal);

        //normal (inverse transpose) matrix
        var normalMatrix = new Matrix4();
        normalMatrix.setInverseOf(this.matrix);
        normalMatrix.transpose();
        gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);

        //for line
        gl.drawArrays(gl.LINES, 0, Cube.linesFloat.length/3);
    }


}


