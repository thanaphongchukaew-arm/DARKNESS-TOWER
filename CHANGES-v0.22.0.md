# สรุปการเปลี่ยนแปลง v0.21.1 → v0.22.0

สรุปจาก `git diff` ของ branch `release-prep` (ยังไม่ commit) แยกตาม path

## ธีมหลัก
1. **Battle art** – ศัตรู/บอสมีภาพ pixel ที่วาดด้วยโค้ด, ฉากหลังตามโซน, status chip รูปทรงต่างกัน, cue บอกตาใคร
2. **Story / Lore** – ย้ายข้อความเนื้อเรื่องทั้งหมดไปไว้ที่ไฟล์เดียว, เพิ่ม lore fragment ตามชั้น, ตอนจบเปลี่ยนตามการเลือกของผู้เล่น
3. **Class art** – ใช้ภาพ portrait ของคลาสชุดเดียวกันทั้งในเมนูและในการต่อสู้
4. **Thai localization pass** – ปรับชื่อสกิล/ไอเทม/ศัตรู ฯลฯ ให้เป็นภาษาไทยที่เป็นธรรมชาติขึ้น (ไม่กระทบ id และ `nameEn`)
5. **Input / accessibility** – เลือกเป้าหมายด้วยคีย์บอร์ดได้

---

## ไฟล์ใหม่

| Path | เนื้อหา |
|---|---|
| `js/battle-art.js` | `G.BattleArt` – วาดศัตรู (role: tank / caster / swift / striker + motion), ฉากหลังตามโซน, ภาพ Timeless Sovereign ที่เปลี่ยนตาม 4 phase, status chip (buff/debuff) |
| `css/battle-identity.css` | สไตล์ของ silhouette ศัตรู, animation, role label, กรอบ champion, ground ring, สถานะ "กำลังเล่นตา" |
| `js/data-story.js` | ข้อความเนื้อเรื่องทั้งหมด (TH + EN): `screens` (intro/ending), `arcs` (Mira, Orin, Lyra อย่างละ 3 บท พร้อม `clue`), `lore` (จดหมาย/จารึก/เสียง), `epilogues`, `truth` |
| `test/battle-art.test.js` | ทดสอบว่าศัตรู/บอสทุกตัวมีภาพ+role, sovereign เปลี่ยนครบ 4 phase, status chip, boss phase event เก็บ actor/phase |
| `test/story-lore.test.js` | ทดสอบว่าข้อความมีครบสองภาษา, lore ไม่ซ้ำชั้น/ไม่ชนชั้น NPC, แสดงครั้งเดียวและเซฟ, catch-up ทีละชิ้น, ตอนจบตามตัวเลือก, intro |
| `previews/classes/restored-battle.png`, `restored-selection.png` | ภาพ preview ของ class art |

## ไฟล์ที่แก้

### เวอร์ชัน / build / cache
| Path | การแก้ |
|---|---|
| `index.html` | ป้ายเวอร์ชัน v0.22.0, เพิ่ม `<link>` ไป `css/battle-identity.css` |
| `package.json` | version → 0.22.0 |
| `sw.js` | cache `darkness-tower-v42`, เพิ่ม `battle-identity.css` และรูป class art (`assets/pixel16/classes/*.png`) และไฟล์ใหม่ใน precache |
| `scripts/build.js` | เพิ่ม `js/data-story.js`, `js/monster-art.js`, `js/battle-art.js` ในรายการ bundle |
| `dist/game.min.js` | ไฟล์ build (**ต้อง build ใหม่หลังแก้ล่าสุด**) |

