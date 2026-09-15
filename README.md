# InstancedMesh With Shader Material

Shader material enables programming in GLSL within three.js. In this example, we create a unique lighting effect that simulates a "headlamp"- whithout the use of lighting in the scene.




No matter which direction you face, the lit side of the shape will always face the camera. This simulates having a "headlamp", without needing manual lighting calculation and position. The process works by passing the `cameraPosition` as a uniform to our Fragment Shader, and calculating the dot product between our camera direction and the face normals of the shape- normals more aligned with our camera will have a higher value, and those perpendicular will be 0.

Inspiration from [Visionary 3D YouTube channel](https://www.youtube.com/@visionary_3_d).