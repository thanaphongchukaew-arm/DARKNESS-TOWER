// Player class definitions: base stats, per-level growth, weakness/resist.
(function () {
  var classes = [
    {
      id: 'blade',
      name: 'อัศวินคมดาบ',
      nameEn: 'Blade Knight',
      icon: 'blade',
      description: 'นักสู้แนวหน้า พลังโจมตีกายภาพสูง พื้นฐานแข็งแกร่ง ต้านทานกายภาพได้ดี แต่หวั่นไหวต่อสายฟ้า',
      descriptionEn: 'A frontline fighter with high physical attack and a sturdy build. Resists physical damage well, but weak to electricity.',
      weak: 'elec',
      resist: 'phys',
      baseStats: { hp: 48, mp: 16, atk: 14, mag: 5, def: 13, res: 8, spd: 9, luk: 7 },
      growth: { hp: 8.8, mp: 2.2, atk: 2.7, mag: 0.6, def: 2.0, res: 1.0, spd: 0.8, luk: 0.7 }
    },
    {
      id: 'elementalist',
      name: 'นักเวทธาตุ',
      nameEn: 'Elementalist',
      icon: 'staffOrb',
      description: 'นักเวทที่ควบคุมธาตุไฟ น้ำแข็ง สายฟ้า และลม พลังเวทสูงลิ่วแต่ร่างกายบอบบาง หวั่นไหวต่อกายภาพ',
      descriptionEn: 'A mage who commands fire, ice, lightning, and wind. Sky-high magic power but frail, weak to physical attacks.',
      weak: 'phys',
      resist: 'wind',
      baseStats: { hp: 33, mp: 36, atk: 6, mag: 16, def: 8, res: 13, spd: 10, luk: 8 },
      growth: { hp: 5.4, mp: 5.0, atk: 0.7, mag: 3.0, def: 1.1, res: 2.0, spd: 1.0, luk: 0.9 }
    },
    {
      id: 'cleric',
      name: 'นักบวชแสงสว่าง',
      nameEn: 'Cleric',
      icon: 'radiantOrb',
      description: 'ผู้เชี่ยวชาญพลังแสงและการฟื้นฟู สมดุลทุกด้าน ต้านทานแสงได้ดี แต่หวั่นไหวต่อความมืด',
      descriptionEn: 'A master of light and restoration. Well-balanced all around, resists light well, but weak to darkness.',
      weak: 'dark',
      resist: 'light',
      baseStats: { hp: 41, mp: 27, atk: 9, mag: 12, def: 11, res: 12, spd: 8, luk: 9 },
      growth: { hp: 6.8, mp: 4.0, atk: 1.4, mag: 2.2, def: 1.5, res: 1.9, spd: 0.8, luk: 1.0 }
    },
    {
      id: 'berserker',
      name: 'นักรบเดือดดาล',
      nameEn: 'Berserker',
      icon: 'berserker',
      description: 'นักรบบ้าคลั่งที่ทุ่มสุดตัวใส่ศัตรู พลัง HP และโจมตีสูงลิ่ว แต่การป้องกันและต้านเวทต่ำมาก หวั่นไหวต่อน้ำแข็ง ทนไฟได้ดี',
      descriptionEn: 'A reckless warrior who throws everything into the attack. Massive HP and ATK, but very low DEF/RES. Weak to ice, resists fire.',
      weak: 'ice',
      resist: 'fire',
      baseStats: { hp: 55, mp: 10, atk: 17, mag: 3, def: 8, res: 5, spd: 8, luk: 6 },
      growth: { hp: 9.5, mp: 1.5, atk: 3.2, mag: 0.4, def: 1.6, res: 0.8, spd: 0.7, luk: 0.6 }
    },
    {
      id: 'ranger',
      name: 'นักธนูพราน',
      nameEn: 'Ranger',
      icon: 'ranger',
      description: 'นักล่าผู้ว่องไว ถนัดธนูและสายลม ความเร็วและโชคสูงเยี่ยม แต่ HP และ MP ค่อนข้างต่ำ หวั่นไหวต่อไฟ ทนลมได้ดี',
      descriptionEn: 'A swift hunter skilled with bow and wind. Excellent SPD and LUK, but lower HP/MP. Weak to fire, resists wind.',
      weak: 'fire',
      resist: 'wind',
      baseStats: { hp: 36, mp: 20, atk: 12, mag: 6, def: 8, res: 8, spd: 14, luk: 12 },
      growth: { hp: 6.0, mp: 3.0, atk: 2.2, mag: 0.9, def: 1.1, res: 1.1, spd: 1.7, luk: 1.4 }
    },
    {
      id: 'necromancer',
      name: 'จอมเวทเงาวิญญาณ',
      nameEn: 'Necromancer',
      icon: 'necromancer',
      description: 'นักเวทมนตร์มืดที่เรียกพลังวิญญาณและคำสาป พลังเวทสูงจัด แต่ HP และการป้องกันต่ำมาก หวั่นไหวต่อแสง ทนความมืดได้ดี',
      descriptionEn: 'A dark spellcaster who commands cursed spirits. Extremely high MAG, but very low HP/DEF. Weak to light, resists dark.',
      weak: 'light',
      resist: 'dark',
      baseStats: { hp: 30, mp: 38, atk: 5, mag: 17, def: 7, res: 11, spd: 9, luk: 7 },
      growth: { hp: 5.0, mp: 5.4, atk: 0.6, mag: 3.2, def: 0.9, res: 1.7, spd: 0.9, luk: 0.8 }
    },
    {
      id: 'monk',
      name: 'นักพรตหมัดสายฟ้า',
      nameEn: 'Monk',
      icon: 'monk',
      description: 'นักสู้สายพลังชี่ที่ผสานหมัดกับสายฟ้า ความเร็วสูง สมดุลระหว่างกายภาพและเวท หวั่นไหวต่อความมืด ทนสายฟ้าได้ดี',
      descriptionEn: 'A martial artist who channels ki through lightning-charged strikes. High SPD, balanced between physical and magic. Weak to dark, resists electricity.',
      weak: 'dark',
      resist: 'elec',
      baseStats: { hp: 40, mp: 24, atk: 11, mag: 9, def: 9, res: 10, spd: 13, luk: 9 },
      growth: { hp: 6.4, mp: 3.4, atk: 1.8, mag: 1.5, def: 1.3, res: 1.4, spd: 1.5, luk: 1.0 }
    },
    {
      id: 'paladin',
      name: 'อัศวินศักดิ์สิทธิ์',
      nameEn: 'Paladin',
      icon: 'paladin',
      description: 'อัศวินผู้พิทักษ์ที่ผสานดาบกับแสงศักดิ์สิทธิ์ การป้องกันและต้านเวทสูงเป็นเลิศ แต่ความเร็วต่ำ หวั่นไหวต่อสายลม ทนน้ำแข็งได้ดี',
      descriptionEn: 'A guardian knight blending swordplay with holy light. Outstanding DEF/RES, but slow. Weak to wind, resists ice.',
      weak: 'wind',
      resist: 'ice',
      baseStats: { hp: 46, mp: 22, atk: 11, mag: 9, def: 15, res: 14, spd: 6, luk: 7 },
      growth: { hp: 7.6, mp: 3.0, atk: 1.6, mag: 1.3, def: 2.4, res: 2.2, spd: 0.5, luk: 0.7 }
    }
  ];

  window.Game = window.Game || {};
  window.Game.Data = window.Game.Data || {};
  window.Game.Data.classes = classes;
  window.Game.Data.getClass = function (id) {
    for (var i = 0; i < classes.length; i++) if (classes[i].id === id) return classes[i];
    return null;
  };
})();
