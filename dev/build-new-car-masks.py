#!/usr/bin/env python3
"""Маски конфигуратора для НОВОЙ машины (когда маски сайта ещё нет).

Зачем отдельный скрипт: dev/rebuild-masks.js пересобирает УЖЕ существующую
маску сайта (базой служит прошлое поколение). У новой машины такой базы нет,
и прогон с useBody=true берёт базой студийный body_mask из zapwrap-app. Он
слишком грубый: колёса вырезаны кругами шире самого колеса, хром по низу
окон и ручки вырезаны целиком. Под mix-blend-mode: multiply это дало белую
кайму вдоль крыши, стоек, порога и белые ореолы вокруг арок - машина читалась
как наклейка (жалоба владельца 2026-07-29, поколение -mask5).

Логика здесь обратная и потому устойчивая:
  база покраски = ТОЧНЫЙ силуэт фото (alpha), значит плёнка всегда доходит
  до кромки кузова и белой каймы быть не может;
  из него вычитаются только те дырки body_mask, которые ПОДТВЕРЖДАЕТ фото.

Каждая дырка проверяется по пикселям фото под ней:
  яркая и нейтральная (хром по низу окна, ручка, зазор) -> это кузов, красим;
  тёмная или цветная (стекло, резина, фара, фонарь)     -> вырезаем.
Вырезы дополнительно эродируются, чтобы плёнка подходила вплотную к стеклу и
арке, а колёсный круг ужимается сильнее с добором реальной тёмной резины.

Запуск (venv с numpy/scipy/pillow):
    /tmp/maskvenv/bin/python dev/build-new-car-masks.py <slug> [<slug> ...]
    ... --suffix -mask6 --preview /tmp/preview

Источник шаблонов: ZAPWRAP_TEMPLATES или ~/Desktop/cars.
"""

import os
import sys

import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

W, H = 1600, 800
REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CARS = os.path.join(REPO, "assets", "cars")
TEMPLATES = os.environ.get("ZAPWRAP_TEMPLATES") or os.path.expanduser("~/Desktop/cars")

# Слаг -> префикс файла шаблона (Год_Марка_Модель).
TEMPLATE_PREFIX = {
    "honda-accord": "2020_Honda_Accord",
    "dodge-challenger": "2020_Dodge_Challenger",
    "porsche-macan": "2024_Porsche_Macan",
    "audi-q5": "2024_Audi_Q5",
    "audi-s5": "2023_Audi_S5",
    "hyundai-sonata": "2023_Hyundai_Sonata",
    "lexus-rx": "2024_Lexus_RX",
    "mercedes-e-class": "2024_Mercedes_E_Class",
    "kia-k5": "2023_Kia_K5",
    "ram-promaster": "2024_Ram_ProMaster",
    "mercedes-metris": "2023_Mercedes_Metris",
    "toyota-tundra": "2024_Toyota_Tundra",
    "ford-transit-connect": "2023_Ford_Transit_Connect",
    "bmw-330i": "2024_BMW_330I",
}

# Дырка остаётся вырезом, если фото под ней темнее LIGHT_LUM или цветное.
# Хром по низу окон и ручки на студийном фото белого кузова дают 200+.
LIGHT_LUM = 190
# Ниже поясной линии порог мягче: серебро молдингов красится, чёрный пластик нет.
LOWER_LUM = 130
COLOR_SAT = 40
# Резина/чёрный пластик: добираются внутри колёсного круга и по всему кузову.
TIRE_LUM = 115
DEEP_DARK = 70
# Мелкие дырки (зазоры панелей, эмблемы) кузов, а не вырез.
MIN_HOLE = 900


def _bin(img: np.ndarray, r: int, grow: bool) -> np.ndarray:
    """Эрозия/дилатация через PIL: быстрее ndimage на маске такого размера."""
    im = Image.fromarray((img * 255).astype("uint8"))
    f = ImageFilter.MaxFilter if grow else ImageFilter.MinFilter
    return np.array(im.filter(f(2 * r + 1))) > 127


