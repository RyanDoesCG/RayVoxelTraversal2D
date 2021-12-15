(function () {
    var canvas = document.getElementById('window')
    var gl = canvas.getContext("webgl2")

    //
    // Shader
    //
    var shader  = createProgram (gl, 
        createShader  (gl, gl.VERTEX_SHADER, vertSource), 
        createShader  (gl, gl.FRAGMENT_SHADER, fragSource));

    //
    // Quad Geometry
    //
    var QuadGeometry = [
        /* pos */ -1.0, -1.0, 0.0, /* uv */ 0.0, 0.0, // bottom left
        /* pos */  1.0, -1.0, 0.0, /* uv */ 1.0, 0.0, // bottom right
        /* pos */  1.0,  1.0, 0.0, /* uv */ 1.0, 1.0, // top right
        /* pos */  1.0,  1.0, 0.0, /* uv */ 1.0, 1.0, // top right
        /* pos */ -1.0, -1.0, 0.0, /* uv */ 0.0, 0.0, // bottom left
        /* pos */ -1.0,  1.0, 0.0, /* uv */ 0.0, 1.0  // top left
        ]

    var VertexBufferObject = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, VertexBufferObject);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(QuadGeometry), gl.STATIC_DRAW)

    var PositionAttributeLocation = gl.getAttribLocation(shader, "in_positions")
    var UVAttributeLocation = gl.getAttribLocation(shader, "in_uvs")
    gl.vertexAttribPointer(PositionAttributeLocation, 3, gl.FLOAT, gl.FALSE, 5 * Float32Array.BYTES_PER_ELEMENT, 0)
	gl.vertexAttribPointer(UVAttributeLocation, 2, gl.FLOAT, gl.FALSE, 5 * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT)
    gl.enableVertexAttribArray(PositionAttributeLocation);
	gl.enableVertexAttribArray(UVAttributeLocation);

    //
    // Textures
    //
    var PerlinNoiseTexture = loadTexture(gl, 'images/simplex.png')
    var WhiteNoiseTexture = loadTexture(gl, 'images/white.png')
    var BlueNoiseTexture = loadTexture(gl, 'images/blue.png')

    //
    // Uniforms
    //
    var PerlinNoiseUniformLoc = gl.getUniformLocation(shader, "perlinNoiseSampler")
    var WhiteNoiseUniformLoc = gl.getUniformLocation(shader, "whiteNoiseSampler")
    var BlueNoiseUniformLoc = gl.getUniformLocation(shader, "blueNoiseSampler")

    var MouseUUniformLoc = gl.getUniformLocation(shader, "MouseU")
    var MouseVUniformLoc = gl.getUniformLocation(shader, "MouseV")

    var ScreenWidthUniformLoc = gl.getUniformLocation(shader, "Width")
    var ScreenHeightUniformLoc = gl.getUniformLocation(shader, "Height")
    
    var TimeUniformLoc = gl.getUniformLocation(shader, "Time")
    var AspectUniformLoc = gl.getUniformLocation(shader, "Aspect")
    
    var PointAUniformLoc = gl.getUniformLocation(shader, "A")
    var PointBUniformLoc = gl.getUniformLocation(shader, "B")

    var PointA = [ 0.25, 0.0 ]
    var PointB = [ 0.15, 1.0 ]

    function UpdateScene()
    {
        PointA = [
            ( 0.5 + Math.cos(frameID * 0.01) * 0.5), 
            ( 0.5 + Math.sin(frameID * 0.00134) * 0.5) ]        
        PointB = [
            ( 0.5 + Math.sin(frameID * 0.00134) * 0.5), 
            ( 0.5 + Math.cos(frameID * 0.01) * -0.5) ]
    }

    function RenderScene()
    {
        gl.viewport(0, 0, canvas.width, canvas.height);
 
        gl.vertexAttribPointer(PositionAttributeLocation, 3, gl.FLOAT, gl.FALSE, 5 * Float32Array.BYTES_PER_ELEMENT, 0)
        gl.vertexAttribPointer(UVAttributeLocation, 2, gl.FLOAT, gl.FALSE, 5 * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT)
        gl.enableVertexAttribArray(PositionAttributeLocation);
        gl.enableVertexAttribArray(UVAttributeLocation);

        gl.useProgram(shader);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, PerlinNoiseTexture);
        gl.uniform1i(PerlinNoiseUniformLoc, 0);

        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, WhiteNoiseTexture);
        gl.uniform1i(WhiteNoiseUniformLoc, 1);

        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, BlueNoiseTexture);
        gl.uniform1i(BlueNoiseUniformLoc, 2);

        gl.uniform1f(MouseUUniformLoc, MouseX)
        gl.uniform1f(MouseVUniformLoc, MouseY)

        gl.uniform1f(ScreenWidthUniformLoc, canvas.clientWidth)
        gl.uniform1f(ScreenHeightUniformLoc, canvas.clientHeight)

        gl.uniform1f(TimeUniformLoc, frameID)
        gl.uniform1f(AspectUniformLoc, 1.0)

        gl.uniform2fv(PointAUniformLoc, PointA)
        gl.uniform2fv(PointBUniformLoc, PointB)

        gl.clearColor(0.0, 0.0, 0.0, 1.0)
        gl.clear(gl.COLOR_BUFFER_BIT)
        gl.drawArrays(gl.TRIANGLES, 0, 6)
    }

    var MouseX = 0;
    var MouseY = 0;

    var frameID = 1;
    function Update ()
    {
        if (!paused)
        {
            UpdateScene();
            RenderScene();
            frameID++;
        }

        requestAnimationFrame(Update)
    }

    requestAnimationFrame(Update)

    var paused = false;

    document.addEventListener('mousemove', e => {
        if (!paused)
        {
            MouseX = e.clientX;
            MouseY = e.clientY;
        }
    });

    document.addEventListener('mousedown', e => {
        paused = !paused;
        if (!paused)
        {
            MouseX = e.clientX;
            MouseY = e.clientY;
        }
    })
}())