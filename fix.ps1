$content = Get-Content -Path style.css;
$newContent = $content[0..804] + $content[806..($content.Count-1)];
$newContent | Set-Content -Path style.css -Encoding UTF8;