def erode(b, r):
    return _bin(b, r, False) if r > 0 else b


def dilate(b, r):
    return _bin(b, r, True) if r > 0 else b


def resolve_prefix(slug):
    """Префикс шаблона: явная карта, иначе поиск по каталогу шаблонов базы.
    Правило имени такое же, как в rebuild-masks.js: год отбрасывается, регистр
    вниз, подчёркивания в дефисы (2020_Honda_Accord -> honda-accord)."""
    if slug in TEMPLATE_PREFIX:
        return TEMPLATE_PREFIX[slug]
    import glob
    import re
    for t in glob.glob(os.path.join(TEMPLATES, "*_body_mask.png")):
        base = os.path.basename(t).replace("_body_mask.png", "")
        key = re.sub(r"^\d{4}_", "", base).lower().replace("_", "-")
        # ключ реестра бывает короче имени файла (911 <- porsche-911)
        if key == slug or key.endswith("-" + slug):
            return base
    raise SystemExit(f"{slug}: шаблон body_mask не найден в {TEMPLATES}")


def load_sources(slug):
    photo = Image.open(os.path.join(CARS, f"{slug}.webp")).convert("RGBA")
    if photo.size != (W, H):
        photo = photo.resize((W, H), Image.LANCZOS)
    prefix = resolve_prefix(slug)
    body = Image.open(os.path.join(TEMPLATES, f"{prefix}_body_mask.png")).convert("L")
    body = body.resize((W, H), Image.LANCZOS)
    return np.array(photo), np.array(body)


