import express from "express";
import LeaveRequest from "../models/LeaveRequest.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

// ✅ إنشاء طلب إجازة
router.post("/", auth(), async (req, res) => {
  try {
    const { from, to, type, reason } = req.body;

    if (!from || !to || !reason) {
      return res.status(400).json({ error: "بيانات ناقصة" });
    }

    const request = await LeaveRequest.create({
      from,
      to,
      type,
      reason,
      user_id: req.user.id,
      status: "pending"
    });

    res.status(201).json(request);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Fehler beim Absenden" });
  }
});
// 🧑‍💼 المستخدم يرى طلباته فقط
router.get("/", auth(), async (req, res) => {
  try {
    const requests = await LeaveRequest.find({
      user_id: req.user.id   // ⭐ الفلترة المهمة
    }).sort({ created_at: -1 });

    res.json(requests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Fehler beim Laden der Anträge" });
  }
});

/* =========================
        Kalender (ثابت)
========================= */

router.get("/calendar", auth(), async (req, res) => {
  const { userId } = req.query;
  const query = { status: "approved" };

  if (req.user.role !== "admin") {
    query.user_id = req.user.id;
  } else if (userId) {
    query.user_id = userId;
  }

  const leaves = await LeaveRequest.find(query).populate("user_id", "name");
  res.json(leaves);
});

// 👨‍💼 المدير يرى جميع الطلبات
router.get("/admin", auth("admin"), async (req, res) => {
  const requests = await LeaveRequest.find()
    .populate("user_id", "name department")
    .sort({ createdAt: -1 });

  res.json(requests);
});

// ✅ موافقة
router.put("/:id/approve", auth("admin"), async (req, res) => {
  const updated = await LeaveRequest.findByIdAndUpdate(
    req.params.id,
    { status: "approved", decided_by: req.user.id },
    { new: true }
  );
  res.json(updated);
});

// ❌ رفض
router.put("/:id/reject", auth("admin"), async (req, res) => {
  const updated = await LeaveRequest.findByIdAndUpdate(
    req.params.id,
    { status: "rejected", decided_by: req.user.id },
    { new: true }
  );
  res.json(updated);
});

export default router;

