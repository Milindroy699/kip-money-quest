# Card and trophy art prompts (Nano Banana)

The card frames, rarity colours and the trophy cabinet are already drawn in the app. These prompts make the **pictures that go inside them**:
- **Part A:** one illustration per card, so no card leans on an emoji (the Fixed Deposit padlock reads as "locked").
- **Part B:** a trophy figurine per achievement.
- **Part C:** a backdrop for the Trophies tab.

**Workflow**
1. Make `card_fd` first. Once it looks right, attach it as the **reference image** for every other card, with "in exactly the same style, camera angle and lighting as the reference image".
2. Do the same for trophies, with `trophy_first-lesson` as the reference.
3. Put the files in `design/source-art/cards/` and `design/source-art/trophies/` (PNG or JPG, 1024 px). I'll cut them out and wire them in through `src/art/cards.ts` and the Trophy Room.

**Style block (paste at the start of every prompt).**
> Playful stylised 3D toy diorama for a mobile learning game. Soft clay-like materials, rounded chunky shapes, warm golden-hour light from the upper left, soft ambient occlusion. Bright but soft colours: leafy greens, sandstone, terracotta, cream, teal and honey gold. Indian-inspired details. Matches the Kip Campus building art. No people, no readable text, no logos, no real brand names.

---

## Part A: Card illustrations (24)

**Nano Banana, 1:1. Template:**
```
[STYLE] A single [OBJECT], three-quarter view from slightly above, centred, filling 70% of the frame, on a small round cream plinth. Solid pure magenta (#FF00FF) background, evenly lit, no background shadow, no pink or magenta in the object, no text.
```

| File name | Card | [OBJECT] |
|---|---|---|
| `card_cash` | Cash | a neat stack of rupee-style banknotes (no readable numbers) with a few gold coins, tied with a paper band |
| `card_savings` | Savings Account | a friendly little bank building with a round piggy-bank dome and a coin slot on top |
| `card_fd` | Fixed Deposit | a sturdy round vault door, slightly open, showing stacked gold coins inside, with a small calendar dial on the door (the money is locked for a set time and grows) |
| `card_rd` | Recurring Deposit | a row of small jars, each a little fuller of coins than the last, with a calendar page behind them |
| `card_ppf` | Public Provident Fund | a tall sandstone pillar-shaped money box with a long sealed lid and fifteen small rings carved around it |
| `card_indexFund` | Index Fund | a woven basket holding many tiny different company buildings together |
| `card_sip` | SIP | Kip-style tortoise-green watering can pouring gold coins onto a small sapling that has coin leaves |
| `card_lumpSum` | Lump Sum | one big heavy sack of gold coins dropped onto a pedestal with a small splash of coins |
| `card_govBond` | Government Bond | a rolled certificate scroll with a wax seal and a ribbon, resting on a small stack of coins |
| `card_mutualFund` | Mutual Fund | several small hands-shaped baskets pooling coins into one big shared bowl |
| `card_gold` | Gold | a few gleaming gold bars and a small gold bangle on a velvet cushion |
| `card_stock` | Stocks | a tiny company headquarters building with a rising green arrow flag on its roof |
| `card_reit` | REIT | a mini shopping mall and office tower on one shared base, with coins coming out of the door like rent |
| `card_derivative` | Futures & Options | a mechanical octopus made of brass gears, each tentacle holding a different small contract card |
| `card_crypto` | Crypto | a glowing hexagonal coin with circuit patterns, floating above a small rocky, unstable pedestal |
| `card_peVc` | Private Equity & VC | a small rocket on a launchpad with a garage-style startup workshop behind it |
| `card_emergencyFund` | Emergency Fund | a red emergency box with a glass front, holding a small stack of coins and a tiny umbrella |
| `card_elss` | ELSS Fund | a basket of company buildings with a small tax-shield badge and a three-ring lock |
| `card_assetAllocation` | Asset Allocation | a round pie made of different materials (gold, brick, glass, leaf) sliced into wedges |
| `card_hedge` | Hedge | a sturdy round shield in front of a small stack of coins, deflecting a storm cloud |
| `card_buyAndHold` | Buy and Hold | an hourglass with gold coins as sand, beside a slowly growing tree |
| `card_fundamentals` | Fundamental Analysis | a magnifying glass over a tiny factory, with gears and a ledger book beside it |
| `card_termInsurance` | Insurance | a big friendly umbrella sheltering a small house and family-sized coin stack from rain |
| `card_nps` | National Pension System | a cosy rocking chair on a porch with a jar of coins that has a long growth vine |

