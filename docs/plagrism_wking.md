Here is your content **cleanly formatted and structured** for documentation or project explanation:

---

# 📘 Plagiarism Detection – Project Overview

## 1️⃣ Overview

Plagiarism checking is implemented **entirely within the backend**.

* ❌ No external plagiarism APIs are used
  (No Turnitin, Copyscape, or other third-party services)
* ✅ Similarity is computed using:

  * **Term Frequency (Bag-of-Words)**
  * **Cosine Similarity**

All logic is implemented inside:

```
plagiarism.routes.js
```

---

# 2️⃣ Text Extraction (Libraries Only – No APIs)

Text is extracted from submitted files using npm packages:

| Format         | Library   | Usage                                        |
| -------------- | --------- | -------------------------------------------- |
| **PDF**        | `unpdf`   | `extractText(buffer, { mergePages: true })`  |
| **DOCX/DOC**   | `mammoth` | `mammoth.extractRawText({ path: filePath })` |
| **Plain Text** | Node `fs` | `fs.readFileSync(filePath, 'utf8')`          |

### ✔ Tools Used

* `unpdf` → Extract text from PDFs
* `mammoth` → Extract raw text from Word documents
* `fs` → Read plain text files

⚠ No external plagiarism detection service is called.

---

# 3️⃣ Similarity Logic (Fully Custom Implementation)

All similarity calculations are implemented in your backend.

---

## 🔹 Step 1: Tokenization

**File:** `plagiarism.routes.js` (Lines 49–56)

```js
function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2); // skip very short words
}
```

### What happens here:

* Convert text to lowercase
* Remove non-alphanumeric characters
* Split into words
* Remove short words (≤ 2 characters like “a”, “is”)

Purpose: Reduce noise and normalize text.

---

## 🔹 Step 2: Term Frequency (Bag-of-Words)

**File:** `plagiarism.routes.js` (Lines 57–63)

```js
function buildTermFreq(tokens) {
  const freq = {};
  for (const t of tokens) {
    freq[t] = (freq[t] || 0) + 1;
  }
  return freq;
}
```

### What happens here:

* Each document becomes a map:

  ```
  word → count
  ```

Example:

```
{
  "algorithm": 3,
  "data": 5,
  "structure": 2
}
```

Each document is now represented as a **term-frequency vector**.

---

## 🔹 Step 3: Cosine Similarity

**File:** `plagiarism.routes.js` (Lines 65–84)

```js
function cosineSimilarity(freqA, freqB) {
  const keysA = new Set(Object.keys(freqA));
  const keysB = new Set(Object.keys(freqB));
  const allKeys = new Set([...keysA, ...keysB]);

  let dot = 0;
  let magA = 0;
  let magB = 0;

  for (const k of allKeys) {
    const a = freqA[k] || 0;
    const b = freqB[k] || 0;
    dot += a * b;
    magA += a * a;
    magB += b * b;
  }

  if (magA === 0 || magB === 0) return 0;

  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}
```

### Mathematical Explanation:

Each document is treated as a vector.

[
Similarity = \frac{A \cdot B}{||A|| \times ||B||}
]

Where:

* `A · B` → Dot product
* `||A||` → Magnitude of vector A
* `||B||` → Magnitude of vector B

### Output Range:

* `0` → No similarity
* `1` → Identical word distribution

Converted to percentage:

```js
similarityPercent = Math.round(similarity * 100);
```

---

# 4️⃣ Risk Levels

| Similarity | Risk Level |
| ---------- | ---------- |
| ≥ 70%      | 🔴 High    |
| ≥ 40%      | 🟡 Medium  |
| < 40%      | 🟢 Low     |

---

# 5️⃣ End-to-End Flow

### Step 1 – Trigger

Teacher clicks **“Check Plagiarism”**
(Requires at least 2 submissions)

### Step 2 – API Call

```
POST /api/plagiarism/check?assignmentId=...
```

### Step 3 – Backend Processing

1. Load all submissions for the assignment
2. For each submission:

   * Extract text (`unpdf` / `mammoth` / `fs`)
   * Tokenize
   * Build term frequency map
3. For every pair of submissions:

   * Compute cosine similarity
4. Convert similarity to percentage
5. Assign risk level
6. Sort results (highest similarity first)

---

# 6️⃣ Response Structure

The API returns:

### ✔ Pairwise Results

* Student A vs Student B
* Similarity %
* Risk Level

### ✔ Per-Student Summary

* Each student’s **maximum similarity** with any other student

---

# 📌 Final Summary

| Aspect                | Implementation                     |
| --------------------- | ---------------------------------- |
| **External APIs**     | ❌ None                            |
| **Text Extraction**   | `unpdf`, `mammoth`, `fs`           |
| **Similarity Method** | Term Frequency + Cosine Similarity |
| **Comparison Type**   | Every pair of submissions          |
| **Output**            | Similarity % (0–100) + Risk Level  |

---

## 🎯 Conclusion

Plagiarism is determined purely by comparing **word-usage patterns** between documents using:

> **Bag-of-Words (Term Frequency) + Cosine Similarity**

All logic is implemented internally in your backend —
no external plagiarism services are involved.

---

If you want, I can also:

* Convert this into **resume-friendly explanation**
* Convert into **technical documentation format (SRS style)**
* Or simplify it for viva/interview explanation**
