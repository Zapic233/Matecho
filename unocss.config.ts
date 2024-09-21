import { defineConfig } from "unocss";

export default defineConfig({
  theme: {
    breakpoints: {
      xs: "0px",
      sm: "600px",
      md: "840px",
      lg: "1080px",
      xl: "1440px",
      xxl: "1920px"
    }
  },
  rules: [
    [
      /^text-m-(.*)$/,
      ([, c]) => {
        return { color: `rgb(var(--mdui-color-${c}))` };
      }
    ]
  ]
});