def build(slug, verbose=True, prev_suffix=None):
    ph, body_img = load_sources(slug)
    prev_painted = None
    if prev_suffix:
        prev_path = os.path.join(CARS, f"{slug}{prev_suffix}.webp")
        if os.path.exists(prev_path):
            prev = Image.open(prev_path).convert("RGBA")
            if prev.size != (W, H):
                prev = prev.resize((W, H), Image.LANCZOS)
            prev_painted = np.array(prev)[:, :, 3] > 40
    rgb = ph[:, :, :3].astype(float)
    alpha = ph[:, :, 3]

    lum = 0.299 * rgb[:, :, 0] + 0.587 * rgb[:, :, 1] + 0.114 * rgb[:, :, 2]
    sat = rgb.max(axis=2) - rgb.min(axis=2)

    # Силуэт из фото - единственная надёжная граница кузова.
    sil = alpha > 40
    sil = ndimage.binary_fill_holes(sil)

    # Дырки берутся из ДВУХ источников. Студийный шаблон бывает битый: у
    # Bentley, BMW, Cadillac, Camaro и Silverado внутри машины сплошной чёрный
    # (это же зафиксировано в шапке rebuild-masks.js), дырок нет вообще, и
    # стёкла уезжают под покраску - на проверке M4 окна стали красными.
    # Поэтому вторым источником идёт действующая маска сайта: её вырезы
    # (стекло, колёса, фонари) проходят ту же проверку по фото, а её дефекты
    # (белые ручки, волоски по стыкам) при этой проверке закрашиваются.
    body = body_img > 128
    inside = float(body[sil].mean()) if sil.any() else 0.0
    holes = np.zeros_like(sil)
    if 0.25 < inside < 0.95:
        holes |= sil & ~body
    if prev_painted is not None:
        holes |= sil & ~prev_painted

    ys, xs = np.where(sil)
    y0, y1, x0, x1 = ys.min(), ys.max(), xs.min(), xs.max()
    car_h, car_w = y1 - y0, x1 - x0

    # Порог «это не кузов» зависит от высоты. Выше поясной линии живёт стекло,
    # оно тусклое, и порог должен быть строгим. Ниже идёт серебристый молдинг
    # порога и накладки бампера (яркость 150-180): под строгим порогом они
    # вырезались и давали белую полосу вдоль порога у Macan, Sonata, Lexus RX,
    # E-Class, Tundra и BMW. Их надо красить, а по-настоящему тёмный пластик
    # и решётки всё равно отсекаются нижним порогом.
    yy_idx = np.arange(H)[:, None]
    belt = y0 + 0.55 * car_h
    lum_thr = np.where(yy_idx < belt, LIGHT_LUM, LOWER_LUM) * np.ones((1, W))

    lab, n = ndimage.label(holes)
    cut = np.zeros_like(sil)     # стёкла и прочее: разбираются по пикселям
    lights = np.zeros_like(sil)  # фары/фонари: вырезаются целиком
    wheels = np.zeros_like(sil)
    kept_mask = np.zeros_like(sil)  # все дырки, признанные настоящими
    kept = dropped = 0

    # Эталон дома (honda-civic и остальные 65): не закрашены ТОЛЬКО стекло,
    # колёса и фонари. Хром остаётся максимум волосяной линией, широких белых
    # полос нет. Поэтому дырка целиком вырезается лишь у колёс и фонарей, а у
    # стекла разбирается по пикселям: тёмное нутро режем, светлый хром красим.
    for i in range(1, n + 1):
        comp = lab == i
        area = int(comp.sum())
        if area < MIN_HOLE:
            dropped += 1
            continue  # зазор/ручка/эмблема - это кузов

        cys, cxs = np.where(comp)
        big = area > 0.02 * car_w * car_h
        upper = (cys.mean() - y0) / max(car_h, 1) < 0.62

        med_lum = float(np.median(lum[comp]))
        med_sat = float(np.median(sat[comp]))
        # Проверка на яркость идёт ПОСЛЕ геометрии: светлое стекло старых фото
        # (Civic) иначе отсеивалось здесь как «сплошь светлый хром» и красилось.
        glassy = big and upper and prev_painted is not None
        if not glassy and med_lum >= LIGHT_LUM and med_sat <= COLOR_SAT:
            dropped += 1
            continue  # сплошь светлый хром/панель - красим

        # Фара/фонарь: заметная доля насыщенных пикселей (красный рассеиватель,
        # янтарный поворотник). Внутри хромовый отражатель, красить его нельзя.
        is_light = (sat[comp] > 60).mean() > 0.03
        if is_light:
            lights |= comp
            kept_mask |= comp
            kept += 1
            continue

        # У старых фото стекло СВЕТЛОЕ (яркость 200+, как у honda-civic), и по
        # одной яркости от белого кузова его не отличить - на проверке окна
        # Civic закрасились. Различие геометрическое: стекло крупное и толстое,
        # а хром, ручки и волоски по стыкам тонкие. Толстое ядро крупной дырки
        # выше поясной линии режется целиком, тонкие отростки решаются по фото.
        core = np.zeros_like(sil)
        # Только для машин, у которых уже есть маска сайта (старые 65). У новых
        # стекло тёмное и решается по яркости, а геометрическое правило там
        # захватывало хром вокруг окон и делало из него белую полосу (Accord).
        if big and upper and prev_painted is not None:
            core = dilate(erode(comp, 5), 5) & comp
            cut |= core
        cut |= (comp & ~core) & ((lum < lum_thr) | (sat > COLOR_SAT))
        kept_mask |= comp
        kept += 1

    # Фонарь в шаблоне часто слит в одну дырку с хромовым бантом багажника или
    # надфарной планкой. Вырезать компонент целиком - это и есть белая полоса
    # над фонарём, поэтому разбираем так же по пикселям, но кромку самого
    # рассеивателя защищаем: всё в 3px от насыщенного цвета остаётся вырезом.
    if lights.any():
        lens = dilate(lights & (sat > 60), 3)
        cut |= lights & ((lum < LIGHT_LUM) | (sat > COLOR_SAT) | lens)

    # Стёкла: ужать на 1px, чтобы плёнка подходила вплотную к кромке.
    cut = erode(cut, 1)
    # Колёса ищутся ПО ФОТО, а не по дыркам шаблона. В шаблоне оба колеса и
    # тень порога слиты в один широкий компонент (bbox 907x235), тест «круглое»
    # не срабатывает, и светлый диск уходит под покраску - на монтаже это
    # розовые диски у Challenger, Sonata, Lexus RX, ProMaster, Transit Connect.
    # x-гистограмма тёмных пикселей устойчива к слиянию шины с тенью порога.
    band = np.zeros_like(sil)
    band[int(y0 + 0.45 * car_h):y1 + 1, x0:x1 + 1] = True
    dark_lo = sil & band & (lum < 95)
    xhist = dark_lo.sum(axis=0)
    thr = xhist.max() * 0.38
    on = xhist >= thr
    runs, start = [], None
    for x in range(x0, x1 + 2):
        hot = on[x] if x <= x1 else False
        if hot and start is None:
            start = x
        elif not hot and start is not None:
            runs.append((start, x))
            start = None
    for a, b in runs:
        rw = b - a
        if not (0.06 * car_w < rw < 0.35 * car_w):
            continue
        cols = dark_lo[:, a:b]
        rows = np.where(cols.any(axis=1))[0]
        if not len(rows):
            continue
        mn, mx = rows.min(), rows.max()
        cy_w, cx_w = (mn + mx) / 2.0, (a + b) / 2.0
        r = min(max((mx - mn) / 2.0, rw / 2.0), 0.16 * car_w)
        yy, xx = np.ogrid[:H, :W]
        disc = (yy - cy_w) ** 2 + (xx - cx_w) ** 2 <= r * r
        # Круг заведомо шире колеса (в тёмное попадает и тень под машиной), и
        # если резать его целиком, съедается крыло - это белые полумесяцы вокруг
        # арок. Поэтому внутри круга режется только реально тёмное: шина и обод.
        # Порог 200 захватывал затенённую кромку крыла у самой арки: она уходила
        # в вырез и давала белое кольцо вокруг колеса (проверено контрольным
        # рендером «закрасить всё» - там кольца нет). Режется только реально
        # тёмная резина, а диск добирается заливкой её замкнутого кольца.
        dc = disc & sil & (lum < TIRE_LUM)
        wheels |= ndimage.binary_fill_holes(dc) & disc
    cut |= wheels

    # Резина и чёрный пластик где угодно по кузову.
    cut |= sil & (lum < DEEP_DARK)

    # Внутри фары хромовый отражатель яркий и попиксельное правило красит его
    # пятнами - лампа получается «леопардовой». Поэтому мелкие закрашенные
    # островки внутри вырезов возвращаются в вырез, а крупные хром-планки
    # (бант над фонарём, надфарная накладка) остаются закрашенными. Только
    # внутри фар: на всём кузове это правило съедало тонкий хром порога.
    painted_islands = lights & ~cut
    lab_i, n_i = ndimage.label(painted_islands)
    for idx in range(1, n_i + 1):
        comp = lab_i == idx
        if comp.sum() >= 1500:
            continue
        # Островок, касающийся кузова, - это хром на кромке лампы (окантовка
        # повторителя на крыле BMW), его надо красить. В вырез возвращается
        # только то, что заперто внутри лампы: сам отражатель.
        if (dilate(comp, 1) & sil & ~lights).any():
            continue
        cut[comp] = True

    # Обрывки выреза вдоль хрома читаются как белые штрихи по кузову: на тёмном
    # пикселе непрокрас незаметен, на светлом бьёт в глаза. Поэтому мелкие
    # фрагменты выреза вне колёс и фар возвращаются под покраску, а светлым
    # даётся запас побольше - именно они портили Sonata, BMW и бамперы.
    free_cut = cut & sil & ~wheels & ~lights
    lab_c, n_c = ndimage.label(free_cut)
    if n_c:
        objs = ndimage.find_objects(lab_c)
        for idx in range(1, n_c + 1):
            comp = lab_c[objs[idx - 1]] == idx
            area = int(comp.sum())
            if area >= 4000:
                continue
            bright = float(np.median(lum[objs[idx - 1]][comp])) >= 200
            if area < 1500 or bright:
                sub = cut[objs[idx - 1]]
                sub[comp] = False
                cut[objs[idx - 1]] = sub

    # Шаблон приходит в 1774px и после ресайза даёт лесенку по кромке выреза.
    # На крупном плане она читается как дешёвая обводка, поэтому края выреза
    # округляются размытием с порогом (морфология тут оставляет углы).
    smooth = Image.fromarray((cut * 255).astype("uint8")).filter(ImageFilter.GaussianBlur(1.2))
    cut = np.array(smooth) > 128

    paint = sil & ~cut

    # Чистка: одиночные крошки убрать, мелкие непрокрасы внутри залить.
    lab_p, n_p = ndimage.label(paint)
    if n_p:
        sizes = ndimage.sum(paint, lab_p, range(1, n_p + 1))
        for idx, s in enumerate(sizes, start=1):
            if s < 300:
                paint[lab_p == idx] = False
    gaps = sil & ~paint & ~cut
    lab_g, n_g = ndimage.label(gaps)
    if n_g:
        sizes = ndimage.sum(gaps, lab_g, range(1, n_g + 1))
        for idx, s in enumerate(sizes, start=1):
            if s < 400:
                paint[lab_g == idx] = True

    if verbose:
        print(f"{slug:22s} holes kept={kept:2d} dropped={dropped:3d} "
              f"body_painted={paint[sil].mean() * 100:5.1f}%")
    return paint, sil, ph


