$reader = [System.IO.StreamReader]::new("d:\MY_FIRST_WEB\csv\product.csv", [System.Text.Encoding]::UTF8)
$header = $reader.ReadLine()
Write-Output "=== HEADER ==="
Write-Output $header
Write-Output ""

for ($i = 0; $i -lt 2; $i++) {
    $line = $reader.ReadLine()
    if ($line -ne $null) {
        Write-Output "=== ROW $i ==="
        $len = [Math]::Min(3000, $line.Length)
        Write-Output $line.Substring(0, $len)
        Write-Output ""
    }
}
$reader.Close()
