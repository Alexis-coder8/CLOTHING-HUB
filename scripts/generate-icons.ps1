$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing

function New-LuveriaIcon {
  param(
    [Parameter(Mandatory = $true)][string]$Path,
    [Parameter(Mandatory = $true)][int]$Size,
    [switch]$Rounded
  )

  $bitmap = New-Object System.Drawing.Bitmap($Size, $Size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $scale = $Size / 512.0
  $bounds = New-Object System.Drawing.RectangleF(0, 0, $Size, $Size)
  $background = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    $bounds,
    [System.Drawing.Color]::FromArgb(50, 23, 64),
    [System.Drawing.Color]::FromArgb(138, 76, 163),
    [System.Drawing.Drawing2D.LinearGradientMode]::ForwardDiagonal
  )
  $white = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
  $accent = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(225, 184, 240))

  try {
    $graphics.Clear([System.Drawing.Color]::Transparent)
    if ($Rounded) {
      $radius = 112 * $scale
      $shape = New-Object System.Drawing.Drawing2D.GraphicsPath
      $shape.AddArc(0, 0, 2 * $radius, 2 * $radius, 180, 90)
      $shape.AddArc($Size - 2 * $radius, 0, 2 * $radius, 2 * $radius, 270, 90)
      $shape.AddArc($Size - 2 * $radius, $Size - 2 * $radius, 2 * $radius, 2 * $radius, 0, 90)
      $shape.AddArc(0, $Size - 2 * $radius, 2 * $radius, 2 * $radius, 90, 90)
      $shape.CloseFigure()
      $graphics.FillPath($background, $shape)
      $shape.Dispose()
    } else {
      $graphics.FillRectangle($background, $bounds)
    }

    $points = [System.Drawing.PointF[]]@(
      [System.Drawing.PointF]::new(152 * $scale, 112 * $scale),
      [System.Drawing.PointF]::new(208 * $scale, 112 * $scale),
      [System.Drawing.PointF]::new(208 * $scale, 346 * $scale),
      [System.Drawing.PointF]::new(360 * $scale, 346 * $scale),
      [System.Drawing.PointF]::new(360 * $scale, 400 * $scale),
      [System.Drawing.PointF]::new(152 * $scale, 400 * $scale)
    )
    $graphics.FillPolygon($white, $points)
    $graphics.FillEllipse( $accent, (350 - 24) * $scale, (152 - 24) * $scale, 48 * $scale, 48 * $scale)
    $bitmap.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
  } finally {
    $accent.Dispose()
    $white.Dispose()
    $background.Dispose()
    $graphics.Dispose()
    $bitmap.Dispose()
  }
}

function New-LuveriaSplash {
  param(
    [Parameter(Mandatory = $true)][string]$Path,
    [Parameter(Mandatory = $true)][int]$Width,
    [Parameter(Mandatory = $true)][int]$Height
  )

  $bitmap = New-Object System.Drawing.Bitmap($Width, $Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $bounds = New-Object System.Drawing.RectangleF(0, 0, $Width, $Height)
  $background = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    $bounds,
    [System.Drawing.Color]::FromArgb(50, 23, 64),
    [System.Drawing.Color]::FromArgb(138, 76, 163),
    [System.Drawing.Drawing2D.LinearGradientMode]::ForwardDiagonal
  )
  $white = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
  $accent = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(225, 184, 240))

  try {
    $graphics.FillRectangle($background, $bounds)
    $scale = ([Math]::Min($Width, $Height) * 0.18) / 288
    $offsetX = ($Width / 2) - (268 * $scale)
    $offsetY = ($Height / 2) - (256 * $scale)
    $points = [System.Drawing.PointF[]]@(
      [System.Drawing.PointF]::new((152 * $scale) + $offsetX, (112 * $scale) + $offsetY),
      [System.Drawing.PointF]::new((208 * $scale) + $offsetX, (112 * $scale) + $offsetY),
      [System.Drawing.PointF]::new((208 * $scale) + $offsetX, (346 * $scale) + $offsetY),
      [System.Drawing.PointF]::new((360 * $scale) + $offsetX, (346 * $scale) + $offsetY),
      [System.Drawing.PointF]::new((360 * $scale) + $offsetX, (400 * $scale) + $offsetY),
      [System.Drawing.PointF]::new((152 * $scale) + $offsetX, (400 * $scale) + $offsetY)
    )
    $graphics.FillPolygon($white, $points)
    $graphics.FillEllipse($accent, (326 * $scale) + $offsetX, (128 * $scale) + $offsetY, 48 * $scale, 48 * $scale)
    $bitmap.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
  } finally {
    $accent.Dispose()
    $white.Dispose()
    $background.Dispose()
    $graphics.Dispose()
    $bitmap.Dispose()
  }
}

$root = Split-Path -Parent $PSScriptRoot
New-LuveriaIcon (Join-Path $root "assets\icon.png") 1024
New-LuveriaIcon (Join-Path $root "images\app-icon-192.png") 192
New-LuveriaIcon (Join-Path $root "images\app-icon-512.png") 512
New-LuveriaIcon (Join-Path $root "ios\App\App\Assets.xcassets\AppIcon.appiconset\AppIcon-512@2x.png") 1024

$androidResources = Join-Path $root "android\app\src\main\res"
$densities = @{
  mdpi = 48
  hdpi = 72
  xhdpi = 96
  xxhdpi = 144
  xxxhdpi = 192
}
foreach ($density in $densities.GetEnumerator()) {
  $folder = Join-Path $androidResources "mipmap-$($density.Key)"
  New-LuveriaIcon (Join-Path $folder "ic_launcher.png") $density.Value
  New-LuveriaIcon (Join-Path $folder "ic_launcher_round.png") $density.Value -Rounded
  New-LuveriaIcon (Join-Path $folder "ic_launcher_foreground.png") $density.Value
}

$splashDirectories = @(
  $androidResources,
  (Join-Path $root "ios\App\App\Assets.xcassets")
)
foreach ($directory in $splashDirectories) {
  Get-ChildItem -Path $directory -Filter "splash*.png" -Recurse | ForEach-Object {
    $image = [System.Drawing.Image]::FromFile($_.FullName)
    $width = $image.Width
    $height = $image.Height
    $image.Dispose()
    New-LuveriaSplash $_.FullName $width $height
  }
}
