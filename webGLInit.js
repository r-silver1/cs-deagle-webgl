//--------------------------------------------------------//
//grading_note: webGLInit.js: pretty much the same as past projects, just moving to different js to make asg4.js prettier
//--------------------------------------------------------//

//--------------------------------------------------------//
//global variables
let u_GlobalRotation;
let u_ModelMatrix;

let u_FragColor;
let a_Position;
let g_vertexBuffer;
let a_TexCoord;
let g_UVbuff;
let u_whichTexture;
let u_ViewMatrix;
let u_ProjMatrix;

let g_NormBuff;
let a_Normal;
let u_NormalMatrix;
let g_ColBuff;
let a_Color;
let u_LightPosition;
let u_LightColor;
let u_AmbientLight;
let u_SpecularColor;
let u_SpecularExponent;
let u_LightOn;
let u_NormCols;

let u_SpotPosition;
let u_SpotDirection;
let u_SpotColor;

let u_FlashLight = 1;
let g_FlashLight = 1;

//--------------------------------------------------------//
//vertex shader

var VSHADER_SOURCE =`
    attribute vec4 a_Position;
    attribute vec2 a_TexCoord;
    
    attribute vec4 a_Color;
    attribute vec4 a_Normal;
    
    uniform mat4 u_GlobalRotation;
    uniform mat4 u_ModelMatrix;
    uniform mat4 u_ViewMatrix;
    uniform mat4 u_ProjMatrix;
    uniform mat4 u_NormalMatrix;
   
    varying vec2 v_TexCoord;
    varying vec4 v_Color;
    varying vec3 v_Normal;
    varying vec3 v_Position;
    //for phong http://math.hws.edu/graphicsbook/c7/s2.html
    
    varying vec4 v_EyeVec;
   
    void main(){
       //varying point position for shading in world coordinates
       v_Position = vec3(u_ModelMatrix * a_Position);
       //eye point varying (before projection, world coordinates)
       v_EyeVec = u_ViewMatrix * u_GlobalRotation * vec4(v_Position, 1.0);
       gl_Position = u_ProjMatrix * v_EyeVec;
       //varying texture coordinate
       v_TexCoord = a_TexCoord;    
       // Recalculate the normal based on the model matrix and make its length 1.
       v_Normal = normalize(vec3(u_NormalMatrix * a_Normal));
       v_Color = a_Color;
    }`;

