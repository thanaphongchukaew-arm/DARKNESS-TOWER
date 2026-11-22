# Balance pass (on top of v0.22.0)

Measured with `npm run balance` (see the header of scripts/balance-sim.js for the `arena`, `--asc` and `--route` modes).

| Area | Problem measured | Change |
|---|---|---|
| Enemy SPD | Floor-10 boss out-sped slow classes: 6 classes died at floor 10 (median) | SPD takes 40% of the floor multiplier (`SPD_SCALE_SHARE`) |
| Endless Arena | One session = 10-70x a floor's EXP, level-ups healed fully, defeat was free | EXP x0.3, materials x0.4, no HP/MP refill on arena level-up |
| Replay | Death ended the whole run for 40% rewards | Death costs 15% gold and leaves 1 HP |
| Ascension | Flat multiplier: A6+ died on floors 1-10; clearing A0 unlocked A10 | Bonus ramps floor 1 (25%) to floor 40 (100%); only clearing your highest level unlocks the next |
| Classes | Paladin weakest, Deathbringer 12/20 clears, Shadowhunter 0/20, casters died early | Paladin SPD/ATK up; Deathbringer skills weaker and costlier in HP; Shadowhunter HP/DEF/RES up and a physical AoE; Necromancer, Storm Caller, Chronomancer, Ranger, Shadow Dancer, Monk got HP/damage growth |
| Skills | Martial classes had no heal; Executioner no AoE; four class openers were worse than the shared spell | `catch_breath` (martial heal), `harvest_sweep`, `shadow_volley`, `divine_mercy`; openers now 6 MP |
| Item tiers | Shop T7 at floor 50, rewards T7 at floor 75, forge T7 at 75 | One table: T6 from floor 45, T7 from floor 60, used by shop, rewards and forge |
| Gold | ~96,000 gold per run vs ~20,000 to spend | `goldForExp` diminishes above ~300 EXP (~37,000 per run); tier 6+ gear costs x1.5 / x1.75 |
| Crafting | Tier 5-8 recipes needed more than a run drops; tier 9 drops were ~44 for one recipe | Tier 5-8 recipes need 3-4 of each; floor 65+ enemies also drop tier 5-8 materials |
| Mini-bosses | Floors 55-95 all used the same phase-2 "mana drain" | Focus rotates buffs / companion / mana through floor 95 |
| Events | Forge was far too cheap; Idol only paid gold; Master's SPD was +1..4 | Forge 140 x tier; Idol also gives 4 zone materials; Master SPD +2 + tier |
| Quests | Four Veteran Medal rewards (2 slots); tier 9 materials as a reward | two of the four medal rewards replaced by skill scrolls and tier 6 materials; tier 9 reward replaced by tier 7 materials |
| Items | No tier-3 MP potion | `p_mp_large` (42 MP) |

## Follow-up fixes found while checking the pass
- Boss floors paid *less* gold than ordinary floors (the diminishing gold curve is per enemy); bosses are now priced like a 5-enemy pack.
- Sell-price freshness still used the old tier-6 ceiling (floor 74); now floor 59.
- Arena/Ascension in-game descriptions now state the new rules.
- `npm run test:modes` drives the real UI for the Arena, Replay defeat, Ascension picker/unlock, shop tiers and the new skills.

## Re-check: strongest classes trimmed
Nightmare bot, 40-60 runs/class: Deathbringer 40% clears, Warlord 32%, Berserker 15% (others <=15%).
Trimmed growth: Deathbringer (hp 7.8, atk 2.3, mag 2.4, def/res 1.4), Warlord (hp 8.4, atk 2.1, def 1.8, res 1.6), Berserker (hp 9.0, atk 3.0, def 1.5).
Result: top classes now 15-18% clears, bottom 0-2%; ascension A0->A5->A10 still falls steeply.
