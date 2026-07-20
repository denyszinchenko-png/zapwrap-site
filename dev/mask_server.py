#!/usr/bin/env python3
"""Локальный сервер для пересборки масок конфигуратора (dev/rebuild-masks.js).

Зачем отдельный сервер: пиксельный код живёт в браузере (canvas), а результат
надо положить на диск. Обычная статика этого не умеет, нужен POST /save.

Запуск:
    python3 dev/mask_server.py            # порт 8123
    python3 dev/mask_server.py 8200       # другой порт

Шаблоны базы (Год_Марка_Модель_body_mask.png) лежат в соседнем проекте
zapwrap-app. Путь берётся из переменной окружения, иначе ищется рядом:
    ZAPWRAP_TEMPLATES=/путь/к/car-templates python3 dev/mask_server.py

Что отдаёт:
    /            -> корень репозитория сайта (index.html, assets/, ...)
    /tpl/        -> каталог шаблонов базы (см. выше)
    POST /save?path=assets/cars/<slug>-mask4.webp -> записывает тело в файл

Листинги каталогов включены намеренно: rebuild-masks.js строит карту машин
из имён файлов в /assets/cars/ и /tpl/, carmap.json больше не нужен.

Запись разрешена ТОЛЬКО внутрь assets/cars/ этого репозитория и только в
файлы *.webp: сервер запускается на машине владельца, но принимать от
браузера произвольный путь всё равно нельзя.
"""

import os
import posixpath
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse, parse_qs, unquote

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SAVE_ROOT = os.path.join(REPO, "assets", "cars")

# Каталог с шаблонами базы. Абсолютный путь намеренно не зашит: этот файл
# отдаётся GitHub Pages как часть сайта, и структура домашнего каталога
# наружу не нужна. Порядок: переменная окружения -> соседний zapwrap-app.
TEMPLATES = os.environ.get("ZAPWRAP_TEMPLATES") or os.path.join(
    os.path.dirname(os.path.dirname(REPO)), "zapwrap-app", "assets", "car-templates"
)


class MaskHandler(SimpleHTTPRequestHandler):
    def translate_path(self, path):
        clean = posixpath.normpath(unquote(urlparse(path).path))
        if clean == "/tpl" or clean.startswith("/tpl/"):
            rest = clean[len("/tpl"):].lstrip("/")
            return os.path.join(TEMPLATES, *[p for p in rest.split("/") if p not in ("", ".", "..")])
        return SimpleHTTPRequestHandler.translate_path(self, path)

    def do_POST(self):
        parsed = urlparse(self.path)
        if parsed.path != "/save":
            return self.send_error(404, "only POST /save")

        rel = (parse_qs(parsed.query).get("path") or [""])[0]
        target = os.path.abspath(os.path.join(REPO, rel))

        # Путь приходит из браузера, поэтому проверяем его, а не доверяем.
        if os.path.commonpath([target, SAVE_ROOT]) != SAVE_ROOT:
            return self.send_error(403, "writes are limited to assets/cars/")
        if not target.endswith(".webp"):
            return self.send_error(403, "only .webp may be written")

        length = int(self.headers.get("Content-Length") or 0)
        if not length:
            return self.send_error(400, "empty body")
        blob = self.rfile.read(length)

        os.makedirs(os.path.dirname(target), exist_ok=True)
        with open(target, "wb") as fh:
            fh.write(blob)

        self.send_response(200)
        self.send_header("Content-Type", "text/plain; charset=utf-8")
        self.send_header("Content-Length", str(len(blob)))
        self.end_headers()
        self.wfile.write(f"saved {len(blob)} bytes\n".encode())
        sys.stderr.write(f"saved {rel} ({len(blob)} bytes)\n")

    def end_headers(self):
        # Маски перечитываются в цикле, кэш браузера тут только мешает.
        self.send_header("Cache-Control", "no-store")
        SimpleHTTPRequestHandler.end_headers(self)

    def log_message(self, fmt, *args):
        if "GET" not in fmt % args:
            SimpleHTTPRequestHandler.log_message(self, fmt, *args)


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8123
    os.chdir(REPO)
    if not os.path.isdir(TEMPLATES):
        sys.stderr.write(f"ВНИМАНИЕ: шаблоны базы не найдены: {TEMPLATES}\n"
                         f"buildAll отработает на фолбэке со старой маской.\n")
    srv = ThreadingHTTPServer(("127.0.0.1", port), MaskHandler)
    print(f"репозиторий: {REPO}")
    print(f"шаблоны:     {TEMPLATES} -> /tpl/")
    print(f"запись:      {SAVE_ROOT} (только *.webp)")
    print(f"открой:      http://127.0.0.1:{port}")
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        print("\nостановлен")


if __name__ == "__main__":
    main()