//todo: get rid of u_FragColor
//fragment shader
//todo: rename u_sampler1 u_sampler2
var FSHADER_SOURCE =
    `precision mediump float;
    uniform int u_whichTexture;
    //todo: get rid of fragcolor?
    uniform vec4 u_FragColor;
    uniform sampler2D u_Sampler;
    uniform sampler2D u_Sampler1;
    uniform sampler2D u_Sampler3;
    uniform sampler2D u_Sampler4;
    //new
    uniform vec3 u_LightColor;
    uniform vec3 u_LightPosition;
    uniform vec3 u_AmbientLight;
    
    varying vec2 v_TexCoord;
    //new
    varying vec4 v_Color;
    varying vec3 v_Normal;
    varying vec3 v_Position;
    
    uniform vec3 u_SpecularColor;
    uniform float u_SpecularExponent;
    varying vec4 v_EyeVec;
    
    uniform int u_LightOn;
    uniform int u_NormCols;
    
    uniform vec3 u_SpotPosition;
    uniform vec3 u_SpotDirection;
    uniform vec3 u_SpotColor;
    uniform int u_FlashLight;
    
    //http://math.hws.edu/graphicsbook/demos/c7/spotlight-demo.html

    void main() {
        //if light on
        if(u_LightOn == 1){
            // Normalize the normal because it is interpolated and not 1.0 in length any more
            vec3 normal = normalize(v_Normal);
            // Calculate the light direction and make its length 1.
            vec3 lightDirection = normalize(u_LightPosition - v_Position);
            // The dot product of the light direction and the orientation of a surface (the normal)
            float nDotL = max(dot(lightDirection, normal), 0.0);
            //new for phong
            vec3 V = normalize(-v_EyeVec.xyz);
            vec3 R = -reflect(lightDirection, normal);
            float colPhong = pow(max(dot(R,V), 0.0), u_SpecularExponent);
            vec3 specCalc = colPhong * u_SpecularColor;
            
            //spotlight
            float spotFactor = 1.0;
            vec3 L = normalize(u_SpotPosition - v_Position);
            //flashlight
            //cos 45; cos between them
            // float cosCut = .707;
            float cosCut = .99;
            //light direction
            vec3 D = -normalize(u_SpotDirection);
            //angle between light and varying fragment position
            float spotCosine = dot(D,L);
            //exponent to adjust diffusion of light
            float exponent = 3.0;
            
            //light adds proportionally to cosine if within range of spotlight, or zero
            if(spotCosine >= cosCut){
                spotFactor = pow(spotCosine, exponent);
            }else{
                spotFactor = 0.0;
            }
            
            vec3 spot = vec3(0.0);
            //if facing spotlight
            int spotCheck = 0;
            if(dot(L, normal) > 0.0 && u_FlashLight == 1){
                spotCheck = 1;
            }
            
            //shapes
            if(u_whichTexture == -1){
                // Calculate the final color from diffuse reflection and ambient reflection
                vec3 diffuse = u_LightColor * v_Color.rgb * nDotL;
                vec3 ambient = u_AmbientLight * v_Color.rgb;
                vec3 light = diffuse + ambient;
                if(u_NormCols == 0){
                    if(spotCheck == 1){
                        spot += u_SpotColor * v_Color.rgb * dot(L, normal);
                        vec3 R_Spot = -reflect(L, normal);
                        float colPhong_S = pow(max(dot(R_Spot,V), 0.0), u_SpecularExponent);
                        spot += colPhong_S*u_SpecularColor;
                        spot *= spotFactor;
                    }
                    gl_FragColor = vec4(diffuse+spot+ambient+specCalc, v_Color.a);
                }else{
                    gl_FragColor = vec4(normal, 1.0);
                }
            }else if(u_whichTexture == 0){
                //texture shading: https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Lighting_in_WebGL
                //crates
                vec4 texelCol = texture2D(u_Sampler, v_TexCoord);
                vec3 diffuse = u_LightColor * texelCol.rgb * nDotL;
                vec3 ambient = u_AmbientLight * texelCol.rgb;
                if(u_NormCols == 0){
                    if(spotCheck == 1){
                        spot += u_SpotColor * texelCol.rgb * dot(L, normal);
                        vec3 R_Spot = -reflect(L, normal);
                        float colPhong_S = pow(max(.01*dot(R_Spot,V), 0.0), u_SpecularExponent);
                        spot += colPhong_S*u_SpecularColor;
                        spot *= spotFactor;
                    }
                    gl_FragColor = vec4(spot + diffuse + ambient+.01*specCalc, v_Color.a);

                }else{
                    gl_FragColor = vec4(normal, 1.0);
                } 
            //floor
            }else if(u_whichTexture == 1){
                vec4 texelCol = texture2D(u_Sampler1, v_TexCoord);
                vec3 diffuse = u_LightColor * texelCol.rgb * nDotL;
                vec3 ambient = u_AmbientLight * texelCol.rgb;
                vec3 light = diffuse + ambient;
                if(spotCheck == 1){
                    spot += u_SpotColor * texelCol.rgb * dot(L, normal);
                    vec3 R_Spot = -reflect(L, normal);
                    float colPhong_S = pow(.1*max(dot(R_Spot,V), 0.0), u_SpecularExponent);
                    spot += colPhong_S*u_SpecularColor;
                    spot *= spotFactor;
                }
                gl_FragColor = vec4(spot + diffuse + ambient, v_Color.a);
            //wall
            }else if(u_whichTexture == 2){
                vec4 texelCol = texture2D(u_Sampler3, v_TexCoord);
                vec3 diffuse = u_LightColor * texelCol.rgb * nDotL;
                vec3 ambient = u_AmbientLight * texelCol.rgb;
                vec3 light = diffuse + ambient;
                if(spotCheck == 1){
                    spot += u_SpotColor * texelCol.rgb * dot(L, normal);
                    vec3 R_Spot = -reflect(L, normal);
                    float colPhong_S = pow(.1*max(dot(R_Spot,V), 0.0), u_SpecularExponent);
                    spot = spot + colPhong_S*u_SpecularColor;
                    spot = spot*spotFactor;
                }
                gl_FragColor = vec4(spot + diffuse + ambient, v_Color.a);
            }else if(u_whichTexture == 3){
                vec4 texelCol = texture2D(u_Sampler4, v_TexCoord);
                vec3 diffuse = u_LightColor * texelCol.rgb * nDotL;
                vec3 ambient = u_AmbientLight * texelCol.rgb;
                vec3 light = diffuse + ambient;
                if(spotCheck == 1){
                    spot += u_SpotColor * texelCol.rgb * dot(L, normal);
                    vec3 R_Spot = -reflect(L, normal);
                    float colPhong_S = pow(max(dot(R_Spot,V), 0.0), u_SpecularExponent);
                    spot += colPhong_S*u_SpecularColor;
                    spot *= spotFactor;
                }
                gl_FragColor = vec4(spot + diffuse + ambient+ .3*specCalc, v_Color.a);    
            }else{
                //debug color
                gl_FragColor = vec4(.9, .9, .8, 1);
            }
        }else{
             if(u_whichTexture == -1){
                 if(u_NormCols == 0){
                    gl_FragColor = u_FragColor;
                 }else{
                    vec3 normal = normalize(v_Normal);
                    gl_FragColor = vec4(normal, 1.0);
                 } 
             }else if(u_whichTexture == 1){
                gl_FragColor = texture2D(u_Sampler1, v_TexCoord);
             }else if(u_whichTexture == 2){
                gl_FragColor = texture2D(u_Sampler3, v_TexCoord);
             }else if(u_whichTexture == 3){
                gl_FragColor = texture2D(u_Sampler4, v_TexCoord);
            }else{
                gl_FragColor = vec4(.9, .9, .8, 1);
            }
        }
    }`;

