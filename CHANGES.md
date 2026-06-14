# Change Log

---

## [2] feat: "Outra" breed option with breed_other field

**Date:** 2026-06-14
**Files:** `src/screens/types.ts`, `src/screens/Flow.tsx`, `src/screens/Loading.tsx`
**Step affected:** `q2` (breed + size question)

### Context

The database `dogs` table has two separate columns for breed:
- `breed text` — stores the canonical breed name from the list, or the literal value `'other'`
- `breed_other text` — stores the free-text description when `breed = 'other'`

This change replaces the previous free-text fix (see entry [1] below, which has been reverted) with a proper UX pattern: the user selects "Outra" from the suggestion list and is then shown a text input to describe the breed freely.

### Changes

**`src/screens/types.ts`**
- Added `breedOther?: string` to `BuddyIDFormData` interface
- Added `breedOther: ''` to `INITIAL_FORM_DATA`

**`src/screens/Flow.tsx` — Q2 component**
- `suggestions` list now always appends `'Outra'` as the last item
- `handleSelect` — when `'Outra'` is selected: sets `form.breed = 'other'`, clears `form.breedOther`, sets search display to `'Outra'`, closes dropdown
- When `form.breed === 'other'`: a `TextInput` appears below the dropdown for the user to type the breed freely (maps to `breedOther`)
- `isContinueDisabled` for `q2`:
  ```ts
  if (!form.size) return true;
  if (form.breed === 'other') return (form.breedOther ?? '').trim().length < 1;
  return !DOG_BREEDS_PT.includes(form.breed);
  ```

**`src/screens/Loading.tsx`**
- Added `breedOther` to the API command payload:
  ```ts
  breed: form.breed,
  breedOther: form.breed === 'other' ? form.breedOther : undefined,
  ```
  `breedOther` is only sent when `breed === 'other'`; otherwise it is `undefined` and omitted from the request.

### Behaviour

| Scenario | breed (DB) | breed_other (DB) |
|---|---|---|
| User picks from list (e.g. "Labrador") | `"Labrador"` | `null` |
| User picks "Outra" + types "Misto" | `"other"` | `"Misto"` |
| User picks "Outra" but leaves input empty | Button locked — cannot continue | — |
| Size not selected | Button locked — cannot continue | — |

### Reverted

The free-text typing fix from entry [1] has been reverted. `handleChangeText` is back to its original behaviour: clears `form.breed` if no exact match is found in `DOG_BREEDS_PT`.

---

## [1] fix: free-text breed input unlocks continue button *(reverted)*

**Date:** 2026-06-14
**Files:** `src/screens/Flow.tsx`

> This fix was superseded by entry [2] and has been reverted. Documented here for historical reference.

### Problem

When the user typed a breed freely (e.g. "Misto"), the Continue button remained permanently disabled because `handleChangeText` reset `form.breed` to `''` on no match, and `isContinueDisabled` checked `!DOG_BREEDS_PT.includes(form.breed)`.

### What was changed (now reverted)

```ts
// handleChangeText — was changed to:
update('breed', exactMatch ?? text.trim());

// isContinueDisabled q2 — was changed to:
case 'q2': return form.breed.trim().length < 1 || !form.size;
```

Both lines have been restored to their original values as part of entry [2].
