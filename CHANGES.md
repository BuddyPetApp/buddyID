# Bug Fix: Free-text breed input unlocks continue button

**File:** `src/screens/Flow.tsx`
**Step affected:** `q2` (breed + size question)

---

## Problem

When the user typed a breed freely (e.g. "Misto", "Sem raça definida", or any value not in `DOG_BREEDS_PT`), the Continue button remained permanently disabled.

**Root cause — two places:**

1. `handleChangeText` (Q2 component, ~line 337):  
   If the typed text had no exact match in `DOG_BREEDS_PT`, it set `form.breed` to `''`, discarding the user's input.

2. `isContinueDisabled` (~line 180):  
   The `q2` case checked `!DOG_BREEDS_PT.includes(form.breed)`, which always returned `true` for any free-text value, keeping the button locked.

---

## Fix

**`handleChangeText`** — store the raw typed text when no list match is found:

```ts
// Before
const exactMatch = DOG_BREEDS_PT.find(b => b.toLowerCase() === text.trim().toLowerCase());
if (exactMatch) {
  update('breed', exactMatch);
} else {
  update('breed', '');  // ← was discarding free input
}

// After
const exactMatch = DOG_BREEDS_PT.find(b => b.toLowerCase() === text.trim().toLowerCase());
update('breed', exactMatch ?? text.trim());
```

**`isContinueDisabled` for `q2`** — validate by length, not by list membership:

```ts
// Before
case 'q2': return !DOG_BREEDS_PT.includes(form.breed) || !form.size;

// After
case 'q2': return form.breed.trim().length < 1 || !form.size;
```

---

## Behaviour after fix

| Scenario | Before | After |
|---|---|---|
| User selects from suggestion list | Works | Works (unchanged) |
| User types free text (not in list) | Button locked | Button enabled |
| User clears the input field | Button locked | Button locked (correct) |
| Size not selected | Button locked | Button locked (correct) |

---

## No side effects

- The suggestion dropdown continues to work as before.
- Selecting a suggestion still resolves to the canonical breed name from `DOG_BREEDS_PT`.
- The `size` requirement is unchanged.
- No other steps or form fields are affected.