//---------- initialize webGL environment -----------------//

//globals for webGL environment/html canvas element
let canvas;
let gl;


//init a_Position attribute variable for vertex location
function initPos(){
    //todo: get location, create buffer stays; bind-enable could leave?
    //get location of attribute variable
    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0 ){
        console.log('Failed to get storage location for a_position');
        return;
    }
    //initialize vertex buffer object
    g_vertexBuffer = gl.createBuffer();
    if(!g_vertexBuffer){
        console.log('failed to create vertexbuffer');
        return;
    }

}

function initUV(){
    //get location of attribute variable
    a_TexCoord = gl.getAttribLocation(gl.program, 'a_TexCoord');
    if (a_TexCoord < 0 ){
        console.log('Failed to get storage location for a_TexCoord');
        return;
    }
    //initialize vertex buffer object
    g_UVbuff = gl.createBuffer();
    if(!g_UVbuff){
        console.log('failed to create g_UVbuff');
        return;
    }
}

//init uniform fragColor for shape/point color
function initCol(){
    //todo: why does "let" or "var" here cause an error?
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (u_FragColor < 0 ){
        console.log('failed to get storage locale for u_fragcolor');
        return;
    }

    //new for shading
    a_Color = gl.getAttribLocation(gl.program, `a_Color`);
    if(a_Color<0){
        console.log('failed to get storage locale for a_Color');
        return;
    }

    g_ColBuff = gl.createBuffer();
    if(!g_ColBuff){
        console.log('failed to create ColBuff');
        return;
    }


}



function initRot(){
    u_GlobalRotation = gl.getUniformLocation(gl.program, 'u_GlobalRotation');
    if(!u_GlobalRotation){
        console.log("failed to get storage locale of u_GlobalRotation");
        return;
    }
}


