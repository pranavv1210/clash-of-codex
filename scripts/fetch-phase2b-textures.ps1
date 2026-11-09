param(
  [string]$Toktx = "$env:TEMP\ktx-phase2b\bin\toktx.exe"
)
$ErrorActionPreference = "Stop"
$assets = @(
  "dark_rock", "quarry_wall_02", "brown_mud_02", "leafy_grass",
  "concrete_pavement", "concrete_wall_007", "metal_plate",
  "medieval_red_brick", "weathered_planks"
)
$maps = @("diff", "nor_gl", "rough", "ao")
$output = Join-Path $PSScriptRoot "..\public\assets\textures"
$source = Join-Path $env:TEMP "clash-of-codex-phase2b-source"
New-Item -ItemType Directory -Force -Path $output, $source | Out-Null
if (-not (Test-Path -LiteralPath $Toktx)) { throw "toktx not found: $Toktx" }
foreach ($asset in $assets) {
  foreach ($map in $maps) {
    $jpg = Join-Path $source "${asset}_${map}_1k.jpg"
    $url = "https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/$asset/${asset}_${map}_1k.jpg"
    Invoke-WebRequest $url -OutFile $jpg
    $ktx = Join-Path $output "${asset}_${map}_1k.ktx2"
    $args = @("--t2", "--encode", "etc1s", "--genmipmap", "--assign_oetf", "srgb", $ktx, $jpg)
    if ($map -ne "diff") {
      $args = @("--t2", "--encode", "etc1s", "--genmipmap", "--assign_oetf", "linear", $ktx, $jpg)
    }
    & $Toktx @args
    if ($LASTEXITCODE -ne 0) { throw "toktx failed for $asset/$map" }
  }
  $ao = Join-Path $source "${asset}_ao_1k.jpg"
  $rough = Join-Path $source "${asset}_rough_1k.jpg"
  $ormPng = Join-Path $source "${asset}_orm_1k.png"
  $packScript = @"
const sharp = require('sharp');
Promise.all([sharp(process.argv[1]).greyscale().raw().toBuffer(), sharp(process.argv[2]).greyscale().raw().toBuffer()]).then(async ([ao, rough]) => {
  const meta = await sharp(process.argv[1]).metadata();
  const pixels = Buffer.alloc(meta.width * meta.height * 3);
  for (let i = 0; i < meta.width * meta.height; i++) { pixels[i * 3] = ao[i]; pixels[i * 3 + 1] = rough[i]; pixels[i * 3 + 2] = 0; }
  await sharp(pixels, { raw: { width: meta.width, height: meta.height, channels: 3 } }).png().toFile(process.argv[3]);
}).catch(error => { console.error(error); process.exit(1); });
"@
  node -e $packScript $ao $rough $ormPng
  if ($LASTEXITCODE -ne 0) { throw "ORM packing failed for $asset" }
  $ormKtx = Join-Path $output "${asset}_orm_1k.ktx2"
  & $Toktx --t2 --encode etc1s --genmipmap --assign_oetf linear $ormKtx $ormPng
  if ($LASTEXITCODE -ne 0) { throw "toktx ORM failed for $asset" }
}
Write-Output "Created $($assets.Count * ($maps.Count + 1)) KTX2 textures in $output"
