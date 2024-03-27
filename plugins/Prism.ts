import { Plugin } from "vite";

interface PrismOptions {
  languages?: string[];
  plugins?: string[];
}

export default (_options?: PrismOptions): Plugin => {
  const options: Required<PrismOptions> = {
    languages: _options?.languages || [],
    plugins: _options?.plugins || []
  };
  return {
    name: "prism-js",
    resolveId(id) {
      if (id === "virtual:prismjs") {
        return id;
      }
    },
    load(id) {
      if (id === "virtual:prismjs") {
        return (
          `import Prism from "prismjs";
                        export default Prism;` +
          options.languages
            .map(v => `import "prismjs/components/prism-${v}";`)
            .join("") +
          options.plugins
            .map(v => `import "prismjs/plugins/${v}/prism-${v}";`)
            .join("")
        );
      }
    }
  };
};