function initModMat(){
    u_ModelMatrix = gl.getUniformLocation(gl.program, "u_ModelMatrix");
    if(!u_ModelMatrix){
        console.log("failed to get storage locale of u_ModelMatrix");
        return;
    }
}

function initVw(){
    u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
    if(!u_ViewMatrix){
        console.log("failed to get storage locale of view matrix");
    }

}

function initPro() {
    u_ProjMatrix = gl.getUniformLocation(gl.program, 'u_ProjMatrix');
    if(!u_ProjMatrix){
        console.log("failed to get storage locale of projection matrix");
    }
}

function initNorm(){
    a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
    if (a_Normal < 0 ){
        console.log('Failed to get storage location for a_Normal');
        return;
    }

    g_NormBuff = gl.createBuffer();
    if(!g_NormBuff){
        console.log('failed to create normBuff');
        return;
    }

    u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
    if(!u_NormalMatrix){
        console.log('failed to get storage location of u_NormalMatrix')
        return;
    }
}

function initLight(){
    //light on/off toggle
    u_LightOn = gl.getUniformLocation(gl.program, 'u_LightOn');
    if(!u_LightOn){
        console.log("could not get the light on");
    }
    gl.uniform1i(u_LightOn, 1);

    //normal color mode toggle switch
    u_NormCols = gl.getUniformLocation(gl.program, 'u_NormCols');
    if(!u_NormCols){
        console.log("couldn't get norm cols");
    }
    gl.uniform1i(u_NormCols, 0);


    u_LightPosition = gl.getUniformLocation(gl.program, 'u_LightPosition');
    if(!u_LightPosition){
        console.log('failed to get storage u_LightPosition');
    }
    //initial light position
    gl.uniform3f(u_LightPosition, -5.0, 4.0, 5.0);

    u_LightColor = gl.getUniformLocation(gl.program, 'u_LightColor');
    if(!u_LightColor){
        console.log('failed to get storage: u_LightColor');
        return;
    }

    gl.uniform3f(u_LightColor, 1, 1, 1);

    u_AmbientLight = gl.getUniformLocation(gl.program, 'u_AmbientLight');
    if(!u_AmbientLight){
        console.log('failed to get ambient light pos');
        return;
    }
    gl.uniform3f(u_AmbientLight, .3, .3, .4);


}

function initSpot(){
    u_SpotPosition = gl.getUniformLocation(gl.program, 'u_SpotPosition');
    u_SpotDirection = gl.getUniformLocation(gl.program, 'u_SpotDirection');
    u_SpotColor = gl.getUniformLocation(gl.program, 'u_SpotColor');
    u_FlashLight = gl.getUniformLocation(gl.program, 'u_FlashLight');
    if(!u_SpotPosition || !u_SpotDirection || !u_SpotColor || !u_FlashLight){
        console.log(`failed to load spot variables`);
    }
    //note: these positions aren't what ends up being shown, just initial values to make program work nicely
    gl.uniform3f(u_SpotPosition, 12, 5, 12);
    gl.uniform3f(u_SpotDirection, 0, -1, 0);
    gl.uniform3f(u_SpotColor, .5, .5, .5);
    gl.uniform1i(u_FlashLight, 1);
}

function initSpec(){
    u_SpecularColor = gl.getUniformLocation(gl.program, 'u_SpecularColor');
    if(!u_SpecularColor){
        console.log('failed to get u_SpecularColor');
    }
    gl.uniform3f(u_SpecularColor, .6, .6, .6);

    u_SpecularExponent = gl.getUniformLocation(gl.program, 'u_SpecularExponent');
    if(!u_SpecularExponent){
        console.log('failed to get u_SpecularExponent');
    }
    gl.uniform1f(u_SpecularExponent, 6.0);
}



function connectVariablesToGLSL(){
    //get position variable loaded into global a_pos
    initPos();
    //get color var loaded into u_frag
    initCol();

    //global rotation/model
    initRot();
    //initialize UV buffer/var
    initUV();
    //initialize model matrix
    initModMat();
    //init view matrix
    initVw();
    //init projection matrix
    initPro();

    //new
    initNorm();
    initLight();
    initSpot();
    initSpec();
}

