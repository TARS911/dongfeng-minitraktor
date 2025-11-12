#!/bin/bash

# Массив URL
urls=(
"https://static.tildacdn.com/stor3537-6135-4663-b163-363661393163/54639074.jpg"
"https://static.tildacdn.com/stor6664-3633-4532-b531-663934343037/22294377.png"
"https://static.tildacdn.com/stor3930-6632-4265-b736-626139653032/12502309.png"
"https://static.tildacdn.com/stor6534-6365-4438-b134-333630623964/46763705.jpg"
"https://static.tildacdn.com/stor3631-3362-4862-b635-396662656332/16229414.jpg"
"https://static.tildacdn.com/stor6639-3037-4464-b238-396465386662/33706207.jpg"
"https://static.tildacdn.com/stor3065-3461-4161-a363-626234653839/16033843.jpg"
"https://static.tildacdn.com/stor3830-6331-4537-b837-656630616634/-/empty/47040123.jpg"
"https://static.tildacdn.com/stor6661-6461-4734-b336-323335653337/-/empty/11605079.png"
"https://static.tildacdn.com/stor3765-3065-4063-b438-386334393366/-/empty/63275539.jpg"
"https://static.tildacdn.com/stor3931-3034-4566-a465-383566353838/-/empty/69067468.jpg"
)

# Модели (в том же порядке, как на сайте)
models=(
"244"
"244-g2"
"304"
"404"
"504"
"504-g3"
"704"
"804"
"904"
"1004"
"1204"
)

echo "========================================"
echo "СКАЧИВАНИЕ ИЗОБРАЖЕНИЙ DONGFENG"
echo "========================================"
echo ""

# Скачиваем изображения
for i in "${!models[@]}"; do
  if [ $i -lt ${#urls[@]} ]; then
    model="${models[$i]}"
    url="${urls[$i]}"
    filename="dongfeng-${model}.jpg"
    
    echo "[$((i+1))/${#models[@]}] Скачивание: $filename"
    echo "    URL: ${url:0:60}..."
    
    wget -q -O "$filename" "$url" && echo "    ✓ Готово" || echo "    ✗ Ошибка"
  fi
done

echo ""
echo "========================================"
echo "ГОТОВО!"
echo "========================================"
ls -lh dongfeng-*.jpg 2>/dev/null | wc -l | xargs echo "Скачано файлов:"
