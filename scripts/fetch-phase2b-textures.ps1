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
}
Write-Output "Created $($assets.Count * $maps.Count) KTX2 textures in $output"
