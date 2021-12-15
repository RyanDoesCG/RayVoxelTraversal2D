var fragSource = `
    precision mediump float;

    varying vec2 out_uvs;

    uniform sampler2D perlinNoiseSampler;
    uniform sampler2D whiteNoiseSampler;
    uniform sampler2D blueNoiseSampler;

    uniform float MouseU;
    uniform float MouseV;

    uniform float Width;
    uniform float Height;

    uniform float Time;
    uniform float Aspect;

    uniform vec2 A;
    uniform vec2 B;

    #define GRID_SIZE 24.0

    float distancePointToLine(vec2 a, vec2 b, vec2 p)
    {
        // if the length of the line segment is 0, both
        // points share the same coordinates and this 
        // becomes a point to point distance
        vec2 ab = b - a;
        float length = dot(ab, ab);
        if (length == 0.0) return distance(p, a);

        //
        float t = max(0.0, min(1.0, dot(p - a, ab) / length));
        vec2  pr = a + t * (ab);
        return distance(p, pr);
    }

    float intersectRayPlane(vec3 rayPosition, vec3 rayDirection, vec3 PlanePosition, vec3 PlaneNormal)
    {
        float d = dot (PlaneNormal, rayDirection);
        if (d < 0.0)
        {
            float t = dot (PlanePosition - rayPosition, PlaneNormal) / d;
            if (t > 0.0)
                return t;
        }
        return 100000.0;
    }

    void main(void) 
    {
        vec2 uvs = vec2(out_uvs.x, out_uvs.y);
        vec2 gridUVs = uvs * GRID_SIZE;
        ivec2 gridIndex = ivec2(floor(uvs * GRID_SIZE));
        // DRAW POINT A
        ivec2 GridA = ivec2(floor(A * (GRID_SIZE)));
        if (GridA == gridIndex) gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
        // DRAW POINT B
        ivec2 GridB = ivec2(floor(B * (GRID_SIZE)));
        if (GridB == gridIndex) gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);
        vec2 RayOrigin = A * GRID_SIZE;
        vec2 RayDirection = normalize((B * GRID_SIZE) - RayOrigin);
        // DRAW GRID
        float line = 0.02;
        if (abs(gridUVs.x - float(gridIndex.x)) < line || abs(gridUVs.y - float(gridIndex.y)) < line)
            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);

        //////////////////////////////////////////////////////////
        // INITIALIZATION PHASE
        //////////////////////////////////////////////////////////
        ivec2 StepDirection = ivec2(sign(RayDirection));
        float NextXBoundary = float(GridA.x);
        if (StepDirection.x > 0) NextXBoundary += 1.0;
        float tMaxX = intersectRayPlane(
            vec3(RayOrigin, 0.0),
            vec3(RayDirection, 0.0),
            vec3(NextXBoundary, 0.0, 0.0),
            vec3(-StepDirection.x, 0.0, 0.0));
    
        float NextYBoundary = float(GridA.y);
        if (StepDirection.y > 0) NextYBoundary += 1.0;
        float tMaxY = intersectRayPlane(
                vec3(RayOrigin, 0.0),
                vec3(RayDirection, 0.0),
                vec3(0.0, NextYBoundary, 0.0),
                vec3(0.0, -StepDirection.y, 0.0));

        // deltas
        float tDeltaX = 100000.0;
        if (RayDirection.x > 0.0)
            tDeltaX = intersectRayPlane(
                vec3(RayOrigin, 0.0),
                vec3(RayDirection, 0.0),
                vec3(A.x * GRID_SIZE + 1.0, 0.0, 0.0),
                vec3(-1.0, 0.0, 0.0));

        if (RayDirection.x < 0.0)
            tDeltaX = intersectRayPlane(
                vec3(RayOrigin, 0.0),
                vec3(RayDirection, 0.0),
                vec3(A.x * GRID_SIZE - 1.0, 0.0, 0.0),
                vec3(1.0, 0.0, 0.0));

        float tDeltaY = 100000.0;
        if (RayDirection.y > 0.0)
            tDeltaY = intersectRayPlane(
                vec3(RayOrigin, 0.0),
                vec3(RayDirection, 0.0),
                vec3(0.0, A.y * GRID_SIZE + 1.0, 0.0),
                vec3(0.0, -1.0, 0.0));

        if (RayDirection.y < 0.0)
            tDeltaY = intersectRayPlane(
                vec3(RayOrigin, 0.0),
                vec3(RayDirection, 0.0),
                vec3(0.0, A.y * GRID_SIZE - 1.0, 0.0),
                vec3(0.0, 1.0, 0.0));

        vec2 maxX = RayOrigin + RayDirection * tMaxX;
        if (distance(gridUVs, maxX) < 0.1)
            gl_FragColor = vec4(1.0, 0.0, 1.0, 1.0);

        vec2 maxY = RayOrigin + RayDirection * tMaxY;
        if (distance(gridUVs, maxY) < 0.1)
            gl_FragColor = vec4(0.0, 1.0, 1.0, 1.0);

        vec2 deltaX = RayOrigin + RayDirection * tDeltaX;
        if (distance(gridUVs, deltaX) < 0.1)
            gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);

        vec2 deltaY = RayOrigin + RayDirection * tDeltaY;
        if (distance(gridUVs, deltaY) < 0.1)
            gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);

        //////////////////////////////////////////////////////////
        // ITERATION PHASE
        //////////////////////////////////////////////////////////
        ivec2 Grid = GridA;
        for (int i = 0; i < 128; ++i)
        {
            if (tMaxX < tMaxY)
            {
                Grid.x += StepDirection.x;
                tMaxX += tDeltaX;
                if (Grid == gridIndex) if (gl_FragColor.w == 0.0) gl_FragColor = vec4(0.5, 0.5, 0.5, 1.0);
            }
            else
            if (tMaxY < tMaxX)
            {
                Grid.y += StepDirection.y;
                tMaxY += tDeltaY;
                if (Grid == gridIndex) if (gl_FragColor.w == 0.0) gl_FragColor = vec4(0.5, 0.5, 0.5, 1.0);
            }

            if (Grid == GridB)
            {
                break;
            }

            vec2 maxX = RayOrigin + RayDirection * tMaxX;
            if (distance(gridUVs, maxX) < 0.1)
                gl_FragColor = vec4(1.0, 0.0, 1.0, 1.0);
            vec2 maxY = RayOrigin + RayDirection * tMaxY;
            if (distance(gridUVs, maxY) < 0.1)
                gl_FragColor = vec4(0.0, 1.0, 1.0, 1.0);
        }

        // DRAW RAY
        float thickness = 0.03;
        float dist = distancePointToLine(RayOrigin + RayDirection * -1000.0, RayOrigin + RayDirection * 1000.0, gridUVs);
        if (dist < thickness) 
            gl_FragColor = vec4(mix(gl_FragColor.xyz, vec3(1.0), clamp(1.0 - (dist / thickness), 0.0, 1.0)), 1.0);
    }
    `;