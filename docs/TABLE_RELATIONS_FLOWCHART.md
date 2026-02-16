# AITA – Table relations flowchart

## All tables and relations (overview)

```
┌─────────────┐                    ┌─────────────┐
│   Teacher   │─── createdBy ──────►│    Class    │
│  (teachers) │     (1 : N)        │  (classes)  │
└─────────────┘                    └──────┬──────┘
                                           │
           ┌───────────────────────────────┼───────────────────────────────┐
           │                               │                               │
           │ classId                        │ classId                        │ classId
           ▼                               ▼                               ▼
┌──────────────────┐            ┌──────────────────┐            ┌──────────────────┐
│   Enrollment     │            │  LabeledImage    │            │  AttendanceLog   │
│  (enrollments)   │            │ (labeled_images) │            │(attendance_logs) │
│                  │            │                  │            │                  │
│ classId ─────────┼──► Class   │ classId ─────────┼──► Class   │ classId ─────────┼──► Class
│ studentId ───────┼──► Student │ label (name)     │            │ timestamp        │
└──────────────────┘            │ path, filename   │            │ students[]       │
           │                    └──────────────────┘            │ count            │
           │ studentId                                           └──────────────────┘
           ▼
┌─────────────┐
│   Student   │
│ (students)  │
└─────────────┘
```

---

## Case 1: Classes → Teacher (teacher-specific classes)

```
┌──────────────┐         createdBy          ┌──────────────┐
│   Teacher    │ ──────────────────────────► │    Class     │
│  _id (e.g.   │     "this class belongs     │  createdBy   │
│   teacherId) │      to this teacher"       │  = teacherId  │
└──────────────┘                             └──────────────┘

Flow: Frontend sends createdBy=user.id → API filters Class where createdBy = that id.
```

---

## Case 2: Students in a class (class-specific roster)

```
┌──────────────┐     classId      ┌──────────────┐     studentId     ┌──────────────┐
│    Class     │ ◄─────────────── │  Enrollment  │ ────────────────► │   Student    │
│    _id       │                  │  classId    │                   │    _id       │
└──────────────┘                  │  studentId   │                   └──────────────┘
                                   │  (unique    │
                                   │   pair)     │
                                   └──────────────┘

Flow: Add student → POST Enrollment(classId, studentId). List students → get Enrollments by classId, join Student.
```

---

## Case 3: Registered students / face photos (class-specific)

```
┌──────────────┐     classId      ┌──────────────┐
│    Class     │ ◄─────────────── │ LabeledImage│
│    _id       │                  │  classId    │
└──────────────┘                  │  label      │  (name for face)
                                   │  path       │  (file path)
                                   └──────────────┘

Flow: Upload photo with ?classId=... → save file + insert LabeledImage with classId. List → GET by classId.
```

---

## Case 4: Attendance logs (class-specific)

```
┌──────────────┐     classId      ┌──────────────┐
│    Class     │ ◄─────────────── │AttendanceLog │
│    _id       │                  │  classId     │
└──────────────┘                  │  timestamp   │
                                   │  students[] │  (names, confidence)
                                   │  count      │
                                   └──────────────┘

Flow: Mark attendance from class → POST with classId in body. List records → GET ?classId=...
```

---

## Mermaid (for GitHub / Mermaid preview)

```mermaid
erDiagram
    Teacher ||--o{ Class : "createdBy"
    Class ||--o{ Enrollment : "classId"
    Student ||--o{ Enrollment : "studentId"
    Class ||--o{ LabeledImage : "classId"
    Class ||--o{ AttendanceLog : "classId"

    Teacher {
        ObjectId _id PK
        string email
        string fullName
    }

    Student {
        ObjectId _id PK
        string email
        string fullName
        string rollNo
    }

    Class {
        ObjectId _id PK
        ObjectId createdBy FK
        string title
        string subject
    }

    Enrollment {
        ObjectId classId FK
        ObjectId studentId FK
    }

    LabeledImage {
        ObjectId _id PK
        ObjectId classId FK
        string label
        string path
    }

    AttendanceLog {
        ObjectId _id PK
        ObjectId classId FK
        date timestamp
        array students
        number count
    }
```

---

## Summary table

| Case | Table(s) involved | Link field(s) |
|------|-------------------|---------------|
| Classes → Teacher | Class | `createdBy` → Teacher._id |
| Students in class | Enrollment | `classId` → Class._id, `studentId` → Student._id |
| Registered faces | LabeledImage | `classId` → Class._id |
| Attendance logs | AttendanceLog | `classId` → Class._id |