---

## Part B: Trophies (26)

These replace the emoji trophies in the Trophy Room cabinet. Each is a small figurine on a base whose colour matches its tier (bronze, silver or gold).

**Nano Banana, 1:1. Template:**
```
[STYLE] A small collectible trophy figurine: [TROPHY], standing on a round [TIER] base with a plain [TIER] rim. Front three-quarter view, centred, filling 70% of the frame. Polished [TIER] metal with soft reflections. Solid pure magenta (#FF00FF) background, evenly lit, no background shadow, no text.
```
[TIER] is *bronze*, *silver* or *gold*, as listed.

| File name | Tier | [TROPHY] |
|---|---|---|
| `trophy_first-lesson` | bronze | an open book with a small star above it |
| `trophy_money-town` | bronze | a tiny town gate arch |
| `trophy_melt` | silver | a little purple fog cloud being pushed back by a shield |
| `trophy_snowball` | silver | a snowball rolling down a hill, growing bigger |
| `trophy_risk` | silver | a climbing wall with a flag at the top |
| `trophy_bazaar` | silver | a striped market stall |
| `trophy_fort` | gold | a toy fort with five towers |
| `trophy_launch` | gold | a rocket lifting off |
| `trophy_streak-3` | bronze | a small flame |
| `trophy_streak-7` | silver | a calendar page with seven ticks |
| `trophy_streak-30` | gold | a faceted diamond |
| `trophy_perfect-5` | silver | five stars in an arc |
| `trophy_boss` | silver | a crown |
| `trophy_boss-5` | gold | a crossed sword and crown |
| `trophy_cards-5` | bronze | a fanned hand of five cards |
| `trophy_cards-12` | silver | a card album |
| `trophy_cards-all` | gold | a classic two-handled trophy cup overflowing with cards |
| `trophy_finiq-saver` | bronze | a graduation cap on a coin |
| `trophy_finiq-investor` | silver | a bar chart with three rising bars |
| `trophy_finiq-compounder` | gold | a tortoise shell with glowing growth rings |
| `trophy_run-1` | bronze | a running shoe |
| `trophy_run-25` | silver | a medal on a ribbon |
| `trophy_dividend` | bronze | a small open treasure chest of coins |
| `trophy_invest` | bronze | a sapling growing out of a coin |
| `trophy_duel-1` | silver | two crossed swords |
| `trophy_duel-10` | gold | a champion's belt |

---

## Part C: Trophy Room backdrop (optional)

**Nano Banana, 9:16**, saved as `bg_trophy_room`. It would replace the card-vault backdrop on the Trophies tab.
```
[STYLE] The inside of a cosy wooden trophy room in a tortoise's study: warm wooden panelling, a big empty glass display cabinet with four empty shelves in the middle, a soft spotlight from above, a rug, a small desk lamp and a few books at the edges. Keep the middle calm and slightly dark so cards and shelves can sit on top. No trophies, no people, no readable text.
```

---

## Status (7 Nov 2026)

All 24 cards, the Trophy Room backdrop and 24 of the 26 trophies are in the app. Some trophy files show a different trophy than their name, so they're matched by what they show (`TROPHY_FILES` in `scripts/process_collectibles.py`):

| File | Used as |
|---|---|
| `trophy_melt` | Bazaar Pro (the market stall) |
| `trophy_fort1` | Money Town Grad (the gate arch) |
| `trophy_bazaar` | Perfectionist (five stars) |
| `trophy_risk` | On Fire (the flame) |
| `trophy_streak-3` | Boss Slayer (the crown) |
| `trophy_money-town`, `trophy_perfect-5`, `trophy_boss` | Not used (duplicates) |

**Still to make:** `trophy_melt_v2` (silver: a little purple fog cloud being pushed back by a shield) and `trophy_risk_v2` (silver: a climbing wall with a flag at the top). Use the template in Part B. The `_v2` names keep the current `trophy_melt` and `trophy_risk` files, which are in use as other trophies. The script picks the new files up automatically.

