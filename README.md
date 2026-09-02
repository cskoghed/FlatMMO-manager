# FlatMMO Manager

FlatMMO Manager is a Tampermonkey userscript that automates repetitive tasks in [FlatMMO](https://flatmmo.com/), such as mining loops, pickpocketing, and basic login/character-loading actions.

[![Install in Tampermonkey](https://img.shields.io/badge/Install-Tampermonkey-00485B?logo=tampermonkey&logoColor=white)](https://github.com/cskoghed/FlatMMO-manager/raw/main/flatMMO-manager.js)

## Key features

- **Auto mining loop** (`AutoMiner`)
  - Targets the nearest configured ore type.
  - Tracks mining completion and immediately switches to a new rock.
  - Handles low-energy recovery by routing the character to sleep and return.
- **Auto pickpocketing** (`autoSteal`)
  - Repeats pickpocket attempts against selected NPC roles (`citizen`, `farmer`, `mage`).
  - Detects full inventory and deposits items at a bank when available.
- **Session helpers**
  - Auto-selects character on dashboard login.
  - Loads startup behavior on `/play.php`.

## What needs improvement

- **Configuration persistence**
  - Save automation preferences (target ore, enabled features) to `localStorage`.
- **Safety and reliability**
  - Add null/availability checks for DOM/game objects before use.
  - Reduce hardcoded map/object assumptions by centralizing route and object metadata.
- **Feature completeness**
  - Expand miner support to multiple ore priorities instead of a single target string.
  - Complete and formalize queue/action orchestration in `AutoBot`.
- **Maintainability**
  - Improve naming consistency, comments, and split larger routines into smaller units.
  - Add tests or simulation hooks for core decision logic.

## Usage

1. Install [Tampermonkey](https://www.tampermonkey.net/).
2. Click the **Install in Tampermonkey** button above.
3. Confirm installation in Tampermonkey.
4. Open FlatMMO and let the script run.