//grading_note: I based these textures off of images found online most similar to CS Source textures, then went into photoshop and did some
//warping/manipulation to make them look "correct"
function initTextures(){
    var texture = gl.createTexture();
    if(!texture){
        console.log("failed to create texture object");
        return false;
    }
    //get u_sampler storage locale
    var u_Sampler = gl.getUniformLocation(gl.program, 'u_Sampler');
    if(!u_Sampler) {
        console.log("failed to get storage location for u_Sampler");
        return false;
    }
    //new image object
    var image = new Image();
    if(!image){
        console.log("image creation failure");
        return false;
    }

    image.onload = function(){ loadTexture(texture, 0, u_Sampler, image); renderScene();};
    image.src = 'texture/crate_texture.jpg';

    //texture2: floor
    var texture2 = gl.createTexture();
    if(!texture2){
        console.log("failed to create texture object");
        return false;
    }

    //todo: rename sampler2?
    var u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
    if(!u_Sampler1) {
        console.log("failed to get storage location for u_Sampler");
        return false;
    }

    var image2 = new Image();
    if(!image2){
        console.log("im2 create fail");
        return false;
    }
    image2.onload = function(){ loadTexture(texture2, 1, u_Sampler1, image2); renderScene();};
    // image2.src = 'texture/floorTexjep.jpg';
    image2.src = 'texture/floorTexjep_bigger2.jpg';

    //texture3: walls
    var texture3 = gl.createTexture();
    if(!texture3){
        console.log("failed to create texture object");
        return false;
    }
    var u_Sampler3 = gl.getUniformLocation(gl.program, 'u_Sampler3');
    if(!u_Sampler3) {
        console.log("failed to get storage location for u_Sampler");
        return false;
    }
    var image3 = new Image();
    if(!image3){
        console.log("im3 create fail");
        return false;
    }
    image3.onload = function(){ loadTexture(texture3, 2, u_Sampler3, image3); renderScene();};
    image3.src = 'texture/walltex_done1.jpg';

    //texture4: walls
    var texture4 = gl.createTexture();
    if(!texture4){
        console.log("failed to create texture object");
        return false;
    }

    var u_Sampler4 = gl.getUniformLocation(gl.program, 'u_Sampler4');
    if(!u_Sampler4) {
        console.log("failed to get storage location for u_Sampler");
        return false;
    }

    var image4 = new Image();
    if(!image4){
        console.log("im4 create fail");
        return false;
    }
    image4.onload = function(){ loadTexture(texture4, 3, u_Sampler4, image4); renderScene();};
    image4.src = 'texture/ceilingtexBig.jpg';


    u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
    if(!u_whichTexture){
        console.log("which texture failed to init");
    }
    return true;
}

function loadTexture(tex, texNum, sampler, img){
    //flip image y axis to match webgl
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    //enable tex unit0
    if(texNum == 1){
        gl.activeTexture(gl.TEXTURE1);
    }else if(texNum == 2){
        gl.activeTexture(gl.TEXTURE2);
    }else if(texNum == 3){
        gl.activeTexture(gl.TEXTURE3);
    }
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
    gl.generateMipmap(gl.TEXTURE_2D);
    if(texNum == 0){
        gl.uniform1i(sampler, 0);
    }
    if(texNum == 1){
        gl.uniform1i(sampler, 1);
    }else if(texNum == 2){
        gl.uniform1i(sampler, 2);
    }else if(texNum == 3){
        gl.uniform1i(sampler, 3);
    }
}

function setupWebGL(){
    canvas = document.getElementById("bigCan");
    gl = canvas.getContext("webgl", false, {preserveDrawingBuffer: true});
    if(!gl){
        console.log('rendering context webgl failure');
        return;
    }

    //enable DEPTH_TEST for 3D geometry
    gl.enable(gl.DEPTH_TEST);

    gl.clearColor(0.17, .17, 0.2, 1.0);
    if(!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)){
        console.log('failed to initiate shaders');
        return;
    }

    if(!initTextures()){
        console.log("failed to init textures");
    }

}