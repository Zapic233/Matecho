/**
 * ExSearch Insight Core
 * https://github.com/AlanDecode/Typecho-Plugin-ExSearch/blob/41505eee62c70a37d0d234057e522cf9b2de4d33/assets/ExSearch.js
 *
 * Modified for TypeScript
 *
 * MIT License
 *
 * Copyright (c) 2019 AlanDecode
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
 *
 */

export interface IExSearchInnerData {
  name: string;
  permalink: string;
  slug: string;
}

export interface IExSearchData {
  pages: {
    date: string;
    path: string;
    text: string;
    title: string;
  }[];
  posts: {
    categories: IExSearchInnerData[];
    date: string;
    path: string;
    title: string;
    text: string;
    tags: IExSearchInnerData[];
  }[];
}

export function parseKeywords(keywords: string) {
  return keywords
    .split(" ")
    .filter(function (keyword) {
      return !!keyword;
    })
    .map(function (keyword) {
      return keyword.toUpperCase();
    });
}

function filter(
  keywords: string,
  obj: Record<string, unknown>,
  fields: string[]
) {
  const keywordArray = parseKeywords(keywords);
  const containKeywords = keywordArray.filter(function (keyword) {
    const containFields = fields.filter(function (field) {
      const t = obj[field];
      if (!Object.prototype.hasOwnProperty.call(obj, field)) return false;
      if (typeof t == "string" && t.toUpperCase().indexOf(keyword) > -1)
        return true;
    });
    if (containFields.length > 0) return true;
    return false;
  });
  return containKeywords.length === keywordArray.length;
}

function filterFactory(keywords: string) {
  return {
    POST: (obj: IExSearchData["posts"][number]) => {
      return filter(keywords, obj, ["title", "text"]);
    },
    PAGE: (obj: IExSearchData["pages"][number]) => {
      return filter(keywords, obj, ["title", "text"]);
    },
    CATEGORY: (obj: IExSearchInnerData) => {
      return filter(keywords, obj as never, ["name", "slug"]);
    },
    TAG: (obj: IExSearchInnerData) => {
      return filter(keywords, obj as never, ["name", "slug"]);
    }
  };
}

function weight<T extends Record<string, unknown>>(
  keywords: string,
  obj: T,
  fields: string[],
  weights: number[]
) {
  let value = 0;
  parseKeywords(keywords).forEach(function (keyword) {
    const pattern = new RegExp(keyword, "img"); // Global, Multi-line, Case-insensitive
    fields.forEach(function (field, index) {
      if (Object.prototype.hasOwnProperty.call(obj, field)) {
        const t = obj[field];
        if (typeof t === "string") {
          const matches = t.match(pattern);
          value += matches ? matches.length * weights[index] : 0;
        }
      }
    });
  });
  return value;
}

function weightFactory(keywords: string) {
  return {
    POST: (obj: IExSearchData["posts"][number]) => {
      return weight(keywords, obj, ["title", "text"], [3, 1]);
    },
    PAGE: (obj: IExSearchData["pages"][number]) => {
      return weight(keywords, obj, ["title", "text"], [3, 1]);
    },
    CATEGORY: (obj: IExSearchInnerData) => {
      return weight(keywords, obj as never, ["name", "slug"], [1, 1]);
    },
    TAG: (obj: IExSearchInnerData) => {
      return weight(keywords, obj as never, ["name", "slug"], [1, 1]);
    }
  };
}

function extractToSet(json: IExSearchData, key: string) {
  const values: Record<string, IExSearchInnerData> = {};
  const entries = json.posts;
  entries.forEach(function (entry) {
    if (key in entry) {
      entry[key as "tags"].forEach(function (value) {
        values[value.name] = value;
      });
    }
  });
  const result = [];
  for (const key in values) {
    result.push(values[key]);
  }
  return result;
}

export function search(json: IExSearchData, keywords: string) {
  const WEIGHTS = weightFactory(keywords);
  const FILTERS = filterFactory(keywords);
  const posts = json.posts;
  const pages = json.pages;
  const tags = extractToSet(json, "tags");
  const categories = extractToSet(json, "categories");
  return {
    posts: posts
      .filter(FILTERS.POST)
      .sort(function (a, b) {
        return WEIGHTS.POST(b) - WEIGHTS.POST(a);
      })
      .slice(0, 5),
    pages: pages
      .filter(FILTERS.PAGE)
      .sort(function (a, b) {
        return WEIGHTS.PAGE(b) - WEIGHTS.PAGE(a);
      })
      .slice(0, 5),
    categories: categories
      .filter(FILTERS.CATEGORY)
      .sort(function (a, b) {
        return WEIGHTS.CATEGORY(b) - WEIGHTS.CATEGORY(a);
      })
      .slice(0, 5),
    tags: tags
      .filter(FILTERS.TAG)
      .sort(function (a, b) {
        return WEIGHTS.TAG(b) - WEIGHTS.TAG(a);
      })
      .slice(0, 5)
  };
}
