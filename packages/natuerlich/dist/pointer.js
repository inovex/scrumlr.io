export {};
/*
export class SliderMaterial extends MeshBasicMaterial {
  private shader!: Shader;

  constructor(parameters: MeshBasicMaterialParameters & { length?: number } | undefined) {
    super(parameters);

    this.onBeforeCompile = (shader) => {
      this.shader = shader;
      shader.uniforms.fontPage = { value: font.page };
      shader.uniforms.pageSize = { value: [font.pageWidth, font.pageHeight] };
      shader.uniforms.distanceRange = { value: font.distanceRange };
      shader.uniforms.v_weight = { value: 0 };
      shader.vertexShader =
        `attribute vec4 instanceUVOffset;\nvarying vec2 fontUv;\n` + shader.vertexShader;
      shader.vertexShader = shader.vertexShader.replace(
        "#include <uv_vertex>",
        `#include <uv_vertex>
              fontUv = instanceUVOffset.xy + uv * instanceUVOffset.zw;`,
      );
      shader.fragmentShader =
        `uniform sampler2D fontPage;
              uniform vec2 pageSize;
              uniform int distanceRange;
              uniform float v_weight;
          varying vec2 fontUv;
          float median(float r, float g, float b) {
              return max(min(r, g), min(max(r, g), b));
          }
          float getDistance() {
              vec3 msdf = texture(fontPage, fontUv).rgb;
              return median(msdf.r, msdf.g, msdf.b);
          }
          ` + shader.fragmentShader;
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <map_fragment>",
        `#include <map_fragment>
              vec2 dxdy = fwidth(fontUv) * pageSize;
              float dist = getDistance() + min(float(v_weight), 0.5 - 1.0 / float(distanceRange)) - 0.5;
              float multiplier = clamp(dist * float(distanceRange) / length(dxdy) + 0.5, 0.0, 1.0);
              if(multiplier <= 0.35) {
                  discard;
              }
              diffuseColor.a *= (multiplier - 0.35) / 0.65;
              `,
      );
    };
  }

  updateFont(font: Font<Texture>): void {
    if (this.font === font) {
      return;
    }
    this.font = font;

    this.shader.uniforms.fontPage.value = font.page;
    this.shader.uniforms.pageSize.value = [font.pageWidth, font.pageHeight];
    this.shader.uniforms.distanceRange.value = font.distanceRange;
  
}
*/
