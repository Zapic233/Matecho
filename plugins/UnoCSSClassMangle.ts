/**
 * UnoCSS Compile Class
 * Modify for match all "class" attributes without leading string
 *
 * https://github.com/unocss/unocss/blob/4d5269540691b4cf74cd9314b90b706accd6681d/packages/transformer-compile-class/src/index.ts
 *
 * MIT License
 *
 * Copyright (c) 2021-PRESENT Anthony Fu <https://github.com/antfu>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import type { SourceCodeTransformer } from "@unocss/core";
import { expandVariantGroup } from "@unocss/core";

export interface CompileClassOptions {
  /**
   * Prefix for compile class name
   * @default 'uno-'
   */
  classPrefix?: string;

  /**
   * Hash function
   */
  hashFn?: (str: string) => string;

  /**
   * Left unknown classes inside the string
   *
   * @default true
   */
  keepUnknown?: boolean;

  /**
   * The layer name of generated rules
   */
  layer?: string;

  /**
   * Skip file that may cause problem
   */
  skip?: [];
}

export default function transformerCompileClass(
  options: CompileClassOptions = {}
): SourceCodeTransformer {
  const {
    classPrefix = "uno-",
    hashFn = hash,
    keepUnknown = true,
    skip = []
  } = options;
  const regex = new RegExp(`class=(["'\`])([^\\1]+?)\\1`, "g");

  return {
    name: "compile-class",
    enforce: "pre",
    async transform(s, _, { uno, tokens }) {
      // Do not handle index.html file processed by vite
      if (_ === "index.html") {
        return;
      }
      if (skip.some(v => _.endsWith(v))) {
        return;
      }

      const matches = [...s.original.matchAll(regex)];
      if (!matches.length) return;
      for (const match of matches) {
        let body = expandVariantGroup(match[2].trim());
        const start = match.index;
        const replacements: string[] = [];
        if (keepUnknown) {
          const result = await Promise.all(
            body
              .split(/\s+/)
              .filter(Boolean)
              .map(async i => [i, !!(await uno.parseToken(i))] as const)
          );
          const known = result.filter(([, matched]) => matched).map(([i]) => i);
          const unknown = result
            .filter(([, matched]) => !matched)
            .map(([i]) => i);
          replacements.push(...unknown);
          body = known.sort().join(" ");
        }
        if (body) {
          const hash = hashFn(body);
          const className = `${classPrefix}${hash}`;
          replacements.unshift(className);
          if (options.layer)
            uno.config.shortcuts.push([
              className,
              body,
              { layer: options.layer }
            ]);
          else uno.config.shortcuts.push([className, body]);
          tokens.add(className);
        }
        s.overwrite(
          start + 7,
          start + match[0].length - 1,
          replacements.join(" ")
        );
      }
    }
  };
}

export function hash(str: string) {
  let i: number;
  let l: number;
  let hval = 0x811c9dc5;

  for (i = 0, l = str.length; i < l; i++) {
    hval ^= str.charCodeAt(i);
    hval +=
      (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24);
  }
  return `00000${(hval >>> 0).toString(36)}`.slice(-6);
}
