// ลิขสิทธิ์และจัดทำโดย ธนพงศ์ ชูแก้ว (Copyright © Thanaphong Chukaew. All rights reserved.)

// Class commands are situational (Reload needs an empty cylinder, a form move needs that
// form...). Tests that cast "every learned skill" from a fresh battle call this first so the
// skill is legitimately usable. Each class's own `prime` hook (class-mech*.js) knows how.
function primeMech(g, battle, skill) {
  g.ClassMech.prime(battle, skill);
}

module.exports = { primeMech };
