function createTexture(glContext, width, height)
{
    const texture = glContext.createTexture();
    glContext.bindTexture(glContext.TEXTURE_2D, texture);

    const level = 0;
    const internalFormat = glContext.RGBA;
    const border = 0;
    const srcFormat = glContext.RGBA;
    const srcType = glContext.UNSIGNED_BYTE;
    const data = null;

    glContext.texImage2D(
        glContext.TEXTURE_2D, 
        level, 
        internalFormat,
        width, 
        height, 
        border, 
        srcFormat, 
        srcType,
        data);

    glContext.texParameteri(glContext.TEXTURE_2D, glContext.TEXTURE_MIN_FILTER, glContext.LINEAR);
    glContext.texParameteri(glContext.TEXTURE_2D, glContext.TEXTURE_WRAP_S, glContext.CLAMP_TO_EDGE);
    glContext.texParameteri(glContext.TEXTURE_2D, glContext.TEXTURE_WRAP_T, glContext.CLAMP_TO_EDGE);

    return texture;
}

function loadTexture(glContext, texturePath)
{
    const texture = glContext.createTexture();
    glContext.bindTexture(glContext.TEXTURE_2D, texture);

    const level = 0;
    const internalFormat = glContext.RGBA;
    const width = 1;
    const height = 1;
    const border = 0;
    const srcFormat = glContext.RGBA;
    const srcType = glContext.UNSIGNED_BYTE;
    const data = new Uint8Array([50, 50, 50, 255]);
    glContext.texImage2D(
        glContext.TEXTURE_2D, 
        level, 
        internalFormat,
        width, 
        height, 
        border, 
        srcFormat, 
        srcType,
        data);

    const image = new Image();
    image.src = texturePath;
    image.onload = function() {
        console.log(image.src)
        console.log(" ")
        glContext.bindTexture(glContext.TEXTURE_2D, texture);
        glContext.texImage2D(glContext.TEXTURE_2D, level, internalFormat, srcFormat, srcType, image);
    };

    glContext.texParameteri(glContext.TEXTURE_2D, glContext.TEXTURE_MIN_FILTER, glContext.LINEAR);
    glContext.texParameteri(glContext.TEXTURE_2D, glContext.TEXTURE_WRAP_T, glContext.MIRRORED_REPEAT);
    glContext.texParameteri(glContext.TEXTURE_2D, glContext.TEXTURE_WRAP_T, glContext.MIRRORED_REPEAT);

    return texture;
}