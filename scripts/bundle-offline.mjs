import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
const dist = resolve("dist");
let html = readFileSync(resolve(dist, "index.html"), "utf8");
html = html.replace(/<script\b[^>]*src="([^"]+)"[^>]*><\/script>/g, (_match, source) => {
  const js = readFileSync(resolve(dist, source), "utf8").replaceAll("</script", "<\\/script");
  return '<script type="module">' + js + "</script>";
});
html = html.replace(/<link\b[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g, (_match, source) => {
  const css = readFileSync(resolve(dist, source), "utf8");
  return "<style>" + css + "</style>";
});
if (/<(?:script|link)\b[^>]*(?:src|href)="\.\/assets\//.test(html)) throw new Error("The offline artifact still contains an external build asset.");
html = html.replace("<body>", '<body data-demo-version="0.4.0">');
const target = resolve(process.argv[2] || "../../outputs/Duanyan-Academy-Demo.html");
mkdirSync(dirname(target), { recursive: true });
writeFileSync(target, html, "utf8");
console.log("Offline demo saved: " + target);