def save_mask(paint, path):
    """Формат v9: белое на ПРОЗРАЧНОМ (alpha = сила покраски), иначе Safari
    красит всю машину и прямоугольник фона."""
    a = Image.fromarray((paint * 255).astype("uint8")).filter(ImageFilter.GaussianBlur(0.8))
    arr = np.array(a)
    arr[arr < 6] = 0
    out = np.dstack([np.full((H, W), 255, "uint8")] * 3 + [arr])
    img = Image.fromarray(out, "RGBA")
    if (arr == 255).mean() > 0.98:
        raise SystemExit(f"{path}: маска непрозрачная, экспорт сломан")
    # exact=True: без него WebP обнуляет RGB в полностью прозрачных пикселях.
    # Маску это не ломает (маскирование идёт по альфе), но остальные 65 файлов
    # хранят там 255, и расхождение только путало бы следующую проверку.
    img.save(path, "WEBP", lossless=True, method=6, exact=True)


def main():
    suffix = "-mask6"
    preview = None
    prev_suffix = None
    slugs = []
    rest = sys.argv[1:]
    while rest:
        a = rest.pop(0)
        if a == "--suffix":
            suffix = rest.pop(0)
        elif a == "--preview":
            preview = rest.pop(0)
        elif a == "--prev":
            prev_suffix = rest.pop(0)
        else:
            slugs.append(a)
    slugs = slugs or list(TEMPLATE_PREFIX)
    for slug in slugs:
        paint, sil, ph = build(slug, prev_suffix=prev_suffix)
        save_mask(paint, os.path.join(CARS, f"{slug}{suffix}.webp"))
        if preview:
            film = np.array([190, 25, 110]) / 255.0
            a = (ph[:, :, 3:4] / 255.0)
            base = ph[:, :, :3] * a + np.array([18, 18, 20]) * (1 - a)
            t = paint[:, :, None].astype(float)
            out = base * ((1 - t) + t * film)
            Image.fromarray(out.clip(0, 255).astype("uint8")).save(f"{preview}_{slug}.png")


if __name__ == "__main__":
    main()
