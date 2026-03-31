# Login as admin
$loginBody = @{email='admin@eternaltowersaga.com';password='Admin@EST2026!'} | ConvertTo-Json
$loginResp = Invoke-RestMethod -Uri 'http://178.128.127.161/api/users/login' -Method POST -ContentType 'application/json' -Body $loginBody
$token = $loginResp.token
$headers = @{ 'Authorization' = "JWT $token"; 'Content-Type' = 'application/json' }
Write-Host "Logged in as: $($loginResp.user.email)"

# 1. Create new admin user
Write-Host "`n--- Creating user john.c@ultimategame.com ---"
$userBody = @{
    email = 'john.c@ultimategame.com'
    password = 'wErew@lf17'
    role = 'admin'
} | ConvertTo-Json
try {
    $userResp = Invoke-RestMethod -Uri 'http://178.128.127.161/api/users' -Method POST -Headers $headers -Body $userBody
    Write-Host "User created: $($userResp.doc.email) (ID: $($userResp.doc.id))"
} catch {
    Write-Host "User creation: $_"
}

# 2. Update Story Page global with 5 sections
Write-Host "`n--- Updating Story Page ---"
$storyBody = @{
    sections = @(
        @{
            titleEn = 'The World of Arcatea'
            titleTh = [char]0x0E42 + [char]0x0E25 + [char]0x0E01 + [char]0x0E41 + [char]0x0E2B + [char]0x0E48 + [char]0x0E07 + ' Arcatea'
            contentEn = 'In a realm where ancient magic intertwines with towering spires, the world of Arcatea stands as both a paradise and a mystery. Once a land blessed by the Goddess of Creation, its skies were clear, its forests lush, and its people thrived in harmony. But that golden era ended when The Boundless Spire erupted from the earth, splitting the land and awakening forces long forgotten.'
            contentTh = 'ในดินแดนที่เวทมนตร์โบราณผสานกับยอดหอคอยสูงตระหง่าน โลกของ Arcatea คือทั้งสวรรค์และปริศนา ครั้งหนึ่งเคยเป็นแผ่นดินที่ได้รับพรจากเทพธิดาแห่งการสร้างสรรค์ แต่ยุคทองนั้นสิ้นสุดลงเมื่อหอคอยไร้ขอบเขตปะทุขึ้นจากผืนดิน แยกแผ่นดินและปลุกพลังที่ถูกลืมมานาน'
        },
        @{
            titleEn = 'The Boundless Spire'
            titleTh = 'หอคอยไร้ขอบเขต'
            contentEn = 'The Boundless Spire stretches endlessly into the heavens, its peak shrouded in clouds no mortal has ever pierced. Each floor holds unique ecosystems, ancient guardians, and remnants of civilizations that existed long before recorded history. The tower seems alive, shifting its corridors, spawning new challenges, and rewarding those brave enough to ascend with powerful artifacts and forgotten knowledge.'
            contentTh = 'หอคอยไร้ขอบเขตยื่นขึ้นไปสู่สวรรค์อย่างไม่สิ้นสุด แต่ละชั้นเต็มไปด้วยระบบนิเวศเฉพาะตัว ผู้พิทักษ์โบราณ และซากอารยธรรมที่ดำรงอยู่ก่อนประวัติศาสตร์ หอคอยดูเหมือนมีชีวิต ทางเดินเปลี่ยนแปลง สร้างความท้าทายใหม่ และมอบรางวัลแก่ผู้กล้า'
        },
        @{
            titleEn = 'The Adventurers'
            titleTh = 'นักผจญภัยแห่ง Arcatea'
            contentEn = 'Drawn by legends of unimaginable treasure, adventurers from every corner of Arcatea converge at the base of the Spire. Swordsmen, archers, mages, and healers each bring their own story. Together, they form parties, forge alliances, and push deeper into the tower mysteries.'
            contentTh = 'ดึงดูดด้วยตำนานของสมบัติที่เหนือจินตนาการ นักผจญภัยจากทุกมุมของ Arcatea มารวมตัวกันที่ฐานหอคอย นักดาบ นักธนู จอมเวท และนักบวช แต่ละคนนำเรื่องราวของตนเอง ร่วมกันตั้งกลุ่ม สร้างพันธมิตร และลุยลึกเข้าไปในปริศนาของหอคอย'
        },
        @{
            titleEn = 'The Shadow Awakens'
            titleTh = 'เงามืดตื่นขึ้น'
            contentEn = 'But the Spire is not without its darkness. As adventurers climb higher, they discover that the tower true purpose may be far more sinister. Ancient seals are weakening, and creatures of shadow pour forth from the deepest floors. Whispers speak of a forgotten god imprisoned within the Spire core.'
            contentTh = 'แต่หอคอยก็ไม่ได้มีแต่แสงสว่าง เมื่อนักผจญภัยปีนสูงขึ้น พวกเขาค้นพบว่าจุดประสงค์ที่แท้จริงของหอคอยอาจชั่วร้ายกว่าที่คิด ตราผนึกโบราณอ่อนแรงลง สิ่งมีชีวิตแห่งเงามืดไหลทะลักออกมา'
        },
        @{
            titleEn = 'Your Journey Begins'
            titleTh = 'การเดินทางของคุณเริ่มต้นแล้ว'
            contentEn = 'The call of the Spire echoes across Arcatea. Choose your weapon, gather your allies, and step into the unknown. The Boundless Spire awaits. Your story in Eternal Tower Saga begins now.'
            contentTh = 'เสียงเรียกของหอคอยก้องกังวานไปทั่ว Arcatea เลือกอาวุธของคุณ รวบรวมพันธมิตร แล้วก้าวเข้าสู่สิ่งที่ไม่รู้จัก หอคอยไร้ขอบเขตรอคอยอยู่ เรื่องราวของคุณใน Eternal Tower Saga เริ่มต้นแล้ว'
        }
    )
} | ConvertTo-Json -Depth 5

try {
    $storyResp = Invoke-RestMethod -Uri 'http://178.128.127.161/api/globals/story-page' -Method POST -Headers $headers -Body ([System.Text.Encoding]::UTF8.GetBytes($storyBody)) -ContentType 'application/json; charset=utf-8'
    Write-Host "Story updated! Sections count: $($storyResp.sections.Count)"
    foreach ($s in $storyResp.sections) {
        Write-Host "  - $($s.titleEn)"
    }
} catch {
    Write-Host "Story update error: $_"
}

Write-Host "`nDone!"
