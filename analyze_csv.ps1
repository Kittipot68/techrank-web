# First, let's see what unique global_category1 values exist
$reader = [System.IO.StreamReader]::new("d:\MY_FIRST_WEB\csv\product.csv", [System.Text.Encoding]::UTF8)
$header = $reader.ReadLine()

$categories = @{}
$count = 0
while ($count -lt 200000) {
    $line = $reader.ReadLine()
    if ($line -eq $null) { break }
    $count++
    # global_category1 is column index 2
    # Simple extraction - find 2nd comma-separated field
    # Use regex to handle quoted fields
    if ($line -match "^[^,]*,[^,]*,([^,""]+)") {
        $cat = $matches[1]
        if (-not $categories.ContainsKey($cat)) {
            $categories[$cat] = 0
        }
        $categories[$cat]++
    }
}
$reader.Close()

Write-Output "=== UNIQUE global_category1 VALUES (first $count rows) ==="
$categories.GetEnumerator() | Sort-Object -Property Value -Descending | ForEach-Object {
    Write-Output "$($_.Value) : $($_.Key)"
}

# Now look for a headphone row with full detail
Write-Output ""
Write-Output "=== SEARCHING HEADPHONE BY CATEGORY ==="
$reader2 = [System.IO.StreamReader]::new("d:\MY_FIRST_WEB\csv\product.csv", [System.Text.Encoding]::UTF8)
$reader2.ReadLine() # skip header
$count2 = 0
$found2 = 0
while ($found2 -lt 1 -and $count2 -lt 500000) {
    $line = $reader2.ReadLine()
    if ($line -eq $null) { break }
    $count2++
    if ($line -match "Mobiles|Mobile|Audio|Headphone|Earphone|Earbuds") {
        $found2++
        Write-Output "Found at row $count2"
        # Print first 4000 chars
        $len = [Math]::Min(4000, $line.Length)
        Write-Output $line.Substring(0, $len)
    }
}
Write-Output ""
Write-Output "Scanned $count2 rows, found $found2 entries"
$reader2.Close()