### Battle
| Path | การแก้ |
|---|---|
| `js/battle-engine.js` | boss phase event เก็บ `targetUid` และ phase (`lastPhaseSnapshot`) เพื่อเล่น visual ให้ถูกบอส |
| `js/battle-vfx.js` | combat modifier ใช้ `BattleArt.chip` (รูปทรงต่างกัน buff/debuff + คำอธิบาย + จำนวนเทิร์น) |
| `js/ui-battle.js` | ใช้ `BattleArt` วาดศัตรู/ฉาก/silhouette บอส; เพิ่ม `setBattleCue` (แถบบอกตาศัตรู/ตาผู้เล่น/เลือกเป้าหมาย, ไฮไลต์ turn chip + การ์ดที่กำลังเล่น); animation `enemy-strike`; อัปเดตภาพ/phase chip ตอนบอสเปลี่ยน phase; การ์ดศัตรูโฟกัสด้วยคีย์บอร์ดได้ (role=button, Enter/Space) |
| `js/ui-codex.js` | Codex ใช้ภาพศัตรูจาก `BattleArt` |
| `js/icons.js` | `Icons.get` ลองดึงไอคอนจาก `MonsterArt` ก่อน |
| `js/pixel-sprites.js` | แก้ comment ชื่อ Steelheart Golem |

### Story
| Path | การแก้ |
|---|---|
| `js/story-system.js` | เพิ่มระบบ lore: `nextLore`, `discover`, `foundLore`, `loreProgress`; ประกอบข้อความ intro/ending (`screen`, `epilogueFor`) จาก `data-story.js`; ตอนจบพิเศษเมื่อเจอ lore ครบ |
| `js/ui-stories.js` | แสดง `clue` ของแต่ละบท, หน้าอ่าน lore (`renderLore`), คลัง lore ในหน้า journal (`loreArchive`) |
| `js/ui-menu.js` | หน้า intro/ending ดึงข้อความจาก `Story.screen()` |
| `css/components.css` | สไตล์ `.lore-scroll` (letter/inscription/voice), `.story-clue`, `.lore-archive`, `.lore-locked` + responsive |
| `js/i18n.js` | ย้ายข้อความ intro/ending ออกไป `data-story.js`; เพิ่ม/แก้ข้อความ guide, survival arena (ระลอก), คำอธิบายคลาสที่ล็อก, `bossFloorTitle`, `victoryMsg` |

### Class / Hero art
| Path | การแก้ |
|---|---|
| `js/class-art.js` | render ภาพ class จากไฟล์ PNG ที่อนุมัติแล้ว (`assets/pixel16/classes/<id>.png`) ใน SVG เดียวกัน |
| `js/hero-art.js` | วางเอฟเฟกต์ตาม talent (halo, runes, armament) ซ้อนบน class art |

### Input
| Path | การแก้ |
|---|---|
| `js/input.js` | ขอบเขตคีย์บอร์ดไม่ถูก submenu ครอบเมื่อกำลังเลือกเป้าหมาย; ปุ่ม `#target-cancel` เป็น target สำหรับ Esc/back |

### Data (ปรับชื่อ/ข้อความภาษาไทย — ไม่แตะ id, ค่าสถานะ, `nameEn`)
`js/data-enemies.js` (ชื่อศัตรูและสกิลศัตรู), `js/data-items.js`, `js/data-skills.js`, `js/data-relics.js`, `js/data-blessings.js`, `js/data-companions.js`, `js/data-quests.js`, `js/data-achievements.js` (ใช้คำว่า "ระลอก" แทน "คลื่น", "จักรพรรดิ" แทน "ราชัน"), `js/systems.js` (ชื่อ perk)

> ตัวอย่าง: หมาป่าเงา → ขนนิลเงา, ดาบสนิม → ดาบสนิมกร้าน, คลื่นรัศมี → วงแสงสะท้าน, Arena Legend → ตำนานสนามประลอง

### Tests / scripts
| Path | การแก้ |
|---|---|
| `test/class-art.test.js` | ปรับให้ตรงกับ class art แบบ PNG |
| `test/helpers/load-game.js` | โหลด `js/data-story.js` |
| `scripts/ui-polish-test.js` | เพิ่มเคสทดสอบ layout บอส/การ์ดศัตรู, เปิด-ปิด submenu, เล่น boss phase ตามลำดับ, คีย์บอร์ดเลือกเป้าหมาย |
| `scripts/screenshots.js` | เพิ่มภาพ `15b-boss-phase4` |

---

## ก่อน release
- [ ] `node scripts/build.js` เพื่อสร้าง `dist/game.min.js` ใหม่
- [ ] รัน test (`test/*.test.js`) และ `scripts/ui-polish-test.js`
- [ ] ตรวจว่ารูป `assets/pixel16/classes/*.png` อยู่ครบตามรายการใน `sw.js`
